import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";

type Props = {
  label: string;
  sortKey: string;
  currentOrder: string | undefined;
  onChange: (newOrder: string) => void;
};

const Sortable = ({ label, sortKey, currentOrder, onChange }: Props) => {
  const isAsc = currentOrder === `${sortKey}_asc`;
  const isDesc = currentOrder === `${sortKey}_desc`;

  const handleClick = () => {
    const newOrder = isAsc ? `${sortKey}_desc` : `${sortKey}_asc`;
    onChange(newOrder);
  };

  return (
    <th onClick={handleClick} style={{ cursor: "pointer", userSelect: "none" }}>
      {label}
      <span style={{ marginLeft: "6px" }}>
        {isAsc && <FontAwesomeIcon icon={faSortUp} />}
        {isDesc && <FontAwesomeIcon icon={faSortDown} />}
        {!isAsc && !isDesc && (
          <FontAwesomeIcon icon={faSortUp} style={{ opacity: 0.3 }} />
        )}
      </span>
    </th>
  );
};

export default Sortable;
