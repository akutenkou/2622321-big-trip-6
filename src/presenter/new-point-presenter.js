import { render, remove, RenderPosition } from '../framework/render.js';
import EditPointView from '../view/edit-point-view.js';
import { UserAction, UpdateType } from '../utils/const.js';

export default class NewPointPresenter {
  #container = null;
  #editComponent = null;
  #handleDataChange = null;
  #handleDestroy = null;
  #destinations = [];
  #offers = [];

  constructor(container, onDataChange, onDestroy, destinations, offers) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  init() {
    if (this.#editComponent !== null) {
      return;
    }

    const blankPoint = this.#createBlankPoint();
    this.#editComponent = new EditPointView(blankPoint, true, this.#destinations, this.#offers);
    this.#editComponent.setFormSubmitHandler(this.#handleFormSubmit);
    this.#editComponent.setDeleteClickHandler(this.#handleDeleteClick);

    render(this.#editComponent, this.#container, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#onEscKeyDown);
  }

  destroy() {
    if (this.#editComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#editComponent);
    this.#editComponent = null;

    document.removeEventListener('keydown', this.#onEscKeyDown);

    if (window.enableNewEventButton) {
      window.enableNewEventButton();
    }
  }

  setSaving() {
    this.#editComponent.setSaving();
  }

  setAborting() {
    this.#editComponent.setAborting();
  }

  #createBlankPoint() {
    const firstDestination = this.#destinations[0] || {
      id: 1,
      name: '',
      description: '',
      pictures: []
    };

    return {
      id: null,
      type: 'Flight',
      destination: firstDestination,
      dateFrom: new Date().toISOString(),
      dateTo: new Date().toISOString(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };
  }

  #handleFormSubmit = (point) => {
    this.setSaving();
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point
    );
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #onEscKeyDown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
