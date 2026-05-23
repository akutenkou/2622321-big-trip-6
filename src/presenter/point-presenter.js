import { render, replace } from '../framework/render.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/edit-point-view.js';
import { UserAction, UpdateType } from '../utils/const.js';

export default class PointPresenter {
  #container = null;
  #point = null;
  #pointComponent = null;
  #editComponent = null;
  #handleViewAction = null;
  #handleModeChange = null;
  #mode = 'view'; // 'view' или 'edit'
  #destinations = [];
  #offers = [];

  constructor(container, onViewAction, onModeChange, destinations, offers) {
    this.#container = container;
    this.#handleViewAction = onViewAction;
    this.#handleModeChange = onModeChange;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevEditComponent = this.#editComponent;

    this.#pointComponent = new PointView(this.#point);
    this.#editComponent = new EditPointView(this.#point, false, this.#destinations, this.#offers);

    this.#pointComponent.setRollupClickHandler(this.#handleRollupClick);
    this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);

    this.#editComponent.setFormSubmitHandler(this.#handleFormSubmit);
    this.#editComponent.setRollupClickHandler(this.#handleEditRollupClick);
    this.#editComponent.setDeleteClickHandler(this.#handleDeleteClick);

    if (prevPointComponent === null || prevEditComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === 'view') {
      if (this.#container.contains(prevPointComponent.element)) {
        replace(this.#pointComponent, prevPointComponent);
      }
    }

    if (this.#mode === 'edit') {
      if (this.#container.contains(prevEditComponent.element)) {
        replace(this.#pointComponent, prevEditComponent);
        this.#mode = 'view';
      }
    }
  }

  resetView() {
    if (this.#mode === 'edit') {
      this.#replaceFormToPoint();
    }
  }

  destroy() {
    this.#pointComponent.element.remove();
    this.#editComponent.element.remove();
  }

  #replacePointToForm = () => {
    this.#handleModeChange();
    replace(this.#editComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#onEscKeyDown);
    this.#mode = 'edit';
  };

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#editComponent);
    document.removeEventListener('keydown', this.#onEscKeyDown);
    this.#mode = 'view';
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
    this.#handleViewAction(UserAction.UPDATE_POINT, UpdateType.PATCH, { ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #handleFormSubmit = (updatedPoint) => {
    this.#handleViewAction(UserAction.UPDATE_POINT, UpdateType.PATCH, updatedPoint);
    this.#mode = 'view';
  };

  #handleEditRollupClick = () => {
    this.#replaceFormToPoint();
  };

  #handleDeleteClick = () => {
    this.#handleViewAction(UserAction.DELETE_POINT, UpdateType.MINOR, this.#point);
  };
}
