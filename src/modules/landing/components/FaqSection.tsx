import { Flower2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const QUESTIONS = [
  {
    id: 'gift',
    question: '¿Qué recibe la persona a la que se lo regalo?',
    answer:
      'Un enlace a una página web con tu dedicatoria, sus nombres y las fotos que agregues. Cada diseño tiene sus propios detalles, como una carta, una galería o un contador de días. Es un regalo digital: se abre desde el navegador, sin instalar nada.',
  },
  {
    id: 'preview',
    question: '¿Puedo ver mi dedicatoria antes de pagar?',
    answer:
      'Sí. Elige un diseño, completa sus datos y revisa el resultado. Los diseños de pago tienen una vista previa de 5 minutos. Después necesitas activar el enlace para que tu dedicatoria vuelva a estar disponible.',
  },
  {
    id: 'payment',
    question: '¿Cómo pago y cuándo se activa el enlace?',
    answer:
      'Si eliges un diseño de pago, el botón de activación te lleva a WhatsApp. Allí coordinas el pago por Yape o Plin y envías tu comprobante. El equipo lo valida manualmente y activa tu página; espera esa confirmación antes de entregar el regalo.',
  },
  {
    id: 'share',
    question: '¿Cómo lo comparto? ¿Hay que instalar algo?',
    answer:
      'Copia el enlace de tu dedicatoria y envíalo por WhatsApp o por el medio que prefieras. La otra persona solo necesita abrirlo en su navegador con conexión a internet. No necesita instalar una aplicación.',
  },
  {
    id: 'duration',
    question: '¿Cuánto tiempo estará disponible?',
    answer:
      'Las dedicatorias gratuitas se crean sin una fecha de vencimiento programada. En las de pago, al validar tu comprobante se elimina el límite de la vista previa. Guarda tu enlace para poder volver a abrir tu dedicatoria.',
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-24 border-t border-[#1E3B2A]/10 bg-[#FFFBF2] px-5 py-20 text-[#1E3B2A] sm:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div data-reveal="left">
          <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="size-2 rounded-full bg-[#EF7A5E]" />
            Antes de regalar
          </p>
          <h2
            id="faq-title"
            className="font-display text-4xl leading-[1.1] tracking-[-0.035em] sm:text-5xl"
          >
            Que la única duda
            <br />
            sea <span className="italic">qué escribirle.</span>
          </h2>
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#1E3B2A]/75">
            Así funciona tu regalo, desde la primera palabra hasta el momento de
            compartirlo.
          </p>
          <Flower2
            aria-hidden="true"
            className="bloom-faq-flower mt-8 hidden size-20 rotate-12 fill-[#F7C325] stroke-[#1E3B2A] stroke-[1] md:block"
          />
        </div>

        {/* Sin `defaultValue`: arranca con todo cerrado para que se vean las
            cinco preguntas de un vistazo. Con una abierta, las de abajo
            quedaban empujadas fuera de pantalla y parecia que habia menos. */}
        <Accordion type="single" collapsible data-reveal="right">
          {QUESTIONS.map(({ id, question, answer }) => (
            <AccordionItem key={id} value={id} className="border-[#1E3B2A]/15">
              <AccordionTrigger className="items-center rounded-lg py-6 text-base leading-6 font-semibold text-[#1E3B2A] hover:no-underline focus-visible:ring-[#1E3B2A]/30 [&>svg]:size-5 [&>svg]:text-[#1E3B2A]">
                {question}
              </AccordionTrigger>
              <AccordionContent className="max-w-xl pr-7 pb-6 text-sm leading-7 text-[#1E3B2A]/75">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
