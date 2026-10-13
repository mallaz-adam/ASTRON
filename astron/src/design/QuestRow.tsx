type QuestRowProps = {
  kind: string;
  title: string;
  xp: number;
  done?: boolean;
};

export function QuestRow({ kind, title, xp, done = false }: QuestRowProps) {
  return (
    <div className={`quest-row ${done ? 'quest-row--done' : ''}`}>
      <span className="quest-box" aria-hidden="true">{done ? '✓' : ''}</span>
      <div className="quest-copy">
        <span className="quest-kind">{kind}</span>
        <span className="quest-title">{title}</span>
        <span className="quest-status">{done ? 'Done' : 'Pending'}</span>
      </div>
      <span className="quest-xp">+{xp} XP</span>
    </div>
  );
}
