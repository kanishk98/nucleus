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
            loggedIn: false
        };
    }

    async componentDidMount() {
        await this.configureGoogleSignIn();
        await this.getCurrentUser();
    }

    async configureGoogleSignIn() {
        await GoogleSignin.hasPlayServices({
            autoResolve: true
        });

        await GoogleSignin.configure({
            webClientId: '***REMOVED***',
            offlineAccess: false,
        });
    }

    async getCurrentUser() {
        try {
            const user = await GoogleSignin.currentUserAsync();
            this.setState({user, error:null});
        } catch (error) {
            this.setState({error,});
        }
    }

    render() {
        const ProgressBar = Platform.select({
            ios: () => ProgressViewIOS,
            android: () => ProgressBarAndroid
        })();
        if (!this.state.loggedIn) {
            return (
            <View style={styles.container}>
                <Text style={styles.instructions}>
                    Sign in with your SNU account.
                </Text>
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
                    Signed in as {this.state.user.email}
                </Text>
            </View>
            );
        }
    }

    signIn = async() => {
        try {
            this.setState({progress: true});
            const user = await GoogleSignin.signIn();
            console.log(user.email);
            if (user.email.includes('@snu.edu.in')) {
                console.log('Valid student');
                this.setState({user: user, error: null, progress: false, loggedIn: true});
            } else {
                this.setState({user:null, error:null, progress:false, loggedIn:false});
            }
        } catch (error) {
            if (error.code == 'CANCELED') {
                error.message = 'User canceled login';
            }
            this.setState({user:null, error:error, progress:false, loggedIn:false});
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