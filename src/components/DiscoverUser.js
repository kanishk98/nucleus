import React from 'react';
import PropTypes from 'prop-types';

class DiscoverUser extends React.Component {
    constructor(props) {
        super(props);
    }
}

DiscoverUser.PropTypes = {
    discoverUser: PropTypes.shape({
        loading: PropTypes.bool,
        data: {
            user: PropTypes.shape({
                firebaseId: PropTypes.string.isRequired,
            }),
        },
    }),
};

export default DiscoverUser;