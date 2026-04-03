import AbstractView from '../framework/view/abstract-view.js';

export default class EditPointView extends AbstractView {
  #point = null;

  constructor(point) {
    super();
    this.#point = point;
    this._callback = {};
  }

  get template() {
    const { type, destination, dateFrom, dateTo, basePrice, offers } = this.#point;

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const startDateValue = startDate.toISOString().slice(0, 16);
    const endDateValue = endDate.toISOString().slice(0, 16);

    const TYPES = ['Taxi', 'Bus', 'Train', 'Ship', 'Drive', 'Flight', 'Check-in', 'Sightseeing', 'Restaurant'];

    const typesHtml = TYPES.map((eventType) => `
      <div class="event__type-item">
        <input id="event-type-${eventType.toLowerCase()}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType.toLowerCase()}" ${type === eventType ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${eventType.toLowerCase()}" for="event-type-${eventType.toLowerCase()}-1">${eventType}</label>
      </div>
    `).join('');

    const offersHtml = offers.length ? `
      <div class="event__available-offers">
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
    ` : '<div class="event__available-offers"></div>';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
              </label>
              <input id="event-type-toggle-1" class="event__type-toggle  visually-hidden" type="checkbox">
              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${typesHtml}
                </fieldset>
              </div>
            </div>
            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output" for="event-destination-1">
                ${type}
              </label>
              <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination.name}" list="destination-list-1">
              <datalist id="destination-list-1">
                <option value="Amsterdam"></option>
                <option value="Geneva"></option>
                <option value="Chamonix"></option>
              </datalist>
            </div>
            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden" for="event-start-time-1">From</label>
              <input class="event__input  event__input--time" id="event-start-time-1" type="datetime-local" name="event-start-time" value="${startDateValue}">
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input  event__input--time" id="event-end-time-1" type="datetime-local" name="event-end-time" value="${endDateValue}">
            </div>
            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
            </div>
            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </header>
          <section class="event__details">
            ${offersHtml}
          </section>
        </form>
      </li>
    `;
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.element.querySelector('form').addEventListener('submit', callback);
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', callback);
  }

  setCancelClickHandler(callback) {
    this._callback.cancelClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', callback);
  }
}
