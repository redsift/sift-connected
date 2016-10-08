/**
 * sift-connected: summary view callbacks.
 *
 * Copyright (c) 2016 Redsift Limited
 */
import { SiftView, registerSiftView } from "@redsift/sift-sdk-web";
import OAuth from './lib/oauth';
import tingle from 'tingle.js';
import Webhook from './lib/webhook';
import '@redsift/ui-rs-hero';

export default class ConnectedSummaryView extends SiftView {
  constructor() {
    super();
    this._oAuth = new OAuth();
    this._webhooks = {};
    this.controller.subscribe('auth', this._updateYou.bind(this));
    this.controller.subscribe('threads', this._updateConnectedEmails.bind(this));
    this.controller.subscribe('stats', this._updateLatestConnections.bind(this));
    this.controller.subscribe('stats', this._updateMostFollowed.bind(this));
    this.registerOnLoadHandler(this.onLoad.bind(this));
  }

  // TODO: link to docs
  presentView(value) {
    this._data = value.data;
    this._updateYou(this._data.auths);
    this._updateConnectedEmails(this._data.threads);
    this._updateLatestConnections(this._data.stats);
    this._updateMostFollowed(this._data.stats);
    this._createWebhooks(this._data.webhooks);
    this._initView(this._data.auths);
  }

  // TODO: link to docs
  willPresentView(value) { }

