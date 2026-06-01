import { render, replace, remove } from '../framework/render.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/edit-point-view.js';
import { UserAction, UpdateType, Mode } from '../utils/const.js';

export default class PointPresenter {
  #container = null;
  #point = null;
  #pointComponent = null;
  #editComponent = null;
  #viewActionHandler = null;
  #modeChangeHandler = null;
  #mode = Mode.VIEW;
  #destinations = [];
  #offers = [];

  constructor(container, onViewAction, onModeChange, destinations, offers) {
    this.#container = container;
    this.#viewActionHandler = onViewAction;
    this.#modeChangeHandler = onModeChange;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevEditComponent = this.#editComponent;

    this.#pointComponent = new PointView(this.#point);
    this.#editComponent = new EditPointView(this.#point, false, this.#destinations, this.#offers);

    this.#pointComponent.setRollupClickHandler(this.#rollupClickHandler);
    this.#pointComponent.setFavoriteClickHandler(this.#favoriteClickHandler);

    this.#editComponent.setFormSubmitHandler(this.#formSubmitHandler);
    this.#editComponent.setRollupClickHandler(this.#editRollupClickHandler);
    this.#editComponent.setDeleteClickHandler(this.#deleteClickHandler);

    if (prevPointComponent === null || prevEditComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.VIEW) {
      replace(this.#pointComponent, prevPointComponent);
    } else if (this.#mode === Mode.EDIT) {
      replace(this.#pointComponent, prevEditComponent);
      this.#mode = Mode.VIEW;
    }
  }

  resetView() {
    if (this.#mode === Mode.EDIT) {
      this.#replaceFormToPoint();
    }
  }

  destroy() {
    if (this.#mode === Mode.EDIT) {
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }

    remove(this.#pointComponent);
    remove(this.#editComponent);
  }

  setAborting() {
    if (this.#mode === Mode.VIEW) {
      this.#pointComponent.shake();
      return;
    }

    this.#editComponent.setAborting();
  }

  #replacePointToForm = () => {
    this.#modeChangeHandler();
    replace(this.#editComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.EDIT;
  };

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#editComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.VIEW;
    remove(this.#editComponent);
    this.#editComponent = new EditPointView(this.#point, false, this.#destinations, this.#offers);
    this.#editComponent.setFormSubmitHandler(this.#formSubmitHandler);
    this.#editComponent.setRollupClickHandler(this.#editRollupClickHandler);
    this.#editComponent.setDeleteClickHandler(this.#deleteClickHandler);
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  #rollupClickHandler = () => {
    this.#replacePointToForm();
  };

  #favoriteClickHandler = () => {
    this.#viewActionHandler(UserAction.UPDATE_POINT, UpdateType.PATCH, { ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #formSubmitHandler = (updatedPoint) => {
    this.#editComponent.setSaving();
    this.#viewActionHandler(UserAction.UPDATE_POINT, UpdateType.MINOR, updatedPoint);
  };

  #editRollupClickHandler = () => {
    this.#replaceFormToPoint();
  };

  #deleteClickHandler = () => {
    this.#editComponent.setDeleting();
    this.#viewActionHandler(UserAction.DELETE_POINT, UpdateType.MINOR, this.#point);
  };
}
