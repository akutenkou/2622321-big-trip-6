const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
};

const Mode = {
  VIEW: 'view',
  EDIT: 'edit',
};

const DEFAULT_POINT_TYPE = 'Flight';

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export { UserAction, UpdateType, Mode, DEFAULT_POINT_TYPE, capitalize };
