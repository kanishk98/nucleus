import React, {Component} from 'react';
import {StyleSheet, View, Text, Platform, ProgressBarAndroid, ProgressViewIOS, Alert} from 'react-native';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';
import { renderProgress } from './renderIf';
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

    fetchUsers (firebaseId) {
        const noFilter = {
            firebaseId: {ne: firebaseId},
            geohash: {ne: 'random_user_geohash'},
        }
        API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, {filter: noFilter}))
        .then(res => {
            const users = res.data.listNucleusDiscoverUsers.items;
            AsyncStorage.setItem(Constants.UserList, JSON.stringify(users))
                .then(asyncStorageResult => {
                    console.log(asyncStorageResult);
                })
                .catch(asyncStorageError => {
                    console.log(asyncStorageError);
            });
            if (res.data.listNucleusDiscoverUsers.nextToken != null) {
                // start background operation to fetch more data
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    componentWillMount() {
        try {
            AsyncStorage.getItem(Constants.LoggedIn)
            .then(res => {
                console.log(res);
                if (res !== null) {
                    AsyncStorage.getItem(Constants.UserObject)
                    .then(savedUser => {
                        console.log(savedUser);
                        if (!!savedUser) {
                            this.props.navigation.navigate('Chat', {user: JSON.parse(savedUser)});
                        } else {
                            // setting user setting to logged out
                            AsyncStorage.setItem(Constants.LoggedIn, 'F')
                            .then(saved => {
                                this.forceUpdate();
                            })
                            .catch(saveError => {
                                console.log(saveError);
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
            } catch (error) {
            console.log(error);
            // error retrieving data, user automatically re-presented with login screen
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
                <Text style={styles.instructions}>Only SNU accounts allowed.</Text>
                {renderProgress(!this.state.progress, <GoogleSigninButton
                    style={styles.signInButton}
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Light}
                    onPress={this.signIn}
                />, <ProgressBar />)}
            </View>
            );
        } else {
            return (
            <View style={styles.container}>
                <Text style={styles.instructions}>
                    Signing you in as {user.user.email}
                </Text>
            </View>
            );
        }
    }

    verifyMail = (email) => {
        if (email == 'nucleus.communications@gmail.com') {
            return true;
        }
        const index = email.indexOf('snu.edu.in');
        if (index != -1) {
            // snu mail
            const char1 = email.charAt(0);
            const char2 = email.charAt(1);
            const char3 = email.substring(2, 5);
            if (char1.toLowerCase() != char1.toUpperCase() && char2.toLowerCase() != char2.toUpperCase() && /^\d+$/.test(char3)) {
                return true;
            }
        }
        return false;
    }

    signIn = async() => {
        try {
            this.setState({progress: true});
            let signedInUser = await GoogleSignin.signIn();
            if (signedInUser.user.email !== null && this.verifyMail(signedInUser.user.email)) {
                console.log('Valid student');
                console.log(JSON.stringify(signedInUser));
                this.setState({user: signedInUser, error: null, progress: true, loggedIn: true});
                // authenticating with Firebase
                // TODO: ADD INTERNET CONNECTIVITY CHECK, HOOK RESULT ACCORDINGLY INTO UI
                const firebaseCredential = firebase.auth.GoogleAuthProvider.credential(signedInUser.idToken,
                    signedInUser.accessToken);
                const firebaseUser = await firebase.auth().signInAndRetrieveDataWithCredential(firebaseCredential);
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
                            geohash: 'null', 
                            offenses: 0,
                            online: 1,
                            paid: false, 
                            profilePic: this.state.user.user.photo,
                            username: firebaseUser.user.displayName,
                            fcmToken: 'null',
                        };
                        API.graphql(graphqlOperation(GraphQL.CreateDiscoverUser, {input: newUser}))
                        .then(res => {
                            this.resolveUser(newUser);
                        })
                        .catch(err => {
                            console.log(err);
                            if (JSON.stringify(err).indexOf('Dynamo') != -1) {
                                this.resolveUser(newUser);
                            } else {
                                Alert.alert(
                                    'Student data over?', 
                                    'We were unable to log you in. This mostly happens because of a slow network connection.'
                                );
                            }
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
                console.log(await GoogleSignin.signOut());   
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

    resolveUser = (newUser) => {
        AsyncStorage.setItem(Constants.LoggedIn, 'T')
        .then(res => {
            console.log('User saved as logged in');
            this.setState({progress: false});
            AsyncStorage.setItem(Constants.UserObject, JSON.stringify(newUser))
            .then(res => {
                console.log('newUser saved');
            })
            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        });
        this.fetchUsers(newUser.firebaseId);
        this.props.navigation.navigate('Chat', {user: newUser});
    }

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
        width: 200, 
        height: 48
    },
    instructions: {
       color: Constants.primaryColor,
       marginBottom: 16,
       fontSize: 18,
       fontWeight: 'bold'
    }
});