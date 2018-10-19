import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, StyleSheet, AsyncStorage, ImageBackground } from 'react-native';
import { List, ListItem, SearchBar } from 'react-native-elements';
import Constants from '../Constants';
import AWS from 'aws-sdk';
import * as JsSearch from 'js-search';
import { renderSearch, renderOnline } from './renderIf';
import {Auth, API, graphqlOperation} from 'aws-amplify';
import * as GraphQL from '../graphql';

export default class SpecificChatList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            conversations: [],
            talkingTo: [],
            showingPeople: false,
            people: [],
            searchResults: [],
        };
        user = null;
        itemCount = 0;
        AWS.config.update({
            accessKeyId: Constants.accessKey,
            secretAccessKey: Constants.secretAccessKey,
            region:'ap-south-1'
        });
        const dynamoDB = new AWS.DynamoDB();
        const table = {TableName: "Nucleus.DiscoverUsers"};
        dynamoDB.describeTable(table, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
                this.itemCount = data.ItemCount;
            }
        });
        this.search = React.createRef();
    }

    noFilter = {
        firebaseId: {ne: this.props.navigation.getParam('user', null).firebaseId},
        geohash: {ne: 'random_user_geohash'},
    }

    showPeople = () => {
        this.setState({showingPeople: true});
    }

    addChat = async(conversation) => {
        try {
            this.state.conversations.push(conversation);
            this.forceUpdate();
            await AsyncStorage.setItem('CHATS', this.state.conversations);
            console.log('Conversation saved');
        } catch (error) {
            console.log(error);
        }
    }

    static generateConversationId(s1, s2) {
        let s = '';
        const l1 = s1.length;
        const l2 = s2.length;
        let l = l1<l2?l1:l2;
        for (let i = 0; i < l; ++i) {
            let ch1 = s1.charAt(i);
            let ch2 = s2.charAt(i);
            s = s + (ch1<ch2?ch1:ch2);
            s = s + (ch1<ch2?ch2:ch1); 
        }
        if (l < l1) {
            s = s + s1.substring(l + 1);
        } else if (l < l2) {
            s = s + s2.substring(l + 1);
        }
        console.log('ConversationID: ' + s);
        return s;
    }

    // item here is a user
    newChat (item) {
        if (!!item) {
            let chat = null;
            let newChat = true;
            let {conversations, talkingTo} = this.state;
            if (!talkingTo.includes(item.firebaseId)) {
                talkingTo.push(item.firebaseId);
                AsyncStorage.setItem(Constants.TalkingTo, JSON.stringify(talkingTo))
                .then(res => {
                    console.log('Saved userID in talkingTo');
                })
                .catch(err => {
                    console.log(err);
                });
                let chatId = SpecificChatList.generateConversationId(this.user.firebaseId, item.firebaseId);
                // add chat to local storage
                chat = {
                    conversationId: chatId, 
                    user1: this.user,
                    user2: item,
                }
                conversations.push(chat);
                AsyncStorage.setItem(Constants.SpecificChatConversations, JSON.stringify(conversations))
                .then(res => {
                    console.log('Saved successfully: ' + JSON.stringify(res));
                })
                .catch(err => {
                    console.log(err);
                });
                // new chat, performing mutation
                
            } else {
                const idSearch = new JsSearch.Search('conversationId');
                idSearch.addIndex(['user2', 'firebaseId']);
                idSearch.addDocuments(conversations);
                chat = idSearch.search(item.firebaseId)[0];
                console.log(chat);
                newChat = false;
            }
            this.props.navigation.navigate('SpecificTextScreen', {chat: chat, newChat: newChat});
        }
    }

    // item here is a conversation
    openChat = async(item) => {
        console.log('Item: ' + JSON.stringify(item));
        let chat = {
            conversationId: item.conversationId,
            user1: this.user, 
            user2: item.user2,
        }
        // get conversations here, move selected conversation to top of FlatList
        const {conversations} = this.state;
        console.log('Conversations: ' + JSON.stringify(conversations));
        conversations.sort(function(x,y){ return x == item ? -1 : y == item ? 1 : 0; });
        // save newly sorted list
        console.log('Sorted conversations: ' + JSON.stringify(conversations));
        await AsyncStorage.setItem('CHATS', JSON.stringify(conversations));
        this.props.navigation.navigate('SpecificTextScreen', {chat: chat, newChat: false});
    }

    deleteAllChats = async() => {
        try {
            await AsyncStorage.removeItem('CHATS');
        } catch (error) {
            console.log(error);
        }
    }

    retrieveChats = () => {
        // getting talkingTo
        AsyncStorage.getItem(Constants.TalkingTo)
        .then(res => {
            console.log(res);
            if (res !== null) {
                // been talking to people
                this.setState({talkingTo: JSON.parse(res)});
            }
        })
        .catch(err => {
            console.log(err);
        });
        AsyncStorage.getItem(Constants.SpecificChatConversations)
        .then(res => {
            console.log(res);
            if (res !== null) {
                // conversations exist
                console.log('Conversations exist');
                this.setState({conversations: JSON.parse(res)});
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    chatKeyExtractor = (item, index) => item.user2.firebaseId;

    peopleKeyExtractor = (item, index) => item.firebaseId;
    
    componentDidMount() {
        this.user = this.props.navigation.getParam('user', null);
        console.log(this.user);
        // fetch previously made conversations here
        this.retrieveChats();
    }

    renderConversation = ({item}) => {
        console.log(item);
        return (
        <ListItem 
            onPress={this.openChat.bind(this, item)}
            roundAvatar
            avatar={{uri: item.user2.profilePic}}
            title={item.user2.username}
            subtitle={renderOnline(item.user2.online)}
        />);
    };

    renderUser = ({item}) => {
        console.log(item);
        return (
        <ListItem
            onPress={this.newChat.bind(this, item)}
            roundAvatar
            avatar={{uri: item.profilePic}}
            title={item.username}
            subtitle={renderOnline(item.online)}
        />);
    };

    searchConversations = ({text}) => {
        // text contains user names
        const chatSearch = new JsSearch.Search('firebaseId');
        chatSearch.addIndex('username');
        chatSearch.addDocuments(this.state.people);
        let searchResults = chatSearch.search(text);
        console.log(searchResults);
        this.setState({searchResults: searchResults})
    }

    getStoredUsers () {
        AsyncStorage.getItem(Constants.UserList)
        .then(res => {
            console.log('Stored users ' + JSON.stringify(res));
            if (res != null) {
                this.setState({people: JSON.parse(res)});
            } else {
                this.fetchUsers();
                this.getStoredUsers();
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    fetchUsers () {
        API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, {filter: this.noFilter}))
        .then(res => {
            // removing signed-in user from UserList
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
                this.getPaginatedUsers(res.data.listNucleusDiscoverUsers.nextToken);
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    getPaginatedUsers = (nextToken) => {
        API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, {filter: this.noFilter, nextToken: nextToken}))
        .then(res => {
            const users = res.data.listNucleusDiscoverUsers.items;
            AsyncStorage.getItem(Constants.UserList)
            .then(res => {
                savedUsers = JSON.parse(res);
                savedUsers.push(users);
                AsyncStorage.setItem(Constants.UserList, JSON.stringify(users))
                    .then(asyncStorageResult => {
                        console.log(asyncStorageResult);
                    })
                    .catch(asyncStorageError => {
                        console.log(asyncStorageError);
                });
                if (res.data.listNucleusDiscoverUsers.nextToken != null) {
                    // start background operation to fetch more data
                    this.getPaginatedUsers(res.data.listNucleusDiscoverUsers.nextToken);
                }
            })
            .catch(err => console.log(err));
        })
        .catch(err => {
            console.log(err);
        });
    }

    submitSearch = () => {
        this.search.cancel;
        this.setState({searchResults: []});
    }

    render() {
        if (!this.state.showingPeople && this.state.conversations.length > 0) {
            return(
                <View style={styles.layout}>
                    <ScrollView scrollEnabled={false}>
                        <SearchBar
                            ref={search=>{this.search = search}}
                            lightTheme
                            placeholder='Search'
                            onChangeText={(text)=>this.searchConversations({text})}  
                            onSubmitEditing={this.submitSearch}
                        />
                        <List>
                        {renderSearch(
                            (this.state.searchResults.length > 0),
                            <FlatList
                                data={this.state.searchResults}
                                keyExtractor={(data)=>this.peopleKeyExtractor(data)}
                                renderItem={this.renderUser}
                            />,
                            <FlatList
                                data={this.state.conversations}
                                keyExtractor={(data)=>this.chatKeyExtractor(data)}
                                renderItem={this.renderConversation}
                            />)}
                        </List>
                    </ScrollView>
                </View>
            );
        } else if (this.state.people == null) {
            return (
                <ImageBackground style={styles.initialLayout} source={require('../../assets/background.png')}>
                    <SearchBar
                        ref={search=>{this.search = search}}
                        lightTheme
                        placeholder='Search for your friends!'
                        onChangeText={(text)=>this.searchConversations({text})}  
                        onSubmitEditing={this.submitSearch}
                    />
                </ImageBackground>
            );
        } else {
            // making initial call for users
            // future calls delegated to background task
            console.log('Inside render() else block');
            if (this.state.people == null || this.state.people.length == 0 || this.state == undefined) {
                console.log('Getting more users from render function');
                this.fetchUsers();
                this.getStoredUsers();
            }
            console.log(this.state);
            return (
                <View style={styles.layout}>
                    <SearchBar
                        ref={search=>{this.search = search}}
                        lightTheme
                        placeholder='#comeconnect, for real.'
                        onChangeText={(text)=>this.searchConversations({text})}  
                        onSubmitEditing={this.submitSearch}
                    />
                    <List>
                    {renderSearch(
                        this.state.searchResults > 0,
                        <FlatList
                            data={this.state.searchResults}
                            keyExtractor={(data)=>this.peopleKeyExtractor(data)}
                            renderItem={this.renderUser}
                        />,
                        <FlatList
                            data={this.state.people}
                            renderItem={this.renderUser}
                            keyExtractor={this.peopleKeyExtractor}
                        />
                        )}
                    </List>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    layout: {
        backgroundColor: 'white',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
    }, 
    initialLayout: {
        flex: 1,
        justifyContent: 'center',
    }, 
    container: {
      backgroundColor: 'white',
    },
    textContainer: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        color: 'black',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center'
    },
    chatContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderBottomColor: '#eee',
      borderBottomWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    chatName: {
      fontWeight: 'bold',
      flex: 0.7,
      color: 'black',
    },
  });