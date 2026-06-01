import dayjs from 'dayjs';

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

const Filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => dayjs().isBefore(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => !dayjs().isBefore(point.dateFrom) && !dayjs().isAfter(point.dateTo)),
  [FilterType.PAST]: (points) => points.filter((point) => dayjs().isAfter(point.dateTo)),
};

export { FilterType, Filter };
