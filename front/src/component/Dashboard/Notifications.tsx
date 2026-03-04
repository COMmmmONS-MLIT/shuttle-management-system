import React, { useState } from "react";
import { UnreadNotificationModal } from "./UnreadNotificationModal";
import { CancellationApprovalModal } from "./RequestedCustomers/CancellationApprovalModal";

// context
import { useNotification } from "@/contexts/NotificationContext";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import { Notification } from "@/types/notification";

type UnreadNotificationsProps = {
  onRequestSuccess?: () => void;
};

export const UnreadNotifications = ({
  onRequestSuccess,
}: UnreadNotificationsProps) => {
  const { unreadNotifications, markAsRead } = useNotification();
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [selectedRequestedCustomerId, setSelectedRequestedCustomerId] =
    useState<number | null>(null);

  const handleNotificationClick = (clickedNotification: Notification) => {
    setNotification(clickedNotification);

    if (
      clickedNotification.category === "cancel_request_after_approval" &&
      clickedNotification.metadata?.requested_customer_id
    ) {
      setSelectedRequestedCustomerId(
        clickedNotification.metadata.requested_customer_id,
      );
      setCancellationModalOpen(true);
    } else {
      setOpenModal(true);
    }
  };

  const handleCancellationSuccess = () => {
    if (notification) {
      markAsRead(notification.id);
    }
    setSelectedRequestedCustomerId(null);
    setNotification(null);
    onRequestSuccess?.();
  };

  const renderNotificationModal = () => {
    if (!notification) return null;

    switch (notification.category) {
      case "cancel_request_after_approval":
        return (
          <CancellationApprovalModal
            notification={notification}
            requestedCustomerId={selectedRequestedCustomerId}
            openModal={cancellationModalOpen}
            setOpenModal={setCancellationModalOpen}
            onSuccess={handleCancellationSuccess}
          />
        );
      case "request":
      case "allow":
      case "cancel":
      case "share":
      case "cancel_after_approval":
      default:
        return (
          <UnreadNotificationModal
            notification={notification}
            setNotification={setNotification}
            openModal={openModal}
            setOpenModal={setOpenModal}
          />
        );
    }
  };

  return (
    <>
      <style>{`
        .notification-list::-webkit-scrollbar {
          width: 8px;
        }
        .notification-list::-webkit-scrollbar-track {
          background:rgb(254, 196, 196);
        }
        .notification-list::-webkit-scrollbar-thumb {
          background: #c00;
        }
        .notification-list::-webkit-scrollbar-thumb:hover {
          background: #a00;
        }
      `}</style>
      <section>
        <div className="importantSCT">
          <div className="cont">
            <h2>
              <FontAwesomeIcon icon={faInfoCircle} />
              未確認のお知らせ
            </h2>
            <div
              className="list notification-list"
              style={{
                maxHeight: "210px",
                overflowY: "auto",
              }}
            >
              {unreadNotifications.map((notification) => (
                <div key={notification.id} className="block">
                  <p className="date">{notification.created_at}</p>
                  <p className="text">
                    <a
                      onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: "pointer" }}
                    >
                      {notification.message}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {renderNotificationModal()}
    </>
  );
};

export const AllNotifications = () => {
  const { notifications } = useNotification();
  return (
    <section>
      <div className="infoSCT">
        <div className="cont">
          <h2>
            <FontAwesomeIcon icon={faInfoCircle} />
            お知らせ
          </h2>
          <div className="list">
            {notifications.map((notification) => (
              <div key={notification.id} className="block">
                <p className="date">{notification.created_at}</p>
                {notification.read_at ? (
                  <p className="date">確認済み</p>
                ) : (
                  <p className="date"></p>
                )}
                <p className="text">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
