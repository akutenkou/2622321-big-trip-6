import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EmptyView from '../view/empty-view.js';
import PointsModel from '../model/points-model.js';
import PointPresenter from './point-presenter.js';
import { generateFilters } from '../mock/filter-mock.js';

export default class TripPresenter {
  #pointsModel = null;
  #filtersComponent = null;
  #sortComponent = null;
  #eventsContainer = null;
  #pointPresenters = new Map();

  constructor() {
    this.#pointsModel = new PointsModel();
    this.#sortComponent = new SortView();
  }

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    this.#eventsContainer = document.querySelector('.trip-events');
    const points = this.#pointsModel.getPoints();
    const hasPoints = points.length > 0;

    const filters = generateFilters(hasPoints);
    this.#filtersComponent = new FiltersView(filters);

    if (filtersContainer) {
      render(this.#filtersComponent, filtersContainer);
    }

    if (this.#eventsContainer) {
      if (!hasPoints) {
        render(new EmptyView(), this.#eventsContainer);
        return;
      }

      render(this.#sortComponent, this.#eventsContainer);
      points.forEach((point) => this.#renderPoint(point));
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter(
      this.#eventsContainer,
      this.#handlePointChange,
      this.#handleModeChange
    );

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #handlePointChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };
}
