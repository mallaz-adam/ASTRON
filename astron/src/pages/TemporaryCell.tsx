import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { completePathCell } from '../data/pathServices';
import { buildCoursePath } from '../logic/coursePath';
import { useToday } from './useToday';
import './CoursePath.css';

export function TemporaryCell() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { model, content, progress, error } = useToday();
  const [saveError, setSaveError] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const contentCell = content?.cells.find(cell => cell.id === id);
  const cell = contentCell && progress ? buildCoursePath(content!, progress, localLearnerId, contentCell.unitId).cells.find(row => row.id === id) : undefined;

  async function finish() {
    if (!cell || !content || cell.state === 'locked' || saving.current) return;
    saving.current = true;
    setBusy(true);
    setSaveError('');
    try {
      await completePathCell(db, content, localLearnerId, cell.id, new Date());
      navigate('/learn');
    } catch (problem) {
      setSaveError(problem instanceof Error ? problem.message : String(problem));
      saving.current = false;
      setBusy(false);
    }
  }

  if (content && !contentCell) return <Navigate to="/learn" replace />;
  return <Page className="course-page" reduceMotion={model?.reduceMotion} skipLabel="Cell">
    <main id="main-content" className="temporary-cell" tabIndex={-1} aria-busy={!model || busy}>
      <Link className="course-return" to="/learn">Course path</Link>
      <p className="course-label">TEMPORARY · Cell</p>
      {cell && <>
        <h1>{cell.title}</h1>
        <p>Lessons arrive in the next step.</p>
        {cell.state === 'locked' && <p>Finish the cell before it to open this one.</p>}
        <Button disabled={!model || busy || cell.state === 'locked'} onClick={finish}>Mark as finished (test)</Button>
      </>}
      {(error || saveError) && <p role="alert">{error || saveError}</p>}
    </main>
  </Page>;
}
