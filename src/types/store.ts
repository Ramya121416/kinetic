export enum ProductCategory {
  ALL = 'All',
  OUTERWEAR = 'Outerwear',
  TAILORING = 'Tailoring',
  KNITWEAR = 'Knitwear',
  DRESSES_BAGS = 'Dresses & Bags',
  FOOTWEAR = 'Footwear',
}

export enum GenderEdit {
  ALL = 'All',
  WOMEN = 'Women',
  MEN = 'Men',
}

export enum TrialDecision {
  RETAIN = 'Retain',
  RETURN = 'Return',
}

export enum OrderStage {
  PACKING = 'Packing at Hub',
  EN_ROUTE = 'Rider En Route',
  DOORSTEP_TRIAL = 'Doorstep Trial Active',
  COMPLETED = 'Handover Complete',
}

export interface HubLocation {
  id: string;
  name: string;
  city: string;
  pincode: string;
  etaMinutes: number;
  riderPool: string;
}

export interface SizeStock {
  size: string;
  inHubCount: number;
}

export interface Product {
  id: string;
  brand: string;
  title: string;
  category: ProductCategory;
  gender: GenderEdit;
  priceInr: number;
  image: string;
  fabric: string;
  fitNote: string;
  description: string;
  sizes: SizeStock[];
  isNewArrival?: boolean;
}

export interface BagItem {
  lineId: string;
  product: Product;
  size: string;
  quantity: number;
  isBackupTrialSize?: boolean;
  decision: TrialDecision;
}

export interface CustomerCheckoutInfo {
  fullName: string;
  phone: string;
  address: string;
  pincode: string;
  paymentMode: 'try_and_buy' | 'cod_upi';
}

export interface ActiveOrder {
  orderNumber: string;
  hub: HubLocation;
  customer: CustomerCheckoutInfo;
  items: BagItem[];
  stage: OrderStage;
  riderName: string;
  etaMinutesRemaining: number;
  trialSecondsRemaining: number;
  placedAtLabel: string;
}
