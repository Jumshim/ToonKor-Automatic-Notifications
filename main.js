var fs = require('fs');
var nodemailer = require('nodemailer');
/**
 * 
 * What if it's not just me who wants webtoon reminders?
 * 
 * credentials -> array -> unique per person; map
 * 
 * Software for myself -> software for others
 * 
 * Need a web framework to store other people's data
 * 
 * convert to class so I can know how javascript classes work
 * 
 * I should learn how a web framework works
 * RubyonRails, django, flask
 * 
 */

function getCredentials() {
    let creds;
    try {
        creds = require("./credentials.json"); 
    } catch(err) {
        throw new Error("credentials.json does not exist, check README"); 
    }
    var keys = ["username", "password", "send"]
    for (var item of keys) {
        if(creds[item] == null) {
            throw new Error(`${item} is not defined in credentials.json`);
        }
    }
    return creds;
}

function getUpdatedDailyTitles() {
    const webtoons = require("./webtoons.json");
    let titles = webtoons["titles"];
    var series = [];
    for (var x of titles) {
        if(x.day === getDay()) {
            x.chapter += 1;
            series.push(x);
        }
    }
    return [series, webtoons];
}

function getDay() {
    let dateOb = new Date();
    var name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var day = name[dateOb.getDay()];
    return day;
}

function sendMail(series, creds) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: creds.username,
            pass: creds.password
        }
    });
    var mailOptions = {
        from: creds.username,
        to: creds.send,
        subject: 'KOREAN RAW UPDATER',
        text: createMessage(series)
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if(error){
            console.log(error);
        } else{
            console.log('Email sent: ' + info.response);
        }
    });
}

function createMessage(series) {
    let message = "Newly Updated Korean Raws:\n";
    for(var x of series) {
        message += `
        ${x.name}:
            URL: ${x.url + x.chapter + "%ED%99%94.html"}
            Chapter:${x.chapter}
            `
    }
    return message;
}

function writeSeries(webtoons) {
    fs.writeFileSync('webtoons.json', JSON.stringify(webtoons, null, 2));
}

function runMain() {
    let creds = getCredentials();
    let series, webtoons;
    [series, webtoons] = getUpdatedDailyTitles();
    sendMail(series, creds);
    writeSeries(webtoons);
}

runMain();