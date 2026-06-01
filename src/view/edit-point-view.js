import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';
import { capitalize } from '../utils/const.js';

const PointType = {
  TAXI: 'Taxi',
  BUS: 'Bus',
  TRAIN: 'Train',
  SHIP: 'Ship',
  DRIVE: 'Drive',
  FLIGHT: 'Flight',
  CHECK_IN: 'Check-in',
  SIGHTSEEING: 'Sightseeing',
  RESTAURANT: 'Restaurant',
};

const TYPES = Object.values(PointType);

const FLATPICKR_DATE_FORMAT = 'd/m/y H:i';

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
    this.#setHandlers();
  }

  get template() {
    const { type, destination, basePrice, id, isDisabled, isSaving, isDeleting } = this._state;
    const pointId = id || 'new';

    const typesHtml = TYPES.map((eventType) => `
      <div class="event__type-item">
        <input id="event-type-${eventType.toLowerCase()}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType.toLowerCase()}" ${type === eventType ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
        <label class="event__type-label  event__type-label--${eventType.toLowerCase()}" for="event-type-${eventType.toLowerCase()}-${pointId}">${eventType}</label>
      </div>
    `).join('');

    const availableOffers = this.#getAvailableOffers(type);
    const offersHtml = availableOffers.length ? `
      <section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${availableOffers.map((offer) => {
    const isChecked = this._state.offers.some((selectedOffer) => selectedOffer.id === offer.id);
    const offerSlug = EditPointView.#getOfferSlug(offer.title);
    return `
              <div class="event__offer-selector">
                <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offerSlug}-${pointId}" type="checkbox" name="event-offer-${offer.id}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                <label class="event__offer-label" for="event-offer-${offerSlug}-${pointId}">
                  <span class="event__offer-title">${he.encode(String(offer.title))}</span>
                  &plus;&euro;&nbsp;
                  <span class="event__offer-price">${he.encode(String(offer.price))}</span>
                </label>
              </div>
            `;
  }).join('')}
        </div>
      </section>
    ` : '';

    const destinationInfo = destination;
    const destinationHtml = destinationInfo && (destinationInfo.description || destinationInfo.pictures?.length) ? `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        ${destinationInfo.description ? `<p class="event__destination-description">${he.encode(destinationInfo.description)}</p>` : ''}
        ${destinationInfo.pictures?.length ? `
          <div class="event__photos-container">
            <div class="event__photos-tape">
              ${destinationInfo.pictures.map((picture) => `
                <img class="event__photo" src="${he.encode(picture.src)}" alt="${he.encode(picture.description)}">
              `).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : '';

    const citiesHtml = this.#destinations.map((dest) => `<option value="${he.encode(dest.name)}"></option>`).join('');
    const destinationName = destinationInfo ? destinationInfo.name : '';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn" for="event-type-toggle-${pointId}">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${he.encode(type.toLowerCase())}.png" alt="Event type icon">
              </label>
              <input id="event-type-toggle-${pointId}" class="event__type-toggle  visually-hidden" type="checkbox" ${isDisabled ? 'disabled' : ''}>
              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${typesHtml}
                </fieldset>
              </div>
            </div>
            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output" for="event-destination-${pointId}">
                ${he.encode(type)}
              </label>
              <input class="event__input  event__input--destination" id="event-destination-${pointId}" type="text" name="event-destination" value="${he.encode(destinationName)}" list="destination-list-${pointId}" ${isDisabled ? 'disabled' : ''}>
              <datalist id="destination-list-${pointId}">
                ${citiesHtml}
              </datalist>
            </div>
            <div class="event__field-group  event__field-group--time">
              <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
              <input class="event__input  event__input--time" id="event-start-time-${pointId}" type="text" name="event-start-time" ${isDisabled ? 'disabled' : ''}>
              &mdash;
              <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
              <input class="event__input  event__input--time" id="event-end-time-${pointId}" type="text" name="event-end-time" ${isDisabled ? 'disabled' : ''}>
            </div>
            <div class="event__field-group  event__field-group--price">
              <label class="event__label" for="event-price-${pointId}">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input  event__input--price" id="event-price-${pointId}" type="text" name="event-price" value="${he.encode(String(basePrice))}" ${isDisabled ? 'disabled' : ''}>
            </div>
            <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
            <button class="event__reset-btn" type="reset" ${isDeleting ? 'disabled' : ''}>${this.#getResetButtonText(isDeleting)}</button>
            ${this.#isNewPoint ? '' : '<button class="event__rollup-btn" type="button"><span class="visually-hidden">Close event</span></button>'}
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

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
  }

  setSaving() {
    this.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setDeleting() {
    this.updateElement({
      isDisabled: true,
      isDeleting: true,
    });
  }

  setAborting() {
    this.updateElement({
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });
    this.shake();
  }

  _restoreHandlers() {
    this.#setHandlers();
    this.setFormSubmitHandler(this._callback.formSubmit);

    this.setDeleteClickHandler(this._callback.deleteClick);

    if (!this.#isNewPoint) {
      this.setRollupClickHandler(this._callback.rollupClick);
    }
  }

  #setHandlers() {
    const priceInput = this.element.querySelector('.event__input--price');
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    priceInput.addEventListener('input', this.#priceInputHandler);
    priceInput.addEventListener('blur', this.#priceChangeHandler);
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

  #getResetButtonText(isDeleting) {
    if (isDeleting) {
      return 'Deleting...';
    }
    return this.#isNewPoint ? 'Cancel' : 'Delete';
  }

  #getAvailableOffers(type) {
    const typeOffers = this.#offers.find((offer) => offer.type === type.toLowerCase());
    return typeOffers ? typeOffers.offers : [];
  }

  #setDatepickers() {
    const pointId = this._state.id || 'new';

    this.#datepickerFrom = flatpickr(
      this.element.querySelector(`#event-start-time-${pointId}`),
      {
        dateFormat: FLATPICKR_DATE_FORMAT,
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector(`#event-end-time-${pointId}`),
      {
        dateFormat: FLATPICKR_DATE_FORMAT,
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this.#dateToChangeHandler,
      }
    );
  }

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate.toISOString(),
    });
    this.#datepickerTo.set('minDate', userDate);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate.toISOString(),
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const form = evt.target;
    const priceInput = form.querySelector('.event__input--price');
    const basePrice = parseInt(priceInput.value, 10) || 0;

    const availableOffers = this.#getAvailableOffers(this._state.type);
    const selectedOffers = [];
    const pointId = this._state.id || 'new';

    availableOffers.forEach((offer) => {
      const offerSlug = EditPointView.#getOfferSlug(offer.title);
      const checkbox = form.querySelector(`[id="event-offer-${offerSlug}-${pointId}"]`);
      if (checkbox && checkbox.checked) {
        selectedOffers.push(offer);
      }
    });

    this._setState({ basePrice, offers: selectedOffers });

    this._callback.formSubmit(EditPointView.parseStateToPoint(this._state));
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    if (this._state.isDisabled) {
      return;
    }
    this._callback.rollupClick(evt);
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    if (this._state.isDeleting) {
      return;
    }
    this._callback.deleteClick(evt);
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: capitalize(evt.target.value)
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
      const currentDestination = this._state.destination;
      evt.target.value = currentDestination ? currentDestination.name : '';
    }
  };

  #priceInputHandler = (evt) => {
    const newValue = evt.target.value.replace(/[^\d]/g, '');
    evt.target.value = newValue;
    this._setState({ basePrice: parseInt(newValue, 10) || 0 });
  };

  #priceChangeHandler = (evt) => {
    const newPrice = parseInt(evt.target.value, 10) || 0;
    this._setState({ basePrice: newPrice });
  };

  static #getOfferSlug(title) {
    return title.replace(/\s+/g, '-').toLowerCase();
  }

  static parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    return point;
  }
}
