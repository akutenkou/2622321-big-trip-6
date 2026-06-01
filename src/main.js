import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import TripApiService from './api/trip-api-service.js';

const AUTHORIZATION = `Basic ${Math.random().toString(36).substring(2)}`;
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const tripMainElement = document.querySelector('.trip-main');
const filtersContainerElement = document.querySelector('.trip-controls__filters');
const eventsContainerElement = document.querySelector('.trip-events');
const newEventButtonElement = document.querySelector('.trip-main__event-add-btn');

const tripApiService = new TripApiService(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel(tripApiService);
const filterModel = new FilterModel();

const enableNewEventButton = () => {
  newEventButtonElement.disabled = false;
};

const tripPresenter = new TripPresenter(eventsContainerElement, pointsModel, filterModel, enableNewEventButton);
const filterPresenter = new FilterPresenter(filtersContainerElement, filterModel, pointsModel);
const tripInfoPresenter = new TripInfoPresenter(tripMainElement, pointsModel);

tripPresenter.setLoading(true);
tripPresenter.init();

pointsModel.init()
  .then(() => {
    tripPresenter.setLoading(false);
    tripPresenter.init();
    filterPresenter.init();
    tripInfoPresenter.init();
  })
  .catch(() => {
    tripPresenter.setLoadError();
    tripPresenter.init();
    filterPresenter.init();
    tripInfoPresenter.init();
  });

newEventButtonElement.addEventListener('click', () => {
  const isOpened = tripPresenter.createPoint();
  if (isOpened) {
    newEventButtonElement.disabled = true;
  }
});
