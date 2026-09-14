import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/env';
import type { Database } from '@/repository/database.types';
import { isMatchingPaidOrder, signFlowParameters } from './flow';

const flowCreateSchema = z.object({
  url: z.url(),
  token: z.string().min(1),
  flowOrder: z.number().int(),
});

const flowStatusSchema = z.object({
  flowOrder: z.number().int(),
  commerceOrder: z.uuid(),
  status: z.number().int(),
  currency: z.string(),
  amount: z.coerce.number().positive(),
});

const flowErrorSchema = z.object({
  code: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
});

type FlowStatus = z.infer<typeof flowStatusSchema>;

function config() {
  const confirmationBaseUrl =
    env.FLOW_MODE === 'production' ? env.SERVER_URL : env.VITE_SERVER_URL;
  if (
    !env.FLOW_API_KEY ||
    !env.FLOW_SECRET_KEY ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !confirmationBaseUrl
  ) {
    throw new Error(
      `Faltan credenciales de Flow, Supabase o ${env.FLOW_MODE === 'production' ? 'VITE_SERVER_URL' : 'SERVER_URL'}`
    );
  }
  if (new URL(confirmationBaseUrl).protocol !== 'https:') {
    throw new Error('La URL pública para Flow debe usar HTTPS');
  }

  const returnBaseUrl =
    env.FLOW_MODE === 'sandbox'
      ? (env.VITE_SERVER_URL ?? confirmationBaseUrl)
      : confirmationBaseUrl;

  return {
    apiKey: env.FLOW_API_KEY,
    secretKey: env.FLOW_SECRET_KEY,
    confirmationBaseUrl: confirmationBaseUrl.replace(/\/$/, ''),
    returnBaseUrl: returnBaseUrl.replace(/\/$/, ''),
    apiUrl:
      env.FLOW_MODE === 'production'
        ? 'https://www.flow.cl/api'
        : 'https://sandbox.flow.cl/api',
    supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function adminClient() {
  const { supabaseKey } = config();
  return createClient<Database>(env.VITE_SUPABASE_URL, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function signedParameters(parameters: Record<string, string>) {
  const { secretKey } = config();
  return {
    ...parameters,
    s: signFlowParameters(parameters, secretKey),
  };
}

async function flowRequest(path: string, parameters: Record<string, string>, method: 'GET' | 'POST') {
  const { apiUrl } = config();
  const body = new URLSearchParams(signedParameters(parameters));
  const response = await fetch(
    method === 'GET' ? `${apiUrl}${path}?${body}` : `${apiUrl}${path}`,
    {
      method,
      ...(method === 'POST' && {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }),
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const parsed = flowErrorSchema.safeParse(payload);
    const detail = parsed.success ? parsed.data.message?.trim().slice(0, 200) : undefined;
    const hasSecret =
      detail &&
      [env.FLOW_API_KEY, env.FLOW_SECRET_KEY].some(
        (secret) => secret && detail.includes(secret)
      );
    const sandboxDetail = env.FLOW_MODE === 'sandbox' && detail && !hasSecret;
    throw new Error(
      `Flow respondió HTTP ${response.status}${sandboxDetail ? `: ${detail}` : ''}`
    );
  }
  return response.json() as Promise<unknown>;
}

function amountInCents(amount: number) {
  return Math.round(amount * 100);
}

export async function createCheckout(pageId: string, email: string) {
  const db = adminClient();
  const { data: page, error: pageError } = await db
    .from('pages')
    .select('id, template_id, is_paid, flow_checkout_url')
    .eq('id', pageId)
    .maybeSingle();
  if (pageError) throw pageError;
  if (!page) throw new Error('Pagina no encontrada');
  if (page.is_paid) throw new Error('Esta pagina ya esta activada');
  if (page.flow_checkout_url) return page.flow_checkout_url;

  const { data: template, error: templateError } = await db
    .from('templates')
    .select('plan_id')
    .eq('id', page.template_id)
    .single();
  if (templateError) throw templateError;
  const { data: plan, error: planError } = await db
    .from('plans')
    .select('name, price')
    .eq('id', template.plan_id)
    .single();
  if (planError) throw planError;
  if (!plan || amountInCents(plan.price) <= 200) {
    throw new Error('El plan debe costar más de S/ 2.00 para Flow');
  }

  const { apiKey, confirmationBaseUrl, returnBaseUrl } = config();
  const result = flowCreateSchema.parse(
    await flowRequest(
      '/payment/create',
      {
        apiKey,
        commerceOrder: pageId,
        subject: `Pagina Flores Amarillas - ${plan.name}`,
        currency: 'PEN',
        amount: plan.price.toFixed(2),
        email,
        urlConfirmation: `${confirmationBaseUrl}/api/flow/confirm`,
        urlReturn: `${returnBaseUrl}/api/flow/return`,
      },
      'POST'
    )
  );
  const checkout = new URL(result.url);
  checkout.searchParams.set('token', result.token);

  const { data: updated, error: updateError } = await db
    .from('pages')
    .update({
      flow_checkout_url: checkout.toString(),
      flow_order: result.flowOrder,
      flow_amount: plan.price,
    })
    .eq('id', pageId)
    .eq('is_paid', false)
    .is('flow_order', null)
    .select('flow_checkout_url')
    .maybeSingle();
  if (updateError) throw updateError;
  if (updated?.flow_checkout_url) return updated.flow_checkout_url;

  const { data: current, error: currentError } = await db
    .from('pages')
    .select('flow_checkout_url')
    .eq('id', pageId)
    .single();
  if (currentError) throw currentError;
  if (current.flow_checkout_url) return current.flow_checkout_url;
  throw new Error('No se pudo registrar la orden de Flow');
}

export async function getFlowStatus(token: string): Promise<FlowStatus> {
  const { apiKey } = config();
  return flowStatusSchema.parse(
    await flowRequest('/payment/getStatus', { apiKey, token }, 'GET')
  );
}

export async function applyFlowStatus(status: FlowStatus) {
  const db = adminClient();
  const { data: page, error: pageError } = await db
    .from('pages')
    .select('id, is_paid, flow_order, flow_amount')
    .eq('id', status.commerceOrder)
    .maybeSingle();
  if (pageError) throw pageError;
  if (!page) {
    throw new Error('Pagina de la orden no encontrada');
  }
  const matchesPaidOrder = isMatchingPaidOrder(
    { id: page.id, flowOrder: page.flow_order, flowAmount: page.flow_amount },
    status
  );
  if (
    page.flow_order !== status.flowOrder ||
    page.flow_amount === null ||
    amountInCents(page.flow_amount) !== amountInCents(status.amount) ||
    status.currency !== 'PEN'
  ) {
    throw new Error('La orden de Flow no coincide con la pagina');
  }

  if (!matchesPaidOrder || page.is_paid) return status.commerceOrder;

  const { error } = await db
    .from('pages')
    .update({ is_paid: true, expires_at: null })
    .eq('id', page.id)
    .eq('is_paid', false)
    .eq('flow_order', status.flowOrder)
    .eq('flow_amount', page.flow_amount);
  if (error) throw error;
  return status.commerceOrder;
}
