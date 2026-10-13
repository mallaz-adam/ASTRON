export function DevSun({ stage }: { stage: 0 | 1 | 2 | 3 }) {
  const radius = [16, 18, 23, 27][stage];
  return (
    <svg className={`dev-sun dev-sun--${stage}`} viewBox="0 0 100 100" role="img" aria-label={`Today's sun: stage ${stage} of 3`}>
      {stage === 3 && <circle className="dev-sun-corona" cx="50" cy="50" r="42" />}
      {stage > 0 && Array.from({ length: 12 }, (_, index) => (
        <path key={index} d="M50 12v8" transform={`rotate(${index * 30} 50 50)`} />
      ))}
      <circle className="dev-sun-disc" cx="50" cy="50" r={radius} />
    </svg>
  );
}
