import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import SelectField from "@/component/FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

type ReplicateSectionProps = {
  date: string;
  onReplicateSuccess: () => void;
};

type ReplicateParams = {
  target_date: string;
  weeks_ago: number;
};

type ReplicateResponse = {
  message: string;
  replicated_count: number;
};

const ReplicateSection: React.FC<ReplicateSectionProps> = ({
  date,
  onReplicateSuccess,
}) => {
  const [selectedWeeks, setSelectedWeeks] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const httpClient = new HttpClient();

  const weeksOptions = [
    { value: "0", label: "------" },
    { value: "1", label: "1週間前" },
    { value: "2", label: "2週間前" },
    { value: "3", label: "3週間前" },
    { value: "4", label: "4週間前" },
  ];

  const replicateVisitings = async (
    params: ReplicateParams
  ): Promise<ReplicateResponse> => {
    const url = "/visitings/replicate";
    const response = await httpClient.post<ReplicateResponse>(url, params);
    return response.data;
  };

  const replicateVisitingsWithOverwrite = async (
    params: ReplicateParams
  ): Promise<ReplicateResponse> => {
    const url = "/visitings/replicate_with_overwrite";
    const response = await httpClient.post<ReplicateResponse>(url, params);
    return response.data;
  };

  const handleReplicate = async () => {
    if (!selectedWeeks || selectedWeeks === "0") {
      ErrorToast("週数を選択してください");
      return;
    }

    setIsLoading(true);
    try {
      const params: ReplicateParams = {
        target_date: date,
        weeks_ago: parseInt(selectedWeeks),
      };

      try {
        const response = await replicateVisitings(params);
        SuccessToast(response.message);
        onReplicateSuccess();
      } catch (error: any) {
        if (error.response?.status === 409) {
          const conflictData = error.response.data;
          const shouldOverwrite = window.confirm(conflictData.message);

          if (shouldOverwrite) {
            const overwriteResponse = await replicateVisitingsWithOverwrite(
              params
            );
            SuccessToast(overwriteResponse.message);
            onReplicateSuccess();
          }
        } else if (error.response?.status === 404) {
          const errorMessage = error.response?.data.errors;
          ErrorToast(errorMessage);
        } else {
          const errorMessage =
            error.response?.data?.error || "複製処理中にエラーが発生しました";
          ErrorToast(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("複製エラー:", error);
      ErrorToast("複製処理中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <label style={{ marginRight: "0", marginLeft: "10px" }}>
          送迎内容の複製:
        </label>
        <SelectField
          label=""
          value={selectedWeeks}
          setState={(value: string | number) => setSelectedWeeks(String(value))}
          options={weeksOptions}
        />
        <button
          onClick={handleReplicate}
          disabled={isLoading || !selectedWeeks}
          style={{
            color: "black",
            justifyContent: "center",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          <FontAwesomeIcon icon={faCopy} style={{ marginLeft: "0" }} />
          複製
        </button>
      </div>
    </div>
  );
};

export default ReplicateSection;
