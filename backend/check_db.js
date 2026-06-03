import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
const users = db.prepare('SELECT id, name, email, role FROM users').all();
console.log('--- Users ---');
console.log(users);

const protocols = db.prepare('SELECT * FROM protocols').all();
console.log('--- Protocols ---');
console.log(protocols);

const lines = db.prepare('SELECT * FROM research_lines').all();
console.log('--- Research Lines ---');
console.log(lines);
