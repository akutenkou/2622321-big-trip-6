import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../utils/filter.js';

const EMPTY_MESSAGE = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'There are no past events now',
};

export default class EmptyView extends AbstractView {
  #filterType = null;

  constructor(filterType) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    const message = EMPTY_MESSAGE[this.#filterType];
    return `<p class="trip-events__msg">${message}</p>`;
  }
}
