import type { AstronDb } from './db';
import { previewDatabaseName } from './progressMode';

export async function prepareProgress(database: AstronDb, temporary: boolean) {
  // Keep temporary working records in IndexedDB so all existing services still
  // behave normally. Discard them before rendering a new development visit.
  // Never clear the permanent learner database, even with a wrong mode flag.
  if (!temporary) return;
  if (database.name !== previewDatabaseName) throw new Error('Temporary progress needs its own preview database.');
  await database.transaction('rw', database.tables, async () => {
    for (const table of database.tables) await table.clear();
  });
}
