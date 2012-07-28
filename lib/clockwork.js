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
    'sms': 'http://api.clockworksms.com/xml/send',
    'credit': 'api.clockworksms.com/xml/credit'
}

var Clockwork = function(key, options)
{
    this.key = key;
    this.options = options;
    return this;
}

exports.Clockwork = Clockwork;
