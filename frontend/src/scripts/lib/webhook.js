/**
 * Webhook sending utility class
 *
 * Copyright (c) 2016 Redsift Limited
 */
export default class Webhook {
  constructor(url) {
    this.url = url;
  }

  send(key, value) {
    return new Promise((resolve, reject) => {
      var wh = new XMLHttpRequest();
      var whurl = this.url;
      if (key) {
        whurl = whurl.replace('{key}', encodeURIComponent(key));
      }
      if (value) {
        whurl = whurl.replace('{value}', encodeURIComponent(value));
      }
      wh.addEventListener('load', (event) => {
        resolve();
      });
      wh.addEventListener('error', (event) => {
        console.error('[Webhook::send]: error: ', event);
        reject();
      });
      wh.open('GET', whurl, true);
      wh.send();
    });
  }
}
