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
    const message = {
        apns: {
          headers: {
            'apns-priority': '10'
          },
          payload: {
            aps: {
              alert: {
                title: 'Kanishk Kakar',
                body: 'Notification sent over a server. Real-world test.',
              },
              badge: 1,
              sound: 'default'
            }
          }
        },
        token: fcmToken
      };
    admin.messaging().send(message)
    .then((response) => {
        console.log('notification delivered');
        console.log(response);
        res.send(response);
    })
    .catch(error => {
        console.log('Error: ' + error);
        res.send(error);
    })
});