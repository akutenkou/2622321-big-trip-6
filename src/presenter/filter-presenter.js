import { render, replace, remove } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import { FilterType, filter } from '../utils/filter.js';
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

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const filters = this.#generateFilters();
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FiltersView(filters, this.#filterModel.filter);
    this.#filterComponent.setFilterTypeChangeHandler(this.#handleFilterTypeChange);

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#container);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #generateFilters() {
    const points = this.#pointsModel.getPoints();

    return [
      {
        type: FilterType.EVERYTHING,
        name: 'Everything',
        disabled: filter[FilterType.EVERYTHING](points).length === 0
      },
      {
        type: FilterType.FUTURE,
        name: 'Future',
        disabled: filter[FilterType.FUTURE](points).length === 0
      },
      {
        type: FilterType.PRESENT,
        name: 'Present',
        disabled: filter[FilterType.PRESENT](points).length === 0
      },
      {
        type: FilterType.PAST,
        name: 'Past',
        disabled: filter[FilterType.PAST](points).length === 0
      }
    ];
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
