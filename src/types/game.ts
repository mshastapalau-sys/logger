export type GameLocation = 'FOREST' | 'MARKET' | 'STORE';

export type GameScreen = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export type TreeStage = 'stump' | 'sapling' | 'young' | 'mature' | 'ancient';

export interface DayNightCycle {
  timeOfDay: number; // 0 to 24 hours
  isNight: boolean;
  dayLengthSeconds: number;
  sunIntensity: number;
}

export interface CityGridPenalty {
  hasPenalty: boolean;
  fineAmount: number;
  remainingSeconds: number;
  isRefused: boolean;
}

export interface DeliveryTruck {
  x: number;
  y: number;
  targetY: number;
  status: 'arriving' | 'unloading' | 'parked' | 'departing';
  unloadingTimer: number;
}

export type DeliveryItemType =
  | 'solar_panel'
  | 'solar_panel_mk2'
  | 'wind_turbine'
  | 'battery_pack'
  | 'tool_chainsaw'
  | 'tool_laser'
  | 'tool_titanium_axe'
  | 'bio_fertilizer'
  | 'planter_kit'
  | 'planter_kit_mega'
  | 'auto_irrigation'
  | 'sawmill_diamond_blade'
  | 'eco_certificate'
  | 'drone_scanner';

export interface DeliveryBox {
  id: string;
  x: number;
  y: number;
  contents: DeliveryItemType;
  contentName: string;
  isOpened: boolean;
  isCarried: boolean;
  isDiscardedTrash: boolean; // Empty box left on ground
}

export interface PlacedMachine {
  id: string;
  type: 'solar_panel' | 'solar_panel_mk2' | 'wind_turbine' | 'battery_pack' | 'auto_irrigation' | 'drone_scanner';
  x: number;
  y: number;
  energyOutput: number;
}

export interface TerritoryPlot {
  id: string;
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
  unlocked: boolean;
  cost: number; // 1000
}

export interface Worker {
  id: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'idle' | 'walking' | 'chopping' | 'planting';
  wageDue: number; // 30 coins
}

export interface MarketStallStock {
  logsOnDisplay: number;
  planksOnDisplay: number;
  pricePerPlank: number;
  pricePerLog: number;
}

export interface CompetitorStall {
  id: string;
  ownerName: string;
  woodType: string;
  pricePerUnit: number;
  stockCount: number;
  x: number;
  y: number;
}

export interface StoreShelf {
  id: string;
  name: string;
  category: 'energy' | 'tool' | 'bio' | 'equipment' | 'license';
  cost: number;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  effect: string;
  isPurchased: boolean;
  deliveryItemType?: DeliveryItemType;
  icon?: string;
  badge?: string;
}

export interface NPC {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
  color: string;
  role: 'buyer' | 'citizen' | 'merchant';
  speech?: string;
  speechTimer: number;
}

export interface Tree {
  id: string;
  x: number;
  y: number;
  stage: TreeStage;
  growthProgress: number;
  woodYield: number;
  ecoValue: number;
  maxHealth: number;
  health: number;
  type: 'pine' | 'oak' | 'birch';
  plantedByPlayer?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface TeleportPad {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  zone: 'forest' | 'sawmill' | 'market' | 'solar';
  energyCost: number;
  color: string;
}

export interface TeleportState {
  isBroken: boolean;
  rebootTimer: number; // 0 to 60 seconds
  failureChance: number; // base 25%, -5% per solar panel
}

export interface InspectorState {
  nextInspectionTime: number;
  cycleDuration: number;
  minForestQuota: number;
  fineAmount: number;
  subsidyAmount: number;
  lastReport: {
    status: 'passed' | 'fined' | 'none';
    message: string;
    amount: number;
  } | null;
  strikes: number;
  nextWasteAudit: number; // Waste inspector timer
  nextSolarAudit: number; // Solar inspector timer
}

export interface PlayerStats {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  isChopping: boolean;
  money: number;
  energy: number;
  maxEnergy: number;
  logs: number;
  planks: number;
  saplings: number;
  ecoTokens: number;
  treesPlanted: number;
  treesChopped: number;
  finesPaid: number;
  subsidiesReceived: number;
  planksSold: number;
  carriedBox: DeliveryBox | null;
}

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface NotificationLogItem {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}
