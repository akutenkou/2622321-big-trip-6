export const adaptPointToClient = (point, destinations, offers) => {
  const destination = destinations.find((dest) => dest.id === point.destination);
  const typeOffers = offers.find((offer) => offer.type === point.type.toLowerCase());
  const selectedOffers = typeOffers
    ? typeOffers.offers.filter((offer) => point.offers.includes(offer.id))
    : [];

  return {
    id: point.id,
    type: point.type.charAt(0).toUpperCase() + point.type.slice(1),
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

export const adaptPointToServer = (point) => ({
  'id': point.id,
  'base_price': point.basePrice,
  'date_from': point.dateFrom,
  'date_to': point.dateTo,
  'destination': typeof point.destination === 'object' ? point.destination.id : point.destination,
  'is_favorite': point.isFavorite,
  'offers': point.offers.map((offer) => offer.id),
  'type': point.type.toLowerCase(),
});
