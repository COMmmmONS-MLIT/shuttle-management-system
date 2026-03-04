import { useRouter } from "next/router";
import postNewData from "@/component/soge/Requests/postNewData";
// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faPlus } from "@fortawesome/free-solid-svg-icons";

// dnd-kit
import { useSortable } from "@dnd-kit/sortable";

type Props = {
  order_index: number;
  bin_index: number;
  overBinId?: number | string | null;
  date: string;
  car_id: number;
  bin_order: number;
};

const BlankArea = ({
  order_index,
  bin_index,
  overBinId,
  date,
  car_id,
  bin_order,
}: Props) => {
  const id = `${order_index}-${bin_index}`;
  const router = useRouter();
  const { setNodeRef } = useSortable({ id });

  const addVisitingAndMovePage = async () => {
    const res = await postNewData(date, car_id, bin_order);
    router.push(`/soge/${res.id}?date=${date}`);
  };

  const isOverThis = overBinId === id;

  return (
    <td ref={setNodeRef} style={{
      verticalAlign: "top",
      border: "none",
      borderRight: "solid 1px var(--color-set1)",
      borderBottom: "solid 1px var(--color-set1)",
    }}>
      <div
        className="panel"
        style={{
          backgroundColor: isOverThis ? "#e3f2fd" : undefined,
          border: isOverThis ? "2px solid #2196f3" : "none",
          minHeight: "50px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          padding: "10px",
        }}
      >
        <button
          type="button"
          aria-label="修正"
          onClick={() => addVisitingAndMovePage()}
        >
          <FontAwesomeIcon icon={faPlus} />
          追加する
        </button>
      </div>
    </td>
  );
};

export default BlankArea;
