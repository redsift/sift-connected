/**
 * sift-connected: email-thread view
 *
 * Copyright (c) 2016 Redsift Limited
 */
import { SiftView, registerSiftView } from "@redsift/sift-sdk-web";

export default class ConnectedDetailView extends SiftView {
  constructor() {
    super();
    this.registerOnLoadHandler(this.onLoad.bind(this));
  }

  // TODO: link to docs
  presentView(value) {
    var ii = document.getElementById('importance-img');
    var primary = value.data.primary;
    var secondary = value.data.secondary;
    switch(primary.importance) {
      case 'high':
        ii.src = 'assets/green.svg';
        break;
      case 'medium':
        ii.src = 'assets/amber.svg';
        break;
    }
    document.getElementById('importance-description').textContent = primary.description;
    Object.keys(secondary).forEach(function (k) {
      let ul = document.getElementById(k + '-connections');
      if(secondary[k].length > 0) {
        document.getElementById(k).style.display = '';
        // <li class="connection-text" type="square">Angel List connection</li>
        for(let i = 0; i < secondary[k].length; i++) {
          let li = document.createElement('li');
          li.type = 'squares';
          li.classList.add('connection-text');
          li.textContent = secondary[k][i];
          ul.appendChild(li);
        }
      }
    });
  }

  // TODO: link to docs
  willPresentView(value) { }

  onLoad() {
    let logos = document.getElementsByClassName('social-logo');
    for (let i = 0; i < logos.length; i++) {
      logos[i].addEventListener('mouseenter', this._onMouseEnter.bind(this));
      logos[i].addEventListener('mouseleave', this._onMouseLeave.bind(this));
    }
  }

  _onMouseEnter(ev) {
    let logos = document.getElementsByClassName('social-logo');
    for (let i = 0; i < logos.length; i++) {
      if(logos[i].id !== ev.target.id) {
        logos[i].classList.add('opaque');
      }
      else {
        logos[i].classList.add('zoom');
      }
    }
    document.getElementById('importance').style.display = 'none';
    document.getElementById(ev.target.id + "-connections").style.display = '';
  }

  _onMouseLeave(ev) {
    let logos = document.getElementsByClassName('social-logo');
    for (let i = 0; i < logos.length; i++) {
      logos[i].classList.remove('opaque');
      logos[i].classList.remove('zoom');
    }
    let cls = document.getElementsByClassName('connection-list');
    for (let i = 0; i < cls.length; i++) {
      cls[i].style.display = 'none';
    }
    document.getElementById('importance').style.display = '';
  }
}

registerSiftView(new ConnectedDetailView(window));
