import { EventDetailsResponse } from './EventDetailsResponse';

export interface LoginResponse {
  status: number;
  message?: string;
  Mobile_Number: string;
  event_details: EventDetailsResponse[];
}
