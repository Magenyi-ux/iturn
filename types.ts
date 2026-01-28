
export interface Measurements {
  height: string;
  chest: string;
  waist: string;
  hips: string;
  shoulders: string;
  sleeveLength: string;
  inseam: string;
  neck: string;
}

export interface PhysicalCharacteristics {
  gender: string;
  ethnicity: string;
}

export type ViewAngle = 'front' | 'quarter' | 'side' | 'back';
export type DisplayMode = 'avatar' | 'mannequin';

export interface StyleConcept {
  id: string;
  title: string;
  description: string;
  occasion: string;
  category: 'Modern' | 'Traditional' | 'Iconic' | 'Avant-Garde' | 'Formal' | 'Casual';
  tags: string[];
  materials: string[];
  steps: string[];
  refinements?: string[]; 
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  measurements: Measurements;
  history: string[]; // Order IDs
  lastVisit: string;
}

export interface Fabric {
  id: string;
  name: string;
  type: string;
  weight: string;
  composition: string;
  imageUrl: string;
  aiAnalysis?: string;
}

export interface PriceItem {
  name: string;
  category: 'Material' | 'Labor' | 'Tool' | 'Addon';
  cost: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  clientId: string;
  styleId: string;
  fabricId: string;
  status: 'Design' | 'Cutting' | 'Basting' | 'Finishing' | 'Delivered';
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  priceBreakdown: PriceItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Material' | 'Tool' | 'Addon';
  unitCost: number;
  stock: number;
  imageUrl?: string;
}

export interface SavedInspiration {
  id: string;
  type: 'image' | 'text';
  content: string;
  title?: string;
  timestamp: string;
}

export interface AppState {
  photos: Record<string, string>;
  measurements: Measurements;
  characteristics: PhysicalCharacteristics;
  isPredicting: boolean;
  isGeneratingStyles: boolean;
  styleConcepts: StyleConcept[];
  selectedStyles: string[];
  userSuggestion: string;
  view: 'capture' | 'measurements' | 'styles' | 'vault' | 'materials' | 'workroom' | 'sketchpad' | 'analytics' | 'inspiration' | 'blueprints' | 'archive' | 'admin' | 'profile';
  clients: Client[];
  fabrics: Fabric[];
  orders: Order[];
  inventory: InventoryItem[];
  savedInspirations: SavedInspiration[];
  currentOrder?: Order;
  selectedOrderId?: string;
  selectedClientId?: string;
}

export const INITIAL_MEASUREMENTS: Measurements = {
  height: '', chest: '', waist: '', hips: '', shoulders: '', sleeveLength: '', inseam: '', neck: '',
};

export const INITIAL_CHARACTERISTICS: PhysicalCharacteristics = {
  gender: 'person',
  ethnicity: 'diverse'
};
