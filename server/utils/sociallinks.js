/**
 * Calculates social links and importance between user and sender
 *
 * Copyright (c) 2016 Redsift Limited
 */
function SocialLinks() { }

SocialLinks.prototype.getLinks = function (user, sender) {
  var links = { twitter: {}, angellist: {} };
  if (user.twitter && sender.twitter) {
    links.twitter.follow = _twitterFollowSender(user, sender);
    links.twitter.commonFriends = _twitterCommonFriends(user, sender);
    links.twitter.commonFollowers = _twitterCommonFollowers(user, sender);
  }
  if (user.angellist && sender.angellist) {
    links.angellist.investmentsInCommon = _angellistInvestmentsInCommon(user, sender);
    links.angellist.marketsInCommon = _angellistMarketsInCommon(user, sender);
    links.angellist.rolesInCommon = _angellistRolesInCommon(user, sender);
    links.angellist.investmentInRoles = _angellistInvestmentInRoles(user, sender);
    links.angellist.roleInInvestments = _angellistRoleInInvestments(user, sender);
  }
  return links;
};

SocialLinks.prototype.calculateImportance = function (links) {
  var primary = { importance: 'low', description: null };
  var secondary = { twitter: [], angellist: [] };
  var twitter = links.twitter || {};
  var angellist = links.angellist || {};
  var matches;
  matches = twitter.follow;
  if (matches) {
    var desc = 'You follow the sender';
    _addLink(primary, secondary.twitter, 'high', desc, ' on Twitter');
  }
  matches = angellist.investmentsInCommon;
  if (matches && matches.length > 0) {
    var desc = 'You have ' + matches.length + ' investments in common';
    _addLink(primary, secondary.angellist, 'high', desc, ', according to Angel List');
  }
  matches = angellist.investmentInRoles;
  if (matches && matches.length > 0) {
    var desc = 'You invested in ' + matches.length + ' companies that they worked on';
    if (matches.length === 1) desc = desc.replace('companies', 'company');
    _addLink(primary, secondary.angellist, 'high', desc, ', according to Angel List');
  }
  matches = twitter.commonFriends;
  if (matches && matches.length > 10) {
    var desc = 'You follow ' + matches.length + ' people in common';
    _addLink(primary, secondary.twitter, 'medium', desc, ' on Twitter');
  }
  matches = angellist.roleInInvestments;
  if (matches && matches.length > 0) {
    var desc = 'You have worked in ' + matches.length + ' of the companies they invested in';
    _addLink(primary, secondary.angellist, 'medium', desc, ', according to Angel List');
  }
  matches = angellist.rolesInCommon;
  if (matches && matches.length > 0) {
    var desc = 'You have worked in ' + matches.length + ' companies in common';
    if (matches.length === 1) desc = desc.replace('companies', 'company');
    _addLink(primary, secondary.angellist, 'medium', desc, ', according to Angel List');
  }
  matches = angellist.marketsInCommon;
  if (matches && matches.length > 0) {
    var desc = 'You invest in ' + matches.length + ' similar markets';
    if (matches.length === 1) desc = desc.replace('markets', 'market');
    _addLink(primary, secondary.angellist, 'medium', desc, ', according to Angel List');
  }
  matches = twitter.commonFollowers;
  if (matches && matches.length > 10) {
    var desc = 'You have ' + matches.length + ' followers in common';
    _addLink(primary, secondary.twitter, 'medium', desc, ' on Twitter');
  }
  return { primary: primary, secondary: secondary };
};

function _addLink(primary, secondary, importance, description, primaryTermination) {
  if (primary.importance === 'low') {
    primary.importance = importance;
    primary.description = description + primaryTermination;
  }
  secondary.push(description);
}

/**
 * Twitter
 */
function _twitterFollowSender(user, sender) {
  var ret = false;
  if (sender.twitter) {
    ret = _safeIndexOf(user.twitter.id, sender.twitter.followers);
  }
  return ret;
}

function _twitterCommonFriends(user, sender) {
  var inCommon = [];
  if (user.twitter && sender.twitter) {
    inCommon = _intersection(user.twitter.friends, sender.twitter.friends);
  }
  return inCommon;
}

function _twitterCommonFollowers(user, sender) {
  var inCommon = [];
  if (user.twitter && sender.twitter) {
    inCommon = _intersection(user.twitter.followers, sender.twitter.followers);
  }
  return inCommon;
}

/**
 * Angellist
 */
function _angellistInvestmentsInCommon(user, sender) {
  var ret = [];
  if (user.angellist.user && user.angellist.user.investor === true
    && sender.angellist.user && sender.angellist.user.investor === true) {
    user.angellist.user.investor_details.investments.forEach(function (uinv) {
      sender.angellist.user.investor_details.investments.forEach(function (sinv) {
        if (uinv.id === sinv.id) {
          ret.push({ id: uinv.id, name: uinv.name });
        }
      });
    });
  }
  return ret;
}

function _angellistMarketsInCommon(user, sender) {
  var ret = [];
  if (user.angellist.user && user.angellist.user.investor === true && user.angellist.user.investor_details.markets
    && sender.angellist.user && sender.angellist.user.investor === true && sender.angellist.user.investor_details.markets) {
    user.angellist.user.investor_details.markets.forEach(function (umkt) {
      sender.angellist.user.investor_details.markets.forEach(function (smkt) {
        if (umkt.id === smkt.id) {
          ret.push({ id: umkt.id, name: umkt.name });
        }
      });
    });
  }
  return ret;
}

function _angellistRolesInCommon(user, sender) {
  var ret = [];
  if (user.angellist.roles && user.angellist.roles.startup_roles
    && sender.angellist.roles && sender.angellist.roles.startup_roles) {
    user.angellist.roles.startup_roles.forEach(function (urol) {
      sender.angellist.roles.startup_roles.forEach(function (srol) {
        if (urol.startup.id === srol.startup.id) {
          ret.push({ id: urol.startup.id, name: urol.startup.name, user: urol.role, sender: srol.role });
        }
      });
    });
  }
  return ret;
}

function _angellistRoleInInvestments(user, sender) {
  var ret = [];
  if (user.angellist.roles && user.angellist.roles.startup_roles
    && sender.angellist.user && sender.angellist.user.investor === true) {
    user.angellist.roles.startup_roles.forEach(function (urol) {
      sender.angellist.user.investor_details.investments.forEach(function (sinv) {
        if (urol.startup.id === sinv.id) {
          ret.push({ id: urol.startup.id, name: urol.startup.name, user: urol.role });
        }
      });
    });
  }
  return ret;
}

function _angellistInvestmentInRoles(user, sender) {
  var ret = [];
  if (user.angellist.user && user.angellist.user.investor === true
    && sender.angellist.roles && sender.angellist.roles.startup_roles) {
    user.angellist.user.investor_details.investments.forEach(function (uinv) {
      sender.angellist.roles.startup_roles.forEach(function (srol) {
        if (uinv.id === srol.startup.id) {
          ret.push({ id: uinv.id, name: uinv.name, sender: srol.role });
        }
      });
    });
  }
  return ret;
}

/**
 * Utilities
 */
function _intersection(array1, array2) {
  if (!array1 || !array2) {
    return [];
  }
  return array1.filter(function (n) {
    return array2.indexOf(n) != -1;
  });
}

function _safeIndexOf(value, array) {
  if (!array || !value) {
    return false;
  }
  else if (array.indexOf(parseInt(value)) === -1) {
    return false;
  }
  else {
    return true;
  }
}

module.exports = SocialLinks;