/**
 * Angel List API utilities
 *
 * Copyright (c) 2016 Redsift Limited
 */
var request = require('request');

var credentials;

function AngelListAPI(creds) {
  credentials = creds;
}

AngelListAPI.prototype.getRoles = function (id) {
  return _apiRequest('https://api.angel.co/1/users/' + id + '/roles');
}

AngelListAPI.prototype.getUserWithDetails = function (id) {
  return _apiRequest('https://api.angel.co/1/users/' + id + '?include_details=investor');
}

function _apiRequest(url) {
  return new Promise(function (resolve, reject) {
    var options = {
      url: url,
      headers: {
        'Authorization': 'Bearer ' + credentials.access_token
      }
    };
    function callback(error, response, body) {
      if (!error && response.statusCode === 200) {
        // TODO: need to support pagination
        var roles = JSON.parse(body);
        resolve(roles);
      }
      else {
        console.error('angellistapi.js: _apiRequest: failed: ', error, response.statusCode);
        resolve(null);
      }
    }
    request(options, callback);
  });
}

// exports
module.exports = AngelListAPI;