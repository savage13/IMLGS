
import Database from 'better-sqlite3';

export let db: Database = undefined

export function db_init() {
  const db_options = {}
  db = new Database('imlgs.db', db_options);
  db.pragma('journal_mode = WAL');
}

