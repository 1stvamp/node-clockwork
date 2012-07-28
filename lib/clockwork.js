/*
 * clockwork
 *
 * Mediaburst Clockwork API wrapper for Node.js
 *
 * Copyright (c) 2012 Wesley Mason <wes@1stvamp.org>
 * See LICENSE file for rights.
 */

var request = require('request');
var querystring = require('querystring');

var baseUris = {
    'sms': 'https://api.clockworksms.com/xml/send',
    'credit': 'https://api.clockworksms.com/xml/credit'
}

var Clockwork = function(auth, options)
{
    if (auth && auth.key)
    {
	this.key = auth.key;
	this.username = this.password = null;
    }
    else if (auth && auth.username && auth.password)
    {
	this.key = null;
	this.username = auth.username;
	this.password = auth.password;
    }
    else
    {
	throw new Error('You must pass either an API key OR a username and password.');
    }

    this.options = options;

    return this;
}

exports.Clockwork = Clockwork;
