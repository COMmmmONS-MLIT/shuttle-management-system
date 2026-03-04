const isValidDate = (dateString: string | undefined) => {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;

  // Dateオブジェクトを使用して日付の妥当性を確認
  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;

  // 月と日が正しいかを確認
  const [year, month, day] = dateString.split("-").map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
};

export default isValidDate;
