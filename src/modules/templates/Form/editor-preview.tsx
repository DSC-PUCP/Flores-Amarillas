import { useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateData } from '@/core/models/template';
import type { EditorScene, EditorUpdate } from './editor-preview-protocol';

export function EditorPreview({
  templateKey,
  data,
  scene,
  revision,
}: {
  templateKey: string;
  data: TemplateData;
  scene: EditorScene;
  revision: number;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const update = useMemo<EditorUpdate>(
    () => ({
      type: 'flower-editor:update',
      templateKey,
      data,
      scene,
      revision,
    }),
    [templateKey, data, scene, revision]
  );
  const latest = useRef(update);
  latest.current = update;
  const send = () =>
    frame.current?.contentWindow?.postMessage(
      latest.current,
      window.location.origin
    );
  useEffect(() => {
    if (loaded)
      frame.current?.contentWindow?.postMessage(update, window.location.origin);
  }, [loaded, update]);
  useEffect(() => {
    const ready = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow
      )
        return;
      if (
        typeof event.data === 'object' &&
        event.data !== null &&
        'type' in event.data &&
        event.data.type === 'flower-demo:ready'
      ) {
        setLoaded(true);
        frame.current?.contentWindow?.postMessage(
          latest.current,
          window.location.origin
        );
      }
    };
    window.addEventListener('message', ready);
    // También cubre el caso en que el iframe terminó antes de la hidratación.
    if (frame.current?.contentDocument?.readyState === 'complete') {
      setLoaded(true);
      frame.current?.contentWindow?.postMessage(
        latest.current,
        window.location.origin
      );
    }
    return () => window.removeEventListener('message', ready);
  }, []);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#183E32]/15 bg-[#FFF9E6]">
      {!loaded && (
        <output className="absolute inset-0 z-10 grid place-items-center bg-[#FFF9E6] text-sm text-[#597157]">
          Preparando la vista previa…
        </output>
      )}
      <iframe
        ref={frame}
        src={`/preview?embed=true&editorTemplate=${encodeURIComponent(templateKey)}`}
        title="Vista previa de tu regalo en vivo"
        allow="autoplay; encrypted-media"
        onLoad={() => {
          setLoaded(true);
          send();
        }}
        className="block h-[min(75svh,760px)] min-h-[420px] w-full bg-[#FFF9E6]"
      />
    </div>
  );
}
