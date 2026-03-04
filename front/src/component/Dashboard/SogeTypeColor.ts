const SogeTypeColor = (type: "pick_up" | "drop_off" | "point" | undefined) => {
  switch (type) {
    case "pick_up":
      return "#f8db82";
    case "drop_off":
      return "#c6d9d3";
    case "point":
      return "#ddd";
    default:
      return "";
  }
};

export default SogeTypeColor;
