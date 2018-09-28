import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'

import App from './App'
import registerServiceWorker from './registerServiceWorker'

import './App.scss'


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


ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <App/>
    </MuiThemeProvider>,
    document.body.appendChild(document.createElement('div'))
);

registerServiceWorker()
