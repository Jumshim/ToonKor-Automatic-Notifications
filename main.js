const fs = require('fs');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();



function getTitles() {
    let db = new sqlite3.Database('webtoons.db', sqlite3.OPEN_READWRITE, (err) => {
        if(err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });
    let data = [];
    return new Promise(resolve => {
        db.all('SELECT * FROM webtoons WHERE user_id=?', 1, (err, rows) => {
            if(err) { throw err };
            rows.forEach((row => {
                data.push(row);
            }))
            resolve(data);
        })
    })
}


/**
 * UserProfile is responsible for verifying a user's webtoon + email data,
 * updating their webtoons list,
 * and creating a message to be sent to the MailSender
 */


class UserProfile {
    constructor(credentialsFileName, webtoonsFileName) {
        this.credentialsFileName = credentialsFileName;
        this.webtoonsFileName = webtoonsFileName;
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

    getUpdatedDailyTitles(day) {
        const webtoons = require(this.webtoonsFileName);
        const titles = webtoons["titles"];
        let series = [];
        for (let x of titles) {
            if(x.day === day) {
                x.chapter += 1;
                series.push(x);
            }
        }
        return [series, webtoons];
    }

    createMessage(series) {
        let message = "Newly Updated Korean Raws:\n";
        for(let x of series) {
            message += `
            ${x.name}:
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

    sendMail(text, subject) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.credentials.username,
                pass: this.credentials.password
            }
        });
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

function writeData(data, fileName) {
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
}

function runMain() {
    const user = new UserProfile("./credentials.json", "./webtoons.json");
    let series, webtoons;
    [series, webtoons] = user.getUpdatedDailyTitles(getDay());
    const mailer = new MailSender(user.getCredentials());
    mailer.sendMail(user.createMessage(series), 'Korean Raw Updater');
    writeData(webtoons, user.webtoonsFileName);
}
db.close();
runMain();