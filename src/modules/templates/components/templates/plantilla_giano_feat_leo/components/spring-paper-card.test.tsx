// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SpringPaperCard } from './spring-paper-card';
import { SpringWelcome } from './spring-welcome';

afterEach(cleanup);

describe('handmade spring card', () => {
  it('moves with the pointer and stops after the drag is canceled', () => {
    render(<SpringPaperCard message="Siempre contigo" />);
    const handle = screen.getByRole('slider');
    const paper = handle.parentElement;
    if (!paper) throw new Error('Missing paper');
    vi.spyOn(paper, 'getBoundingClientRect').mockReturnValue({
      width: 500,
    } as DOMRect);
    handle.setPointerCapture = vi.fn();
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 200 });
    expect(handle.getAttribute('aria-valuenow')).toBe('50');
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 500 });
    expect(handle.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.pointerCancel(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 100 });
    expect(handle.getAttribute('aria-valuenow')).toBe('100');
  });
  it('reveals the personalized phrase with keyboard controls and resets the paper', () => {
    render(<SpringPaperCard message="Cada primavera te elijo a ti." />);
    const handle = screen.getByRole('slider');
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
    fireEvent.keyDown(handle, { key: 'End' });
    expect(handle.getAttribute('aria-valuenow')).toBe('100');
    expect(document.getElementById('spring-card-phrase')?.textContent).toBe(
      'Cada primavera te elijo a ti.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Volver a empezar' }));
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
    expect(document.getElementById('spring-card-phrase')?.textContent).toBe('');
  });

  it('keeps progress within the physical paper limits', () => {
    render(<SpringPaperCard message="" />);
    const handle = screen.getByRole('slider');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
  });

  it('navigates from the welcome to the card and back', () => {
    render(<SpringWelcome recipient="Ana" cardMessage="Una frase especial" />);
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Nosotros dos' }));
    expect(screen.getByRole('heading', { name: 'Nosotros dos' })).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Ir a la primera pantalla' })
    );
    expect(screen.getByText('Ana')).toBeTruthy();
  });
});
