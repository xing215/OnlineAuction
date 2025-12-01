export const capitalizeFirstLetter = (text: string | undefined | null): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};