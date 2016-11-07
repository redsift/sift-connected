/**
 * sift-connected: 'angellist' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

var AngelListAPI = require('./apis/angellistapi.js');
var SocialLinks = require('./utils/sociallinks.js');

module.exports = function (got) {
  const inData = got['in'];
  const withData = got['with'];
  const lookupData = got['lookup'];

  var datum = inData.data[0];
  var key = datum.key.slice(0, datum.key.lastIndexOf('/')) + '/angellist';
  var val = JSON.parse(datum.value);
  var alid = datum.key.slice(datum.key.lastIndexOf('/') + 1);

  var credentials = null;
  try {
    credentials = JSON.parse(lookupData[0].data.value);
  } catch (e) {
    console.warn('angellist.js: angellist credentials not available', e);
    return;
  }
  if (!credentials) {
    console.warn('angellist.js: angellist credentials not available');
    return;
  }

  var user;
  try {
    user = JSON.parse(lookupData[1].data.value);
  } catch (e) { }
  var cachedSender = false;
  var sender;
  if (withData.data && withData.data[0] && withData.data[0].value) {
    sender = JSON.parse(withData.data[0].value);
    cachedSender = true;
  }

  var sp = [];
  sp.push(getSocialConnections(credentials.id, user, credentials));
  sp.push(getSocialConnections(alid, sender, credentials));
  return Promise.all(sp).then(function (results) {
    var ret = [];
    var links = new SocialLinks();
    val.links = links.getLinks({ angellist: results[0] }, { angellist: results[1] });
    ret.push({ name: 'reduce', key: key, value: val });
    if (results[0]) {
      ret.push({ name: 'user-cache', key: 'angellist', value: results[0] });
    }
    if (!cachedSender && results[1] && results[1].user) {
      ret.push({ name: 'stats', key: 'angellist/' + alid, value: { followers: results[1].user.follower_count, username: results[1].user.name, url: results[1].user.angellist_url } });
      ret.push({ name: 'stats', key: 'angellist/latest', value: { username: results[1].user.name, url: results[1].user.angellist_url } });
      ret.push({ name: 'alids-cache', key: alid, value: results[1] });
    }
    return ret;
  });
};

function getSocialConnections(id, person, credentials) {
  if (person) {
    return Promise.resolve(person);
  }
  else {
    var angellist = new AngelListAPI(credentials);
    var alp = [];
    alp.push(angellist.getRoles(id));
    alp.push(angellist.getUserWithDetails(id));
    return Promise.all(alp).then(function (results) {
      if (!results[0] && !results[1]) {
        return [{ angellist: null }];
      }
      var connections = { id: id, roles: results[0], user: results[1] };
      return connections;
    });
  }
}
