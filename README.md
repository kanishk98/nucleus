# nucleus
One app to provide all solutions required by college students.  

## Authentication flow

The app requires users to sign in through their SNU IDs. To enable this and avoid the hassles of setting up a full-blown, secure authentication system, we integrate a Google Sign-in button into the app. The API connected to this button returns a JSON response, from which we take the email and check for the snu.edu.in domain. If it's not present, we refuse to move on to the chat screen and present a relevant prompt to the user. 

If the user is an SNU student, then the details (Firebase UserID, name, and email address) are synced with AWS Cognito using the Auth React Native library. This returns a JWT token specific to the user, and is used to authenticate him/her in other AWS use cases throughout the app. 

## Chat system

We use GraphQL-based AWS AppSync to keep our data real-time and our app quick. For more details, see the README for Proton, our back-end system.

### Random chat (named)
