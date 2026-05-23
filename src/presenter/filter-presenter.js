import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import { FilterType } from '../utils/filter.js';
import { UpdateType } from '../utils/const.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #pointsModel = null;
  #filterComponent = null;

  constructor(container, filterModel, pointsModel) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
  }

  init() {
    const filters = this.#generateFilters();
    this.#filterComponent = new FiltersView(filters);
    this.#filterComponent.setFilterTypeChangeHandler(this.#handleFilterTypeChange);
    render(this.#filterComponent, this.#container);
  }

  #generateFilters() {
    const points = this.#pointsModel.getPoints();
    const hasPoints = points.length > 0;

    return [
      {
        type: FilterType.EVERYTHING,
        name: 'Everything',
        disabled: !hasPoints
      },
      {
        type: FilterType.FUTURE,
        name: 'Future',
        disabled: !hasPoints
      },
      {
        type: FilterType.PRESENT,
        name: 'Present',
        disabled: !hasPoints
      },
      {
        type: FilterType.PAST,
        name: 'Past',
        disabled: !hasPoints
      }
    ];
  }

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
