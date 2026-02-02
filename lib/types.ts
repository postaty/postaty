export type Category = "restaurant" | "supermarket" | "online";

export interface RestaurantFormData {
  category: "restaurant";
  restaurantName: string;
  logo: string; // base64
  mealImage: string; // base64
  mealName: string;
  newPrice: string;
  oldPrice: string;
  offerDuration?: string;
  whatsapp: string;
  cta: string;
  formats: OutputFormat[];
}

export interface SupermarketFormData {
  category: "supermarket";
  supermarketName: string;
  logo: string; // base64
  productName: string;
  productImages: string[]; // base64[]
  weight?: string;
  offerDuration?: string;
  whatsapp: string;
  headline: string;
  cta: string;
  formats: OutputFormat[];
}

export interface OnlineFormData {
  category: "online";
  shopName: string;
  logo: string; // base64
  productImage: string; // base64
  productName: string;
  price: string;
  discount?: string;
  shipping: "free" | "paid";
  whatsapp: string;
  headline: string;
  cta: string;
  formats: OutputFormat[];
}

export type PostFormData =
  | RestaurantFormData
  | SupermarketFormData
  | OnlineFormData;

export type OutputFormat = "instagram-square" | "instagram-story" | "facebook-post";

export interface FormatConfig {
  label: string;
  aspectRatio: string;
  size: string; // WxH for gpt-image-1
  width: number;
  height: number;
}

export interface GenerationResult {
  format: OutputFormat;
  imageBase64: string;
  status: "pending" | "generating" | "complete" | "error";
  error?: string;
}

export interface GenerationState {
  step: "idle" | "crafting-prompt" | "generating-images" | "complete" | "error";
  currentFormat?: OutputFormat;
  results: GenerationResult[];
  error?: string;
  craftedPrompt?: string;
}
