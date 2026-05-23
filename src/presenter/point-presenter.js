import { render, replace } from '../framework/render.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/edit-point-view.js';

export default class PointPresenter {
  #container = null;
  #point = null;
  #pointComponent = null;
  #editComponent = null;
  #handleDataChange = null;
  #handleModeChange = null;

  constructor(container, onDataChange, onModeChange) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevEditComponent = this.#editComponent;

    this.#pointComponent = new PointView(this.#point);
    this.#editComponent = new EditPointView(this.#point);

    this.#pointComponent.setRollupClickHandler(this.#handleRollupClick);
    this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);

    this.#editComponent.setFormSubmitHandler(this.#handleFormSubmit);
    this.#editComponent.setRollupClickHandler(this.#handleEditRollupClick);
    this.#editComponent.setCancelClickHandler(this.#handleCancelClick);

    if (prevPointComponent === null || prevEditComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#container.contains(prevPointComponent.element)) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#container.contains(prevEditComponent.element)) {
      replace(this.#editComponent, prevEditComponent);
    }
  }

  resetView() {
    if (this.#container.contains(this.#editComponent.element)) {
      this.#replaceFormToPoint();
    }
  }

  destroy() {
    this.#pointComponent.element.remove();
    this.#editComponent.element.remove();
  }

  #replacePointToForm = () => {
    replace(this.#editComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#onEscKeyDown);
    this.#handleModeChange();
  };

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#editComponent);
    document.removeEventListener('keydown', this.#onEscKeyDown);
  };

  #onEscKeyDown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  #handleRollupClick = () => {
    this.#replacePointToForm();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({ ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #handleFormSubmit = (evt) => {
    evt.preventDefault();
    this.#replaceFormToPoint();
  };

  #handleEditRollupClick = () => {
    this.#replaceFormToPoint();
  };

  #handleCancelClick = () => {
    this.#replaceFormToPoint();
  };
}
