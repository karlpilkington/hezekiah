//
// Hezekiah v.0.3.0
// Copyright 2013-2015 Kyle Hotchkiss
// All Rights Reserved
//

var environment = process.env.NODE_ENV || 'development';

if ( environment === "production" ) {
    require('newrelic');
} else if ( environment === "development" ) {
    require('node-env-file')(__dirname + '/.env');
}

var meta = require('./package.json');
var config = require('./config.json'); // TODO: Load sequalize settings into .env

var url = require('url');
var cors = require('cors');
var raven = require('raven');
var express = require('express');
var compress = require('compression');
var bodyParser = require('body-parser');
var validator = require('express-validator');

//
// Express Setup
//
var app = express();

if ( process.env.HEZ_SENTRY_URL ) {
    app.use(raven.middleware.express( process.env.HEZ_SENTRY_URL ));
}

if ( environment === "production" ) {
    app.use(cors({
        origin: "https://www.illuminatenations.org"
    }));
} else if ( environment === "staging" ) {
    app.use(cors({
        origin: "http://illuminatenations.dev"
    }));
} else {
    app.use(cors());
}

app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(express.static('public',  { maxAge: '1w' }));

//
// Get Subdomain
//
app.use(function( req, res, next ) {
    req.subdomain = req.get('host').split('.')[0];

    next();
});


//
// App Routing
//
app = require('./routes')( app );


//
// Return app for Supertest
//
module.exports = app;


//
// Start it UP!
//
app.listen( process.env.PORT || 5000 );


if ( environment === "development" ) {
    console.log( "\n " + meta.name + " v" + meta.version);
    console.log( " binded: http://0.0.0.0:" + ( process.env.PORT || 5000 ) + "/\n");
}
