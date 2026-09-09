import { createContext, useContext } from 'react';

export interface MediaTrackApi {
  fileName: string | null;
  hasTrack: boolean;
  setFile: (f: File) => void;
  clear: () => void;
}

export const MediaCtx = createContext<MediaTrackApi>({
  fileName: null, hasTrack: false, setFile: () => {}, clear: () => {},
});

export function useMediaTrack(): MediaTrackApi {
  return useContext(MediaCtx);
}
