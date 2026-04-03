import AbstractView from '../framework/view/abstract-view.js';

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
    const dayMonth = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    const startTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const durationMs = endDate - startDate;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;

    const offersHtml = offers.length ? `
      <div class="event__selected-offers">
        ${offers.map((offer) => `
          <div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.title}-1" type="checkbox" name="event-offer-${offer.title}" checked>
            <label class="event__offer-label" for="event-offer-${offer.title}-1">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    ` : '';

    const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${startDate.toISOString()}">${dayMonth}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
          </div>
          <h3 class="event__title">${type} ${destination.name}</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${startDate.toISOString()}">${startTime}</time>
              &mdash;
              <time class="event__end-time" datetime="${endDate.toISOString()}">${endTime}</time>
            </p>
            <p class="event__duration">${duration}</p>
          </div>
          <p class="event__price">
            &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
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
    this.element.querySelector('.event__rollup-btn').addEventListener('click', callback);
  }
}
