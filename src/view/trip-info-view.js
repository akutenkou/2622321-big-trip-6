import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

export default class TripInfoView extends AbstractView {
  #points = [];
  #destinations = [];

  constructor(points, destinations) {
    super();
    this.#points = points;
    this.#destinations = destinations;
  }

  get template() {
    const route = this.#getRoute();
    const dates = this.#getDates();
    const cost = this.#getTotalCost();

    return `
      <section class="trip-main__trip-info  trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${route}</h1>
          <p class="trip-info__dates">${dates}</p>
        </div>
        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">${cost}</span>
        </p>
      </section>
    `;
  }

  #getRoute() {
    if (this.#points.length === 0) {
      return '';
    }

    const cities = this.#points.map((point) => {
      const destination = typeof point.destination === 'object'
        ? point.destination
        : this.#destinations.find((dest) => dest.id === point.destination);
      return destination ? destination.name : '';
    });

    if (cities.length <= 3) {
      return cities.join(' &mdash; ');
    }

    return `${cities[0]} &mdash; ... &mdash; ${cities[cities.length - 1]}`;
  }

  #getDates() {
    if (this.#points.length === 0) {
      return '';
    }

    const sortedPoints = [...this.#points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    const startDate = dayjs(sortedPoints[0].dateFrom);
    const endDate = dayjs(sortedPoints[sortedPoints.length - 1].dateTo);

    if (startDate.month() === endDate.month()) {
      return `${startDate.format('DD')}&nbsp;&mdash;&nbsp;${endDate.format('DD MMM')}`;
    }

    return `${startDate.format('DD MMM')}&nbsp;&mdash;&nbsp;${endDate.format('DD MMM')}`;
  }

  #getTotalCost() {
    return this.#points.reduce((total, point) => {
      const pointCost = point.basePrice;
      const offersCost = point.offers.reduce((sum, offer) => sum + offer.price, 0);
      return total + pointCost + offersCost;
    }, 0);
  }
}
