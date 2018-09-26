import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles';

import './index.css'

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#009688',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ffffff',
            contrastText: '#000000',
        },
        error: {
            main: '#ef5350',
            contrastText: '#000000',
        }
    },
});

import App from './App'
import registerServiceWorker from './registerServiceWorker'


ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <App/>
    </MuiThemeProvider>,
    document.body.appendChild(document.createElement('div'))
);

registerServiceWorker()

