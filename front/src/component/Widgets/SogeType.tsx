const SogeType = (sogeType: string | undefined) => {
  switch (sogeType) {
    case "pick_up":
      return <span className="pattern1">迎え</span>;
      break;
    case "drop_off":
      return <span className="pattern2">送り</span>;
    case "mix":
      return <span className="pattern3">混在</span>;
    case "point":
      return (
        <span
          style={{
            display: "inline-block",
            backgroundColor: "#ccc",
            borderRadius: "3px",
            padding: "3px 8px",
            fontSize: "12px",
          }}
        >
          地点
        </span>
      );
    default:
      return <span className="pattern1">迎え</span>;
  }
};

export default SogeType;
