import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const TYPES = ['Taxi', 'Bus', 'Train', 'Ship', 'Drive', 'Flight', 'Check-in', 'Sightseeing', 'Restaurant'];

const CITIES = ['Amsterdam', 'Geneva', 'Chamonix'];

const OFFERS_BY_TYPE = {
  'Taxi': [{ title: 'Upgrade to business class', price: 50 }, { title: 'Child seat', price: 15 }],
  'Bus': [{ title: 'Wi-Fi', price: 10 }, { title: 'Extra luggage', price: 20 }],
  'Train': [{ title: 'First class', price: 80 }, { title: 'Meal', price: 25 }],
  'Ship': [{ title: 'Cabin', price: 150 }, { title: 'Meal', price: 35 }],
  'Drive': [{ title: 'Insurance', price: 30 }, { title: 'GPS', price: 10 }],
  'Flight': [{ title: 'Luggage', price: 30 }, { title: 'Business class', price: 120 }, { title: 'Meal', price: 20 }],
  'Check-in': [{ title: 'Breakfast', price: 25 }],
  'Sightseeing': [{ title: 'Guide', price: 40 }, { title: 'Audio guide', price: 15 }],
  'Restaurant': [{ title: 'Set menu', price: 45 }, { title: 'Wine', price: 20 }]
};

const DESTINATIONS = {
  'Amsterdam': {
    name: 'Amsterdam',
    description: 'Amsterdam is a city with a rich history and beautiful canals.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=1', description: 'Amsterdam photo 1' },
      { src: 'https://loremflickr.com/248/152?random=2', description: 'Amsterdam photo 2' }
    ]
  },
  'Geneva': {
    name: 'Geneva',
    description: 'Geneva is a global city, a financial center, and worldwide center for diplomacy.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=3', description: 'Geneva photo 1' }
    ]
  },
  'Chamonix': {
    name: 'Chamonix',
    description: 'Chamonix is a resort area near the junction of France, Switzerland and Italy.',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=4', description: 'Chamonix photo 1' },
      { src: 'https://loremflickr.com/248/152?random=5', description: 'Chamonix photo 2' },
      { src: 'https://loremflickr.com/248/152?random=6', description: 'Chamonix photo 3' }
    ]
  }
};

export default class EditPointView extends AbstractStatefulView {
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor(point) {
    super();
    this._state = EditPointView.parsePointToState(point);
    this._callback = {};
    this.#setDatepickers();
  }

  get template() {
    const { type, destination, basePrice } = this._state;

    const typesHtml = TYPES.map((eventType) => `
      <div class="event__type-item">
        <input id="event-type-${eventType.toLowerCase()}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType.toLowerCase()}" ${type === eventType ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${eventType.toLowerCase()}" for="event-type-${eventType.toLowerCase()}-1">${eventType}</label>
      </div>
    `).join('');

    const availableOffers = OFFERS_BY_TYPE[type] || [];
    const offersHtml = availableOffers.length ? `
      <div class="event__available-offers">
        ${availableOffers.map((offer) => `
          <div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.title}-1" type="checkbox" name="event-offer-${offer.title}">
            <label class="event__offer-label" for="event-offer-${offer.title}-1">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    ` : '';

    const destinationHtml = destination.description || destination.pictures.length ? `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        ${destination.description ? `<p class="event__destination-description">${destination.description}</p>` : ''}
        ${destination.pictures.length ? `
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destination.pictures.map((picture) => `
                <img class="event__photo" src="${picture.src}" alt="${picture.description}">
              `).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : '';

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
                ${CITIES.map((city) => `<option value="${city}"></option>`).join('')}
              </datalist>
            </div>
            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden" for="event-start-time-1">From</label>
              <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time">
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time">
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
            ${destinationHtml}
          </section>
        </form>
      </li>
    `;
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollupClickHandler);
  }

  setCancelClickHandler(callback) {
    this._callback.cancelClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#cancelClickHandler);
  }

  _restoreHandlers() {
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setRollupClickHandler(this._callback.rollupClick);
    this.setCancelClickHandler(this._callback.cancelClick);
    this.#setDatepickers();
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  #setDatepickers() {
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this.#dateToChangeHandler,
      }
    );
  }

  #dateFromChangeHandler = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate.toISOString(),
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    this.updateElement({
      dateTo: userDate.toISOString(),
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.formSubmit(evt);
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.rollupClick(evt);
  };

  #cancelClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.cancelClick(evt);
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value.charAt(0).toUpperCase() + evt.target.value.slice(1)
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const newDestination = DESTINATIONS[evt.target.value];
    if (newDestination) {
      this.updateElement({
        destination: newDestination
      });
    }
  };

  static parsePointToState(point) {
    return { ...point };
  }

  static parseStateToPoint(state) {
    return { ...state };
  }
}
