import AbstractView from '../framework/view/abstract-view.js';

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilter = null;

  constructor(filters, currentFilter) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this._callback = {};
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${this.#filters.map((filter) => `
          <div class="trip-filters__filter">
            <input
              id="filter-${filter.type}"
              class="trip-filters__filter-input  visually-hidden"
              type="radio"
              name="trip-filter"
              value="${filter.type}"
              data-filter-type="${filter.type}"
              ${filter.type === this.#currentFilter ? 'checked' : ''}
              ${filter.disabled ? 'disabled' : ''}
            >
            <label class="trip-filters__filter-label" for="filter-${filter.type}">${filter.name}</label>
          </div>
        `).join('')}
      </form>
    `;
  }

  setFilterTypeChangeHandler(callback) {
    this._callback.filterTypeChange = callback;
    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  #filterTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();
    this._callback.filterTypeChange(evt.target.dataset.filterType);
  };
}
