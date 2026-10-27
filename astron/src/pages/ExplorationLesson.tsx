import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Content, Exercise, Lesson } from '../data/types';
import { loadExplorationLesson, type ExplorationLesson as LessonData } from '../data/explorationLesson';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { submitLessonExam } from '../data/lessonServices';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { DiscoveryDetails } from '../design/DiscoveryDetails';
import { GlauxArt } from '../design/InlineArt';
import { correctSelection, exerciseItems } from '../logic/lessonPlayer';
import type { ExamAnswers } from '../logic/lessonExam';
import { ExplorationDiagram } from './ExplorationDiagrams';
import './ExplorationLesson.css';

type Report = Awaited<ReturnType<typeof submitLessonExam>>;

function ExamControl({ exercise, selection, change, disabled }: { exercise: Exercise; selection: string[]; change: (value: string[]) => void; disabled: boolean }) {
  const items = exerciseItems(exercise);
  if (exercise.type==='order') return <div className="exploration-order"><p>Choose the items in order. Use Undo to change your sequence.</p><ol>{items.map((_,i)=><li key={i}>{items.find(item=>item.id===selection[i])?.text ?? 'Choose the next item'}</li>)}</ol><div className="exploration-levels">{items.map(item=><button key={item.id} type="button" disabled={disabled||selection.includes(item.id)} onClick={()=>change([...selection,item.id])}>{item.text}</button>)}</div><Button variant="secondary" disabled={disabled||!selection.length} onClick={()=>change(selection.slice(0,-1))}>Undo</Button></div>;
  return <fieldset className="exploration-options" disabled={disabled}><legend>Choose the answer and explanation that fit best.</legend>{items.map((item,i)=><label key={item.id}><input type="radio" name={exercise.id} value={item.id} checked={selection[0]===item.id} onChange={()=>change([item.id])} /><span><span className="exploration-letter">{String.fromCharCode(65+i)}.</span> {item.text}</span></label>)}</fieldset>;
}

