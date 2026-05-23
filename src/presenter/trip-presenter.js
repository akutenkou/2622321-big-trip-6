import { render, remove } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import EmptyView from '../view/empty-view.js';
import MessageView, { MessageType } from '../view/message-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { SortType, sortByDay, sortByTime, sortByPrice } from '../utils/sort.js';
import { filter, FilterType } from '../utils/filter.js';
import { UserAction, UpdateType } from '../utils/const.js';

export default class TripPresenter {
  #pointsModel = null;
  #filterModel = null;
  #sortComponent = null;
  #emptyComponent = null;
  #messageComponent = null;
  #eventsContainer = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY;
  #isLoading = true;

  constructor(eventsContainer, pointsModel, filterModel) {
    this.#eventsContainer = eventsContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init() {
    if (this.#isLoading) {
      this.#renderMessage(MessageType.LOADING);
      return;
    }

    this.#clearTrip();

    const destinations = this.#pointsModel.destinations;
    const offers = this.#pointsModel.offers;

    this.#newPointPresenter = new NewPointPresenter(
      this.#eventsContainer,
      this.#handleViewAction,
      this.#handleNewPointDestroy,
      destinations,
      offers
    );

    this.#renderTrip();
  }

  setLoading(isLoading) {
    this.#isLoading = isLoading;
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter.init();
  }

  #renderTrip() {
    const points = this.#getFilteredPoints();

    if (points.length === 0) {
      this.#renderEmpty();
      return;
    }

    this.#renderSort();
    this.#renderPoints();
  }

  #renderMessage(message) {
    this.#messageComponent = new MessageView(message);
    render(this.#messageComponent, this.#eventsContainer);
  }

  #renderEmpty() {
    this.#emptyComponent = new EmptyView(this.#filterModel.filter);
    render(this.#emptyComponent, this.#eventsContainer);
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
      this.#handleViewAction,
      this.#handleModeChange
    );

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearTrip() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }

    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }

    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }

    if (this.#messageComponent) {
      remove(this.#messageComponent);
      this.#messageComponent = null;
    }
  }

  #getFilteredPoints() {
    const points = this.#pointsModel.getPoints();
    const filterType = this.#filterModel.filter;
    return filter[filterType](points);
  }

  #getSortedPoints() {
    const points = this.#getFilteredPoints();

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

  #handleModelEvent = (updateType) => {
    switch (updateType) {
      case UpdateType.MAJOR:
        this.#currentSortType = SortType.DAY;
        this.#clearTrip();
        this.#renderTrip();
        break;
    }
  };

  #handleViewAction = async (actionType, updateType, updatedPoint) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        try {
          await this.#pointsModel.updatePoint(updatedPoint);
          this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
          this.#pointPresenters.get(updatedPoint.id).resetView();
        } catch (err) {
          this.#pointPresenters.get(updatedPoint.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        try {
          await this.#pointsModel.addPoint(updatedPoint);
          this.#newPointPresenter.destroy();
          this.#clearTrip();
          this.#currentSortType = SortType.DAY;
          this.#renderTrip();
        } catch (err) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        try {
          await this.#pointsModel.deletePoint(updatedPoint.id);
          this.#clearTrip();
          this.#renderTrip();
        } catch (err) {
          this.#pointPresenters.get(updatedPoint.id).setAborting();
        }
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleNewPointDestroy = () => {
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearTrip();
    this.#renderTrip();
  };
}
