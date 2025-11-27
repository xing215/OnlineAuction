import { useMemo, useState } from "react";

type MyProductStatus = "ongoing" | "sold" | "completed";

interface MyProductItem {
  id: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  bidCount: number;
  highestBidder: string;
  status: MyProductStatus;
}

interface StatCard {
  id: string;
  label: string;
  value: number;
  accent: "blue" | "green" | "amber";
}

interface TabOption {
  id: MyProductStatus;
  label: string;
}

const PRODUCT_ITEMS: MyProductItem[] = [
  {
    id: "product-1",
    title: "Túi xách Louis Vuitton",
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&auto=format&fit=crop",
    currentPrice: 980,
    bidCount: 20,
    highestBidder: "fashion_queen",
    status: "ongoing",
  },
  {
    id: "product-2",
    title: "Xe đạp Road Bike chuyên nghiệp",
    imageUrl: "https://images.unsplash.com/photo-1515777315835-281b94c9589a?w=400&auto=format&fit=crop",
    currentPrice: 750,
    bidCount: 10,
    highestBidder: "cyclist_pro",
    status: "ongoing",
  },
];

const STAT_CARDS: StatCard[] = [
  { id: "ongoing", label: "Đang đấu giá", value: 2, accent: "blue" },
  { id: "sold", label: "Đã bán", value: 0, accent: "green" },
  { id: "total", label: "Tổng lượt giá", value: 30, accent: "amber" },
];

const TABS: TabOption[] = [
  { id: "ongoing", label: "Đang đấu giá" },
  { id: "sold", label: "Đã bán" },
  { id: "completed", label: "Thành công" },
];

export const useMyProducts = () => {
  const [activeTab, setActiveTab] = useState<MyProductStatus>("ongoing");

  const filteredProducts = useMemo(() => {
    if (activeTab === "completed") {
      return PRODUCT_ITEMS.filter((item) => item.status === "completed");
    }
    if (activeTab === "sold") {
      return PRODUCT_ITEMS.filter((item) => item.status === "sold");
    }

    return PRODUCT_ITEMS.filter((item) => item.status === "ongoing");
  }, [activeTab]);

  const tabSummaries = useMemo(
    () =>
      TABS.map((tab) => {
        const count = PRODUCT_ITEMS.filter((item) => item.status === tab.id).length;
        return {
          ...tab,
          count,
        };
      }),
    []
  );

  return {
    activeTab,
    setActiveTab,
    stats: STAT_CARDS,
    tabOptions: tabSummaries,
    products: filteredProducts,
  };
};

export type { MyProductItem, MyProductStatus, StatCard };