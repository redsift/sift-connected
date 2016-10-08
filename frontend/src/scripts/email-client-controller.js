/**
 * sift-connected: email client controller
 *
 * Copyright (c) 2016 Redsift Limited
 */
import { EmailClientController, registerEmailClientController } from '@redsift/sift-sdk-web';

export default class ConnectedEmailClientController extends EmailClientController {
  constructor() {
    super();
  }

  // TODO: link to docs
  loadThreadListView(listInfo) {
    var url = '';
    switch (listInfo.importance) {
      case 'high':
        url = 'assets/green.svg'
        break;
      case 'medium':
        url = 'assets/amber.svg'
        break;
    }
    return {
      template: '003_list_common_img',
      value: {
        image: { url: url },
        subtitle: listInfo.description
      }
    };
  }
}

registerEmailClientController(new ConnectedEmailClientController());
