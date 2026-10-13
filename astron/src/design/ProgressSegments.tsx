type ProgressSegmentsProps = {
  label: string;
  filled: number;
  total?: number;
};

export function ProgressSegments({ label, filled, total = 6 }: ProgressSegmentsProps) {
  if (!Number.isInteger(total) || total < 1 || !Number.isInteger(filled) || filled < 0 || filled > total) {
    throw new RangeError('Progress needs a positive total and a filled count between zero and total.');
  }

  return (
    <div className="progress-specimen">
      <div className="progress-caption"><span>{label}</span><span>{filled} / {total}</span></div>
      <div className="progress-segments" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={filled}>
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={`progress-segment ${index < filled ? 'progress-segment--filled' : ''}`} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
