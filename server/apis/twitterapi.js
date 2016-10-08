/**
 * Twitter API utilities
 *
 * Copyright (c) 2016 Redsift Limited
 */
var Twitter = require('twitter');

var credentials;

function TwitterAPI(creds) {
  credentials = creds;
}

function _getIdList(path, twid) {
  return new Promise(function (resolve, reject) {
    var params = {
      user_id: twid
    };
    var ids = [];
    var twitter = new Twitter({
      consumer_key: process.env.TWITTER_APP_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_APP_CONSUMER_SECRET,
      access_token_key: credentials.token,
      access_token_secret: credentials.secret
    });
    twitter.get(path, params, function getIds(error, pids, response) {
      if (!error) {
        ids = ids.concat(pids.ids);
        if (pids.next_cursor > 0) {
          params.cursor = pids.next_cursor;
          twitter.get(path, params, getIds);
        }
        else {
          resolve(ids);
        }
      }
      else {
        console.error('twitter.js: _getIdList: error: ', error);
        resolve(ids);
      }
    });
  });
}

TwitterAPI.prototype.getFriends = function (twid) {
  return _getIdList('friends/ids', twid);
}

TwitterAPI.prototype.getFollowers = function (twid) {
  return _getIdList('followers/ids', twid);
}

// exports
module.exports = TwitterAPI;