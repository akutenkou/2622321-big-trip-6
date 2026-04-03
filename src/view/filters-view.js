import AbstractView from '../framework/view/abstract-view.js';

export default class FiltersView extends AbstractView {
  #filters = null;

  constructor(filters) {
    super();
    this.#filters = filters;
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${this.#filters.map((filter) => `
          <div class="trip-filters__filter">
            <input
              id="filter-${filter.name}"
              class="trip-filters__filter-input  visually-hidden"
              type="radio"
              name="trip-filter"
              value="${filter.name}"
              ${filter.isChecked ? 'checked' : ''}
              ${filter.isDisabled ? 'disabled' : ''}
            >
            <label class="trip-filters__filter-label" for="filter-${filter.name}">${filter.name[0].toUpperCase() + filter.name.slice(1)}</label>
          </div>
        `).join('')}
      </form>
    `;
  }
}
