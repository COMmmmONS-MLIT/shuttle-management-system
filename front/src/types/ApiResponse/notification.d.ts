import { Notification } from "@/types/notification";

export type ResponseNotifications = {
  notifications: Notification[];
  unread_notifications: Notification[];
};
