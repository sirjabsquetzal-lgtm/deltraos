// Full backup / restore: bundles the app state (trades, plans, settings),
// every Sueños image, and the meditation track into one .zip file the user
// can download and later restore — on this device or any other. This is
// the escape hatch from "everything lives only in this browser's storage":
// localStorage and IndexedDB never leave the device on their own, so
// getting data onto another device (or back after clearing site data) has
// to go through a file the user carries over themselves.

import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import type { AppState } from './types';
import { idbGet, idbSet, STORE_AUDIO, STORE_DREAMS } from './idb';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'image/heic': 'heic', 'image/heif': 'heif', 'image/avif': 'avif',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav',
  'audio/x-wav': 'wav', 'audio/aac': 'aac', 'audio/flac': 'flac', 'audio/webm': 'weba',
};

function extFor(type: string): string {
  return EXT_BY_TYPE[type] || 'bin';
}

interface StoredTrack {
  blob: Blob;
  name: string;
}

export async function exportBackup(state: AppState): Promise<void> {
  const files: Record<string, Uint8Array> = {
    'state.json': strToU8(JSON.stringify(state)),
  };

  await Promise.all(
    state.dreams.map(async (d) => {
      const blob = await idbGet<Blob>(STORE_DREAMS, d.id).catch(() => undefined);
      if (!blob) return; // seed image (bundled asset) — nothing to back up
      const bytes = new Uint8Array(await blob.arrayBuffer());
      files[`images/${d.id}.${extFor(blob.type)}`] = bytes;
    })
  );

  const track = await idbGet<StoredTrack>(STORE_AUDIO, 'meditation').catch(() => undefined);
  if (track) {
    const bytes = new Uint8Array(await track.blob.arrayBuffer());
    files[`audio/track.${extFor(track.blob.type)}`] = bytes;
    files['audio/track.json'] = strToU8(JSON.stringify({ name: track.name }));
  }

  const zipped = zipSync(files, { level: 6 });
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `deltraos-backup-${stamp}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export interface RestoredBackup {
  state: AppState;
  imageCount: number;
  hasAudio: boolean;
}

export async function importBackup(file: File): Promise<RestoredBackup> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(bytes);

  const stateRaw = entries['state.json'];
  if (!stateRaw) throw new Error('not-a-backup');
  const state = JSON.parse(strFromU8(stateRaw)) as AppState;

  let imageCount = 0;
  await Promise.all(
    Object.entries(entries).map(async ([path, data]) => {
      const m = /^images\/([^/]+)\.[^./]+$/.exec(path);
      if (!m) return;
      const [, id] = m;
      const type = mimeGuessFromPath(path);
      await idbSet(STORE_DREAMS, id, new Blob([data], { type }));
      imageCount++;
    })
  );

  let hasAudio = false;
  const audioEntry = Object.keys(entries).find((p) => p.startsWith('audio/track.') && !p.endsWith('.json'));
  if (audioEntry) {
    const meta = entries['audio/track.json'];
    const name = meta ? (JSON.parse(strFromU8(meta)) as { name: string }).name : 'track';
    const type = mimeGuessFromPath(audioEntry);
    await idbSet(STORE_AUDIO, 'meditation', { blob: new Blob([entries[audioEntry]], { type }), name });
    hasAudio = true;
  }

  return { state, imageCount, hasAudio };
}

function mimeGuessFromPath(path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  const found = Object.entries(EXT_BY_TYPE).find(([, e]) => e === ext);
  return found ? found[0] : 'application/octet-stream';
}
