functions = require('firebase-functions');
admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
exports.sendDiscoverTextNotification = functions.https.onRequest((req, res) => {
    const content = req.query.content;
    const recipient = req.query.recipient;
    const author = req.query.author;
    const payload = {
        notification: {
            title: "New message from " + JSON.stringify({author}),
            body: JSON.stringify({content}) 
        }
    }
    return admin.messaging().sendToDevice(recipient, payload);
})

// working request that returned a Google Sign-in page on Postman
// https://us-central1-nucleus-2018.cloudfunctions.net/sendDiscoverTextNotification&recipient="Sarthak"&author="Kanishk"&content="Content"