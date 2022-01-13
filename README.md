# WebtoonReminder

### How to Run
run: `npm install`

In the terminal, to send the email, run: `node main.js`


### Security Info

When you create this, make sure you add a "credentials.json" file to cover sensitive information

*Put it in this format:*
```
{
    "username" : "johndoe@gmail.com",
    "password" : "johndoe123",
    "send" : "janedoe@gmail.com"
}
```

### What does this program do?

getting everything in titles that corresponds to the current day and pushing them into an array

go through the array and update each of the chapters + URLS weekly

use that array to format an email message

sends the email

### Changing things into classes

From an initial analysis of my program, 2 classes instantly stand out

One class should be in charge of all of the webtoon data; holding the crednetials and managing/updating the .json of webtoons

The other class should be in charge of the after; sending the email and creating the message
