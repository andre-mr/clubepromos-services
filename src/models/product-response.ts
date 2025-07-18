import { PriceHistory } from "./price-history";

export interface ProductResponse {
  productId: number;
  categoryName: string | null;
  createdAt: Date | null;
  verifiedAt: Date | null;
  discountRate: number;
  priceHistory?: PriceHistory[];
  productBrand: string;
  productImage: string;
  productName: string;
  productSku: string;
  productUrl: string;
  storeName: string | null;
}
