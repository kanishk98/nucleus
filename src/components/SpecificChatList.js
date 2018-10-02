import React, { Component } from 'react';
import { View, ScrollView, FlatList, StyleSheet, AsyncStorage } from 'react-native';
import { List, ListItem, SearchBar } from 'react-native-elements';
import Constants from '../Constants';
import AWS from 'aws-sdk';
import * as JsSearch from 'js-search';
import { renderSearch } from './renderIf';

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

    static noFilter = {
        firebaseId: {ne: 'random_user_placeholder'},
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
    openChat = (item) => {
        let chat = {
            conversationId: item.conversationId,
            user1: this.user, 
            user2: item,
        }
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

    renderConversation = ({item}) => (
        <ListItem 
            onPress={this.openChat.bind(this, item)}
            roundAvatar
            title={item.user2.username}
        />
    );

    renderUser = ({item}) => (
        <ListItem
            onPress={this.newChat.bind(this, item)}
            roundAvatar
            title={item.username}
        />
    );

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
            console.log(res);
            if (res != null || res != undefined) {
                // if res is not null or undefined
                this.setState({people: JSON.parse(res)});
            }
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
                <View>
                    <ScrollView scrollEnabled={false}>
                        <SearchBar
                            ref={search=>{this.search = search}}
                            lightTheme
                            onChangeText={(text)=>this.searchConversations({text})}  
                            onSubmitEditing={this.submitSearch}
                        />
                        </ScrollView>
                        <List style={styles.container}>
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
                </View>
            );
        }  else {
            // making initial call for users
            // future calls delegated to background task
            console.log('Inside render() else block');
            if (this.state.people == null || this.state.people.length == 0 || this.state == undefined) {
                console.log('Getting more users from render function');
                this.getStoredUsers();
            }
            console.log(this.state);
            return (
                <List style={styles.container}>
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
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      flex: 1,
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