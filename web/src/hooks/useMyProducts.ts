import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "../config/api";
import { useUser } from "../context/useUser";

type MyProductStatus = "ongoing" | "sold" | "completed";

interface MyProductItem {
  id: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  bidCount: number;
  highestBidder: string;
  status: MyProductStatus;
  orderId?: string; // For completed products
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

interface BackendOrder {
  _id: string;
  product: string;
  product_detail: {
    name: string;
    images: string[];
    start_price: number;
  };
  final_price: number;
  status: string;
  winner: string;
  seller: string;
}

interface BackendProduct {
  _id: string;
  name: string;
  images: string[];
  current_price: number;
  start_price: number;
  bid_count: number;
  current_bidder?: {
    _id: string;
    full_name: string;
  } | null;
  seller: string | { _id: string }; // Can be ObjectId string or object
  status: "active" | "sold" | "expired";
  end_date: string;
}

const TABS: TabOption[] = [
  { id: "ongoing", label: "Đang đấu giá" },
  { id: "sold", label: "Đã bán" },
  { id: "completed", label: "Đã đấu giá xong" },
];

export const useMyProducts = () => {
  const { user, token, loading: authLoading } = useUser();
  const [activeTab, setActiveTab] = useState<MyProductStatus>("ongoing");
  const [products, setProducts] = useState<MyProductItem[]>([]);
  const [wonProducts, setWonProducts] = useState<MyProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map backend product to frontend format
  const mapProduct = (product: BackendProduct): MyProductItem => {
    let status: MyProductStatus = "ongoing";
    if (product.status === "sold") {
      status = "sold";
    } else if (product.status === "expired") {
      status = "completed";
    } else if (product.status === "active") {
      status = "ongoing";
    }

    return {
      id: product._id,
      title: product.name,
      imageUrl: product.images[0] || "https://via.placeholder.com/400",
      currentPrice: product.current_price || product.start_price,
      bidCount: product.bid_count,
      highestBidder: product.current_bidder?.full_name || "no_bidder",
      status,
    };
  };

  // Map backend order to frontend format
  const mapOrderToProduct = (order: BackendOrder): MyProductItem => {
    return {
      id: order.product,
      title: order.product_detail.name,
      imageUrl: order.product_detail.images[0] || "https://via.placeholder.com/400",
      currentPrice: order.final_price,
      bidCount: 0, // Not available in order
      highestBidder: "", // Not needed
      status: "completed",
      orderId: order._id,
    };
  };

  // Fetch products from backend
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If no user/token after auth loaded, stop loading
    if (!token || !user?._id) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem sản phẩm của bạn");
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch with high limit to get all products
        const response = await fetch(
          apiUrl(`/api/products?status=all&limit=1000`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        let myProducts: BackendProduct[] = [];
        if (data.success && data.data) {
          console.log("Total products fetched:", data.data.length);
          console.log("Current user ID:", user._id);
          
          // Filter products by current user as seller
          // Convert both to strings for comparison since seller might be ObjectId
          myProducts = data.data.filter(
            (product: BackendProduct) => {
              const sellerStr = typeof product.seller === 'object' && product.seller !== null 
                ? product.seller._id?.toString() || product.seller.toString()
                : String(product.seller);
              const userIdStr = String(user._id);
              return sellerStr === userIdStr;
            }
          );
          
          console.log("My products count:", myProducts.length);
          console.log("My products:", myProducts.map((p: BackendProduct) => ({ name: p.name, seller: p.seller })));

          const mappedProducts = myProducts.map(mapProduct);
          setProducts(mappedProducts);
        }

        // Fetch won orders
        const ordersResponse = await fetch(
          apiUrl(`/api/orders/my-orders?status=all`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.success && ordersData.data) {
            // Filter orders where user is winner
            const wonOrders = ordersData.data.filter(
              (order: BackendOrder) => order.winner === user._id
            );
            const mappedWonProducts = wonOrders.map(mapOrderToProduct);
            setWonProducts(mappedWonProducts);

            // Create map of productId to orderId for sold products
            const productToOrderMap: { [key: string]: string } = {};
            ordersData.data.forEach((order: BackendOrder) => {
              if (order.seller === user._id) {
                productToOrderMap[order.product] = order._id;
              }
            });

            // Update products with orderId if sold
            const updatedProducts = myProducts.map((product: BackendProduct) => {
              const mapped = mapProduct(product);
              if (mapped.status === "sold" && productToOrderMap[product._id]) {
                mapped.orderId = productToOrderMap[product._id];
              }
              return mapped;
            });
            setProducts(updatedProducts);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?._id, token, authLoading]);

  // Filter products by active tab
  const filteredProducts = useMemo(() => {
    if (activeTab === "completed") {
      return wonProducts;
    }
    return products.filter((item) => item.status === activeTab);
  }, [activeTab, products, wonProducts]);

  // Calculate statistics
  const stats = useMemo(() => {
    const ongoingCount = products.filter((p) => p.status === "ongoing").length;
    const soldCount = products.filter((p) => p.status === "sold").length;
    const totalBids = products.reduce((sum, p) => sum + p.bidCount, 0);

    return [
      { id: "ongoing", label: "Đang đấu giá", value: ongoingCount, accent: "blue" as const },
      { id: "sold", label: "Đã bán", value: soldCount, accent: "green" as const },
      { id: "total", label: "Tổng lượt giá", value: totalBids, accent: "amber" as const },
    ];
  }, [products]);

  // Tab options with counts
  const tabSummaries = useMemo(
    () =>
      TABS.map((tab) => {
        let count = 0;
        if (tab.id === "completed") {
          count = wonProducts.length;
        } else {
          count = products.filter((item) => item.status === tab.id).length;
        }
        return {
          ...tab,
          count,
        };
      }),
    [products, wonProducts]
  );

  return {
    activeTab,
    setActiveTab,
    stats,
    tabOptions: tabSummaries,
    products: filteredProducts,
    loading,
    error,
  };
};

export type { MyProductItem, MyProductStatus, StatCard };