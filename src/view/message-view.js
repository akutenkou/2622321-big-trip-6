import AbstractView from '../framework/view/abstract-view.js';

const MessageType = {
  LOADING: 'Loading...',
  ERROR: 'Failed to load latest route information',
};

export default class MessageView extends AbstractView {
  #message = null;

  constructor(message = MessageType.LOADING) {
    super();
    this.#message = message;
  }

  get template() {
    return `<p class="trip-events__msg">${this.#message}</p>`;
  }
}

export { MessageType };
