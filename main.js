//open titles.txt, read the title, print the lines
var fs = require('fs');
var nodemailer = require('nodemailer');
const webtoons = require("./webtoons.json");
let titles = webtoons["titles"];

let creds;
try { creds = require("./credentials.json"); }
catch(err) { throw new Error("credentials.json does not exist, check README"); }

//---------------------------------

var keys = ["username", "password", "send"]
for (var item of keys) {
    if(creds[item] == null) {
        throw new Error(`${item} is not defined in credentials.json`);
    }
}

var series = [];

for (var x of titles) {
    if(x.day === getDay()) {
        x.chapter += 1;
        series.push(x);
    }
}
sendMail();
//---------------------------------

function getDay() {
    let dateOb = new Date();
    var name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var day = name[dateOb.getDay()];
    return day;
}
function sendMail() {
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
        text: createMessage()
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if(error){
            console.log(error);
        } else{
            console.log('Email sent: ' + info.response);
        }
    });
}
function createMessage() {
    let message = "Newly Updated Korean Raws:\n";
    for(var x of series) {
        message += `
        ${x.name}:
            URL: ${updateInfo(x)}
            Chapter:${x.url + x.chapter + "%ED%99%94.html"}
            `
    }
    return message;
}
function updateInfo(arg){
    arg.chapter = arg.chapter + 1;
    return arg.url + arg.chapter + "%ED%99%94.html";
}