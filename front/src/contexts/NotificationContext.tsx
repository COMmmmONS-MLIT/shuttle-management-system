import React, { createContext, useContext, useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import { ResponseNotifications } from "@/types/ApiResponse/notification";
import { useUser } from "@/contexts/UserContext";
import { Notification } from "@/types/notification";

type NotificationContextType = {
  unreadNotificationCount: number;
  notifications: Notification[];
  unreadNotifications: Notification[];
  markAsRead: (notificationId: number) => void;
  loading: boolean;
  error: Error | null;
  refetchNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  unreadNotificationCount: 0,
  unreadNotifications: [],
  notifications: [],
  markAsRead: () => {},
  loading: true,
  error: null,
  refetchNotifications: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, role } = useUser();
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const httpClient = new HttpClient();

  const fetchNotifications = () => {
    if (!user || role === "Admin" || role === "Customer") {
      setLoading(false);
      return;
    }

    httpClient
      .get<ResponseNotifications>("/notifications", {
        skipLoading: true,
      })
      .then((response) => {
        setNotifications(response.data.notifications);
        setUnreadNotificationCount(response.data.unread_notifications.length);
        setUnreadNotifications(response.data.unread_notifications);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        console.error("Failed to fetch notifications:", err);
      });
  };

  useEffect(() => {
    if (user && role !== "Admin" && role !== "Customer") {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user, role]);

  const markAsRead = (notificationId: number) => {
    httpClient
      .put(`/notifications/${notificationId}/read`, {})
      .then(() => {
        fetchNotifications();
      })
      .catch((err) => {
        console.error("Failed to mark as read:", err);
      });
  };
  return (
    <NotificationContext.Provider
      value={{
        unreadNotificationCount,
        notifications,
        unreadNotifications,
        markAsRead,
        loading,
        error,
        refetchNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
