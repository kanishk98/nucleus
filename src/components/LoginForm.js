import React, {Component} from 'react';
import {StyleSheet, View, Dimensions, Text, Platform, ProgressBarAndroid, ProgressViewIOS} from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import renderIf from './renderIf';

export default class LoginForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            error: null,
            progress: false
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
        const {user} = this.state;
        const ProgressBar = Platform.select({
            ios: () => ProgressViewIOS,
            android: () => ProgressBarAndroid
        })();
        if (!user) {
            return (
                <View style={styles.container}>
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
                <Text>
                    Welcome, {user.email}
                </Text>
            </View>
            );
        }
    }

    signIn = async() => {
        try {
            this.setState({progress: true});
            const user = await GoogleSignin.signIn();
            this.setState({user: user, error: null, progress: false})
        } catch (error) {
            if (error.code == 'CANCELED') {
                error.message = 'User canceled login';
            }
            this.setState({error});
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
});