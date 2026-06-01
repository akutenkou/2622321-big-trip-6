import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const DATE_FORMAT = {
  DATE: 'MMM DD',
  TIME: 'HH:mm',
};

const humanizeDate = (date) => dayjs(date).format(DATE_FORMAT.DATE);

const humanizeTime = (date) => dayjs(date).format(DATE_FORMAT.TIME);

const formatDatetime = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

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

export { humanizeDate, humanizeTime, formatDatetime, getPointDuration };
