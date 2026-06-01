import { render, replace, remove } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import { FilterType, Filter } from '../utils/filter.js';
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

    this.#pointsModel.addObserver(this.#modelEventHandler);
    this.#filterModel.addObserver(this.#modelEventHandler);
  }

  init() {
    const filters = this.#generateFilters();
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FiltersView(filters, this.#filterModel.filter);
    this.#filterComponent.setFilterTypeChangeHandler(this.#filterTypeChangeHandler);

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#container);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #generateFilters() {
    const points = this.#pointsModel.points;

    return [
      {
        type: FilterType.EVERYTHING,
        name: 'Everything',
        disabled: Filter[FilterType.EVERYTHING](points).length === 0
      },
      {
        type: FilterType.FUTURE,
        name: 'Future',
        disabled: Filter[FilterType.FUTURE](points).length === 0
      },
      {
        type: FilterType.PRESENT,
        name: 'Present',
        disabled: Filter[FilterType.PRESENT](points).length === 0
      },
      {
        type: FilterType.PAST,
        name: 'Past',
        disabled: Filter[FilterType.PAST](points).length === 0
      }
    ];
  }

  #modelEventHandler = () => {
    this.init();
  };

  #filterTypeChangeHandler = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
