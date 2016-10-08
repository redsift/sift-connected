/**
 * sift-connected: 'reduce' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

var SocialLinks = require('./utils/sociallinks.js');

module.exports = function (got) {
  const inData = got['in'];
  const query = got['query'];

  var tid = query[0];
  var myLinks = {};
  var requester = 'email';
  var channel = null;
  inData.data.map(function (datum) {
    var jdatum = JSON.parse(datum.value);
    var lns = jdatum.links;
    requester = jdatum.requester ? jdatum.requester : requester;
    channel = jdatum.channel ? jdatum.channel : channel;
    Object.keys(lns).forEach(function (k) {
      if (lns[k] && Object.keys(lns[k]).length > 0) {
        myLinks[k] = lns[k];
      }
    });
  });

  var links = new SocialLinks();
  var imp = links.calculateImportance(myLinks);
  var ret;

  if (requester === 'email' && imp.primary.importance !== 'low') {
    ret = {
      name: 'tidList',
      key: tid,
      value: {
        list: imp.primary,
        detail: {
          primary: imp.primary,
          secondary: imp.secondary
        }
      }
    };
  }
  else if (requester === 'slackbot') {
    ret = {
      name: 'slackresponse',
      key: tid,
      value: {
        primary: imp.primary,
        secondary: imp.secondary,
        requester: requester,
        channel: channel
      }
    };
  }
  return ret;
};
