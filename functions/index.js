functions = require('firebase-functions');
admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var dryRun = true;
exports.sendDiscoverTextNotification = functions.https.onRequest((req, res) => {
    const content = req.query.content;
    const recipient = req.query.recipient;
    const author = req.query.author;
    const token = req.query.token;
    const payload = {
        notification: {
            title: "New message from " + {author},
            body: {content},
        },
        android: {
            priority: 'normal', 
        },
        token: {token},
    };
    admin.messaging().send(message, dryRun)
    .then((response) => {
        // response is a message ID
        console.log(response);
    })
    .catch(error => {
        console.log(error);
    })
})
