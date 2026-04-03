import { render, replace } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/edit-point-view.js';
import PointsModel from '../model/points-model.js';

export default class TripPresenter {
  #pointsModel = null;
  #filtersComponent = null;
  #sortComponent = null;
  #eventsContainer = null;

  constructor() {
    this.#pointsModel = new PointsModel();
    this.#filtersComponent = new FiltersView();
    this.#sortComponent = new SortView();
  }

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    this.#eventsContainer = document.querySelector('.trip-events');
    const points = this.#pointsModel.getPoints();

    if (filtersContainer) {
      render(this.#filtersComponent, filtersContainer);
    }

    if (this.#eventsContainer) {
      render(this.#sortComponent, this.#eventsContainer);
      this.#renderPoints(points);
    }
  }

  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const pointComponent = new PointView(point);
    const editComponent = new EditPointView(point);

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        replace(pointComponent, editComponent);
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    pointComponent.setRollupClickHandler(() => {
      replace(editComponent, pointComponent);
      document.addEventListener('keydown', onEscKeyDown);
    });

    editComponent.setFormSubmitHandler(() => {
      replace(pointComponent, editComponent);
      document.removeEventListener('keydown', onEscKeyDown);
    });

    editComponent.setRollupClickHandler(() => {
      replace(pointComponent, editComponent);
      document.removeEventListener('keydown', onEscKeyDown);
    });

    editComponent.setCancelClickHandler(() => {
      replace(pointComponent, editComponent);
      document.removeEventListener('keydown', onEscKeyDown);
    });

    render(pointComponent, this.#eventsContainer);
  }
}
