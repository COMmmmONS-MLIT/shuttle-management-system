import React from "react";
import { Notification } from "@/types/notification";
import { postApproveCancellation } from "./postApproveCancellation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type Props = {
  notification: Notification | null;
  requestedCustomerId: number | null;
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  onSuccess?: () => void;
};

export const CancellationApprovalModal = ({
  notification,
  requestedCustomerId,
  openModal,
  setOpenModal,
  onSuccess,
}: Props) => {
  if (!notification || !requestedCustomerId) return null;

  const handleApprove = () => {
    if (!confirm(`${notification.metadata?.customer_name}様の送迎キャンセルリクエストを承認しますか?`)) {
      return;
    }
    
    postApproveCancellation(requestedCustomerId, () => {
      setOpenModal(false);
      onSuccess?.();
    });
  };

  return (
    <section>
      <div className={`modalSCT ${openModal ? "active" : ""}`}>
        <div className="mask" onClick={() => setOpenModal(false)}></div>
        <div className="cont">
          <div className="close" onClick={() => setOpenModal(false)}></div>
          <div className="inner narrow selectMDL">
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FontAwesomeIcon 
                  icon={faExclamationTriangle} 
                  style={{ color: "#ff6b6b" }}
                />
                キャンセルリクエストの承認
              </h3>
              <div style={{ padding: "16px 32px" }}>
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ marginBottom: "16px", lineHeight: "1.6" }}>
                    {notification.metadata?.date}、{notification.metadata?.customer_name}様({notification.metadata?.soge_type === "pick_up" ? "迎え" : "送り"})に対して送迎のキャンセルリクエストを受け取りました。
                  </p>
                  <p style={{ marginBottom: "16px", lineHeight: "1.6" }}>
                    承認しますか？
                  </p>
                  <p style={{ 
                    color: "#666", 
                    lineHeight: "1.6"
                  }}>
                    ※ 承認後、送迎からこの利用者様が取り消されます。
                  </p>
                </div>

                <div style={{ 
                  display: "flex", 
                  justifyContent: "center",
                  gap: "12px"
                }}>
                  <button 
                    type="button" 
                    className="button" 
                    onClick={handleApprove}
                    style={{ background: "#dc3545", color: "#fff"  }}
                  >
                    承認する
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

