import { describe, expect, it } from 'vitest';
import type { TemplateData } from '@/core/models/template';
import { resolveForestData } from './forest-data';

describe('resolveForestData', () => {
  it('provides a readable gift when optional content is absent', () => {
    const data = resolveForestData({});

    expect(data.recipient).toBe('ti');
    expect(data.sender).toBe('Alguien que te quiere');
    expect(data.message.trim().length).toBeGreaterThan(0);
    expect(data.reasons.length).toBeGreaterThan(0);
    expect(data.reasons.every((reason) => reason.trim().length > 0)).toBe(true);
    expect(data.photos).toEqual([]);
    expect(data.captions).toEqual([]);
    expect(data.musicUrl).toBe('');
    expect(data.night).toBe(false);
  });

  it('accepts safe local and HTTP(S) images while discarding unsafe or broken URLs', () => {
    const data = resolveForestData({
      photos: [
        'javascript:alert(1)',
        'data:image/svg+xml,<svg/>',
        '//untrusted.example/photo.jpg',
        'file:///private/photo.jpg',
        'this is not a URL',
        'https://',
        '/images/our-day.jpg',
        'https://example.com/photo.jpg',
        'http://localhost:5173/photo.jpg',
      ],
    });

    expect(data.photos).toEqual([
      '/images/our-day.jpg',
      'https://example.com/photo.jpg',
      'http://localhost:5173/photo.jpg',
    ]);
  });

  it('ignores malformed arrays and non-string entries from persisted data', () => {
    const malformed = {
      photos: [false, 23, null, {}, ' ', '/images/valid.jpg'],
      photoCaptions: 'not an array',
      flowerMessages: [false, 4, null, '', 'Una razón de verdad'],
      recipientName: 12,
      senderName: false,
      night: 'true',
    } as unknown as TemplateData;
    const data = resolveForestData(malformed);

    expect(data.photos).toEqual(['/images/valid.jpg']);
    expect(data.captions).toEqual([]);
    expect(data.reasons).toEqual(['Una razón de verdad']);
    expect(data.recipient).toBe('ti');
    expect(data.sender).toBe('Alguien que te quiere');
    expect(data.night).toBe(false);
    expect(
      resolveForestData({ photos: 'broken', flowerMessages: null }).photos
    ).toEqual([]);
    expect(
      resolveForestData({ flowerMessages: [] }).reasons.length
    ).toBeGreaterThan(0);
  });

  it('reads legacy aliases and gives explicit personalized fields precedence', () => {
    const legacy = {
      personA: '  Ángel  ',
      personB: '  Valeria  ',
      timelinePhotos: ['/images/legacy.jpg'],
    };

    expect(resolveForestData(legacy)).toMatchObject({
      sender: 'Ángel',
      recipient: 'Valeria',
      photos: ['/images/legacy.jpg'],
    });
    expect(
      resolveForestData({
        ...legacy,
        senderName: 'Darling',
        recipientName: 'Ana',
        photos: ['/images/current.jpg'],
      })
    ).toMatchObject({
      sender: 'Darling',
      recipient: 'Ana',
      photos: ['/images/current.jpg'],
    });
  });

  it('bounds the gift contents and recognizes supported personalization', () => {
    const data = resolveForestData({
      photos: Array.from({ length: 12 }, (_, index) => `/images/${index}.jpg`),
      photoCaptions: Array.from(
        { length: 12 },
        (_, index) => `Recuerdo ${index}`
      ),
      flowerMessages: Array.from({ length: 9 }, (_, index) => `Razón ${index}`),
      flowerStyle: 'margaritas',
      night: true,
      message: '  Un mensaje personal.  ',
    });

    expect(data.photos).toHaveLength(8);
    expect(data.captions).toHaveLength(8);
    expect(data.reasons).toHaveLength(5);
    expect(data.flowerStyle).toBe('margaritas');
    expect(data.night).toBe(true);
    expect(data.message).toBe('Un mensaje personal.');
    expect(resolveForestData({ flowerStyle: 'rosas' }).flowerStyle).toBe(
      'mixto'
    );
  });
});
