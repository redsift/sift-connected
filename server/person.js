/**
 * sift-connected: 'person' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */

'use strict';

var FullContactAPI = require('./apis/fullcontactapi');

module.exports = function (got) {
  const inData = got['in'];
  const withData = got['with'];
  const lookupData = got['lookup'];

  var fcApiKey = null;
  try{
    fcApiKey = JSON.parse(lookupData[0].data.value.toString('utf8'));
  }catch(e){
    console.warn('person.js: fullcontact API key not available', e);
    return;
  }
  if (!fcApiKey){
    console.warn('person.js: fullcontact API key not available');
    return;
  }

  var fullContact = new FullContactAPI(fcApiKey);

  var datum = inData.data[0];
  var key = datum.key;
  var val = JSON.parse(datum.value);
  var email = key.slice(key.lastIndexOf('/') + 1);

  if (withData.data.length === 1) {
    var sp = JSON.parse(withData.data[0].value);
    return _getReturnValues(key, sp, val);
  }
  else {
    // fullcontact search
    return fullContact.searchEmail(email).then(function (sp) {
      var ret;
      ret = _getReturnValues(key, sp, val);
      // Cache the returned social profiles
      ret.push({ name: 'emails-fc-cache', key: email, value: sp });
      return ret;
    });
  }
};

function _getReturnValues(key, sp, val) {
  var ret = [];
  // Twitter
  if (sp.twitter && sp.twitter.id) {
    ret.push({ name: 'twitter', key: key + '/' + sp.twitter.id, value: { requester: val.requester, url: sp.twitter.url, username: sp.twitter.username }});
  }
  // AngelList
  if (sp.angellist && sp.angellist.id) {
    ret.push({ name: 'angellist', key: key + '/' + sp.angellist.id, value: { requester: val.requester, url: sp.angellist.url, username: sp.angellist.username } });
  }
  // Empty response for bot
  if(ret.length === 0 && val.requester === 'slackbot') {
    ret.push({ name: 'slackresponse', key: key.slice(key.lastIndexOf('/') + 1), value: val});
  }
  return ret;
}
