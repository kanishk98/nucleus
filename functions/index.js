functions = require('firebase-functions');
admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var dryRun = true;
exports.sendDiscoverTextNotification = functions.https.onRequest((req, res) => {
    const content = req.query.content;
    const recipient = req.query.recipient;
    const author = req.query.author;
    const registrationToken = req.query.token;
    const message = {
        "notification": {
            title: "New message from " + {author},
            body: {content},
        },
        "token": registrationToken
    };
    admin.messaging().send(message)
    .then((response) => {
        // response is a message ID
        console.log(response);
    })
    .catch(error => {
        console.log(error);
    })
})

// working request that returned a Google Sign-in page on Postman
// https://us-central1-nucleus-2018.cloudfunctions.net/sendDiscoverTextNotification&recipient="Sarthak"&author="Kanishk"&content="Content"