/**
 * sift-connected: 'slack bot' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

// Entry point for DAG node
module.exports = function (got) {
  /* jshint camelcase: false */
  /* jshint -W069 */
  const inData = got['in'];

  var ret = [];

  for (var d of inData.data) {
    if (d.value) {
      try {
        var msg = JSON.parse(d.value);
        if (msg.subtype === 'message_deleted') {
          continue;
        }
        // remove <@..> direct mention
        msg.text = /mailto:(.*)\|/.exec(msg.text)[1];
        ret.push({ bucket: "person", key: msg.text + '/' + msg.text, value: { requester: "slackbot", channel: msg.channel } });
      }
      catch (ex) {
        console.error('slackbot.js: Error parsing value for: ', d.key);
        console.error('slackbot.js: Exception: ', ex);
        continue;
      }
    }
  }
  return ret;
};
