export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Fabric {
  id: string;
  name: string;
  type: string;
  color: string;
  price: number;
}

export interface StyleConcept {
  id: string;
  name: string;
  description: string;
  images: string[];
}

export interface SavedInspiration {
  id: string;
  title: string;
  image: string;
  category: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PriceItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Order {
  id: string;
  clientId: string;
  items: PriceItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}
