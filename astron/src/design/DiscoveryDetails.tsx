import { useState } from 'react';
import type { ReactNode } from 'react';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { markDetailExplored } from '../data/discoveryServices';
import { useProgress } from '../hooks/useProgress';
import './DiscoveryDetails.css';

type DetailProps = { label: string; children: ReactNode; className?: string };

export function DiscoveryDetailsView({ label, children, className = '', explored, onExplore, detailId, reduceMotion = false }: DetailProps & {
  explored: boolean; onExplore: () => void; detailId?: string; reduceMotion?: boolean;
}) {
  return <details className={`discovery-detail ${className}`.trim()} data-detail-id={detailId} data-unseen={!explored} data-reduce-motion={reduceMotion}
    onToggle={event => { if (event.currentTarget.open && !explored) onExplore(); }}>
    <summary className="discovery-summary">
      <span className="discovery-label">{label}</span>
      {!explored && <span className="discovery-hint">Tap to explore</span>}
      <span className="discovery-indicator" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="m10 2 2.2 5.8L18 10l-5.8 2.2L10 18l-2.2-5.8L2 10l5.8-2.2Z" /></svg></span>
      <span className="discovery-description">{explored ? ' Previously opened detail.' : ' Unopened detail.'}</span>
    </summary>
    {children}
  </details>;
}

export function DiscoveryDetails({ detailId, ...props }: DetailProps & { detailId: string }) {
  const { progress } = useProgress();
  const learner = progress?.learners.find(row => row.id === localLearnerId);
  const [openedHere, setOpenedHere] = useState<string[]>([]);
  const explored = Boolean(learner?.exploredDetails?.includes(detailId) || openedHere.includes(detailId));
  function explore() {
    setOpenedHere(ids => ids.includes(detailId) ? ids : [...ids, detailId]);
    // Reading stays available if storage is unavailable. The cue still stops
    // immediately for this visit; a later visit can retry saving the preference.
    void markDetailExplored(db, localLearnerId, detailId).catch(() => {});
  }
  return <DiscoveryDetailsView {...props} detailId={detailId} explored={explored} reduceMotion={learner?.reduceMotion} onExplore={explore} />;
}
