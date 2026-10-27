// Content belongs to the author. Progress belongs to one learner on this device.
export type Interest = { id: string; label: string };
export type Constellation = { id: string; name: string; mythNote: string };
export type Star = { id: string; name: string; greekLetter: string; factText: string; constellationId: string };
export type Tale = { id: string; title: string; subtitle: string; minutes: number; teaser: string; sourceNote: string; starId: string; reader?: string };
export type Chapter = { taleId: string; number: number; title: string; text: string; marginNotes: string[]; glaux?: string; presentation?: 'hunter' | 'landscape' | 'chart' | 'guided-chart' };
export type Unit = { id: string; title: string; summary: string; orderNo: number };
export type CellKind = 'lesson' | 'tale' | 'quiz';
type CellFields = { id: string; positionNo: number; title: string; minutes: number; unitId: string };
export type Cell = CellFields & ({ kind: 'tale'; taleId: string } | { kind: 'lesson' | 'quiz'; taleId?: never });
export type GlauxMood = 'happy' | 'thinking' | 'proud' | 'cheering' | 'gentle' | 'sleepy';
export type HunchChoice = 'blue' | 'orange' | 'red' | 'skipped';
export type HunchOption = { id: Exclude<HunchChoice, 'skipped'>; text: string; colour: string };
export const glauxPoolIds = [
  'firstTryRight', 'rightAfterMisses', 'rightWithHint', 'missed', 'showMe', 'sneeze',
  'hunchBlue', 'hunchOrange', 'hunchRed', 'hunchSkip', 'orderCallbackBlue', 'orderCallbackOther',
  'dialRedEnd', 'gapFlagFew', 'gapFlagTen', 'endingHunch', 'endingSkipped', 'endingTease',
  'todayBegin', 'todayContinue', 'todayKept', 'sunBegin', 'sunGrowing', 'sunReturn',
  'pathBegin', 'pathContinue', 'pathComplete',
] as const;
export type GlauxPoolId = typeof glauxPoolIds[number];
export type GlauxLinePool = { id: GlauxPoolId; lines: string[] };
type SpokenCard = { mood: GlauxMood; glaux: string; art?: string };
export type LessonCard =
  | (SpokenCard & { kind: 'say' })
  | (SpokenCard & { kind: 'idea'; text: string })
  | (Omit<SpokenCard, 'glaux'> & { kind: 'hunch'; glaux: [string, string]; options: HunchOption[]; skipLabel: string })
  | (SpokenCard & { kind: 'dial' | 'mass' | 'race' | 'gap'; text: string })
  | { kind: 'exercise'; exerciseId: string }
  | (SpokenCard & { kind: 'recap'; items: string[] });
export type Lesson = { id: string; title: string; cards: LessonCard[]; cellId: string; placeholder?: boolean };
export type ExerciseType = 'choice' | 'connect' | 'order' | 'find' | 'estimate';
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type Exercise = {
  id: string; type: ExerciseType; prompt: string; contentData: { [key: string]: JsonValue }; xpValue: number; cellId: string;
  glaux: string; hint: string; rightLine: string; missedLine: string; explanation: string;
};
export type QuestKind = 'learn' | 'story' | 'read';
export type Quest = { id: string; kind: QuestKind; title: string; xpReward: number };
export type ArticleCover = { src: string; alt: string; caption: string; credit: string; source: string; license: string; licenseUrl: string };
export type Article = { id: string; title: string; summary: string; body: string; readingMin: number; sourceNote?: string; category?: string; cover?: ArticleCover };
export type UnitArticle = { unitId: string; articleId: string };

export type DailyGoal = 1 | 2 | 3;
export type TaleStage = 'cover' | 'story' | 'star' | 'activity' | 'sky' | 'preferences';
export type TaleVisit = { taleId: string; stage: TaleStage; chapter: number; readThrough: boolean; beltOutcome?: 'independent' | 'assisted' };
export type Learner = { id: string; displayName: string; dailyGoal: DailyGoal; language: string; reduceMotion: boolean; freezesLeft: number; welcome?: { startedOn: string; introductionSeenOn?: string; completedOn?: string }; taleVisit?: TaleVisit; exploredDetails?: string[] };
export type LearnerInterest = { learnerId: string; interestId: string };
// The goal is saved for the day, so later goal changes do not rewrite history.
export type ActivityDay = { learnerId: string; dayDate: string; freezeUsed: boolean; dailyGoal: DailyGoal };
export type QuestDone = { learnerId: string; dayDate: string; questId: string; doneOn: string; xpEarned: number };
export type Completion = { learnerId: string; cellId: string; completedOn: string; correctAnswers: number; xpEarned: number };
export type Answer = { learnerId: string; exerciseId: string; answeredOn: string; correct: boolean; attempts: number };
export type StarTint = 'blue' | 'orange' | 'red' | 'gold';
export type LitStar = { learnerId: string; starId: string; litOn: string; how: 'tale' | 'lesson' | 'sighting'; tint?: StarTint };
export type ArticleRead = { learnerId: string; articleId: string; readOn: string };

export type Content = {
  interests: Interest[]; constellations: Constellation[]; stars: Star[];
  tales: Tale[]; chapters: Chapter[]; units: Unit[]; cells: Cell[];
  lessons: Lesson[]; exercises: Exercise[]; quests: Quest[];
  articles: Article[]; unitArticles: UnitArticle[]; glauxLines: GlauxLinePool[];
};

export type Progress = {
  learners: Learner[]; learnerInterests: LearnerInterest[]; activityDays: ActivityDay[];
  questDone: QuestDone[]; completions: Completion[]; answers: Answer[];
  litStars: LitStar[]; articleReads: ArticleRead[];
};
