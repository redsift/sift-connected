/**
 * sift-connected: 'twitter' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

var TwitterAPI = require('./apis/twitterapi.js');
var SocialLinks = require('./utils/sociallinks.js');

module.exports = function (got) {
  const inData = got['in'];
  const withData = got['with'];
  const lookupData = got['lookup'];

  var datum = inData.data[0];
  var key = datum.key.slice(0, datum.key.lastIndexOf('/')) + '/twitter';
  var val = JSON.parse(datum.value);
  var twid = datum.key.slice(datum.key.lastIndexOf('/') + 1);

  var credentials = null;
  console.log('debugging lookup values', lookupData);
  try{
    credentials = JSON.parse(lookupData[0].data.value);
  }catch(e){
    console.warn('twitter.js: twitter credentials not available', e);
    return;
  }
  if (!credentials){
    console.warn('twitter.js: twitter credentials not available');
    return;
  }

  var user;
  try{
    user = JSON.parse(lookupData[1].data.value);
  }catch(e){ }
  var cachedSender = false;
  var sender;
  if (withData.data && withData.data[0] && withData.data[0].value) {
    sender = JSON.parse(withData.data[0].value);
    cachedSender = true;
  }

  var sp = [];
  sp.push(getSocialConnections(credentials.id, user, credentials));
  sp.push(getSocialConnections(twid, sender, credentials));
  return Promise.all(sp).then(function (results) {
    var ret = [];
    var links = new SocialLinks();
    val.links = links.getLinks({twitter: results[0]}, {twitter: results[1]});
    ret.push({ name: 'reduce', key: key, value: val });
    if(results[0].friends.length > 0) {
      ret.push({ name: 'user-cache', key: 'twitter', value: results[0] });
    }
    if(!cachedSender && results[1].friends.length > 0) {
      ret.push({ name: 'stats', key: 'twitter/' + twid, value: { followers: results[1].followers.length, friends: results[1].friends.length, username: val.username, url: val.url }});
      ret.push({ name: 'stats', key: 'twitter/latest', value: { username: val.username, url: val.url }});
      ret.push({ name: 'twids-cache', key: twid, value: results[1] });
    }
    return ret;
  });
};

function getSocialConnections(id, person, credentials) {
  if(person) {
    return Promise.resolve(person);
  }
  else {
    var twitter = new TwitterAPI(credentials);
    var promises = [];
    promises.push(twitter.getFollowers(id));
    promises.push(twitter.getFriends(id));
    return Promise.all(promises).then(function (results) {
      var value = {};
      value.id = id;
      value.followers = results[0];
      value.friends = results[1];
      return value;
    });
  }
}