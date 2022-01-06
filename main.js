//open titles.txt, read the title, print the lines
var fs = require('fs');
var nodemailer = require('nodemailer');
const webtoons = require("./webtoons.json");
let titles = webtoons["titles"];

//---------------------------------
var series = [];

for (var x of titles) {
    if(x.day === 'Thursday') {
        x.chapter += 1;
        series.push(x);
    }
}
console.log(createMessage());
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
            /**REMINDER TO FILL THIS IN WHEN TESTING, AND DON'T UPLOAD TO GITHUB <3

            user: 
            pass: 
            */
        }
    });
    var mailOptions = {
        from: 'onlyforbrawlstara@gmail.com',
        to: 'munjeffrey2003@gmail.com',
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