import { capitalize } from './const.js';

export const adaptPointToClient = (point, destinations, offers) => {
  const destination = destinations.find((dest) => dest.id === point.destination);
  const typeOffers = offers.find((offer) => offer.type === point.type.toLowerCase());
  const selectedOffers = typeOffers
    ? typeOffers.offers.filter((offer) => point.offers.includes(offer.id))
    : [];

  return {
    id: point.id,
    type: capitalize(point.type),
    destination: destination || {
      id: point.destination,
      name: '',
      description: '',
      pictures: []
    },
    dateFrom: point.date_from ? new Date(point.date_from) : null,
    dateTo: point.date_to ? new Date(point.date_to) : null,
    basePrice: point.base_price,
    offers: selectedOffers,
    isFavorite: point.is_favorite,
  };
};

export const adaptPointToServer = (point) => {
  const adaptedPoint = {
    'base_price': point.basePrice,
    'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : point.dateFrom,
    'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : point.dateTo,
    'destination': typeof point.destination === 'object' ? point.destination.id : point.destination,
    'is_favorite': point.isFavorite,
    'offers': point.offers.map((offer) => typeof offer === 'object' ? offer.id : offer),
    'type': point.type.toLowerCase(),
  };

  if (point.id !== null) {
    adaptedPoint.id = point.id;
  }

  return adaptedPoint;
};
