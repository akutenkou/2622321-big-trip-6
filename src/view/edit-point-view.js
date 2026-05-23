import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const TYPES = ['Taxi', 'Bus', 'Train', 'Ship', 'Drive', 'Flight', 'Check-in', 'Sightseeing', 'Restaurant'];

export default class EditPointView extends AbstractStatefulView {
  #datepickerFrom = null;
  #datepickerTo = null;
  #isNewPoint = false;
  #destinations = [];
  #offers = [];

  constructor(point, isNewPoint = false, destinations = [], offers = []) {
    super();
    this._state = EditPointView.parsePointToState(point);
    this.#isNewPoint = isNewPoint;
    this.#destinations = destinations;
    this.#offers = offers;
    this._callback = {};
    this.#setDatepickers();
  }

  get template() {
    const { type, destination, basePrice, id } = this._state;
    const pointId = id || 'new';

    const typesHtml = TYPES.map((eventType) => `
      <div class="event__type-item">
        <input id="event-type-${eventType.toLowerCase()}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType.toLowerCase()}" ${type === eventType ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${eventType.toLowerCase()}" for="event-type-${eventType.toLowerCase()}-${pointId}">${eventType}</label>
      </div>
    `).join('');

    const typeOffers = this.#offers.find((offer) => offer.type === type.toLowerCase());
    const availableOffers = typeOffers ? typeOffers.offers : [];
    const offersHtml = availableOffers.length ? `
      <div class="event__available-offers">
        ${availableOffers.map((offer) => {
    const isChecked = this._state.offers.some((selectedOffer) => selectedOffer.id === offer.id);
    const offerSlug = offer.title.replace(/\s+/g, '-').toLowerCase();
    return `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offerSlug}-${pointId}" type="checkbox" name="event-offer-${offer.id}" ${isChecked ? 'checked' : ''}>
              <label class="event__offer-label" for="event-offer-${offerSlug}-${pointId}">
                <span class="event__offer-title">${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${offer.price}</span>
              </label>
            </div>
          `;
  }).join('')}
      </div>
    ` : '';

    const destinationInfo = typeof destination === 'object' ? destination : this.#destinations.find((dest) => dest.id === destination);
    const destinationHtml = destinationInfo && (destinationInfo.description || destinationInfo.pictures?.length) ? `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        ${destinationInfo.description ? `<p class="event__destination-description">${destinationInfo.description}</p>` : ''}
        ${destinationInfo.pictures?.length ? `
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destinationInfo.pictures.map((picture) => `
                <img class="event__photo" src="${picture.src}" alt="${picture.description}">
              `).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : '';

    const citiesHtml = this.#destinations.map((dest) => `<option value="${dest.name}"></option>`).join('');
    const destinationName = destinationInfo ? destinationInfo.name : '';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
              </label>
              <input id="event-type-toggle-${pointId}" class="event__type-toggle  visually-hidden" type="checkbox">
              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${typesHtml}
                </fieldset>
              </div>
            </div>
            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output" for="event-destination-${pointId}">
                ${type}
              </label>
              <input class="event__input  event__input--destination" id="event-destination-${pointId}" type="text" name="event-destination" value="${destinationName}" list="destination-list-${pointId}">
              <datalist id="destination-list-${pointId}">
                ${citiesHtml}
              </datalist>
            </div>
            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
              <input class="event__input  event__input--time" id="event-start-time-${pointId}" type="text" name="event-start-time">
              &mdash;
              <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
              <input class="event__input  event__input--time" id="event-end-time-${pointId}" type="text" name="event-end-time">
            </div>
            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-${pointId}">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input  event__input--price" id="event-price-${pointId}" type="text" name="event-price" value="${basePrice}">
            </div>
            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">${this.#isNewPoint ? 'Cancel' : 'Delete'}</button>
            ${this.#isNewPoint ? '' : '<button class="event__rollup-btn" type="button"><span class="visually-hidden">Open event</span></button>'}
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
    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.addEventListener('click', this.#rollupClickHandler);
    }
  }

  setCancelClickHandler(callback) {
    this._callback.cancelClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#cancelClickHandler);
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
  }

  _restoreHandlers() {
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);
    this.element.querySelector('.event__input--price').addEventListener('blur', this.#priceChangeHandler);
    this.setFormSubmitHandler(this._callback.formSubmit);

    if (this.#isNewPoint) {
      this.setDeleteClickHandler(this._callback.deleteClick);
    } else {
      this.setRollupClickHandler(this._callback.rollupClick);
      this.setDeleteClickHandler(this._callback.deleteClick);
    }

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
    const pointId = this._state.id || 'new';

    this.#datepickerFrom = flatpickr(
      this.element.querySelector(`#event-start-time-${pointId}`),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector(`#event-end-time-${pointId}`),
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

    const form = evt.target;
    const priceInput = form.querySelector('.event__input--price');

    this._state.basePrice = parseInt(priceInput.value, 10) || 0;

    const typeOffers = this.#offers.find((offer) => offer.type === this._state.type.toLowerCase());
    const availableOffers = typeOffers ? typeOffers.offers : [];
    const selectedOffers = [];
    const pointId = this._state.id || 'new';

    availableOffers.forEach((offer) => {
      const offerSlug = offer.title.replace(/\s+/g, '-').toLowerCase();
      const checkbox = form.querySelector(`#event-offer-${offerSlug}-${pointId}`);
      if (checkbox && checkbox.checked) {
        selectedOffers.push(offer);
      }
    });

    this._state.offers = selectedOffers;

    this._callback.formSubmit(EditPointView.parseStateToPoint(this._state));
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.rollupClick(evt);
  };

  #cancelClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.cancelClick(evt);
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.deleteClick(evt);
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value.charAt(0).toUpperCase() + evt.target.value.slice(1)
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const newDestination = this.#destinations.find((dest) => dest.name === evt.target.value);
    if (newDestination) {
      this.updateElement({
        destination: newDestination
      });
    } else {
      const currentDestination = typeof this._state.destination === 'object'
        ? this._state.destination
        : this.#destinations.find((dest) => dest.id === this._state.destination);
      evt.target.value = currentDestination ? currentDestination.name : '';
    }
  };

  #priceInputHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/[^\d]/g, '');
  };

  #priceChangeHandler = (evt) => {
    const newPrice = parseInt(evt.target.value, 10) || 0;
    this._setState({ basePrice: newPrice });
  };

  static parsePointToState(point) {
    return { ...point };
  }

  static parseStateToPoint(state) {
    return { ...state };
  }
}
