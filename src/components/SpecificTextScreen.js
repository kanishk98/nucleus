import React from 'react';
import { Message } from './Message';
import * as GraphQL from '../graphql';
import { noFilter } from './SpecificChatList';
import { FlatList, KeyboardAvoidingView, Dimensions, StyleSheet, TextInput, ScrollView } from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { connectClient } from '../../App';

export default class SpecificTextScreen extends React.Component {

    static noFilter = {
        conversationId: {ne: 'null'}
    }
    
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        }
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

    onSendHandler = () => {
        const newMessage = {
            conversationId: this.props.navigation.state.chat.conversationId,
            author: this.props.navigation.state.chat.user1,
            recipient: this.props.navigation.state.chat.user2,
            timestamp: String(Math.floor(new Date().getTime()/1000)),
            messageId: this.props.navigation.state.chat.user1.firebaseId + this.props.navigation.state.chat.user2.firebaseId + String(Math.floor(new Date().getTime()/1000)),
        }
        API.graphql(graphqlOperation(GraphQL.CreateConnectMessage), {input: newMessage})
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
    }

    renderItem = ({item}) => (
        <Message id={item.messageId} sent={item.sender} />
    )


    componentWillMount() {
        console.log('Props ' + JSON.stringify(this.props));
        this.fetchMoreMessages();
    }

    componentDidMount() {
        API.graphql(graphqlOperation(GraphQL.SubscribeToConnectMessages), {conversationId: this.props.navigation.getParam('chat', null)})
        .subscribe({
            next: (res) => {
              console.log('Subscription received: ' + String(res));
              const newMessage = res.value.data.onCreateNucleusConnectMessages;
              this.state.messages.push(newMessage);
              this.forceUpdate();
            }
        }); 
    }

    render() {
        // TODO: Avoid re-rendering at every character entry
        return (
            <KeyboardAvoidingView style={styles.container}>
                <FlatList
                    data={this.state.conversations}
                    renderItem={this.renderItem}
                    onMomentumScrollBegin={this.fetchMoreMessages}
                />
                <TextInput
                    style={styles.input}
                    placeholder='Type a message'
                    secureTextEntry={false}
                    autoCorrect={true}
                    autoCapitalize={'sentences'}
                    placeholderTextColor='gray'
                    onChangeText={(text)=>this.setState({typedMessage: text})}
                    onSubmitEditing={this.onSendHandler}
                />
            </KeyboardAvoidingView>
        );
    }
} 

const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: 'absolute', 
    bottom: 0,
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
