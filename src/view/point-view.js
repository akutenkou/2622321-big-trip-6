export default class PointView {
  constructor() {
    this.element = null;
  }

  getTemplate() {
    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="2019-03-18">MAR 18</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/flight.png" alt="Event type icon">
          </div>
          <h3 class="event__title">Flight to Chamonix</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="2019-03-18T10:30">10:30</time>
              &mdash;
              <time class="event__end-time" datetime="2019-03-18T11:30">11:30</time>
            </p>
            <p class="event__duration">01H 00M</p>
          </div>
          <p class="event__price">
            &euro;&nbsp;<span class="event__price-value">160</span>
          </p>
          <h4 class="visually-hidden">Offers:</h4>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `;
  }

  getElement() {
    if (!this.element) {
      this.element = this.createElement(this.getTemplate());
    }
    return this.element;
  }

  createElement(template) {
    const newElement = document.createElement('div');
    newElement.innerHTML = template;
    return newElement.firstElementChild;
  }
}
