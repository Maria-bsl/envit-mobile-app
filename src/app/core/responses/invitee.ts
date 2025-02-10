export interface Visitor {
  visitor_det_sno?: number | null;
  visitor_name?: string | null;
  card_state?: string | null;
  no_of_persons?: number | null;
  mobile_no?: string | null;
  email_address?: string | null;
  table_number?: string | null;
  qr_code?: string | null;
}

export interface IInviteeRes {
  status?: number | null;
  totalVisitor?: number | null;
  visitors?: Visitor[] | null;
}
