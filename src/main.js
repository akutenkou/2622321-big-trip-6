import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import TripApiService from './api/trip-api-service.js';

const AUTHORIZATION = `Basic ${Math.random().toString(36).substring(2)}`;
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const tripMainElement = document.querySelector('.trip-main');
const filtersContainer = document.querySelector('.trip-controls__filters');
const eventsContainer = document.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const tripApiService = new TripApiService(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel(tripApiService);
const filterModel = new FilterModel();

const tripPresenter = new TripPresenter(eventsContainer, pointsModel, filterModel);
const filterPresenter = new FilterPresenter(filtersContainer, filterModel, pointsModel);
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
    tripPresenter.setLoading(false);
    tripPresenter.init();
  });

newEventButton.addEventListener('click', () => {
  tripPresenter.createPoint();
  newEventButton.disabled = true;
});

const enableNewEventButton = () => {
  newEventButton.disabled = false;
};

window.enableNewEventButton = enableNewEventButton;
