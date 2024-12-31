export interface EventDetailsResponse {
  event_id: number;
  event_name: string;
}

export interface LoginResponse {
  status: number;
  message?: string;
  Mobile_Number: string;
  event_details: EventDetailsResponse[];
}
