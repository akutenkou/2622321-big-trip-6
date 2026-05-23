const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

const sortByDay = (pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom);

const sortByTime = (pointA, pointB) => {
  const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
  const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);
  return durationB - durationA;
};

const sortByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

export { SortType, sortByDay, sortByTime, sortByPrice };
