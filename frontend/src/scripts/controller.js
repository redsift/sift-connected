/**
 * sift-connected: Controller.
 *
 * Copyright (c) 2016 Redsift Limited
 */
import { SiftController, registerSiftController } from '@redsift/sift-sdk-web';

export default class ConnectedController extends SiftController {
  constructor() {
    super();
    // Bind this to method so they can be used in callbacks
    this.onStorageUpdate = this.onStorageUpdate.bind(this);
  }

  // TODO: link to docs
  loadView(state) {
    this.storage.subscribe('*', this.onStorageUpdate);
    switch(state.type) {
      case 'summary':
        return this._loadSummaryView();
      case 'email-thread':
        return this._loadDetailView(state.params.detail);
      default:
        console.error('[ConnectedController::loadView]: unknown view type', state.type);
    }
  }

  _loadSummaryView() {
    return {
      html: 'summary.html',
      data: Promise.all([this._getWebhooks(), this._getAuths(), this._getStats(), this._getConnectedThreads()]).then((results) => {
        return { webhooks: results[0], auths: results[1], stats: results[2], threads: results[3] };
      })
    };
  }

  _getWebhooks() {
    return this.storage.get({
      bucket: '_redsift',
      keys: ['webhooks/twitter-wh', 'webhooks/angel_list-wh', 'webhooks/fc-wh']
    }).then((results) => {
      return {
        twitter: results[0].value,
        angel_list: results[1].value,
        fullcontact: results[2].value
      }
    });
  }

  _getAuths() {
    return this.storage.get({
      bucket: 'auth',
      keys: ['twitter', 'angel_list', 'fullcontact']
    }).then((results) => {
      return {
        twitter: results[0].value ? JSON.parse(results[0].value):null,
        angel_list: results[1].value ? JSON.parse(results[1].value):null,
        fullcontact: results[2].value
      }
    });
  }

  _getStats() {
    return this.storage.getAll({
      bucket: 'stats'
    }).then((results) => {
      let ret = {angel_list: {}, twitter: {}};
      results.forEach((r) => {
        if(r.value) {
          let jv = JSON.parse(r.value);
          if(r.key === 'angellist/latest') {
            ret.angel_list.latest = jv;
          }
          else if(r.key === 'twitter/latest') {
            ret.twitter.latest = jv;
          }
          else {
            if(r.key.startsWith('angellist')) {
              if(!ret.angel_list.mostfollowed || ret.angel_list.mostfollowed.followers < jv.followers) {
                ret.angel_list.mostfollowed = jv;
              }
            }
            else if(r.key.startsWith('twitter')) {
              if(!ret.twitter.mostfollowed || ret.twitter.mostfollowed.followers < jv.followers) {
                ret.twitter.mostfollowed = jv;
              }
            }
          }
        }
      });
      return ret;
    });
  }

  _getConnectedThreads() {
    return this.storage.getAll({
      bucket: '_email.tid'
    }).then((results) => {
      let ret = {high: 0, medium: 0};
      results.forEach((r) => {
        if(r.value) {
          let jv = JSON.parse(r.value);
          ret[jv.list.importance]++;
        }
      });
      return ret;
    });
  }

  _loadDetailView(data) {
    return {html: 'detail.html', data: data};
  }

  onStorageUpdate(updated) {
    updated.forEach((bucket) => {
      switch (bucket) {
        case 'auth':
          this._getAuths().then((auths) => {
            this.publish('auth', auths);
          });
          break;
        case 'stats':
          this._getStats().then((stats) => {
            this.publish('stats', stats);
          });
          break;
        case '_email.tid':
          this._getConnectedThreads().then((threads) => {
            this.publish('threads', threads);
          });
          break;
      }
    });
  }
}

registerSiftController(new ConnectedController());
