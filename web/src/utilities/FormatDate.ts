export const formatDate = (isoString: string | undefined | null | Date): string => {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  
  // Kiểm tra nếu date không hợp lệ
  if (isNaN(date.getTime())) return isoString instanceof Date ? isoString.toString() : isoString || "";
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};
