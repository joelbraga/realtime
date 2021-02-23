export const ErrorAuth = 'error_auth';
export const EventCheckin = 'checkin';
export const EventConnection = 'connection';

export type MessageFromServer<T> = {
  type: string;
  data?: T;
  message?: string;
};

export type MessageFromClient<T> = {
  type: string;
  data?: T;
  token?: string;
};
