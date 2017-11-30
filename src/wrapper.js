import ReactDOM from 'react-dom';
import React from 'react';

const showAppTemplate = ( element ) =>
{
    ReactDOM.render(<App />, element );
};

module.exports = showAppTemplate;