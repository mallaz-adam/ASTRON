import { Dexie, type Table } from 'dexie';
import type { ActivityDay, Answer, ArticleRead, Completion, Learner, LearnerInterest, LitStar, QuestDone } from './types';

export class AstronDb extends Dexie {
  learners!: Table<Learner, string>;
  learnerInterests!: Table<LearnerInterest, [string, string]>;
  activityDays!: Table<ActivityDay, [string, string]>;
  questDone!: Table<QuestDone, [string, string, string]>;
  completions!: Table<Completion, [string, string]>;
  answers!: Table<Answer, [string, string]>;
  litStars!: Table<LitStar, [string, string]>;
  articleReads!: Table<ArticleRead, [string, string]>;

  constructor(name = 'astron-progress') {
    super(name);
    // The first field is the unique key. Brackets combine fields into one key.
    this.version(1).stores({
      learners: 'id',
      learnerInterests: '[learnerId+interestId], learnerId',
      activityDays: '[learnerId+dayDate], learnerId',
      questDone: '[learnerId+dayDate+questId], learnerId, [learnerId+dayDate]',
      completions: '[learnerId+cellId], learnerId',
      answers: '[learnerId+exerciseId], learnerId',
      litStars: '[learnerId+starId], learnerId',
      articleReads: '[learnerId+articleId], learnerId',
    });
  }
}

export const db = new AstronDb();
