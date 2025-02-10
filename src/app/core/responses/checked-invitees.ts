export interface ICheckedInvitee {
  id?: number | null;
  visitor_name?: string | null;
  card_state?: string | null;
  no_of_persons?: number | null;
  scan_status?: string | null;
  scanned_by?: string | null;
}

export interface ICheckedInviteeRes {
  number_of_verified_invitees?: number | null;
  verified_invitees?: ICheckedInvitee[] | null;
}
