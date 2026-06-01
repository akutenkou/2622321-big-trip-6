import AbstractView from '../framework/view/abstract-view.js';
import { humanizeDate, humanizeTime, getPointDuration, formatDatetime } from '../utils/date.js';
import he from 'he';

export default class PointView extends AbstractView {
  #point = null;

  constructor(point) {
    super();
    this.#point = point;
    this._callback = {};
  }

  get template() {
    const { type, destination, dateFrom, dateTo, basePrice, offers, isFavorite } = this.#point;

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const dayMonth = humanizeDate(dateFrom);
    const startTime = humanizeTime(dateFrom);
    const endTime = humanizeTime(dateTo);
    const duration = getPointDuration(dateFrom, dateTo);

    const offersHtml = offers.length ? `
      <ul class="event__selected-offers">
        ${offers.map((offer) => `
          <li class="event__offer">
            <span class="event__offer-title">${he.encode(String(offer.title))}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${he.encode(String(offer.price))}</span>
          </li>
        `).join('')}
      </ul>
    ` : '';

    const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${formatDatetime(startDate)}">${dayMonth}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${he.encode(type.toLowerCase())}.png" alt="Event type icon">
          </div>
          <h3 class="event__title">${he.encode(type)} ${he.encode(destination.name)}</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${formatDatetime(startDate)}">${startTime}</time>
              &mdash;
              <time class="event__end-time" datetime="${formatDatetime(endDate)}">${endTime}</time>
            </p>
            <p class="event__duration">${duration}</p>
          </div>
          <p class="event__price">
            &euro;&nbsp;<span class="event__price-value">${he.encode(String(basePrice))}</span>
          </p>
          ${offersHtml}
          <button class="event__favorite-btn ${favoriteClass}" type="button">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-4.9-2.8-4.9 2.8 1.4-5.6L1 11.2l5.7-.5L14 5l2.3 5.7 5.7.5-4.6 4.2 1.4 5.6z"/>
            </svg>
          </button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `;
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;
    const button = this.element.querySelector('.event__rollup-btn');
    button.addEventListener('click', this.#rollupClickHandler);
  }

  setFavoriteClickHandler(callback) {
    this._callback.favoriteClick = callback;
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.rollupClick(evt);
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick(evt);
  };
}
