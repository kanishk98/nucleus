import React from 'react';
import { Text, Button, StyleSheet, View, FlatList } from 'react-native';
import { Card } from 'react-native-elements';
import Constants from '../Constants';

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

export default class Trending extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state={
            postList: []
        };
    }

    getMorePosts = ({viewableItems, changed}) => {
        fetch('http://' + Constants.postsIp + '/get-posts?perPage=5')
        .then(res => {
            console.log(res);
            this.postList = res;
        })
        .catch(err => {
            console.log(err);
        });
        console.log(viewableItems);
        console.log(changed);
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
        console.log(item);
        return (
        <PollCard
            title={item.title}
            image={item.image}
            caption={item.caption}
            button1Title={item.button1Title}
            button2Title={item.button2Title}
        />);
    }

    componentWillMount() {
        this.getPosts();
    }

    render() {
        console.log(this.state.postList);
        return (
            <FlatList
                onViewableItemsChanged={this.getMorePosts}
                data={this.state.postList}
                keyExtractor={this.postKeyExtractor}
                renderItem={this.renderPost} 
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