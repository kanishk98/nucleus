import React from 'react';
import { NetInfo, StyleSheet, View, FlatList, ActivityIndicator, AsyncStorage, ImageBackground, Dimensions } from 'react-native';
import { Card, Button } from 'react-native-elements';
import Constants from '../Constants';
import NavigationService from './NavigationService';
import { renderSearch } from './renderIf';
import PollButton from './PollButton';
import PollGraph from './PollGraph';

class PollCard extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = this.props;
        this.state.buttonPressed = false;
    }

    updatePost = (button1Value, button2Value, userList) => {
        console.log('BUTTON1VAL: ' + this.state.button1Value);
        console.log('BUTTON2VAL: ' + this.state.button2Value);
        fetch('http://' + Constants.postsIp + '/update-post', {
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
                userList: userList,
            }),
        })
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }

    onPressButton1 = () => {
        let userList = this.state.userList;
        userList[this.state.firebaseId] = true;
        this.setState({ button1Value: this.state.button1Value + 1, buttonPressed: true });
        this.updatePost(this.state.button1Value + 1, this.state.button2Value, userList);
    }

    onPressButton2 = () => {
        let userList = this.state.userList;
        userList[this.state.firebaseId] = true;
        this.setState({ button2Value: this.state.button2Value + 1, buttonPressed: true });
        this.updatePost(this.state.button1Value, this.state.button2Value + 1, userList);
    }

    render() {
        const { title, caption, image, button1Title, button2Title, button1Value, button2Value, userList, firebaseId } = this.state;
        return (
            <Card containerStyle={{ borderRadius: 15 }}
                title={caption}>
                {renderSearch(
                    this.state.buttonPressed || (!!userList && !!userList[firebaseId]),
                    <View>
                        <PollGraph label={button1Title} value={button1Value} total={button1Value + button2Value} />
                        <View style={{ paddingHorizontal: 30 }} />
                        <PollGraph label={button2Title} value={button2Value} total={button2Value + button1Value} />
                    </View>,
                    <View>
                        <PollButton
                            label={button1Title}
                            onPress={this.onPressButton1}
                        />
                        <PollButton
                            label={button2Title}
                            onPress={this.onPressButton2}
                        />
                    </View>
                )}
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
        this.state = {
            currentPage: 1,
            networkStatus: 'wifi',
        };
        this.newTrendingSet = false;
    }

    getMorePosts = () => {
        let { currentPage } = this.state;
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
                this.setState({ postList: tempList, currentPage: currentPage });
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
                this.setState({ postList: postList });
            })
            .catch(err => {
                console.log(err);
            });
    }

    postKeyExtractor = (item, index) => item._id;

    renderPost = ({ item }) => {
        try {
            return (
                <PollCard
                    _id={item._id}
                    title={item.title || 'Anonymous'}
                    image={item.image}
                    caption={item.caption}
                    button1Title={item.button1Title}
                    button2Title={item.button2Title}
                    button1Value={item.button1Value || 0}
                    button2Value={item.button2Value || 0}
                    userList={item.userList || {}}
                    firebaseId={this.user.firebaseId}
                />
            );
        }
        catch (err) {
            return null;
        }
    }

    _onrefresh = () => {
        this.setState({ refreshing: true });
        this.getPosts();
    }

    componentWillMount() {
        if (this.state.postList == null || this.state.postList == undefined) {
            this.getPosts();
        }
    }

    handleConnectivityChange(connectionInfo) {
        console.log('First change, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
        this.setState({ networkStatus: connectionInfo.type });
    }

    componentWillUnmount() {
        NetInfo.removeEventListener(
            'connectionChange',
            handleFirstConnectivityChange
        );
    }

    async componentDidMount() {
        this.user = JSON.parse(await (AsyncStorage.getItem(Constants.UserObject)));
        NetInfo.getConnectionInfo().then((connectionInfo) => {
            console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
        });
    }

    setNewTrending() {
        this.newTrendingSet = true;
    }

    render() {
        const newTrending = this.props.navigation.getParam('newTrending');
        console.log(newTrending);
        if (!!newTrending && !this.newTrendingSet) {
            console.log('refreshing polls');
            this.setNewTrending();
            this.getPosts();
            this.newTrendingSet = false;
        }
        const { postList, networkStatus } = this.state;
        console.log()
        if (!postList || postList.length == 0) {
            return (
                <ImageBackground source={require('../../assets/background.png')} style={styles.backgroundStyle}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                        <ActivityIndicator color={'white'} />
                    </View>
                </ImageBackground>
            );
        }

        return (
            <ImageBackground source={require('../../assets/background.png')} style={styles.backgroundStyle}>
                <FlatList
                    data={postList}
                    keyExtractor={this.postKeyExtractor}
                    renderItem={this.renderPost}
                    onEndReached={this.getMorePosts}
                    onEndReachedThreshold={0.75}
                    onRefresh={this._onrefresh}
                    refreshing={false}
                />
            </ImageBackground>
        );
    }
}

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundStyle: {
        flex: 1,
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT,
        backgroundColor: 'transparent'
    },
    resultText: {
        fontFamily: 'Roboto',
        fontWeight: 'bold',
    },
    pollButton: {
        borderRadius: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
    },
})