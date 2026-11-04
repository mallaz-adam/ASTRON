type QuestRowProps = {
  kind: string;
  title: string;
  xp: number;
  done?: boolean;
  description?: string;
  statusText?: string;
  showXp?: boolean;
};

export function QuestRow({ kind, title, xp, done = false, description, statusText, showXp = true }: QuestRowProps) {
  return (
    <div className={`quest-row ${done ? 'quest-row--done' : ''}`}>
      <span className="quest-box" aria-hidden="true">{done ? '✓' : ''}</span>
      <div className="quest-copy">
        <span className="quest-kind">{kind}</span>
        <span className="quest-title">{title}</span>
        {description && <span className="quest-description">{description}</span>}
        <span className="quest-status">{statusText ?? (done ? 'Done' : 'Pending')}</span>
      </div>
      {showXp && <span className="quest-xp">+{xp} XP</span>}
    </div>
  );
}
