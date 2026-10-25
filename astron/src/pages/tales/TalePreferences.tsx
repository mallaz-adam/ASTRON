import { useEffect, useRef, useState } from 'react';
import type { DailyGoal, Interest } from '../../data/types';
import { Button } from '../../design/Button';
import { Chip } from '../../design/Chip';
import { TaleGlaux } from './TaleCommon';

export function TalePreferences({ interests, selected, dailyGoal, reduceMotion, busy, onSave }: {
  interests: Interest[]; selected: string[]; dailyGoal: DailyGoal; reduceMotion: boolean; busy: boolean;
  onSave: (interests: string[], goal: DailyGoal, motion: boolean) => void;
}) {
  const [step, setStep] = useState<'interests' | 'goal'>('interests');
  const [choices, setChoices] = useState(selected);
  const [goal, setGoal] = useState(dailyGoal);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, [step]);
  return <section className="tale-preferences" aria-labelledby="preferences-title"><p className="tale-eyebrow">Make the atlas yours</p>
    <h1 id="preferences-title" ref={heading} tabIndex={-1}>{step === 'interests' ? 'What would you like to explore?' : 'A little sky, each day'}</h1>
    {step === 'interests' ? <><p>Choose what interests you. You can also continue without choosing.</p><div className="interest-choices">{interests.map(interest => <Chip key={interest.id} selected={choices.includes(interest.id)} onClick={() => setChoices(previous => previous.includes(interest.id) ? previous.filter(id => id !== interest.id) : [...previous, interest.id])}>{interest.label}</Chip>)}</div><Button onClick={() => setStep('goal')}>Continue</Button></>
      : <><p>Quests are small daily activities: learn, read an article, or explore a story. Choose how many to finish each day to keep your streak.</p><fieldset className="daily-goal-choices"><legend>Daily goal</legend>{([{ value: 1, name: 'Light', detail: '1 quest' }, { value: 2, name: 'Steady', detail: '2 quests' }, { value: 3, name: 'Full', detail: '3 quests' }] as const).map(option => <label className="daily-goal-choice" key={option.value}><input type="radio" name="daily-goal" value={option.value} checked={goal === option.value} onChange={() => setGoal(option.value)} /><span>{option.name}</span><span>{option.detail}</span></label>)}</fieldset>
        <TaleGlaux mood="gentle">You can begin with one small discovery each day.</TaleGlaux>
        <div className="tale-actions"><Button variant="secondary" onClick={() => setStep('interests')} disabled={busy}>Back</Button><Button disabled={busy} onClick={() => onSave(choices, goal, reduceMotion)}>Start exploring</Button></div></>}
  </section>;
}
