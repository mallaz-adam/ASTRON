import type { ReactNode } from 'react';

export function SpeechBox({ children }: { children: ReactNode }) {
  return <div className="speech-box">{children}</div>;
}
