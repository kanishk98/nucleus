let functions = require('firebase-functions');
let admin = require('firebase-admin');
let qs = require('querystring');

admin.initializeApp(functions.config().firebase);
exports.sendDiscoverTextNotification = functions.https.onRequest((req, res) => {
    console.log('Method ' + req.method);
    console.log('Body ' + req.originalUrl);
    console.log(req.body);
    const content = req.body.content;
    const author = req.body.author;
    const fcmToken = req.body.token;
    const payload = {
        data: {
            data_type: "direct_message",
            title: "New message from " + author,
            message: content,
        },
        token: fcmToken
    };
    admin.messaging().send(payload)
    .then((response) => {
        console.log('notification delivered');
        // response is a message ID
        console.log(response);
    })
    .catch(error => {
        console.log('Error: ' + error);
    })
})