// Meditation-track playback. The audio file's bytes are persisted to
// IndexedDB (see idb.ts) under a fixed key, so the track survives a reload
// — not just the display name, the actual file — and is restored
// automatically the next time the app starts.

import { useCallback, useEffect, useRef, useState } from 'react';
import { idbDelete, idbGet, idbSet, STORE_AUDIO } from './idb';

const AUDIO_KEY = 'meditation';

interface StoredTrack {
  blob: Blob;
  name: string;
}

export function useMeditationTrack(playing: boolean) {
  const [fileName, setFileName] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setFile = useCallback((file: File) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(file);
    setFileName(file.name);
    idbSet(STORE_AUDIO, AUDIO_KEY, { blob: file, name: file.name } satisfies StoredTrack).catch(() => {});
  }, []);

  const clear = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setFileName(null);
    idbDelete(STORE_AUDIO, AUDIO_KEY).catch(() => {});
  }, []);

  // Rehydrate the previously-saved track once, on first mount.
  useEffect(() => {
    let cancelled = false;
    idbGet<StoredTrack>(STORE_AUDIO, AUDIO_KEY).then((stored) => {
      if (cancelled || !stored) return;
      urlRef.current = URL.createObjectURL(stored.blob);
      setFileName(stored.name);
    }).catch(() => {});
    return () => { cancelled = true; };
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
    // `fileName` doubles as a "the blob is ready" signal: rehydration from
    // IndexedDB resolves asynchronously, after this effect may have already
    // run with urlRef.current still empty. Re-running once fileName flips
    // from null to a value catches the case where meditation was already
    // running (persisted state) before the track finished loading.
  }, [playing, fileName]);

  useEffect(() => () => {
    audioRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return { fileName, hasTrack: !!fileName, setFile, clear };
}
