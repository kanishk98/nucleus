import React, {Component} from 'react';
import {StyleSheet, View, Dimensions, Text} from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

export default class LoginForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            error: null
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
        const {user, error} = this.state;
        if (!user) {
            return (
                <View style={styles.container}>
                    <GoogleSigninButton
                        style={styles.signInButton}
                        size={GoogleSigninButton.Size.Icon}
                        color={GoogleSigninButton.Color.Light}
                        onPress={this.signIn}
                    />
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


    onLoginButtonClick() {
        this.signIn;
    }

    signIn = async() => {
        try {
            const user = await GoogleSignin.signIn();
            this.setState({user, error:null});
        } catch (error) {
            if (error.code == 'CANCELED') {
                error.message = 'User canceled login';
            }
            this.setState({error});
        }
    };
}

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
   container: {
       justifyContent: 'center',
       flex: 1,
       alignItems: 'center',
   },
    signInButton: {
        width: 312, 
        height: 60
    }
});