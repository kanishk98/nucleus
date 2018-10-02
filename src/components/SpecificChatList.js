import React, { Component } from 'react';
import { View, ScrollView, FlatList, StyleSheet, AsyncStorage } from 'react-native';
import { List, ListItem, SearchBar } from 'react-native-elements';
import Constants from '../Constants';
import AWS from 'aws-sdk';

class Conversation extends Component {
    // item here is a conversationItem
    openChat = () => {
        let chat = {
            conversationId: this.props.item.conversationId,
            user1: this.props.user, 
            user2: this.props.item,
        }
        this.props.navigation.navigate('SpecificTextScreen', {chat: chat, newChat: false});
    }
    render() {
        console.log(this.props);
        return (
            <ListItem 
                onPress={this.openChat}
                roundAvatar
                title={this.props.item.user2.username}
            />
        )
    }
}

export default class SpecificChatList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            conversations: [],
            showingPeople: true,
            people: [],
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
            // TODO: Serialising this to have one user before the other means 2 table rows for same conversation
            // TODO: Fix above issue by alternating id characters between the two on set condition
            // TODO: Define static function for the same
            let chatId = SpecificChatList.generateConversationId(this.user.firebaseId, item.firebaseId);
            // add chat to local storage
            let {conversations} = this.state;
            const chat = {
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
            this.props.navigation.navigate('SpecificTextScreen', {chat: chat, newChat: true});
        }
    }

    deleteAllChats = async() => {
        try {
            await AsyncStorage.removeItem('CHATS');
        } catch (error) {
            console.log(error);
        }
    }

    retrieveChats = () => {
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
        })
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
        <Conversation item={item} user={this.user}/>
    );

    renderUser = ({item}) => (
        <ListItem
            onPress={this.newChat.bind(this, item)}
            roundAvatar
            title={item.username}
        />
    );

    searchConversations({text}) {
        // text contains user names
        console.log('Search bar text: ' + JSON.stringify(text));
    }

    getStoredUsers () {
        AsyncStorage.getItem(Constants.UserList)
        .then(res => {
            console.log(res);
            if (res !== null || res !== undefined) {
                // if res is not null or undefined
                this.setState({people: JSON.parse(res)});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    render() {
        if (!this.state.showingPeople && this.state.conversations.length > 0) {
            return(
                <View>
                    <ScrollView scrollEnabled={false}>
                        <SearchBar
                            ref={search=>{this.search = search}}
                            lightTheme
                            onChangeText={text=>this.searchConversations(text)}  
                            onSubmitEditing={this.search.cancel}
                        />
                        </ScrollView>
                        <List style={styles.container}>
                            <FlatList
                                data={this.state.conversations}
                                keyExtractor={(data)=>this.chatKeyExtractor(data)}
                                renderItem={this.renderConversation}
                            />
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
                    <FlatList
                        data={this.state.people}
                        renderItem={this.renderUser}
                        keyExtractor={this.peopleKeyExtractor}
                    />
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