  onLoad() {
    document.getElementById('help').onclick = this._onHelp;
    let buttons = document.getElementsByClassName('login-button');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', this._onLogin.bind(this));
    }
  }

  _initView(auths) {
    let fc = false;
    let social = false;
    Object.keys(auths).forEach((k) => {
      if (k === 'fullcontact' && auths[k]) {
        fc = true;
      }
      if ((k === 'twitter' || k === 'angel_list') && auths[k]) {
        social = true;
      }
    });
    if (fc === true && social === true) {
      this._showPage('connected');
      return;
    }
    else if (fc === false) {
      this._setupStage = '_welcomePopup';
    }
    else {
      this._setupStage = '_socialPopup';
    }
    document.getElementById('setup').onclick = this._onSetup.bind(this);
    this._popup(this._setupStage);
  }

  _updateYou(auths) {
    this._data.auths = auths;
    let next = false;
    let lbs = document.getElementsByClassName('login-button');
    for (let i = 0; i < lbs.length; i++) {
      let label;
      let url;
      if (auths[lbs[i].id]) {
        next = true;
        status = '';
        label = auths[lbs[i].id].alias ? '@' + auths[lbs[i].id].alias : auths[lbs[i].id].name;
        url = auths[lbs[i].id].url;
        lbs[i].style.display = 'none';
      }
      else {
        lbs[i].style.display = '';
        status = 'none';
      }
      let msi = document.getElementsByClassName('my-' + lbs[i].id + '-info');
      for (let j = 0; j < msi.length; j++) {
        msi[j].style.display = status;
        if (label) {
          let msn = document.getElementsByClassName('my-' + lbs[i].id + '-name');
          for (let k = 0; k < msn.length; k++) {
            msn[k].textContent = label;
          }
        }
      }
      let msl = document.getElementsByClassName('my-' + lbs[i].id + '-link');
      for (let l = 0; l < msl.length; l++) {
        msl[l].href = decodeURIComponent(url);
      }
    }
    let sn = document.querySelector('.social--next');
    if (sn) {
      sn.disabled = !next;
    }
  }

  _updateConnectedEmails(threads) {
    Object.keys(threads).forEach((k) => {
      document.getElementById('emails-'+k).textContent = threads[k];
    });
  }

  _updateLatestConnections(stats) {
    this._updateSocialStats('latest', stats);
  }

  _updateMostFollowed(stats) {
    this._updateSocialStats('mostfollowed', stats);
  }

  _updateSocialStats(statType, stats) {
    Object.keys(stats).forEach((k) => {
      if(stats[k][statType]) {
        let prefix = (k === 'twitter')?'@':'';
        document.getElementById(statType+'-'+k).style.visibility = 'initial';
        document.getElementById(statType+'-'+k+'-url').href = stats[k][statType].url;
        document.getElementById(statType+'-'+k+'-name').textContent = prefix + stats[k][statType].username;
      }
    });
  }

  _createWebhooks(whUrls) {
    Object.keys(whUrls).forEach((k) => {
      this._webhooks[k] = new Webhook(whUrls[k]);
    });
  }

  _showPage(name) {
    let pages = document.getElementsByClassName('page');
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].id === name) {
        pages[i].style.display = '';
      }
      else {
        pages[i].style.display = 'none';
      }
    }
  }

  _onLogin(ev) {
    // Fire oAuth flow
    this._oAuth.popup(ev.target.id, this._webhooks[ev.target.id].send.bind(this._webhooks[ev.target.id]));
  }

  _onSetup() {
    this._popup(this._setupStage);
  }

  _popup(stage) {
    this._setupStage = stage;
    if (this._openPopup) {
      this._openPopup.close();
    }
    this._openPopup = this[stage]();
  }

  _welcomePopup() {
    let welcome = new tingle.modal({
      footer: true,
      stickyFooter: true
    });
    welcome.setContent(
      '<div id="welcome" class="popup">' +
      '<h3>Welcome to your <strong>Connected</strong> Sift</h3>' +
      '<p>This Sift prioritizes your emails based on the stength of your social connections with the sender.</p>' +
      '</div>');
    welcome.addFooterBtn('Next', 'rs-btn--green', () => {
      this._popup('_fullContactPopup');
    });
    welcome.open();
    return welcome;
  }

  _fullContactPopup() {
    let fc = new tingle.modal({
      footer: true,
      stickyFooter: true
    });
    fc.setContent(
      '<div id="welcome" class="popup">' +
      '<h3>Looking up incoming emails</h3>' +
      '<p>Social identity lookup for incoming emails is powered by FullContact. You can get a free account by <a href="https://portal.fullcontact.com/signup" target="_blank">signing up.</a></p>' +
      '<p>Once you complete the sign up you will get an API key like this:</p>' +
      '<img src="assets/fc-welcome.png" style="width: 60%; max-width: 200px; border: 1px solid black;" />' +
      '<p>To continue your setup, enter your API key: <input id="fc-api-key" autofocus></input></p>' +
      '</div>');
    let fcKey = document.getElementById('fc-api-key');
    fcKey.addEventListener('input', (ev) => {
      if (ev.target.value.length === 16) {
        document.querySelector('.fc--next').disabled = false;
      }
      else {
        document.querySelector('.fc--next').disabled = true;
      }
    });
    fc.addFooterBtn('Next', 'rs-btn--green fc--next', () => {
      this._webhooks['fullcontact'].send('fullcontact', fcKey.value).then(() => {
        this._popup('_socialPopup');
      });
    });
    document.querySelector('.fc--next').disabled = true;
    fc.open();
    return fc;
  }

  _socialPopup() {
    let social = new tingle.modal({
      footer: true,
      stickyFooter: true
    });
    social.setContent(
      '<div id="social" class="popup">' +
      '<h3>Your social identities</h3>' +
      '<p>Now it is time for you to tell us a bit about yourself. Sign in with at least one of the following social identities.</p>' +
      '<button class="login-button rs-btn--green" id="twitter"><i class="fa fa-twitter"></i> Connect</button>' +
      '<div class="my-twitter-info" style="display: none;">' +
      '<a href="#" target="_blank" class="my-twitter-link"><img src="assets/twitter.svg" class="social-icon" /></a>' +
      '<span class="my-twitter-name">Connected</span>' +
      '</div>' +
      '<button class="login-button rs-btn--green" id="angel_list"><i class="fa fa-angellist"></i> Connect</button>' +
      '<div class="my-angel_list-info" style="display: none;">' +
      '<a href="#" target="_blank" class="my-angel_list-link"><img src="assets/angellist.svg" class="social-icon" /></a>' +
      '<span class="my-angel_list-name">Connected</span>' +
      '</div>' +
      '</div>');
    social.addFooterBtn('Next', 'rs-btn--green social--next', () => {
      this._popup('_donePopup');
    });
    let buttons = document.getElementsByClassName('login-button');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', this._onLogin.bind(this));
    }
    this._updateYou(this._data.auths);
    social.open();
    return social;
  }

  _donePopup() {
    let done = new tingle.modal({
      footer: true,
      stickyFooter: true,
      onClose: () => {
        this._showPage('connected');
        this._updateYou(this._data.auths);
      }
    });
    done.setContent(
      '<div id="final" class="popup">' +
      '<h3>Your setup is complete</h3>' +
      '<p>Once you receive emails from social connections the strength of the connection will be indicated next to the email.</p>' +
      '<img src="assets/email-list.png" style="width: 100%; max-width: 400px;"/>' +
      '<p>And once you open these emails you can explore any other connections you might have with the sender.</p>' +
      '<img src="assets/email-detail.png" style="width: 100%; max-width: 400px;"/>' +
      '</div>');
    done.addFooterBtn('Done', 'rs-btn--green', () => {
      done.close();
    });
    done.open();
    return done;
  }

  _onHelp(ev) {
    ev.preventDefault();
    let help = new tingle.modal();
    help.setContent(
      '<div class="popup">' +
      '<h2>The Connected Sift</h2>' +
      '<p>Never miss out on important emails</p>' +
      '<p>This Sift prioritizes your inbox based on your social proximity with the sender.</p>' +
      '<h2>Getting started</h2>' +
      '<p>If you have already provided your FullContact key and connected with at least one social account, that\'s all you need to do.</p>' +
      '<p>Once emails from important connections arrive in your inbox they will be flagged.</p>' +
      '<img src="assets/email-list.png" style="width: 100%; max-width: 400px;"/>' +
      '<p>And once you open the email you\'ll also be able to explore your connections with the sender further.</p>' +
      '<img src="assets/email-detail.png" style="width: 100%; max-width: 400px;"/>' +
      '<h2>Improve this Sift</h2>' +
      '<p>Found an issue with this Sift or have a suggestion? Report it <a href="https://github.com/redsift/sift-connected/issues" target="_blank">here</a> or, if you have no idea what Github is, you can send an email to <a href="mailto:sift-connected@redsift.com">sift-connected@redsift.com</a></p>' +
      '<p>Are you a developer? Want to contribute? We love pull requests.</p>' +
      '<p>Want to customize this Sift for your own functionality? <a href="https://redsift.com" target="_blank">Sign up</a> for free and become a Red Sift developer, <a href="https://github.com/redsift/sift-connected" target="_blank">fork this Sift</a> (or create a new one), run it and share it with the world.</p>' +
      '</div>');
    help.open();
  }
}

registerSiftView(new ConnectedSummaryView(window));
