/**
 * Get chip styling for motion status
 * Used across MotionDetailsCard, MotionPage, and other components
 */
export const getChipSxForStatus = (label) => {
  const s = String(label || "").toUpperCase();
  const lightText = { color: "white" };
  const darkText = { color: "black" };

  switch (s) {
    case "DEBATE":
      return { sx: { bgcolor: "#FF57BB", ...lightText } };
    case "VOTING":
      return { sx: { bgcolor: "#22577A", ...lightText } };
    case "PASSED":
      return { sx: { bgcolor: "#57CC99", ...darkText } };
    case "SECONDED":
      return { sx: { bgcolor: "#38A3A5", ...darkText } };
    case "VETOED":
      return { sx: { bgcolor: "#4f4e4eff", ...lightText } };
    case "VETO_CONFIRMED":
      return { sx: { bgcolor: "#4f4e4eff", ...lightText } };
    case "REJECTED":
      return { sx: { bgcolor: "#8d0858ff", ...lightText } };
    case "PROPOSED":
      return { sx: { bgcolor: "#85D4D5", ...darkText } };
    case "CHALLENGING_VETO":
      return { sx: { bgcolor: "#ed6c02", ...lightText } };
    case "PENDING":
    default:
      return { sx: {} };
  }
};
