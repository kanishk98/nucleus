import React, {Component} from 'react';
import {StyleSheet, View, Dimensions, Text, Platform, ProgressBarAndroid, ProgressViewIOS} from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import renderIf from './renderIf';
import {Auth} from 'aws-amplify';
import firebase from 'react-native-firebase';

export default class LoginForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            error: null,
            progress: false,
            loggedIn: false,
        };
    }

    async componentDidMount() {
        await this.configureGoogleSignIn();
    }

    async configureGoogleSignIn() {
        // TODO: SOME ANDROID PHONES MAY NOT HAVE PLAY SERVICES. DISPLAY ERROR MESSAGE THERE.
        // always returns true on iOS
        await GoogleSignin.hasPlayServices({
            autoResolve: true
        });

        await GoogleSignin.configure({
            webClientId: '***REMOVED***',
            offlineAccess: false,
        });
    }

    render() {
        const ProgressBar = Platform.select({
            ios: () => ProgressViewIOS,
            android: () => ProgressBarAndroid
        })();
        const user = this.state.user;
        if (!user) {
            return (
            <View style={styles.container}>
                <Text style={styles.instructions}>Sign in with your SNU account.</Text>
                {renderIf(!this.state.progress, <GoogleSigninButton
                    style={styles.signInButton}
                    size={GoogleSigninButton.Size.Icon}
                    color={GoogleSigninButton.Color.Light}
                    onPress={this.signIn}
                />)}
                {renderIf(this.state.progress, <ProgressBar/>)}
            </View>
            );
        } else {
            return (
            <View style={styles.container}>
                <Text style={styles.instructions}>
                    Signed in as {user.email}
                </Text>
            </View>
            );
        }
    }

    signIn = async() => {
        try {
            this.setState({progress: true});
            let signedInUser = await GoogleSignin.signIn();
            console.log(signedInUser.email);
            if (signedInUser.email.includes('@snu.edu.in')) {
                console.log('Valid student');
                this.setState({user: signedInUser, error: null, progress: true, loggedIn: true});
                // authenticating with Firebase
                // TODO: ADD INTERNET CONNECTIVITY CHECK, HOOK RESULT ACCORDINGLY INTO UI
                const firebaseCredential = firebase.auth.GoogleAuthProvider.credential(signedInUser.idToken,
                    signedInUser.accessToken);
                const firebaseUser = await firebase.auth().signInAndRetrieveDataWithCredential(firebaseCredential);
                this.setState({progress: false});
                const firebaseOIDCToken = await firebaseUser.user.getIdToken(true);
                console.log(firebaseOIDCToken);
                // syncing user details with Cognito User Pool
                Auth.configure({
                    identityPoolId: 'ap-south-1:7bea4d8a-8ec9-425b-833d-2ac9ed73e27b',
                    region: 'ap-south-1'
                });
                Auth.federatedSignIn(
                    'securetoken.google.com/nucleus-2018',
                    {
                        token: firebaseOIDCToken
                    },
                    signedInUser)
                    .then(user => console.log(user))
                    .catch(error => console.log(error));
                    // moving user to chat screen
                    this.props.navigation.navigate('Connect');
            } else {
                console.log('Signing out user');
                this.configureGoogleSignIn();
                this.signOut();
            }
        } catch (error) {
            console.log(error.message);
            if (error.code == 'CANCELED') {
                error.message = 'User canceled login';
            }
            this.setState({user:null, error:error, progress:false, loggedIn:false});
        }
    };

    async signOut() {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            this.setState({ user: null, error: null, progress: false, loggedIn: false });
        } catch (error) {
            this.setState({
                error: error,
            });
        }
    };
}

const styles = StyleSheet.create({
   container: {
       justifyContent: 'center',
       flex: 1,
       alignItems: 'center',
   },
    signInButton: {
        width: 312, 
        height: 60
    },
    instructions: {
       color: 'white',
       marginBottom: 16,
       fontSize: 18,
       fontWeight: 'bold'
    }
});