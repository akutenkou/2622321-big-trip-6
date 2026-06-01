import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import he from 'he';

const TRIP_DATE_FORMAT = 'DD MMM';
const MAX_FULL_ROUTE_CITIES = 3;

export default class TripInfoView extends AbstractView {
  #points = [];
  #destinations = [];

  constructor(points, destinations) {
    super();
    this.#points = points;
    this.#destinations = destinations;
  }

  get template() {
    const sortedPoints = this.#getSortedPoints();
    const route = this.#getRoute(sortedPoints);
    const dates = this.#getDates(sortedPoints);
    const cost = this.#getTotalCost();

    return `
      <section class="trip-main__trip-info  trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${route}</h1>
          <p class="trip-info__dates">${dates}</p>
        </div>
        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">${he.encode(String(cost))}</span>
        </p>
      </section>
    `;
  }

  #getSortedPoints() {
    return [...this.#points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
  }

  #getRoute(sortedPoints) {
    if (sortedPoints.length === 0) {
      return '';
    }

    const cities = sortedPoints.map((point) => {
      const destination = point.destination;
      return destination ? destination.name : '';
    });

    if (cities.length <= MAX_FULL_ROUTE_CITIES) {
      return cities.map((city) => he.encode(city)).join(' &mdash; ');
    }

    return `${he.encode(cities[0])} &mdash; ... &mdash; ${he.encode(cities[cities.length - 1])}`;
  }

  #getDates(sortedPoints) {
    if (sortedPoints.length === 0) {
      return '';
    }

    const startDate = dayjs(sortedPoints[0].dateFrom);
    const endDate = dayjs(sortedPoints[sortedPoints.length - 1].dateTo);

    return `${startDate.format(TRIP_DATE_FORMAT).toUpperCase()}&nbsp;&mdash;&nbsp;${endDate.format(TRIP_DATE_FORMAT).toUpperCase()}`;
  }

  #getTotalCost() {
    return this.#points.reduce((total, point) => {
      const pointCost = point.basePrice;
      const offersCost = point.offers.reduce((sum, offer) => sum + offer.price, 0);
      return total + pointCost + offersCost;
    }, 0);
  }
}
