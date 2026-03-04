import React, { useState } from "react";
import CustomerNgTableArea from "@/component/customer_ngs/TableArea";
import CustomerNgRegister from "@/component/customer_ngs/Modal/CustomerNgRegister";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

// types
import { CustomerNg } from "@/types/customerNg";

// context
import { useUser } from "@/contexts/UserContext";

const CustomerNgsPage = () => {
  const [modal, setModal] = useState<string | null>(null);
  const [editData, setEditData] = useState<CustomerNg | undefined>();
  const [reloadKey, setReloadKey] = useState(0);
  const { officeName } = useUser();

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const handleEdit = (data: CustomerNg) => {
    setEditData(data);
    setModal("register");
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              乗り合わせ設定
            </h1>
            <ul className="button">
              <li>
                <a
                  className="main js-modalLink"
                  data-modal="USERS"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setEditData(undefined);
                    setModal("register");
                  }}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  利用者登録
                </a>
              </li>
            </ul>
            {officeName && (
              <div className="officeNameDisplay">
                {officeName}
              </div>
            )}
          </div>
        </div>
      </section>
      <CustomerNgTableArea
        setModal={setModal}
        onEdit={handleEdit}
        reloadKey={reloadKey}
      />
      {modal === "register" && (
        <CustomerNgRegister
          setModal={setModal}
          initialData={editData}
          isEdit={!!editData}
          onSuccess={handleReload}
        />
      )}
    </div>
  );
};

export default CustomerNgsPage;
