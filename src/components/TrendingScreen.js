import React from 'react';
import { Text, Button, StyleSheet, View, FlatList } from 'react-native';
import { Card } from 'react-native-elements';
import Constants from '../Constants';
import { FloatingAction } from 'react-native-floating-action';

class PollCard extends React.PureComponent {
    render() {
        const {title, caption, image, button1Title, button2Title} = this.props;
        return (
            <Card
                title={title}
                image={image}>
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
                title={title}
                image={image}>
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
            currentPage: 0,
        };
    }

    getMorePosts = () => {
        let {currentPage} = this.state;
        currentPage = currentPage + 1;
        fetch('http://' + Constants.postsIp + '/get-posts?perPage=3&currentPage=' + currentPage)
        .then(res => {
            console.log(res);
            let tempList = this.state.postList;
            let receivedList = JSON.parse(res._bodyInit);
            for (item in receivedList) {
                tempList.push(receivedList[item]);
            }
            this.setState({postList: tempList, currentPage: currentPage});
        })
        .catch(err => {
            console.log(err);
        });
    }

    getPosts = () => {
        fetch('http://' + Constants.postsIp + '/get-posts?perPage=3')
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
        if (item.title == 'Poll') {
            return (
            <PollCard
                title={item.title}
                image={item.image}
                caption={item.caption}
                button1Title={item.button1Title}
                button2Title={item.button2Title}
            />);
        } else {
            return (
                <ConfessionCard
                title={item.title}
                image={item.image}
                caption={item.caption}
                button1Title={item.button1Title}
                button2Title={item.button2Title}
                />
            );
        }
    }

    componentWillMount() {
        if (this.state.postList == null || this.state.postList == undefined) {
            this.getPosts();
        }
    }

    render() {
        console.log(this.state.postList);
        return (
            <View>
                <FlatList
                    data={this.state.postList}
                    keyExtractor={this.postKeyExtractor}
                    renderItem={this.renderPost}
                    onEndReached={this.getMorePosts}
                    onEndReachedThreshold={0.25}
                />
                <FloatingAction
                    onPressMain={console.log('Main pressed')}
                />
            </View>
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