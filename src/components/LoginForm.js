import React, {Component} from 'react';
import {StyleSheet, View, Dimensions, Text, Platform, ProgressBarAndroid, ProgressViewIOS, Alert} from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import renderIf from './renderIf';
import {Auth, API, graphqlOperation} from 'aws-amplify';
import firebase from 'react-native-firebase';
import { AsyncStorage } from '@aws-amplify/core';
import * as GraphQL from '../graphql';
import Constants from '../Constants';

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

    componentWillMount() {
        _retrieveData = async () => {
            try {
              const value = await AsyncStorage.getItem('LOGGED_IN');
              const user = await AsyncStorage.getItem('USER');
              if (value !== null && value !== 'false') {
                console.log(value);
                this.props.navigation.navigate('Chat', {user: JSON.parse(user)});
              }
             } catch (error) {
               // Error retrieving data
             }
          }
    }

    async componentDidMount() {
        await this.configureGoogleSignIn();
    }

    async configureGoogleSignIn() {
        // TODO: SOME ANDROID PHONES MAY NOT HAVE PLAY SERVICES. DISPLAY ERROR MESSAGE THERE.
        // always returns true on iOS
        await GoogleSignin.hasPlayServices();

        await GoogleSignin.configure({
            iosClientId: Constants.iosClientId,
            webClientId: Constants.webClientId,
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
                    Signed in as {user.user.email}
                </Text>
            </View>
            );
        }
    }

    signIn = async() => {
        try {
            this.setState({progress: true});
            let signedInUser = await GoogleSignin.signIn();
            if (signedInUser.user.email !== null) {
                console.log('Valid student');
                console.log(JSON.stringify(signedInUser));
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
                    .then(user => {
                        console.log(firebaseUser.user.displayName);
                        this.setLoggedIn('LOGGED_IN', 'true');
                        let newUser = {
                            firebaseId: firebaseUser.user.uid,
                            geohash: "null", 
                            offenses: 0,
                            online: 1,
                            paid: false, 
                            profilePic: this.state.user.user.photo,
                            username: firebaseUser.user.displayName,
                        };
                        this.setLoggedIn('USER', JSON.stringify(newUser));
                        API.graphql(graphqlOperation(GraphQL.CreateDiscoverUser, {input: newUser}))
                        .then(res => {
                            console.log('user resolved, moving to next screen');
                            this.props.navigation.navigate('Chat', {user: newUser});
                        })
                        .catch(err => {
                            console.log(err);
                            Alert.alert(
                                'Student data over?', 
                                'We were unable to log you in because of a slow network connection.'
                            );
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        Alert.alert(
                            'Network unavailable',
                            'We were unable to log you in. Please try again later.');
                    });
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

    async setLoggedIn(key, item) {
        try {
            await AsyncStorage.setItem(key, item);
        } catch(error) {
            console.log(error.message);
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