export function ExplorationReader({ data, lesson, content, reduceMotion }: { data: LessonData; lesson: Lesson; content: Content; reduceMotion: boolean }) {
  const [section, setSection] = useState(0);
  const [view, setView] = useState<'read'|'exam'|'report'>('read');
  const [question, setQuestion] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswers>({});
  const [report, setReport] = useState<Report>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const writing = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = data.sections[section];
  const exercise = content.exercises.find(e=>e.id===data.questions[question].exerciseId)!;
  const filled = (e: Exercise) => (answers[e.id]?.length ?? 0)===(e.type==='order'?exerciseItems(e).length:1);
  const answered = data.questions.filter(q=>filled(content.exercises.find(e=>e.id===q.exerciseId)!)).length;

  useEffect(()=>{ document.title=`${lesson.title} · ASTRON`; },[lesson.title]);
  useEffect(()=>{ heading.current?.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); },[section,view,question]);
  function beginExam() { setAnswers({}); setQuestion(0); setReport(undefined); setError(''); setView('exam'); }
  async function submit() {
    if (writing.current) return;
    writing.current=true; setBusy(true); setError('');
    try { setReport(await submitLessonExam(db,content,localLearnerId,lesson.id,answers,new Date())); setView('report'); }
    catch(problem) { setError(problem instanceof Error?problem.message:String(problem)); }
    finally { writing.current=false; setBusy(false); }
  }
  function review(id: string) { setSection(data.sections.findIndex(s=>s.id===id)); setView('read'); }

  return <Page className="exploration-page" reduceMotion={reduceMotion} skipLabel="Skip to lesson"><main id="main-content" className="exploration-main" data-view={view} tabIndex={-1} aria-busy={busy}>
    <header className="exploration-header"><Link to="/learn">Back to the path</Link><span>Scale of the cosmos</span></header>
    {view==='read' && <>
      <p className="exploration-eyebrow">Lesson 1 · Part {section+1} of {data.sections.length}</p><h1 ref={heading} tabIndex={-1}>{current.title}</h1>
      {section===0 && <p className="exploration-introduction">{data.introduction}</p>}
      <label className="exploration-contents">Lesson contents<select value={section} onChange={e=>setSection(Number(e.target.value))}>{data.sections.map((s,i)=><option key={s.id} value={i}>{i+1}. {s.title}</option>)}</select></label>
      <div className="exploration-layout"><div className="exploration-prose">{current.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</div><aside className="exploration-visual" aria-label="Explore the idea"><ExplorationDiagram key={current.id} kind={current.diagram} /></aside></div>
      <div className="exploration-glaux"><GlauxArt mood="gentle" /><p>{current.glaux}</p></div>
      <nav className="exploration-actions" aria-label="Lesson sections"><Button variant="secondary" disabled={section===0} onClick={()=>setSection(section-1)}>Previous</Button>{section<data.sections.length-1?<Button onClick={()=>setSection(section+1)}>Continue</Button>:<Button onClick={beginExam}>{report?'Try the exam again':'Start the exam'}</Button>}</nav>
      {report && <Button variant="secondary" onClick={()=>setView('report')}>Back to results</Button>}
      <DiscoveryDetails detailId={`lesson:${lesson.id}:sources`} label="Sources"><ul className="exploration-sources">{data.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></DiscoveryDetails>
    </>}
    {view==='exam' && <>
      <p className="exploration-eyebrow">Understanding exam · Question {question+1} of {data.questions.length}</p><h1 ref={heading} tabIndex={-1}>{exercise.prompt}</h1><p>There is no timer. Change any answer before submitting. Explanations follow the complete exam.</p>
      <nav className="exploration-question-nav" aria-label="Exam questions">{data.questions.map((q,i)=>{const done=filled(content.exercises.find(e=>e.id===q.exerciseId)!);return <button key={q.exerciseId} type="button" aria-current={question===i?'step':undefined} aria-label={`Question ${i+1}, ${done?'answered':'unanswered'}`} onClick={()=>setQuestion(i)} disabled={busy}>{i+1}{done&&<span aria-hidden="true"> ✓</span>}</button>;})}</nav>
      <ExamControl key={exercise.id} exercise={exercise} selection={answers[exercise.id]??[]} disabled={busy} change={value=>setAnswers(old=>({...old,[exercise.id]:value}))} />
      <p role="status">{answered} of {data.questions.length} questions answered.</p><nav className="exploration-actions" aria-label="Exam controls"><Button variant="secondary" disabled={question===0||busy} onClick={()=>setQuestion(question-1)}>Previous question</Button>{question<data.questions.length-1?<Button disabled={!filled(exercise)||busy} onClick={()=>setQuestion(question+1)}>Next question</Button>:<Button disabled={answered!==data.questions.length||busy} onClick={()=>void submit()}>Submit exam</Button>}</nav>
    </>}
    {view==='report' && report && <>
      <p className="exploration-eyebrow">Your understanding · This attempt</p><h1 ref={heading} tabIndex={-1}>{report.correct} of {report.total} answered correctly</h1>
      <div className="exploration-glaux"><GlauxArt mood={report.correct===report.total?'proud':'gentle'} /><p>{report.correct===report.total?'You have connected the ideas. Your cosmic address is clear.':'Your answers show us which ideas to explore once more.'}</p></div>
      <div className="exploration-topics">{data.topics.map(topic=>{const ids=data.questions.filter(q=>q.topicId===topic.id).map(q=>q.exerciseId);const count=report.results.filter(r=>ids.includes(r.exerciseId)&&r.correct).length;return <section key={topic.id}><h2>{topic.title}</h2><p>{count} of {ids.length} answered correctly · {count===ids.length?'Secure':count?'Developing':'Revisit'}</p><p>{count===ids.length?topic.secureLine:topic.reviewLine}</p><button type="button" onClick={()=>review(topic.reviewSection)}>Review this idea</button></section>;})}</div>
      <section className="exploration-answer-review"><h2>Your answers, explained</h2>{report.results.map((result,i)=>{const e=content.exercises.find(e=>e.id===result.exerciseId)!;const text=(ids:string[])=>ids.map(id=>exerciseItems(e).find(item=>item.id===id)!.text).join(' → ');return <section key={e.id}><h3>{i+1}. {e.prompt}</h3><p className="exploration-result">{result.correct?'Answered correctly':'An idea to revisit'}</p><p><span className="exploration-review-label">Your answer:</span> {text(result.selection)}</p>{!result.correct&&<p><span className="exploration-review-label">Expected answer:</span> {text(correctSelection(e))}</p>}<p>{e.explanation}</p></section>;})}</section>
      {report.learnQuestEarned&&<p>Learn quest done: +20 XP.</p>}<p>Lesson complete. You can review any idea and try the exam again.</p><nav className="exploration-actions" aria-label="After the exam"><Link className="atlas-button atlas-button--primary" to="/learn">Back to the path</Link><Button variant="secondary" onClick={beginExam}>Try the exam again</Button></nav>
    </>}
    {error&&<p role="alert">{error}</p>}
  </main></Page>;
}

export function ExplorationLesson({ lesson, content, reduceMotion }: { lesson: Lesson; content: Content; reduceMotion: boolean }) {
  const [data,setData]=useState<LessonData>();
  const [error,setError]=useState('');
  useEffect(()=>{let active=true;void loadExplorationLesson(lesson,content).then(value=>{if(active)setData(value);}).catch(problem=>{if(active)setError(String(problem.message));});return()=>{active=false;};},[lesson,content]);
  if(!data)return <Page className="exploration-page" reduceMotion={reduceMotion} skipLabel="Skip to lesson"><main id="main-content" aria-busy={!error}><h1>Opening the lesson…</h1>{error&&<><p role="alert">{error}</p><Button onClick={()=>window.location.reload()}>Try again</Button></>}</main></Page>;
  return <ExplorationReader data={data} lesson={lesson} content={content} reduceMotion={reduceMotion} />;
}
