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
      jv = JSON.parse(datum.value);
      ['access_token', 'oauth_token', 'oauth_token_secret'].forEach(function (k) {
        if(jv[k]) {
          delete jv[k];
        }
      });
    }
    catch (e) {}
    ret.push({ name: 'auth', key: datum.key, value: jv });
  });
  return ret;
};
