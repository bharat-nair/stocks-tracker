function initDb(db){
    db.run(`CREATE TABLE IF NOT EXISTS "stocks" (
        "id"	INTEGER NOT NULL UNIQUE,
        "name"	TEXT NOT NULL,
        "code"	TEXT,
        PRIMARY KEY("id" AUTOINCREMENT)
    )`, (err) => {
        if (err) {
            console.error('Error creating stocks table:', err.message);
        } else {
            console.log('stocks table created successfully.');
        }
    });
    
    db.run(`CREATE TABLE IF NOT EXISTS "stocks_patterns" (
        "id"	INTEGER NOT NULL UNIQUE,
        "stock_id"	INTEGER NOT NULL,
        "mon"	INTEGER DEFAULT 0,
        "tue"	INTEGER DEFAULT 0,
        "wed"	INTEGER DEFAULT 0,
        "thu"	INTEGER DEFAULT 0,
        "fri"	INTEGER DEFAULT 0,
        PRIMARY KEY("id" AUTOINCREMENT),
        FOREIGN KEY("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error('Error creating stocks_patterns table:', err.message);
        } else {
            console.log('stocks_patterns table created successfully.');
        }
    });
}

module.exports = { initDb };