export type Notification = {
  id: number;
  category?: "request" | "allow" | "cancel" | "share" | "cancel_request_after_approval" | "cancel_after_approval";
  message: string;
  created_at: string;
  read_at?: string;
  metadata?: {
    requested_customer_id?: number;
    customer_name?: string;
    soge_type?: string;
    date?: string;
  };
};
