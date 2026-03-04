import { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import SelectField from "@/component/FormControls/SelectField";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// context
import { useUser } from "@/contexts/UserContext";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { ResponseAcceptOfficeOptions } from "@/types/ApiResponse/tourism";
import { ResponseSogeTypeOptions } from "@/types/ApiResponse/visiting";
import { SelectOption } from "@/types/FormControll/selectOption";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  visitingsCustomerIds: number[];
  onSuccess: () => void;
  onCancel: () => void;
  isBulkRequest?: boolean;
};

const RequestVisitingsCustomer = ({
  visitingsCustomerIds,
  onSuccess,
  onCancel,
  isBulkRequest = false,
}: Props) => {
  const [acceptOfficeOptions, setAcceptOfficeOptions] = useState<
    SelectOption[]
  >([]);
  const [selectedAcceptOffice, setSelectedAcceptOffice] = useState<number>();
  const [sogeTypeOptions, setSogeTypeOptions] = useState<SelectOption[]>([]);
  const [selectedSogeType, setSelectedSogeType] = useState<string>("pick_up");
  const httpClient = new HttpClient();
  const { category } = useUser();

  const isWelfare = category !== "tourism";

  useEffect(() => {
    getAcceptOfficeOptions();
    if (isWelfare) {
      getSogeTypeOptions();
    }
  }, []);

  const getAcceptOfficeOptions = () => {
    const url =
      category === "tourism"
        ? "/tourism/visitings_customers/accept_office_options"
        : "/visitings_customers/accept_office_options";
    httpClient
      .get<ResponseAcceptOfficeOptions>(url)
      .then((res) => {
        setAcceptOfficeOptions(res.data.accept_office_options);
        setSelectedAcceptOffice(res.data.accept_office_options[0].value);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getSogeTypeOptions = () => {
    if (!isWelfare || visitingsCustomerIds.length === 0) {
      return;
    }

    if (isBulkRequest) {
      const bulkOptions: SelectOption[] = [
        { value: "pick_up", label: "迎え" },
        { value: "drop_off", label: "送り" },
        { value: "both", label: "両方" },
      ];
      setSogeTypeOptions(bulkOptions);
      setSelectedSogeType(String(bulkOptions[0].value));
    } else {
      const url = "/visitings_customers/soge_type_options";
      const params = {
        visitings_customer_id: visitingsCustomerIds[0],
      };
      httpClient
        .post<ResponseSogeTypeOptions>(url, params)
        .then((res) => {
          setSogeTypeOptions(res.data.soge_type_options);
          if (res.data.soge_type_options.length > 0) {
            setSelectedSogeType(res.data.soge_type_options[0].value);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onRequest = () => {
    if (!confirm(`送迎リクエストを送信しますか？`)) {
      return;
    }

    const url =
      category === "tourism"
        ? `/tourism/visitings_customers/request_visitings_customer`
        : `/visitings_customers/request_visitings_customer`;

    const params: any = {
      visitings_customer_ids: visitingsCustomerIds,
      accept_office_id: selectedAcceptOffice,
    };

    if (isWelfare) {
      params.soge_type = selectedSogeType;
    }

    httpClient
      .post<SuccessResponse>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages);
        onSuccess();
      })
      .catch((error) => {
        ErrorToast("送迎リクエストの送信に失敗しました");
        console.log(error);
      });
  };

  return (
    <div className="sortSCT">
      <div className="head">
        <div
          style={{
            width: "100%",
            minWidth: "600px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>
            <FontAwesomeIcon icon={faCar} />
            リクエスト先選択
          </h2>
        </div>
      </div>
      <div className="sort">
        <div className="searchbox">
          <fieldset className="basic flex">
            <SelectField
              label="リクエスト先："
              options={acceptOfficeOptions}
              value={selectedAcceptOffice}
              setState={setSelectedAcceptOffice}
              style={{ minWidth: "200px" }}
            />
            {isWelfare && (
              <SelectField
                label="送迎タイプ："
                options={sogeTypeOptions}
                value={selectedSogeType}
                setState={setSelectedSogeType}
                style={{ minWidth: "200px" }}
              />
            )}
          </fieldset>
        </div>
      </div>
      <div className="submitbox">
        <button type="button" onClick={onCancel} className="sub">
          キャンセル
        </button>
        <button type="button" onClick={onRequest}>
          <FontAwesomeIcon icon={faCar} />
          送迎リクエスト
        </button>
      </div>
    </div>
  );
};

export default RequestVisitingsCustomer;
