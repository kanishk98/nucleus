import React, { Component } from 'react';
import { Text, TouchableHighlight, FlatList, StyleSheet, View } from 'react-native';
import { List, ListItem, Button } from 'react-native-elements';
import { AsyncStorage } from '../../node_modules/@aws-amplify/core';
import { API, graphqlOperation } from '../../node_modules/aws-amplify';
import * as GraphQL from '../graphql';
import  renderIf from './renderIf';

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
                title={this.props.item.name}
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
    }

    static noFilter = {
        firebaseId: {ne: 'random_user_placeholder'},
        geohash: {ne: 'random_user_geohash'},
    }

    showPeople = () => {
        this.setState({showingPeople: true});
    }

    fetchUsers = () => {
        API.graphql(graphqlOperation(GraphQL.GetAllDiscoverUsers, {filter: SpecificChatList.noFilter}))
        .then(res => {
            console.log('People: ');
            console.log(res);
            if (res.data.listNucleusDiscoverUsers.nextToken != null) {
                this.setState({people: res.data.listNucleusDiscoverUsers.items});
                // start background operation to fetch more data
            } else {
                this.setState({people: res.data.listNucleusDiscoverUsers.items});
            }
        })
        .catch(err => {
            console.log(err);
        })
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

    // item here is a user
    async newChat (item) {
        console.log(item);
        if (!!item) {
            let chatId = this.user.firebaseId + " " + item.firebaseId;
            // add chat to local storage
            const chat = {
                conversationId: chatId, 
                user1: this.user,
                user2: item,
            }
            let chats = this.state.conversations;
            // chats.push(chat);
            await AsyncStorage.setItem('CHATS', JSON.stringify(chats))
            .then(res => {
                console.log(res);
            })
            .catch(err => console.log(err));
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

    retrieveChats = async() => {
        let res = null;
        try {
            const previousChats = await AsyncStorage.getItem('CHATS');
            res = previousChats;
        } catch(error) {
            console.log(err);
        }
        return res;
    }

    peopleKeyExtractor = (item, index) => item.firebaseId;
    
    async componentDidMount() {
        // fetch previously made conversations here
        const conversations = await AsyncStorage.getItem('CHATS');
        if (conversations != null) {
            this.setState({conversations: conversations});
        }
        this.user = this.props.navigation.getParam('user');
    }

    renderItem = ({item}) => (
        <Conversation item={item} user={this.user}/>
    );

    renderUser = ({item}) => (
        <ListItem
            onPress={this.newChat.bind(this, item)}
            roundAvatar
            title={item.username}
        />
    );


    render() {
        if (!this.state.showingPeople) {
            return(
                <List style={styles.container}>
                    <FlatList
                        data={this.state.conversations}
                        renderItem={this.renderItem}
                    />
                </List>
            );
        } else {
            console.log(this.user);
            // making initial call for users
            // future calls delegated to background task
            if (!this.state.people || this.state.people.length == 0) {
                this.fetchUsers();
            }
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