import React from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { Card, Button } from 'react-native-elements';
import Constants from '../Constants';
import NavigationService from './NavigationService';

class PollCard extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = this.props;
    }

    updatePost = (button1Value, button2Value) => {
        console.log('BUTTON1VAL: ' + this.state.button1Value);
        console.log('BUTTON2VAL: ' + this.state.button2Value);
        fetch('http://' + Constants.postsIp + '/update-post',  {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                _id: this.props._id,
                title: this.props.title,
                caption: this.props.caption,
                button1Title: this.props.button1Title,
                button2Title: this.props.button2Title,
                button1Value: button1Value,
                button2Value: button2Value,
            }),
        })
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }

    onPressButton1 = () => {
        this.setState({button1Value: this.state.button1Value + 1});
        this.updatePost(this.state.button1Value + 1, this.state.button2Value);
    }

    onPressButton2 = () => {
        this.setState({button2Value: this.state.button2Value + 1});
        this.updatePost(this.state.button1Value, this.state.button2Value + 1);
    }
    
    render() {
        const {title, caption, image, button1Title, button2Title, button1Value, button2Value} = this.state;
        return (
            <Card
                title={title}>
                <Text style={{marginBottom: 10, textAlign: 'center'}}>
                    {caption}
                </Text>
                <View style={styles.buttonContainer}>
                    <Text>{button1Value}</Text>
                    <Button
                        style={{flex: 1, justifyContent: 'flex-start', paddingRight: 10}}
                        textStyle={{textAlign: 'center', color: Constants.primaryColor}}
                        title={button1Title}
                        backgroundColor={'white'}
                        onPress={this.onPressButton1} />
                    <Button
                        textStyle={{textAlign: 'center', color: Constants.primaryColor}}
                        title={button2Title}
                        backgroundColor={'white'}
                        style={{flex: 1, justifyContent: 'flex-end', paddingLeft: 10}}
                        onPress={this.onPressButton2} />
                    <Text>{button2Value}</Text>
                </View>
            </Card>
        );
    }
}

export const newTrendingPost = () => {
    NavigationService.navigate('NewTrendingScreen');
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
                _id = {item._id}
                title={item.title || 'Anonymous'}
                image={item.image}
                caption={item.caption}
                button1Title={item.button1Title}
                button2Title={item.button2Title}
                button1Value={item.button1Value || 0}
                button2Value={item.button2Value || 0}
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
        alignItems: 'center',
    },
    pollButton: {
        borderRadius: 0,
        marginLeft: 0, 
        marginRight: 0, 
        marginBottom: 0,
    },
})