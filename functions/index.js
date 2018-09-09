import functions from 'firebase-functions';
import admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
exports.sendDiscoverTextNotification = functions.https.onRequest((req, res) => {
    const content = req.query.content;
    const recipient = req.query.recipient;
    const author = req.query.author;
    const payload = {
        notification: {
            title: "New message from " + {author},
            body: {content} 
        }
    }
    return admin.messaging().sendToDevice(recipient, payload);
})
