/**
 * FullContact API utilities
 *
 * Copyright (c) 2016 Redsift Limited
 */
var FullContact = require('fullcontact');

function FullContactAPI(apiKey) {
  this._apiKey = apiKey;
}

FullContactAPI.prototype.searchEmail = function(email) {
  return _search.call(this, 'person', email);
}

FullContactAPI.prototype.searchDomain = function(domain) {
  return _search.call(this, 'company', domain);
}

function _search(type, value) {
  return new Promise(function(resolve, reject) {
    var valType = (type === 'person') ? 'email' : 'domain';
    var fullcontact = new FullContact(this._apiKey);
    fullcontact[type][valType](value, function(err, data) {
      var ret = {};
      if (!err) {
        ret = _getSocialProfiles(data);
      }
      resolve(ret);
    });
  }.bind(this));
}

// Returns twitter and angellist profiles
function _getSocialProfiles(data) {
  var ret = {};
  if (data.socialProfiles && data.socialProfiles.length > 0) {
    data.socialProfiles.forEach(function(p) {
      if (p.typeId === 'twitter' || p.typeId === 'angellist') {
        ret[p.typeId] = p;
      }
    });
  }
  return ret;
}

// exports
module.exports = FullContactAPI;