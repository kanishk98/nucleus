import React from 'react';
import { Message } from './Message';
import * as GraphQL from '../graphql';
import { noFilter } from './SpecificChatList';
import { FlatList, KeyboardAvoidingView, Dimensions, StyleSheet, TextInput, ScrollView } from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { connectClient } from '../../App';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { GiftedChat } from 'react-native-gifted-chat';

export default class SpecificTextScreen extends React.Component {

    static noFilter = {
        conversationId: {ne: 'null'}
    }
    
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        }
        this.onSendHandler = this.onSendHandler.bind(this);
    }
    
    fetchMoreMessages = () => {
        connectClient.query({
            query: GraphQL.GetConnectMessages, 
            options: {
                variables: {filter: SpecificTextScreen.noFilter},
                fetchPolicy: 'cache-and-network',
            }
        })
        .then(res => {
            console.log(res);
            this.setState({messages: res.data.listNucleusConnectMessages.items});
            if (res.data.listNucleusConnectMessages.nextToken != null) {
                // start background operation to fetch more data
                // TODO: is this really needed or should we just fetch when 
                // user scrolls upwards?

            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    onSendHandler = ({messages = []}) => {
        /*const newMessage = {
            conversationId: this.state.passedChat.conversationId,
            author: this.state.passedChat.user1,
            content: this.state.typedMessage,
            recipient: this.state.passedChat.user2,
            timestamp: String(Math.floor(new Date().getTime()/1000)),
            messageId: this.state.passedChat.user1.firebaseId + this.state.passedChat.user2.firebaseId + String(Math.floor(new Date().getTime()/1000)),
        }
        console.log(newMessage);
        API.graphql(graphqlOperation(GraphQL.CreateConnectMessage, {input: newMessage}))
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });*/
        console.log(messages);
        console.log(previousState);
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, messages, true),
            };
        });
        this.answerDemo(messages);
    }

    renderItem = ({item}) => (
        <Message id={item.messageId} sent={item.sender} />
    )

    answerDemo(messages) {
        if (messages.length > 0) {
          if ((messages[0].image || messages[0].location) || !this._isAlright) {
            this.setState((previousState) => {
              return {
                typingText: 'React Native is typing'
              };
            });
          }
        }
    }


    /*componentWillMount() {
        this.fetchMoreMessages();
    }*/

    /*componentDidMount() {
        this.setState({passedChat: this.props.navigation.getParam('chat', null)});
        API.graphql(graphqlOperation(GraphQL.SubscribeToConnectMessages, {conversationId: this.props.navigation.getParam('chat', null)}))
        .subscribe({
            next: (res) => {
              console.log('Subscription received: ' + String(res));
              const newMessage = res.value.data.onCreateNucleusConnectMessages;
              this.state.messages.push(newMessage);
              this.forceUpdate();
            }
        }); 
    }*/

    render() {
        // TODO: Avoid re-rendering at every character entry
        console.log(this.state);
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={this.onSendHandler}
                user={{_id: 1}}
            />
        );
    }
} 

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  }, 
  input: {
    borderRadius: 5,
    height: 40,
    width: DEVICE_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'black',
    paddingHorizontal: 10,
}
});
