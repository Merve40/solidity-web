var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./contracts')(app); // do not remove this line!

/**
*   Put your code below.
*/

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/index.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.js'));
});

app.listen(8181);
console.log("running on https://localhost:8181");
                