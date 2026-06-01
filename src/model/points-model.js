import Observable from '../framework/observable.js';
import { adaptPointToClient } from '../utils/adapters.js';
import { UpdateType } from '../utils/const.js';

export default class PointsModel extends Observable {
  #points = [];
  #tripApiService = null;
  #destinations = [];
  #offers = [];

  constructor(tripApiService) {
    super();
    this.#tripApiService = tripApiService;
  }

  get destinations() {
    return [...this.#destinations];
  }

  get offers() {
    return [...this.#offers];
  }

  get points() {
    return [...this.#points];
  }

  async init() {
    const [pointsResult, destinationsResult, offersResult] = await Promise.allSettled([
      this.#tripApiService.points,
      this.#tripApiService.destinations,
      this.#tripApiService.offers,
    ]);

    if (destinationsResult.status === 'fulfilled') {
      this.#destinations = destinationsResult.value;
    } else {
      this.#destinations = [];
    }

    if (offersResult.status === 'fulfilled') {
      this.#offers = offersResult.value;
    } else {
      this.#offers = [];
    }

    if (pointsResult.status === 'fulfilled') {
      this.#points = pointsResult.value.map((point) =>
        adaptPointToClient(point, this.#destinations, this.#offers)
      );
    } else {
      this.#points = [];
    }

    if (destinationsResult.status === 'rejected' || offersResult.status === 'rejected') {
      throw new Error('Failed to load essential data');
    }


  }

  async updatePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update nonexistent point');
    }

    try {
      const response = await this.#tripApiService.updatePoint(updatedPoint);
      const adaptedPoint = adaptPointToClient(response, this.#destinations, this.#offers);
      this.#points[index] = adaptedPoint;
      this._notify(updateType);
      return adaptedPoint;
    } catch (err) {
      throw new Error('Can\'t update point', { cause: err });
    }
  }

  async addPoint(point) {
    try {
      const response = await this.#tripApiService.addPoint(point);
      const adaptedPoint = adaptPointToClient(response, this.#destinations, this.#offers);
      this.#points.push(adaptedPoint);
      this._notify(UpdateType.MINOR);
      return adaptedPoint;
    } catch (err) {
      throw new Error('Can\'t add point', { cause: err });
    }
  }

  async deletePoint(pointId) {
    const index = this.#points.findIndex((point) => point.id === pointId);

    if (index === -1) {
      throw new Error('Can\'t delete nonexistent point');
    }

    try {
      await this.#tripApiService.deletePoint({id: pointId});
      this.#points.splice(index, 1);
      this._notify(UpdateType.MINOR);
    } catch (err) {
      throw new Error('Can\'t delete point', { cause: err });
    }
  }
}
