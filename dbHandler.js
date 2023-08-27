const { initDb } = require('./initDb');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('stocks.db');
initDb(db);

const DAYS = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
};

function getTradingDate() {
    let today = new Date();

    if (today.getDay() === 0)
        today = new Date(today.setDate(today.getDate() - 2));
    else if (today.getDay() === 6)
        today = new Date(today.setDate(today.getDate() - 1));

    return today;
}

async function handleStocks(operation, data) {
    const { stockId, stockName, stockCode, mon, tue, wed, thu, fri } = data;

    if (operation === "insert") {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            db.run('INSERT INTO stocks (name, code) VALUES (?, ?)', stockName, stockCode, function (err) {
                if (err)
                    db.run("ROLLBACK");
                else {
                    const stockId = this.lastID;
                    db.run(`INSERT INTO stocks_patterns (stock_id, mon, tue, wed, thu, fri) VALUES (?, ?, ?, ?, ?, ?)`,
                        stockId,
                        mon,
                        tue,
                        wed,
                        thu,
                        fri, function (err) {
                            if (err)
                                db.run("ROLLBACK");
                            else
                                db.run("COMMIT");
                        });
                }
            })
        })
    }
    else if (operation === "update") {
        db.serialize(() => {
            console.log(stockName, stockCode, stockId)
            console.log(mon, tue, wed, thu, fri)
            db.run("BEGIN TRANSACTION");
            db.run('UPDATE stocks SET name=?, code=? WHERE id=?', stockName, stockCode, stockId, function (err) {
                if (err) {
                    console.log(err);
                    db.run("ROLLBACK");
                }
                else {
                    db.run(`UPDATE stocks_patterns SET mon=?, tue=?, wed=?, thu=?, fri=? WHERE stock_id=?`,
                        mon,
                        tue,
                        wed,
                        thu,
                        fri,
                        stockId,
                        function (err) {
                            if (err) {
                                console.log(err);
                                db.run("ROLLBACK");
                            }
                            else
                                db.run("COMMIT");
                        });
                }
            })
        })
    }
    else if (operation === "get") {
        return new Promise((resolve, reject) => {

            const stock = {};
            console.log("stockId", stockId)
            db.each(`SELECT s.id, name, code, mon, tue, wed, thu, fri FROM stocks s
            INNER JOIN stocks_patterns p ON p.stock_id = s.id
            WHERE s.id = ?`, stockId, (err, row) => {
                if (err)
                    resolve({})
                else {
                    stock.stockName = row.name;
                    stock.stockCode = row.code;
                    stock.stockId = row.id;
                    stock.days = {
                        mon: row.mon,
                        tue: row.tue,
                        wed: row.wed,
                        thu: row.thu,
                        fri: row.fri
                    }
                    resolve(stock)
                }
            })
        });
    }
    else if (operation === "list") {
        if (data.type === "all") {
            return new Promise((resolve, reject) => {

                const stock = {};
                db.all(`SELECT s.id, name, code, mon, tue, wed, thu, fri FROM stocks s
                INNER JOIN stocks_patterns p ON p.stock_id = s.id`, (err, rows) => {
                    if (err)
                        resolve([])

                    else {
                        const stocks = [];
                        for (let row of rows) {
                            const stock = {};
                            stock.stockId = row.id;
                            stock.stockName = row.name;
                            stock.stockCode = row.code;
                            stock.days = {
                                mon: row.mon,
                                tue: row.tue,
                                wed: row.wed,
                                thu: row.thu,
                                fri: row.fri
                            }

                            stocks.push(stock);
                        }
                        resolve({ stocks });
                    }
                })
            });
        }
        if (data.type === "today") {
            return new Promise((resolve, reject) => {
                const today = getTradingDate();

                let day_today = DAYS[today.getDay()];

                db.all(`SELECT s.id, name, code, mon, tue, wed, thu, fri FROM stocks s
                INNER JOIN stocks_patterns p ON p.stock_id = s.id
                WHERE p.${day_today} = 1`, (err, rows) => {
                    if (err) {
                        console.log(err)
                        resolve([])
                    }

                    else {
                        const stocks = [];
                        for (let row of rows) {
                            const stock = {};
                            stock.stockId = row.id;
                            stock.stockName = row.name;
                            stock.stockCode = row.code;
                            stock.days = {
                                mon: row.mon,
                                tue: row.tue,
                                wed: row.wed,
                                thu: row.thu,
                                fri: row.fri
                            }
                            stock.today = today;

                            stocks.push(stock);
                        }
                        resolve({ stocks, today });
                    }
                })
            });
        }
    }
}

module.exports = { handleStocks };