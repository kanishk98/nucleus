import React from 'react';
import { Message } from './Message';
import * as GraphQL from '../graphql';
import { noFilter } from './SpecificChatList';
import { FlatList, KeyboardAvoidingView, Dimensions, StyleSheet, TextInput } from 'react-native';
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

    componentWillMount() {
         this.fetchMoreMessages();
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
        })
    }

    renderItem = ({item}) => (
        <Message id={item.messageId} sent={item.sender} />
    )

    render() {
        const otherPerson = this.props.navigation.getParam('chat');
        console.log(otherPerson);
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
