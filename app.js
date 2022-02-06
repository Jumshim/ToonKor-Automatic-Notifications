const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

//templating to pass variables
//put other templates within templates
//react = powerful javascript rendering
let db = new sqlite3.Database('webtoons.db', sqlite3.OPEN_READWRITE, (err) => {
    if(err) {
        return console.error(err.message);
    }
    console.log('Connected to the out-of-memory SQlite database.');
});

function getTitles(userID, day) {
    let data = [];
    return new Promise(resolve => {
        db.all(`SELECT * FROM webtoons WHERE user_id=? AND day=?`, [userID, day], (err, rows) => {
            if(err) { throw err };
            rows.forEach((row => {
                data.push(row);
            }))
            resolve(data);
        })
    })
}

function getAllTitles() {
    let data = [];
    return new Promise(resolve => {
        db.all(`SELECT title FROM webtoons`, (err, rows) => {
            if(err) { throw err };
            rows.forEach((row => {
                data.push(row);
            }))
            resolve(data);
        })
    })
}


app.use(express.static(path.join(__dirname, 'js')));

app.use(cors());

app.set('view engine', 'ejs');

//req is an object containing information about the HTTP request that raised the event. 
//In response to req, you use res to send back the desired HTTP response.
app.get('/data', async function(req, res) {
    let webtoons = await getTitles(1, "Thursday");
    res.json(webtoons);
});

app.get('/resource', async function(req, res) {
    let repo = await getAllTitles();
    res.json(repo);
});

app.get('/', async function(req, res) {
    let webtoons = await getTitles(1, "Thursday");
    let repo = await getAllTitles();
    res.render('index', {data: {webtoons: webtoons, repo: repo}});
})

app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`);
})

//hello