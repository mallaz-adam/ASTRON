import { useState } from 'react';
import type { PathCell } from '../logic/coursePath';
import { hexPoints, hexPosition, honeycombSize, titleLines } from '../logic/honeycomb';
import './Honeycomb.css';

export function Honeycomb({ cells, selectedId, onSelect }: { cells: PathCell[]; selectedId: string; onSelect: (id: string) => void }) {
  const [focusId, setFocusId] = useState('');
  const { radius, width, height } = honeycombSize;
  const buttonWidth = radius * Math.sqrt(3);
  return <div className="honeycomb" style={{ aspectRatio: `${width} / ${height}` }}>
    <svg className="honeycomb-drawing" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {cells.map((cell, index) => {
        const { x, y } = hexPosition(index);
        const lines = titleLines(cell.title);
        return <g key={cell.id} className={`hex hex--${cell.kind} hex--${cell.state}${index % 2 ? ' hex--alternate' : ''}`}>
          <polygon className="hex-face" points={hexPoints(x, y)} />
          {cell.state === 'current' && <polygon className="hex-pulse" points={hexPoints(x, y, radius - 1)} />}
          <text className="hex-label" x={x} y={y - 27} textAnchor="middle">{cell.kind === 'tale' ? 'TALE' : cell.kind === 'quiz' ? 'FINAL' : cell.positionNo}</text>
          <text className="hex-title" textAnchor="middle">{lines.map((line, row) => <tspan key={line} x={x} y={y + (lines.length === 1 ? 2 : -5 + row * 15)}>{line}</tspan>)}</text>
          {cell.state === 'locked' ? <g className="hex-lock" transform={`translate(${x - 4} ${y + 21})`}><path d="M1 4V2a3 3 0 0 1 6 0v2" /><rect x="0" y="4" width="8" height="7" /></g>
            : <text className={`hex-status${cell.state === 'current' ? ' hex-begin' : ''}`} x={x} y={y + 29} textAnchor="middle">{cell.state === 'done' ? '✓' : 'BEGIN'}</text>}
          {selectedId === cell.id && <polygon className="hex-selection" points={hexPoints(x, y, radius - 1)} />}
          {focusId === cell.id && <polygon className="hex-focus" points={hexPoints(x, y, radius - 1)} />}
        </g>;
      })}
      {cells.slice(0, -1).map((cell, index) => {
        const from = hexPosition(index), to = hexPosition(index + 1);
        const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
        return <path key={cell.id} className="hex-arrow" d="M-4-3L4 0-4 3z" transform={`translate(${(from.x + to.x) / 2} ${(from.y + to.y) / 2}) rotate(${angle})`} />;
      })}
    </svg>
    {cells.map((cell, index) => {
      const { x, y } = hexPosition(index);
      return <button key={cell.id} type="button" className="hex-button" aria-label={cell.label} aria-pressed={cell.id === selectedId}
        aria-controls="cell-details" onClick={() => onSelect(cell.id)} onFocus={() => setFocusId(cell.id)} onBlur={() => setFocusId('')}
        style={{ left: `${(x - buttonWidth / 2) / width * 100}%`, top: `${(y - radius) / height * 100}%`, width: `${buttonWidth / width * 100}%`, height: `${radius * 2 / height * 100}%` }} />;
    })}
  </div>;
}
