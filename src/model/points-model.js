import { points } from '../mock/point-mock.js';

export default class PointsModel {
  #points = points;

  get points() {
    return this.#points;
  }

  set points(updatedPoints) {
    this.#points = updatedPoints;
  }

  getPoints() {
    return this.#points;
  }

  updatePoint(updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      return;
    }

    this.#points[index] = updatedPoint;
  }

  addPoint(point) {
    this.#points.push(point);
  }

  deletePoint(pointId) {
    const index = this.#points.findIndex((point) => point.id === pointId);

    if (index === -1) {
      return;
    }

    this.#points.splice(index, 1);
  }
}
