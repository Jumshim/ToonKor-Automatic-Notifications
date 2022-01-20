const fs = require('fs');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();

/**
 * Database gets a sqlite3 database and serves to:
 * get the appropriate webtoons for notification
 * updates appropriate webtoons
 */

/**
 * ORM = separate class for every single table
 * user object, webtoon object ...
 * RAW sql statements -> collection of objects that represent the rows/columns
 * 
 * class User {
 *      constructor(db) {
 *          this.db = db;
 *          this.db.getAll()
 *          //transforms everything in db to object representations
 *      }
 * 
 *      getValues() {  
 *          
 *      }
 * }
 * 
 * what's nice about raw sql statements;
 * to serialize/martial millions of data is faster when using raw sql vs ORMs
 * a lot easier to work with tuples
 * 
 * But it is inconvenient; abstraction sucks
 * 
 * when you start doing bulk things, the optimizations are trash
 */

class Database {
    constructor(db) {
        this.db = db;
    }

    getTitles(userID, day) {
        let data = [];
        return new Promise(resolve => {
            this.db.all(`SELECT * FROM webtoons WHERE user_id=? AND day=?`, [userID, day], (err, rows) => {
                if(err) { throw err };
                rows.forEach((row => {
                    data.push(row);
                }))
                resolve(data);
            })
        })
    }

    updateDailyTitles(day) {
        this.db.run(`UPDATE webtoons SET chapter=chapter+1 WHERE day=?`, [day], err => {
            if(err) { return console.error(err.message); }
        });
    }

    async getReceivingAddress(userID) {
        return new Promise(resolve => {
            this.db.get(`SELECT email FROM users WHERE id=?`, [userID], (err, row) => {
                if(err) { return console.error(err.message); }
                resolve(row["email"]);
            });
        })
    }
}


/**
 * UserProfile is responsible for verifying a user's webtoon + email data,
 * updating their webtoons list,
 * and creating a message to be sent to the MailSender
 */

class UserProfile {
    constructor(credentialsFileName) {
        this.credentialsFileName = credentialsFileName;
    }
    
    getCredentials() {
        let creds;
        try {
            creds = require(this.credentialsFileName); 
        } catch(err) {
            throw new Error("credentials.json does not exist, check README"); 
        }
        const keys = ["username", "password"]
        for (let item of keys) {
            if(creds[item] == null) {
                throw new Error(`${item} is not defined in credentials.json`);
            }
        }
        return creds;
    }

    createMessage(webtoons) {
        let message = "Newly Updated Korean Raws:\n";
        for(let x of webtoons) {
            message += `
            ${x.title}:
                URL: ${x.url + x.chapter + "%ED%99%94.html"}
                Chapter:${x.chapter}
                `
        }
        return message;
    }
}

/**
 * Mail sender takes in a set of credentials (sender address, sender password, receiver address)
 * and sends an email accordingly
 */

class MailSender {
    constructor(credentials){ 
        this.credentials = credentials;
    }

    async sendMail(text, subject, receiverAddress) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.credentials.username,
                pass: this.credentials.password
            }
        });
        const mailOptions = {
            from: this.credentials.username,
            to: receiverAddress,
            subject: subject,
            text: text
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                throw new Error('Email did not work');
            } else{
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

function getDay() {
    const dateOb = new Date();
    const name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = name[dateOb.getDay()];
    return day;
}

async function runMain() {
    let db = new sqlite3.Database('webtoons.db', sqlite3.OPEN_READWRITE, (err) => {
        if(err) {
            return console.error(err.message);
        }
        console.log('Connected to the out-of-memory SQlite database.');
    });

    const user = new UserProfile("./credentials.json", "./webtoons.json");
    let database = new Database(db);
    let webtoons = await database.getTitles(1, getDay());    
    const mailer = new MailSender(user.getCredentials());
    let email = await database.getReceivingAddress(1);
    try { 
        await mailer.sendMail(user.createMessage(webtoons), 'Korean Raw Updater', email);
        database.updateDailyTitles(1, getDay());
    } catch(e) {
        console.log('Error with the email');
    }
    db.close();
}

runMain();
