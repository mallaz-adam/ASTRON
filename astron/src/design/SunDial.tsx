import type { SunModel } from '../logic/sun';

function point(radius: number, turn: number) {
  const angle = turn * Math.PI * 2;
  return { x: 159 + radius * Math.sin(angle), y: 159 - radius * Math.cos(angle) };
}

export function SunDial({ model }: { model: SunModel }) {
  const circumference = 2 * Math.PI * 148;
  const marker = point(148, model.ring.ratio);
  return (
    <svg className="sun-dial" viewBox="0 0 318 318" role="img" aria-label={model.description}>
      <desc>{model.description}</desc>
      <g aria-hidden="true">
        <circle className="dial-track" cx="159" cy="159" r="148" />
        {model.ring.ratio > 0 && <circle className="dial-progress" cx="159" cy="159" r="148" strokeDasharray={`${circumference * model.ring.ratio} ${circumference}`} transform="rotate(-90 159 159)" />}
        {model.ring.ticks.map(tick => {
          const start = point(141, tick), end = point(155, tick);
          return <line key={tick} className="dial-tick" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
        })}
        <circle className="dial-marker" cx={marker.x} cy={marker.y} r="8" />
        <circle className="halo dial-halo" cx="159" cy="159" r="62" />
        {model.rays.map(ray => {
          const turn = ray.angle / 360;
          const start = point(64, turn), end = point(ray.isToday ? 108 : 100, turn), label = point(126, turn);
          return <g key={ray.dayDate} className={`dial-ray dial-ray--${ray.state}${ray.isToday && ray.state === 'kept' ? ' dial-ray--pulse' : ''}`} data-date={ray.dayDate}>
            <line className="dial-ray-ink" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            {ray.state === 'kept' && <line className="dial-ray-gold" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />}
            <text className={`dial-initial${ray.isToday ? ' dial-initial--today' : ''}`} x={label.x} y={label.y} textAnchor="middle" dominantBaseline="central">{ray.initial}</text>
          </g>;
        })}
        <circle className="dial-disc" cx="159" cy="159" r="54" />
        <text className="dial-number" x="159" y="163" textAnchor="middle">{model.streak}</text>
        <text className="dial-days" x="159" y="185" textAnchor="middle">DAYS</text>
      </g>
    </svg>
  );
}
