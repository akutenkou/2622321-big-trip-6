import { render, remove } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import SortView from '../view/sort-view.js';
import ListView from '../view/list-view.js';
import EmptyView from '../view/empty-view.js';
import MessageView, { MessageType } from '../view/message-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { SortType, sortByDay, sortByTime, sortByPrice } from '../utils/sort.js';
import { Filter, FilterType } from '../utils/filter.js';
import { UserAction, UpdateType } from '../utils/const.js';

const UI_BLOCK_LIMIT = {
  lowerLimit: 500,
  upperLimit: 1000,
};

export default class TripPresenter {
  #pointsModel = null;
  #filterModel = null;
  #sortComponent = null;
  #emptyComponent = null;
  #messageComponent = null;
  #eventsContainer = null;
  #listContainer = null;
  #destinations = [];
  #offers = [];
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY;
  #isLoading = true;
  #isLoadError = false;
  #onEnableNewEventButton = null;
  #uiBlocker = new UiBlocker(UI_BLOCK_LIMIT);

  constructor(eventsContainer, pointsModel, filterModel, onEnableNewEventButton) {
    this.#eventsContainer = eventsContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#onEnableNewEventButton = onEnableNewEventButton;

    this.#pointsModel.addObserver(this.#modelEventHandler);
    this.#filterModel.addObserver(this.#modelEventHandler);
  }

  init() {
    if (this.#isLoading) {
      this.#renderMessage(MessageType.LOADING);
      return;
    }

    if (this.#isLoadError) {
      this.#clearTrip();
      this.#renderMessage(MessageType.ERROR);
      return;
    }

    this.#rerender();
  }

  setLoading(isLoading) {
    this.#isLoading = isLoading;
  }

  setLoadError() {
    this.#isLoading = false;
    this.#isLoadError = true;
  }

  createPoint() {
    if (!this.#newPointPresenter) {
      return false;
    }

    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }

    this.#newPointPresenter.init();
    return true;
  }

  #renderTrip() {
    const points = this.#getFilteredPoints();

    this.#destinations = this.#pointsModel.destinations;
    this.#offers = this.#pointsModel.offers;

    if (points.length === 0 && !this.#emptyComponent) {
      this.#renderEmpty();
    } else if (!this.#sortComponent) {
      this.#renderSort();
    }

    this.#listContainer = new ListView();
    render(this.#listContainer, this.#eventsContainer);

    this.#newPointPresenter = new NewPointPresenter(
      this.#listContainer.element,
      this.#viewActionHandler,
      this.#newPointDestroyHandler,
      this.#destinations,
      this.#offers,
      this.#onEnableNewEventButton
    );

    if (points.length > 0) {
      this.#renderPoints();
    }
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
    this.#sortComponent.setSortTypeChangeHandler(this.#sortTypeChangeHandler);
    render(this.#sortComponent, this.#eventsContainer);
  }

  #renderPoints() {
    const points = this.#getSortedPoints();
    points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter(
      this.#listContainer.element,
      this.#viewActionHandler,
      this.#modeChangeHandler,
      this.#destinations,
      this.#offers
    );

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }

    if (this.#listContainer) {
      remove(this.#listContainer);
      this.#listContainer = null;
    }
  }

  #clearTrip() {
    this.#clearPoints();

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

  #rerender(resetSort = false) {
    if (resetSort) {
      this.#currentSortType = SortType.DAY;
    }
    this.#clearTrip();
    this.#renderTrip();
  }

  #getFilteredPoints() {
    const points = this.#pointsModel.points;
    const filterType = this.#filterModel.filter;
    return Filter[filterType](points);
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

  #modelEventHandler = (updateType) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#rerender();
        break;
      case UpdateType.MAJOR:
        this.#rerender(true);
        break;
      default:
        this.#rerender();
        break;
    }
  };

  #viewActionHandler = async (actionType, updateType, updatedPoint) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        try {
          await this.#pointsModel.updatePoint(updateType, updatedPoint);
        } catch (err) {
          this.#pointPresenters.get(updatedPoint.id)?.setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        try {
          this.#currentSortType = SortType.DAY;
          await this.#pointsModel.addPoint(updatedPoint);
        } catch (err) {
          this.#newPointPresenter?.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        try {
          await this.#pointsModel.deletePoint(updatedPoint.id);
        } catch (err) {
          this.#pointPresenters.get(updatedPoint.id)?.setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  #modeChangeHandler = () => {
    this.#newPointPresenter?.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #newPointDestroyHandler = () => {
    if (this.#getFilteredPoints().length === 0 && !this.#emptyComponent) {
      this.#renderEmpty();
    }
  };

  #sortTypeChangeHandler = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPoints();
    this.#renderTrip();
  };
}
