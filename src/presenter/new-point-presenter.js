import { render, remove, RenderPosition } from '../framework/render.js';
import EditPointView from '../view/edit-point-view.js';
import { UserAction, UpdateType, DEFAULT_POINT_TYPE } from '../utils/const.js';

export default class NewPointPresenter {
  #container = null;
  #editComponent = null;
  #viewActionHandler = null;
  #destroyHandler = null;
  #destinations = [];
  #offers = [];
  #onEnableNewEventButton = null;

  constructor(container, onViewAction, onDestroy, destinations, offers, onEnableNewEventButton) {
    this.#container = container;
    this.#viewActionHandler = onViewAction;
    this.#destroyHandler = onDestroy;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onEnableNewEventButton = onEnableNewEventButton;
  }

  init() {
    if (this.#editComponent !== null) {
      return;
    }

    const blankPoint = this.#createBlankPoint();
    this.#editComponent = new EditPointView(blankPoint, true, this.#destinations, this.#offers);
    this.#editComponent.setFormSubmitHandler(this.#formSubmitHandler);
    this.#editComponent.setDeleteClickHandler(this.#deleteClickHandler);

    render(this.#editComponent, this.#container, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#editComponent === null) {
      return;
    }

    remove(this.#editComponent);
    this.#editComponent = null;

    this.#destroyHandler();

    document.removeEventListener('keydown', this.#escKeyDownHandler);

    if (this.#onEnableNewEventButton) {
      this.#onEnableNewEventButton();
    }
  }

  setSaving() {
    this.#editComponent?.setSaving();
  }

  setAborting() {
    this.#editComponent?.setAborting();
  }

  #createBlankPoint() {
    return {
      id: null,
      type: DEFAULT_POINT_TYPE,
      destination: {id: null, name: '', description: '', pictures: []},
      dateFrom: null,
      dateTo: null,
      basePrice: 0,
      offers: [],
      isFavorite: false
    };
  }

  #formSubmitHandler = (point) => {
    this.setSaving();
    this.#viewActionHandler(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point
    );
  };

  #deleteClickHandler = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
