export interface Product {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  buyNowPrice: number;
  imageUrl: string;
  endTime: Date;
  bidCount: number;
  seller?: string;
  category?: string;
}
