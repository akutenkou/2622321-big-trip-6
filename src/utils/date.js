import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';
const DATETIME_FORMAT = 'DD/MM/YY HH:mm';

const humanizeDate = (date) => dayjs(date).format(DATE_FORMAT);

const humanizeTime = (date) => dayjs(date).format(TIME_FORMAT);

const humanizeDateTime = (date) => dayjs(date).format(DATETIME_FORMAT);

const getPointDuration = (dateFrom, dateTo) => {
  const diff = dayjs(dateTo).diff(dayjs(dateFrom));
  const durationTime = dayjs.duration(diff);

  const days = Math.floor(durationTime.asDays());
  const hours = durationTime.hours();
  const minutes = durationTime.minutes();

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  }

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  }

  return `${minutes.toString().padStart(2, '0')}M`;
};

export { humanizeDate, humanizeTime, humanizeDateTime, getPointDuration };
