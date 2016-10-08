/**
 * sift-connected: 'slack response' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

var slackapi = require('./apis/slack.js');

// Entry point for DAG node
module.exports = function (got) {
  /* jshint camelcase: false */
  /* jshint -W069 */
  const inData = got['in'];
  const lookupData = got['lookup'];
  const withData = got['with'];

  var promises = [];

  for (var d of inData.data) {
    if (d.value) {
      try {
        var connection = JSON.parse(d.value);
        if(!connection.primary || connection.primary.importance === 'low') {
          promises.push(slackapi.postMessage(connection.channel, 'I couldn\'t find a connection between you on Angel List or Twitter.' , null));
        }
        else {
          var attachments = [];
          attachments.push(slackapi.attachment({
            fallback: connection.primary.description,
            title: 'Connection level: ' + connection.primary.importance,
            text: connection.primary.description,
            thumb_url: 'https://static.redsift.io/assets/sifts/sift-connected/' + connection.primary.importance + '.png'
          }));
          if(connection.secondary.twitter && connection.secondary.twitter.length > 0) {
            var text = '';
            connection.secondary.twitter.forEach(function (c) {
              text += c + '. ';
            });
            attachments.push(slackapi.attachment({
              fallback: text,
              title: 'Twitter connections',
              text: text,
              thumb_url: 'https://static.redsift.io/assets/sifts/sift-connected/twitter.png'
            }));
          }
          if(connection.secondary.angellist && connection.secondary.angellist.length > 0) {
            var text = '';
            connection.secondary.angellist.forEach(function (c) {
              text += c + '. ';
            });
            attachments.push(slackapi.attachment({
              fallback: text,
              title: 'Angel List connections',
              text: text,
              thumb_url: 'https://static.redsift.io/assets/sifts/sift-connected/angellist.png'
            }));
          }
          promises.push(slackapi.postMessage(connection.channel, null , attachments));
        }
      }
      catch (ex) {
        console.error('slackresponse.js: Error parsing value for: ', d.key);
        console.error('slackresponse.js: Exception: ', ex);
        continue;
      }
    }
  }
  return promises;
};
