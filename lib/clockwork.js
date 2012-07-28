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
var xmlbuilder = require('xmlbuilder');
var libxmljs = require('libxmljs');


var BASE_URLS = {
    'sms': 'https://api.clockworksms.com/xml/send.aspx',
    'credit': 'https://api.mediaburst.co.uk/xml/credit.aspx'
}

var serialize = function(obj)
{
    var doc = xmlbuilder.create();
    var root = doc.begin(Object.keys(obj)[0], {'version': '1.0', 'encoding': 'UTF-8', 'standalone': true});

    var attrs = obj[Object.keys(obj)[0]];

    for (var attr in attrs)
    {
	if (!attrs.hasOwnProperty(attr)) continue;

	var el = root.ele(attr, {}, attrs[attr]);
    }
    return root.doc().toString();

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

    this.options = options || {};

    this.getCredit = function(callback)
    {
	if (!callback)
	{
	    throw new Error('Please provide a callback.');
	}

	var _this = this;
	var payload = {
	    'Credit': {
		'Key': this.key
	    }
	};
	request(
	    {
		'uri': BASE_URLS.credit,
		'method': 'post',
		'body': serialize(payload)
	    },
	    function(error, response, body) {
		var credit = null;
		if (!error)
		{
		    var xmlDoc = libxmljs.parseXml(body);
		    credit = parseInt(xmlDoc.get('//Credit').text());
		}
		callback(error, credit);
	    }
	);
    }

    return this;
}

exports.Clockwork = Clockwork;
