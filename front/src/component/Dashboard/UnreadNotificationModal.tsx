// context
import { useNotification } from "@/contexts/NotificationContext";
import { Notification } from "@/types/notification";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

type Props = {
  notification: Notification;
  setNotification: (notification: Notification | null) => void;
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
};

export const UnreadNotificationModal = ({
  notification,
  setNotification,
  openModal,
  setOpenModal,
}: Props) => {
  const { markAsRead } = useNotification();
  const onSubmit = () => {
    markAsRead(notification.id);
    setOpenModal(false);
    setNotification(null);
  };

  return (
    <section>
      <div className={`modalSCT ${openModal ? "active" : ""}`}>
        <div className="mask" onClick={() => setOpenModal(false)}></div>
        <div className="cont">
          <div className="close" onClick={() => setOpenModal(false)}></div>
          <div className="inner narrow selectMDL">
            <div>
              <h3>未確認のお知らせ</h3>
              <div style={{ padding: "16px 32px" }}>
                <p style={{ marginBottom: "16px" }}>{notification.message}</p>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button type="button" className="button" onClick={onSubmit}>
                    既読にする
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
