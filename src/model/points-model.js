import { points } from '../mock/point-mock.js';

export default class PointsModel {
  constructor() {
    this.points = points;
  }

  getPoints() {
    return this.points;
  }

  updatePoint(updatedPoint) {
    const index = this.points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      return;
    }

    this.points[index] = updatedPoint;
  }
}

