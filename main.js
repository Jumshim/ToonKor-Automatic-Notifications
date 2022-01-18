const fs = require('fs');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();

/**
 * Database gets a sqlite3 database and serves to:
 * get the appropriate webtoons for notification
 * updates appropriate webtoons
 */

class Database {
    constructor(db, day) {
        this.db = db;
        this.day = day;
    }

    getTitles() {
        let data = [];
        return new Promise(resolve => {
            this.db.all(`SELECT * FROM webtoons WHERE user_id=? AND day=?`, [1, this.day], (err, rows) => {
                if(err) { throw err };
                rows.forEach((row => {
                    data.push(row);
                }))
                resolve(data);
            })
        })
    }

    updateDailyTitles() {
        this.db.run(`UPDATE webtoons SET chapter=chapter+1 WHERE day=?`, [this.day], err => {
            if(err) { return console.error(err.message); }
        });
    }

    getReceivingAddress() {
        this.db.get(`SELECT email FROM users WHERE id=1`, (err, row) => {
            if(err) { return console.error(err.message); }
            return row["email"];
        });
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
        const keys = ["username", "password", "send"]
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
        //this.credentials.send is being used as a replacement for database.getReceivingAddress for now
        const mailOptions = {
            from: this.credentials.username,
            to: this.credentials.send,
            subject: subject,
            text: text
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                console.log(error);
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
        console.log('Connected to the in-memory SQlite database.');
    });
    const user = new UserProfile("./credentials.json", "./webtoons.json");
    let database = new Database(db, getDay());
    //When testing, change getDay() to "Thursday"
    let webtoons = await database.getTitles();    
    const mailer = new MailSender(user.getCredentials());
    mailer.sendMail(user.createMessage(webtoons), 'Korean Raw Updater', database.getReceivingAddress());
    //database.getReceivingAddress isn't working
    database.updateDailyTitles();
    db.close();
}

runMain();
