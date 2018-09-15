functions = require('firebase-functions');
admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
exports.sendDiscoverTextNotification = functions.https.onRequest((req, res) => {
    const content = req.query.content;
    const recipient = req.query.recipient;
    const author = req.query.author;
    const fcmToken = req.query.token;
    const payload = {
        notification: {
            title: "New message from " + author,
            body: content,
        },
    };
    admin.messaging().sendToDevice(payload, fcmToken)
    .then((response) => {
        console.log('notification delivered');
        // response is a message ID
        console.log(response);
    })
    .catch(error => {
        console.log('Error: ' + error);
    })
})

// working request that returned a Google Sign-in page on Postman
// https://us-central1-nucleus-2018.cloudfunctions.net/sendDiscoverTextNotification&recipient="Sarthak"&author="Kanishk"&content="Content"