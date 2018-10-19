let functions = require('firebase-functions');
let admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
exports.sendDiscoverTextNotification = functions.https.onRequest((req, res) => {
    console.log('Method ' + req.method);
    console.log('Body ' + req.originalUrl);
    console.log(req.body);
    const content = req.body.content;
    const author = req.body.author;
    const fcmToken = req.body.token;
    const chat = req.body.chat;
    const message = {
      notification: {
        title: author,
        body: content,
      },
      data: {
        chat: JSON.stringify(chat)
      },
      android: {
        notification: {
          icon: 'stock_ticker_update',
          color: '#f45342',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
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