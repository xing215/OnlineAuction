import { formatDate } from "./FormatDate";

export const getTimeRemaining = (endDate: Date): string => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 3) {
        return formatDate(endDate.toISOString());
    }
    if (days > 0) {
        return `${days} ngày nữa`;
    }
    if (hours > 0) {
        return `${hours} giờ nữa`;
    }
    return `${minutes} phút nữa`;
  };