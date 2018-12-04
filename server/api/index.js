var express = require('express')
var app = express();

app.get('/', (req, res) => {
    res.send('test')
});

module.exports = {
    path: '/api',
    handler: app,
}
