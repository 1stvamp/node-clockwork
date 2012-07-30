// ex: set tabstop=4 shiftwidth=4 expandtab:
/*
 * node-clockwork
 *
 * Mediaburst Clockwork API wrapper for Node.js
 *
 * Copyright (c) 2012 Wesley Mason <wes@1stvamp.org>
 * See LICENSE file for rights.
 */

var request = require('request');
var querystring = require('querystring');
var xmlbuilder = require('xmlbuilder');
var xml2js = require('xml2js');


var BASE_URLS = {
    'sms': 'https://api.clockworksms.com/xml/send.aspx',
    'credit': 'https://api.mediaburst.co.uk/xml/credit.aspx'
}


/**
  * Helper function to recursively serialize a JS object or array to Clockwork compatible XML docs.
  */
var serialize = function(obj, root)
{
    var child = false;
    if (!root)
    {
        var doc = xmlbuilder.create();
        var root = doc.begin(Object.keys(obj)[0], {'version': '1.0', 'encoding': 'UTF-8'});
    }
    else
    {
        child = true;
    }

    var attrs;
    if (child)
    {
        attrs = obj;
    }
    else
    {
        attrs = obj[Object.keys(obj)[0]];
    }

    for (var attr in attrs)
    {
        if (!attrs.hasOwnProperty(attr)) continue;

        var value = attrs[attr];
        if (value instanceof Array)
        {
            for (subattrName in value)
            {
                subattr = value[subattrName];
                var el = root.ele(attr, {});
                serialize(subattr, el);
            }
        }
        else if (typeof(value) == 'object')
        {
            var el = root.ele(attr, {});
            serialize(value, el);
        }
        else
        {
            var el = root.ele(attr, {}, value);
        }
    }

    if (child)
    {
        return root;
    }

    return root.doc();
}


var ClockworkApi = function(auth)
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

    this.parser = new xml2js.Parser();

    // Don't be so strict with the kids!
    // Results from Clockwork are a little lax as XML.
    this.parser.saxParser.strict = false;


    /**
      * See http://www.mediaburst.co.uk/api/doc/xml/check-credit/
      */
    this.getCredit = function(callback)
    {
        if (!callback)
        {
            throw new Error('Please provide a callback.');
        }

        var _this = this;
        var payload = {
            'Credit': {
            }
        };
        if (this.key)
        {
            payload['Credit']['Key'] = this.key;
        }
        else
        {
            payload['Credit']['Username'] = this.username;
            payload['Credit']['Password'] = this.password;
        }

        request({
            'uri': BASE_URLS.credit,
            'method': 'post',
            'body': serialize(payload).toString()
            },
            function(error, response, body) {
                var credit = null;
                if (error)
                {
                    callback(error, credit);
                }
                else
                {
                    _this.parser.parseString(body,function(error, data)
                    {
                        if (!error)
                        {
                            if (data['ERRNO'])
                            {
                                error = data;
                            }
                            else
                            {
                                credit = parseInt(data['CREDIT']);
                            }
                        }
                        callback(error, credit);
                    });
                }
            }
        );
    };


    /**
      * See http://www.mediaburst.co.uk/api/doc/xml/send-sms/
      */
    this.sendSms = function(options, callback)
    {
        if (!options)
        {
            throw new Error('Please provide options for sending the SMS. At the very least to, from, content.');
        }

        var _this = this;

        var payload = {
            'Message': {
                'SMS': options
            }
        };

        if (this.key)
        {
            payload['Message']['Key'] = this.key;
        }
        else
        {
            payload['Message']['Username'] = this.username;
            payload['Message']['Password'] = this.password;
        }

        request({
            'uri': BASE_URLS.sms,
            'method': 'post',
            'body': serialize(payload).toString()
            },
            function(error, response, body)
            {
                var resp = null;

                if (error)
                {
                    callback(error, resp);
                }
                else
                {
                    _this.parser.parseString(body, function(error, data)
                    {
                        if (!error)
                        {
                            if (data['SMS_RESP']['ERRNO'])
                            {
                                error = data;
                            }
                            else
                            {
                                resp = [];
                                if (data['SMS_RESP'] instanceof Array)
                                {
                                    for (i in data['SMS_RESP'])
                                    {
                                        if (data['SMS_RESP'][i]['ERRNO'])
                                        {
                                            callback(data, null);
                                        }
                                        smsResp = data['SMS_RESP'][i];
                                        resp.push({
                                            'To': smsResp['TO'],
                                            'MessageID': smsResp['MESSAGEID']
                                        });
                                    }
                                }
                                else
                                {
                                    resp.push({
                                        'To': data['SMS_RESP']['TO'],
                                        'MessageID': data['SMS_RESP']['MESSAGEID']
                                    });
                                }
                            }
                        }
                        callback(error, resp);
                    });
                }
            }
        );
    };

    return this;
}

exports.ClockworkApi = ClockworkApi;
