import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { Honeycomb } from '../design/Honeycomb';
import { Button } from '../design/Button';
import { GlauxArt } from '../design/InlineArt';
import type { CoursePathModel } from '../logic/coursePath';
import { useDesktopLayout } from '../hooks/useDesktopLayout';
import { TodayTabs } from './TodayTabs';
import './Today.css';
import './CoursePath.css';

export function CoursePathView({ model, reduceMotion }: { model: CoursePathModel; reduceMotion: boolean }) {
  const desktop = useDesktopLayout();
  const [selectedId, setSelectedId] = useState('');
  const selected = model.cells.find(cell => cell.id === selectedId) ?? model.current ?? model.cells.at(-1);
  return <Page className="course-page" reduceMotion={reduceMotion} skipLabel="Course path">
    <main id="main-content" className="course-main" tabIndex={-1}>
      {desktop && <TodayTabs />}
      <header className="course-heading">
        <p className="course-label">{model.unitLabel}</p>
        <h1>{model.unit.title}</h1>
        <p className="course-count" role="status">{model.countText}</p>
        <div className="course-guide"><GlauxArt mood="thinking" /><p>{model.glaux}</p></div>
      </header>
      {selected && <div className="course-layout">
        <Honeycomb cells={model.cells} selectedId={selected.id} onSelect={setSelectedId} />
        <section id="cell-details" className="cell-details" aria-live="polite" aria-atomic="true" aria-labelledby="cell-title">
          <p className="course-label">CELL {selected.positionNo} · {selected.kind.toUpperCase()}</p>
          <h2 id="cell-title">{selected.title}</h2>
          <p className="cell-detail-line">{selected.line}</p>
          {selected.state === 'locked' ? <Button disabled>BEGIN</Button>
            : <Link className="atlas-button atlas-button--primary course-action" to={`/cell/${selected.id}`}>{selected.action}</Link>}
        </section>
      </div>}
      <section className="chapter-evaluation" aria-labelledby="chapter-evaluation-title">
        <p className="course-label">End of chapter</p>
        <h2 id="chapter-evaluation-title">Chapter evaluation</h2>
        <p>Bring together what you have learned throughout {model.unit.title}.</p>
        <p>This chapter is still being written. Its full evaluation will appear here when the remaining lessons are ready.</p>
        <Button disabled>Coming later</Button>
      </section>
      {!desktop && <TodayTabs />}
    </main>
  </Page>;
}
