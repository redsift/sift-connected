/**
 * sift-connected: 'map' node implementation
 *
 * Copyright (c) 2016 Redsift Limited
 */
'use strict';

module.exports = function (got) {
  // inData contains the key/value pairs that match the given query
  const inData = got['in'];
  var result = [];

  inData.data.map(function (datum) {
    var jmapInfo = JSON.parse(datum.value);

    var me = {};
    me.email = jmapInfo.user.toLowerCase();
    me.domain = _getDomain(me.email);

    var from = jmapInfo.from;
    from.email = from.email.toLowerCase();
    from.domain = _getDomain(from.email);

    // If not email to self or from someone in the same company
    if ((from.email !== me.email) && (from.domain !== me.domain || from.domain === 'gmail.com')) {
      result.push({ name: 'person', key: jmapInfo.threadId + '/' + from.email, value: { requester: 'email'} });
    }
  });
  return result;
};

// Extracts the domain name from an email
function _getDomain(email) {
  return email.slice(email.indexOf('@') + 1);
}