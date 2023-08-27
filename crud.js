const Database = require('better-sqlite3');
const db = new Database('stocks.db', {
    fileMustExist: true,
    verbose: console.log
});

console.log(db.prepare("SELECT * FROM stocks").run())