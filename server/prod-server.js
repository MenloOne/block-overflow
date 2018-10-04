const express = require('express');
const path = require('path');
var forceSsl = require('force-ssl-heroku');

const app = express();
app.use(forceSsl);

const buildPath = path.join(__dirname, '../build')

// Serve the static files from the React app
app.use(express.static(buildPath));

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(buildPath+'/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port);

console.log('App is listening on port ' + port);