export interface ProductResponse {
  productId: number;
  categoryName: string | null;
  productBrand: string;
  productImage: string;
  productName: string;
  productSku: string;
  productUrl: string;
  storeName: string | null;
  lastPrice?: number;
}
