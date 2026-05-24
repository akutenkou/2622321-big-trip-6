import { adaptPointToClient } from '../utils/adapters.js';

export default class PointsModel {
  #points = [];
  #tripApiService = null;
  #destinations = [];
  #offers = [];
  #observers = new Set();

  constructor(tripApiService) {
    this.#tripApiService = tripApiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  addObserver(observer) {
    this.#observers.add(observer);
  }

  removeObserver(observer) {
    this.#observers.delete(observer);
  }

  #notifyObservers() {
    this.#observers.forEach((observer) => observer());
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#tripApiService.points,
        this.#tripApiService.destinations,
        this.#tripApiService.offers,
      ]);

      this.#destinations = destinations;
      this.#offers = offers;
      this.#points = points.map((point) => adaptPointToClient(point, destinations, offers));
    } catch (err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = [];
      throw err;
    }
  }

  getPoints() {
    return this.#points;
  }

  async updatePoint(updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#tripApiService.updatePoint(updatedPoint);
      const adaptedPoint = adaptPointToClient(response, this.#destinations, this.#offers);
      this.#points[index] = adaptedPoint;
      this.#notifyObservers();
      return adaptedPoint;
    } catch (err) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(point) {
    try {
      const response = await this.#tripApiService.addPoint(point);
      const adaptedPoint = adaptPointToClient(response, this.#destinations, this.#offers);
      this.#points.push(adaptedPoint);
      this.#notifyObservers();
      return adaptedPoint;
    } catch (err) {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(pointId) {
    const index = this.#points.findIndex((point) => point.id === pointId);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    try {
      await this.#tripApiService.deletePoint({id: pointId});
      this.#points.splice(index, 1);
      this.#notifyObservers();
    } catch (err) {
      throw new Error('Can\'t delete point');
    }
  }
}
