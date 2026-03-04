import { useState, useEffect } from "react";
import getCanDriver from "../Requests/getCanDriver";
import putUpdateStaffs from "../Requests/putUpdateStaffs";

type Props = {
  visitingId: number;
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  fetchVisiting: () => void;
  moveToIndex?: () => void;
};

const DriverModal = ({
  visitingId,
  openModal,
  setOpenModal,
  fetchVisiting,
  moveToIndex,
}: Props) => {
  const [driverId, setDriverId] = useState<number | string>("");
  const [tenjoId, setTenjoId] = useState<number | string>("");
  const [driverOptions, setDriverOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [tenjoOptions, setTenjoOptions] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    if (visitingId) {
      fetchDriverAndTenjoOptions();
    }
  }, [visitingId]);

  const fetchDriverAndTenjoOptions = async () => {
    const data = await getCanDriver(visitingId);
    setDriverOptions(
      data.can_driver.map((driver) => ({
        label: driver.name,
        value: driver.id,
      }))
    );
    setTenjoOptions(
      data.can_tenjo.map((tenjo) => ({
        label: tenjo.name,
        value: tenjo.id,
      }))
    );
    if (data.selected_driver_id) {
      setDriverId(data.selected_driver_id);
    }
    if (data.selected_tenjo_id) {
      setTenjoId(data.selected_tenjo_id);
    }
  };

  const onSubmit = async () => {
    await putUpdateStaffs(visitingId, driverId as number, tenjoId as number);
    fetchVisiting();
    setOpenModal(false);
    if (moveToIndex) {
      moveToIndex();
    }
  };

  const onSelectDriver = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setDriverId(Number(e.target.value));
    } else {
      setDriverId("");
    }
  };

  const onSelectTenjo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setTenjoId(Number(e.target.value));
    } else {
      setTenjoId("");
    }
  };

  return (
    <section>
      <div className={`modalSCT ${openModal ? "active" : ""}`}>
        <div className="mask" onClick={() => setOpenModal(false)}></div>
        <div className="cont">
          <div className="close" onClick={() => setOpenModal(false)}></div>
          <div className="inner narrow selectMDL">
            <h3>運転手・添乗員登録</h3>
            <div style={{ padding: "16px 32px" }}>
              <fieldset>
                <label className="select">
                  <span>運転手：</span>
                  <select value={driverId} onChange={onSelectDriver}>
                    <option value="">-----</option>
                    {driverOptions.map((option, index) => (
                      <option
                        key={index}
                        value={option.value}
                        disabled={tenjoId === option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="select">
                  <span>添乗員：</span>
                  <select value={tenjoId} onChange={onSelectTenjo}>
                    <option value="">なし</option>
                    {tenjoOptions.map((option, index) => (
                      <option
                        key={index}
                        value={option.value}
                        disabled={driverId === option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="button" className="button" onClick={onSubmit}>
                  登録する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverModal;
