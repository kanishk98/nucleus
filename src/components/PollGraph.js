import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import Constants from '../Constants';

export default class PollGraph extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            width: null,
        }
    }

    renderSubParts = () => {
        let label = (this.props.value / this.props.total) * 100.0;
        return (
            <Text style={styles.text}>
                {this.props.value + (this.props.value == 1?' vote for ':' votes for ') + this.props.label}
            </Text>
        );
    }

    onMeasureLayout = (event) => {
        let width = event.nativeEvent.layout.width;
        if (this.props.total != 0) {
            width = width * (this.props.value / this.props.total);
        } else {
            width = 0;
        }
        this.setState({ width: width });
    }

    render() {
        let { width } = this.state;
        if (!!width) {
            // have both width and height
            return (
                <View>
                    <View style={{
                        aligItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        borderWidth: 2,
                        width: width,
                        backgroundColor: Constants.secondaryColor,
                        borderRadius: 5,
                        height: 50,
                        borderColor: Constants.secondaryColor,
                        paddingLeft: 10,
                        paddingRight: 10,
                        marginTop: 5,
                        marginBottom: 10,
                    }} />

                    {this.renderSubParts()}
                </View>
            );
        } else if (width == 0) {
            return (
                <View styles={styles.graphContainer}>
                    <View style={{
                        aligItems: 'center',
                        justifyContent: 'center',
                        width: width,
                        borderWidth: 2,
                        borderColor: Constants.secondaryColor,
                        backgroundColor: Constants.secondaryColor,
                        borderRadius: 5,
                        height: 30,
                        paddingLeft: 10,
                        paddingRight: 10,
                        marginTop: 5,
                        marginBottom: 10,
                    }}>
                    </View>
                    <Text style={styles.text}>
                        {'No votes for ' + this.props.label + ' yet'}
                    </Text>
                </View>
            );
        }
        return (
            <View onLayout={(event) => this.onMeasureLayout(event)}
                style={styles.container}
            >
                <View style={styles.wrapper}>
                    {this.renderSubParts()}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    graphContainer: {
        marginTop: 5,
        marginBottom: 10,
    },
    container: {
        alignItems: 'center',
        marginTop: 5,
        flex: 1,
        flexDirection: 'row',
        marginBottom: 10,
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Constants.secondaryColor,
        borderRadius: 10,
        height: 50,
        paddingLeft: 10,
        paddingRight: 10,
    },
    text: {
        backgroundColor: 'transparent',
        color: 'black',
        fontWeight: 'bold',
        fontSize: 14,
    },
})