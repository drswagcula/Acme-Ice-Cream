const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); 

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS flavors");
  db.run(`
    CREATE TABLE flavors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_favorite BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed the table with some flavors
  const flavorsToSeed = [
    { name: 'Vanilla', is_favorite: true },
    { name: 'Chocolate', is_favorite: true },
    { name: 'Strawberry', is_favorite: false },
    { name: 'Mint Chocolate Chip', is_favorite: true },
    { name: 'Rocky Road', is_favorite: false }
  ];

  const stmt = db.prepare("INSERT INTO flavors (name, is_favorite) VALUES (?, ?)");
  flavorsToSeed.forEach(flavor => {
    stmt.run(flavor.name, flavor.is_favorite);
  });
  stmt.finalize();

  console.log('Flavors table created and seeded.');
});

module.exports = db;