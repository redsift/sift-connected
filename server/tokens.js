/**
 * sift-connected: 'tokens' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

module.exports = function (got) {
  const inData = got['in'];
  var ret = [];

  inData.data.map(function (datum) {
    ret.push({ name: 'auth-cache', key: datum.key, value: datum.value });
    // Filtering out token info from the auth info sent to the frontend
    var jv = 'connected';
    try {
      console.log('the node receives:', datum);
      jv = JSON.parse(decodeURIComponent(datum.value));
      ['access_token', 'oauth_token', 'oauth_token_secret'].forEach(function (k) {
        if(jv[k]) {
          delete jv[k];
        }
      });
    }
    catch (e) {
      console.log('looks like something failed:', e)
    }
    ret.push({ name: 'auth', key: datum.key, value: jv });
  });
  return ret;
};
