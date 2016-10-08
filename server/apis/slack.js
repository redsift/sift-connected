/**
 * Slack API utilities
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

var rp = require('request-promise');

function postMessage(channel, text, attachments) {
  return new Promise(function (resolve, reject) {
    var botToken = process.env._SLACK_BOT_TOKEN;

    // sanitise channel
    channel = channel.replace(/(^<@)/, '');
    channel = channel.replace(/(^@)/, '');
    channel = channel.replace(/(^<#)/, '');
    channel = channel.replace(/(^#)/, '');
    channel = channel.replace(/(>:$)/, '');
    channel = channel.replace(/(>$)/, '');

    var options = {
      uri: 'https://slack.com/api/chat.postMessage',
      qs: {
        token: botToken,
        channel: channel
      },
      json: true // Automatically parses the JSON string in the response
    };

    if (text) {
      options.qs.text = text;
    }
    if (attachments) {
      options.qs.attachments = JSON.stringify(attachments);
    }

    rp(options).then(function (rsp) {
      resolve();
    }).catch(function (err) {
      // API call failed...
      console.error('Error: ' + err);
      reject(err);
    });
  });
}

function attachmentFields(color, fields) {
  /*jshint camelcase: false */
  var att = {
    color: color || '#36a64f',
    fields: fields,
    mrkdwn_in: ['fields']
  };
  return att;
}

function attachment(cfg) {
  /*jshint camelcase: false */
  var att = {
    fallback: cfg.fallback,
    color: cfg.color || '#36a64f',
    mrkdwn_in: ['title', 'text', 'fields']
  };
  if (cfg.title) {
    att.title = cfg.title;
  }
  if (cfg.text) {
    att.text = cfg.text;
  }
  if (cfg.subtext) {
    att.fields = [
      {
        value: cfg.subtext,
        short: false
      }
    ];
  }
  if (cfg.image_url) {
    att.image_url = cfg.image_url;
  }
  if (cfg.thumb_url) {
    att.thumb_url = cfg.thumb_url;
  }
  return att;
}

module.exports = {
  postMessage: postMessage,
  attachmentFields: attachmentFields,
  attachment: attachment
};
