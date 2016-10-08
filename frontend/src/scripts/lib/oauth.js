/**
 * Client oAuth handling
 *
 * Copyright (c) 2016 Redsift Limited
 */
import OAuthIO from 'oauthio-web';

export default class OAuth {
  constructor() {
    // Initialise OAuth library
    OAuthIO.OAuth.initialize('EBTXwE53OLYenDi7B7XS2mmFam8');
    OAuthIO.OAuth.setOAuthdURL('https://oauth.redsift.cloud');
  }

  popup(provider, handler) {
    return new Promise((resolve, reject) => {
      OAuthIO.OAuth.popup(provider).done((service) => {
        let creds = {
          access_token: service.access_token,
          oauth_token: service.oauth_token,
          oauth_token_secret: service.oauth_token_secret
        };
        service.me().done((me) => {
          creds.id = me.id;
          creds.alias = me.alias;
          creds.name = me.name;
          creds.avatar = me.avatar;
          creds.url = (me.url) ? me.url : me.raw.angellist_url;
          handler(provider, JSON.stringify(creds)).then(resolve).catch(reject);
        }).fail((e) => {
          console.error('[OAuth::popup]: me failed: ', provider);
          reject(e);
        });
      }).fail(function (e) {
        console.error('[OAuth::popup]: popup failed: ', provider);
        reject(e);
      });
    });
  }

}