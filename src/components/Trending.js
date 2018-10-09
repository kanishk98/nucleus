import React from 'react';
import { Text, Button, StyleSheet, View } from 'react-native';
import { Card } from 'react-native-elements';

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
                        title={button1Title} />
                    <Button
                        buttonStyle={styles.buttonStyle}
                        title={button2Title} />
                </View>
            </Card>
        );
    }
}

export default class Trending extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <PollCard title={'Poll'} caption={'How is this background?'} image={require('../../assets/pattern.png')}
            button1Title={'Yay'} button2Title={'Nay'} />
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