import { render, RenderPosition } from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/edit-point-view.js';

export default class TripPresenter {
  constructor() {
    this.filtersComponent = new FiltersView();
    this.sortComponent = new SortView();
    this.editPointComponent = new EditPointView();
    this.pointComponents = [new PointView(), new PointView(), new PointView()];
  }

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const eventsContainer = document.querySelector('.trip-events');

    if (filtersContainer) {
      render(this.filtersComponent, filtersContainer, RenderPosition.BEFOREEND);
    }

    if (eventsContainer) {
      render(this.sortComponent, eventsContainer, RenderPosition.BEFOREEND);
      render(this.editPointComponent, eventsContainer, RenderPosition.BEFOREEND);

      this.pointComponents.forEach((pointComponent) => {
        render(pointComponent, eventsContainer, RenderPosition.BEFOREEND);
      });
    }
  }
}
