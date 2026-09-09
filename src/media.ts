// Meditation-track playback. The audio file itself is session-only (it can't
// be serialised into localStorage); only its display name lives in the
// persisted store. Mirrors the prototype's this.audio/this.trackUrl fields.

import { useCallback, useEffect, useRef, useState } from 'react';

export function useMeditationTrack(playing: boolean) {
  const [fileName, setFileName] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setFile = useCallback((file: File) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(file);
    setFileName(file.name);
  }, []);

  const clear = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setFileName(null);
  }, []);

  useEffect(() => {
    if (!urlRef.current) return;
    if (playing) {
      if (!audioRef.current) {
        audioRef.current = new Audio(urlRef.current);
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current?.pause();
    }
  }, [playing]);

  useEffect(() => () => {
    audioRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return { fileName, hasTrack: !!fileName, setFile, clear };
}
