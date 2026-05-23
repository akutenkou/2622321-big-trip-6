import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EmptyView from '../view/empty-view.js';
import PointsModel from '../model/points-model.js';
import PointPresenter from './point-presenter.js';
import { generateFilters } from '../mock/filter-mock.js';
import { SortType, sortByDay, sortByTime, sortByPrice } from '../utils/sort.js';

export default class TripPresenter {
  #pointsModel = null;
  #filtersComponent = null;
  #sortComponent = null;
  #eventsContainer = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;

  constructor() {
    this.#pointsModel = new PointsModel();
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

      this.#renderSort();
      this.#renderPoints();
    }
  }

  #renderSort() {
    this.#sortComponent = new SortView();
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#sortComponent, this.#eventsContainer);
  }

  #renderPoints() {
    const points = this.#getSortedPoints();
    points.forEach((point) => this.#renderPoint(point));
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

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #getSortedPoints() {
    const points = this.#pointsModel.getPoints();

    switch (this.#currentSortType) {
      case SortType.TIME:
        return [...points].sort(sortByTime);
      case SortType.PRICE:
        return [...points].sort(sortByPrice);
      case SortType.DAY:
      default:
        return [...points].sort(sortByDay);
    }
  }

  #handlePointChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPoints();
    this.#renderPoints();
  };
}
