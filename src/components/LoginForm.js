import React, {Component} from 'react';
import {StyleSheet, View, Dimensions, Text, Platform, ProgressBarAndroid, ProgressViewIOS} from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import renderIf from './renderIf';
import {Auth} from 'aws-amplify';

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
                this.setState({user: signedInUser, error: null, progress: false, loggedIn: true});
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