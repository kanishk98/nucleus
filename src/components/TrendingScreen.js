import React from 'react';
import { Text, Button, StyleSheet, View, FlatList } from 'react-native';
import { Card } from 'react-native-elements';
import Constants from '../Constants';
import { FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';

class PollCard extends React.PureComponent {
    render() {
        const {title, caption, image, button1Title, button2Title} = this.props;
        return (
            <Card
                title={title}>
                <Text style={{marginBottom: 10}}>
                    {caption}
                </Text>
                <View style={styles.buttonContainer}>
                    <Button
                        buttonStyle={styles.buttonStyle}
                        title={button1Title}
                        onPress={console.log('Button pressed')} />
                    <Button
                        buttonStyle={styles.buttonStyle}
                        title={button2Title}
                        onPress={console.log('Button pressed')} />
                </View>
            </Card>
        );
    }
}

class ConfessionCard extends React.PureComponent {
    render() {
        const {title, caption, image, button1Title, button2Title} = this.props;
        return (
            <Card
                title={title}>
                <Text style={{marginBottom: 10}}>
                    {caption}
                </Text>
                <View style={styles.buttonContainer}>
                    <Button
                        buttonStyle={styles.buttonStyle}
                        title={button1Title}
                        onPress={console.log('Button pressed')} />
                    <Button
                        buttonStyle={styles.buttonStyle}
                        title={button2Title}
                        onPress={console.log('Button pressed')} />
                </View>
            </Card>
        );
    }
}


export default class Trending extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state={
            currentPage: 1,
        };
    }

    getMorePosts = () => {
        let {currentPage} = this.state;
        currentPage = currentPage + 1;
        console.log('CurrentPage: ' + currentPage);
        fetch('http://' + Constants.postsIp + '/get-posts?perPage=5&currentPage=' + currentPage)
        .then(res => {
            console.log(res);
            let tempList = this.state.postList;
            console.log('TEMPLIST: ' + JSON.stringify(tempList));
            let receivedList = JSON.parse(res._bodyInit);
            console.log('RECEIVED LIST: ' + JSON.stringify(receivedList));
            for (item in receivedList) {
                if (tempList.indexOf(receivedList[item]) == -1) {
                    tempList.push(receivedList[item]);
                }
            }
            this.setState({postList: tempList, currentPage: currentPage});
        })
        .catch(err => {
            console.log(err);
        });
    }

    getPosts = () => {
        fetch('http://' + Constants.postsIp + '/get-posts?perPage=5')
        .then(res => {
            console.log(res);
            const postList = JSON.parse(res._bodyInit);
            this.setState({postList: postList});
        })
        .catch(err => {
            console.log(err);
        });
    }

    postKeyExtractor = (item, index) => item._id;

    renderPost = ({item}) => {
        return (
            <PollCard
                title='Anonymous'
                image={item.image}
                caption={item.caption}
                button1Title={item.button1Title}
                button2Title={item.button2Title}
            />
        );
    }

    componentWillMount() {
        if (this.state.postList == null || this.state.postList == undefined) {
            this.getPosts();
        }
    }

    render() {
        console.log(this.state.postList);
        return (
            <FlatList
                data={this.state.postList}
                keyExtractor={this.postKeyExtractor}
                renderItem={this.renderPost}
                onEndReached={this.getMorePosts}
                onEndReachedThreshold={0.25}
            />
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    pollButton: {
        borderRadius: 0,
        marginLeft: 0, 
        marginRight: 0, 
        marginBottom: 0,
    },
})