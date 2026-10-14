import { liveQuery } from 'dexie';
import type { AstronDb } from './db';
import { readProgress } from './progressServices';

// Dexie also notices changes made in another tab at the same browser address.
export function observeProgress(database: AstronDb) {
  return liveQuery(() => readProgress(database));
}
