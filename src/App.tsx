import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tree,
  TeleportPad,
  PlayerStats,
  InspectorState,
  TreeStage,
  GameLocation,
  NPC,
  DayNightCycle,
  CityGridPenalty,
  StoreShelf,
  DeliveryBox,
  PlacedMachine,
  TerritoryPlot,
  Worker,
  MarketStallStock,
  CompetitorStall,
  TutorialStep,
  NotificationLogItem,
} from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { DECORATIVE_STALLS } from './types/marketStalls';
import { HUD } from './components/HUD';
import { TutorialQuestBar } from './components/TutorialQuestBar';
import { TerritoryModal } from './components/TerritoryModal';
import { WorkerHireModal } from './components/WorkerHireModal';
import { PlayerStallModal } from './components/PlayerStallModal';
import { CompetitorModal } from './components/CompetitorModal';
import { CityFineModal } from './components/CityFineModal';
import { BankruptcyModal } from './components/BankruptcyModal';
import { NotificationLogModal } from './components/NotificationLogModal';
import { RulesModal } from './components/RulesModal';
import { UpgradesModal } from './components/UpgradesModal';
import { TeleportGlitchModal } from './components/TeleportGlitchModal';
import { VictoryModal, GameOverModal } from './components/EndGameModals';
import { sounds } from './utils/audio';
import { Bell } from 'lucide-react';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

const INITIAL_NPCS: NPC[] = [
  {
    id: 'npc-1',
    x: 230,
    y: 280,
    targetX: 230,
    targetY: 280,
    speed: 1.2,
    direction: 'up',
    color: '#0284c7',
    role: 'buyer',
    speech: 'Ищу качественные сухие доски!',
    speechTimer: 10,
  },
  {
    id: 'npc-2',
    x: 480,
    y: 350,
    targetX: 520,
    targetY: 420,
    speed: 0.9,
    direction: 'right',
    color: '#ea580c',
    role: 'citizen',
    speech: 'У Бориса сырая древесина...',
    speechTimer: 12,
  },
  {
    id: 'npc-3',
    x: 750,
    y: 290,
    targetX: 720,
    targetY: 250,
    speed: 0.8,
    direction: 'left',
    color: '#16a34a',
    role: 'merchant',
    speech: 'Саженцы 20$ за 2 штуки — отличная цена!',
    speechTimer: 15,
  },
  {
    id: 'npc-4',
    x: 340,
    y: 430,
    targetX: 380,
    targetY: 400,
    speed: 1.0,
    direction: 'down',
    color: '#9333ea',
    role: 'buyer',
    speech: 'Куплю пару досок для ремонта дачи!',
    speechTimer: 8,
  },
  {
    id: 'npc-5',
    x: 620,
    y: 500,
    targetX: 580,
    targetY: 480,
    speed: 0.7,
    direction: 'up',
    color: '#e11d48',
    role: 'citizen',
    speech: 'Главное — не забывать сажать лес!',
    speechTimer: 14,
  },
];

const INITIAL_TELEPORTS: TeleportPad[] = [
  {
    id: 'solar',
    name: '1. Солнечная Станция',
    description: 'Быстрая зарядка ранцевых аккумуляторов',
    x: 195,
    y: 195,
    zone: 'solar',
    energyCost: 15,
    color: '#06b6d4',
  },
  {
    id: 'sawmill',
    name: '2. Эко-Лесопилка',
    description: 'Переработка брёвен в строительные доски',
    x: 530,
    y: 195,
    zone: 'sawmill',
    energyCost: 15,
    color: '#d97706',
  },
  {
    id: 'market',
    name: '3. Телепорт на Городской Рынок',
    description: 'Дневной рынок: прилавки, конкуренты, саженцы 20$ за 2 шт.',
    x: 840,
    y: 125,
    zone: 'market',
    energyCost: 15,
    color: '#10b981',
  },
  {
    id: 'forest',
    name: '4. Глубокий Лес',
    description: 'Лесные сектора и поляны для посадок',
    x: 500,
    y: 520,
    zone: 'forest',
    energyCost: 15,
    color: '#22c55e',
  },
];

const INITIAL_PLOTS: TerritoryPlot[] = [
  { id: 'plot-0-0', row: 0, col: 0, unlocked: false, cost: 1000 },
  { id: 'plot-0-1', row: 0, col: 1, unlocked: true, cost: 1000 }, // Center-top unlocked
  { id: 'plot-0-2', row: 0, col: 2, unlocked: true, cost: 1000 }, // Top-right unlocked (Tesla car location)
  { id: 'plot-1-0', row: 1, col: 0, unlocked: false, cost: 1000 },
  { id: 'plot-1-1', row: 1, col: 1, unlocked: true, cost: 1000 }, // Center unlocked
  { id: 'plot-1-2', row: 1, col: 2, unlocked: false, cost: 1000 },
  { id: 'plot-2-0', row: 2, col: 0, unlocked: false, cost: 1000 },
  { id: 'plot-2-1', row: 2, col: 1, unlocked: false, cost: 1000 },
  { id: 'plot-2-2', row: 2, col: 2, unlocked: false, cost: 1000 },
];

const INITIAL_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Срубите первое дерево',
    description: 'Подойдите к сосне или дубу и нажмите ЛКМ или ПРОБЕЛ, чтобы срубить бревно.',
    completed: false,
  },
  {
    id: 2,
    title: 'Распилите брёвна на лесопилке',
    description: 'Подойдите к лесопилке в центре и нажмите ПРОБЕЛ для распила в доски.',
    completed: false,
  },
  {
    id: 3,
    title: 'Телепортируйтесь на Рынок [T] и разложите доски',
    description: 'Шагните в телепорт [T], подойдите к вашему прилавку и нажмите [E], чтобы выложить доски.',
    completed: false,
  },
  {
    id: 4,
    title: 'Купите генератор или панель в Строймаркете',
    description: 'Зайдите в Строймаркет на рынке, подойдите к стеллажу и купите оборудование с доставкой.',
    completed: false,
  },
  {
    id: 5,
    title: 'Встретьте фуру и утилизируйте коробку в бак',
    description: 'Откройте коробку [E]. Обязательно выбросьте пустую коробку в мусорный бак (эко-бонус +5 Br).',
    completed: false,
  },
  {
    id: 6,
    title: 'Расклейте объявления и наймите рабочего',
    description: 'Подойдите к Доске вакансий на рынке, расклейте листовки за 25 Br и платите рабочим з/п 30 Br.',
    completed: false,
  },
  {
    id: 7,
    title: 'Купите новый квадрат территории за 1000 Br',
    description: 'Накопите 1000 Br и откройте 2-й из 9 квадратов территории, нажав на карту!',
    completed: false,
  },
];

const INITIAL_COMPETITORS: CompetitorStall[] = [
  {
    id: 'comp-1',
    ownerName: 'Лавка Лесоруба Бориса',
    woodType: 'Сырые брёвна сосны',
    pricePerUnit: 22,
    stockCount: 18,
    x: 750,
    y: 175,
  },
  {
    id: 'comp-2',
    ownerName: 'Северная Тайга',
    woodType: 'Необработанная берёза',
    pricePerUnit: 25,
    stockCount: 12,
    x: 750,
    y: 310,
  },
];

export default function App() {
  const [location, setLocation] = useState<GameLocation>('FOREST');
  const [gameState, setGameState] = useState<'PLAYING' | 'VICTORY' | 'GAMEOVER'>('PLAYING');

  // Day/Night Cycle
  const [dayNight, setDayNight] = useState<DayNightCycle>({
    timeOfDay: 10.0,
    isNight: false,
    dayLengthSeconds: 120,
    sunIntensity: 0.8,
  });

  // Territory 9 plots
  const [plots, setPlots] = useState<TerritoryPlot[]>(INITIAL_PLOTS);
  const [showTerritoryModal, setShowTerritoryModal] = useState<boolean>(false);

  // Delivery Boxes from Truck
  const [deliveryBoxes, setDeliveryBoxes] = useState<DeliveryBox[]>([]);
  // Placed Machines (Solar Panels, Wind Turbines)
  const [placedMachines, setPlacedMachines] = useState<PlacedMachine[]>([]);

  // Workers
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showHireModal, setShowHireModal] = useState<boolean>(false);

  // Player Market Stall
  const [playerStallStock, setPlayerStallStock] = useState<MarketStallStock>({
    logsOnDisplay: 0,
    planksOnDisplay: 6,
    pricePerPlank: 18,
    pricePerLog: 12,
  });
  const [showStallModal, setShowStallModal] = useState<boolean>(false);

  // Competitor stall inspect
  const [inspectedCompetitor, setInspectedCompetitor] = useState<CompetitorStall | null>(null);

  // Tutorial Quests
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>(INITIAL_TUTORIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // City Power Grid Penalty (5 min = 300s)
  const [gridPenalty, setGridPenalty] = useState<CityGridPenalty>({
    hasPenalty: false,
    fineAmount: 80,
    remainingSeconds: 300,
    isRefused: false,
  });
  const [showGridModal, setShowGridModal] = useState<boolean>(false);
  const cityEnergyUsageCounter = useRef<number>(0);

  // Player state
  const [player, setPlayer] = useState<PlayerStats>({
    x: 500,
    y: 320,
    direction: 'down',
    isMoving: false,
    isChopping: false,
    money: 140,
    energy: 100,
    maxEnergy: 100,
    logs: 0,
    planks: 4,
    saplings: 6,
    ecoTokens: 0,
    treesPlanted: 0,
    treesChopped: 0,
    finesPaid: 0,
    subsidiesReceived: 0,
    planksSold: 0,
    carriedBox: null,
  });

  // Upgrades & Hardware Store Shelves
  const [axeLevel, setAxeLevel] = useState<number>(1);
  const [hasBioFertilizer, setHasBioFertilizer] = useState<boolean>(false);
  const [hasEcoCertificate, setHasEcoCertificate] = useState<boolean>(false);
  const [sawmillBonus, setSawmillBonus] = useState<boolean>(false);
  const [hasDroneScanner, setHasDroneScanner] = useState<boolean>(false);

  const [shelves, setShelves] = useState<StoreShelf[]>([
    // --- РЯД 1 (ВЕРХНИЕ СТЕЛЛАЖИ: ЭНЕРГЕТИКА И ТОПОРЫ) ---
    {
      id: 'shelf-solar',
      name: 'Солнечная Панель Mk.1',
      category: 'energy',
      cost: 200,
      x: 50,
      y: 135,
      width: 195,
      height: 105,
      description: 'Кристаллическая солнечная батарея. Снижает риск аварии телепорта на -5%. Доставка фурой.',
      effect: '+15 кВт·ч энергии, телепорт -5% сбоев',
      isPurchased: false,
      deliveryItemType: 'solar_panel',
    },
    {
      id: 'shelf-solar-2',
      name: 'Солнечная Панель Mk.2 Pro',
      category: 'energy',
      cost: 450,
      x: 285,
      y: 135,
      width: 195,
      height: 105,
      description: 'Усиленная монокристаллическая электростанция. Защищает энергосистему леса и портала.',
      effect: '+35 кВт·ч генерации, телепорт -10% сбоев',
      isPurchased: false,
      deliveryItemType: 'solar_panel_mk2',
    },
    {
      id: 'shelf-tool-titanium',
      name: 'Титановый Топор Дровосека',
      category: 'tool',
      cost: 90,
      x: 520,
      y: 135,
      width: 195,
      height: 105,
      description: 'Сверхпрочный сплав титана и углеволокна. Увеличивает силу удара по деревьям в 2 раза.',
      effect: 'Урон рубки x2, лёгкий размах',
      isPurchased: false,
      deliveryItemType: 'tool_titanium_axe',
    },
    {
      id: 'shelf-tool-2',
      name: 'Электропила «Лес-1»',
      category: 'tool',
      cost: 160,
      x: 755,
      y: 135,
      width: 195,
      height: 105,
      description: 'Шинная пила с закалённой цепью. Быстрая срезка и +1 дополнительное бревно с дерева!',
      effect: 'Скорость x2, добыча +1 бревно',
      isPurchased: false,
      deliveryItemType: 'tool_chainsaw',
    },

    // --- РЯД 2 (СРЕДНИЕ СТЕЛЛАЖИ: ВЕТРЯКИ, БАТАРЕИ, ЛАЗЕР, ДИСК) ---
    {
      id: 'shelf-wind',
      name: 'Эко-Ветрогенератор',
      category: 'energy',
      cost: 350,
      x: 50,
      y: 285,
      width: 195,
      height: 105,
      description: 'Высокий аэродинамический ветряк. Вращается день и ночь, генерируя ток для базы.',
      effect: 'Круглосуточная выработка тока ветром',
      isPurchased: false,
      deliveryItemType: 'wind_turbine',
    },
    {
      id: 'shelf-battery',
      name: 'Аккумулятор PowerBank 5000',
      category: 'energy',
      cost: 280,
      x: 285,
      y: 285,
      width: 195,
      height: 105,
      description: 'Промышленный шкаф литиевых батарей. Накапливает избыток тока и стабилизирует сеть.',
      effect: 'Резервное питание, стабилизация сети',
      isPurchased: false,
      deliveryItemType: 'battery_pack',
    },
    {
      id: 'shelf-tool-3',
      name: 'Бионический Лазер «Тайга»',
      category: 'tool',
      cost: 420,
      x: 520,
      y: 285,
      width: 195,
      height: 105,
      description: 'Импульсный лазерный луч срезает даже вековые сосны за 1 секунду без шума!',
      effect: 'Мгновенная рубка x3 урона',
      isPurchased: false,
      deliveryItemType: 'tool_laser',
    },
    {
      id: 'shelf-sawmill-blade',
      name: 'Алмазный Диск Лесопилки',
      category: 'equipment',
      cost: 250,
      x: 755,
      y: 285,
      width: 195,
      height: 105,
      description: 'Алмазное напыление зубьев: каждое бревно даёт 3 доски вместо 2 (+50% к выходу продукции)!',
      effect: '+50% досок из брёвен (3 шт вместо 2)',
      isPurchased: false,
      deliveryItemType: 'sawmill_diamond_blade',
    },

    // --- РЯД 3 (НИЖНИЕ СТЕЛЛАЖИ: САД, САЖЕНЦЫ И УДОБРЕНИЯ) ---
    {
      id: 'shelf-planter',
      name: 'Оптовый Пакет Саженцев (+15)',
      category: 'bio',
      cost: 100,
      x: 50,
      y: 435,
      width: 195,
      height: 105,
      description: 'Партия из 15 отборных саженцев сосны и дуба. Помогает восстановить лес и избежать штрафов.',
      effect: '+15 саженцев сразу в инвентарь',
      isPurchased: false,
      deliveryItemType: 'planter_kit',
    },
    {
      id: 'shelf-planter-mega',
      name: 'Мега-Пак Саженцев (+35)',
      category: 'bio',
      cost: 220,
      x: 285,
      y: 435,
      width: 195,
      height: 105,
      description: 'Большой питомник на 35 саженцев. Быстрейший способ вырастить 1,000 деревьев для победы!',
      effect: '+35 саженцев (+награда 20 Br за каждое)',
      isPurchased: false,
      deliveryItemType: 'planter_kit_mega',
    },
    {
      id: 'shelf-bio',
      name: 'Био-Ускоритель Роста',
      category: 'bio',
      cost: 140,
      x: 520,
      y: 435,
      width: 195,
      height: 105,
      description: 'Органический стимулятор хлорофилла. Саженцы развиваются во взрослые деревья в 2 раза быстрее!',
      effect: 'Рост всех саженцев ускорен x2',
      isPurchased: false,
      deliveryItemType: 'bio_fertilizer',
    },
    {
      id: 'shelf-irrigation',
      name: 'Система Авто-Орошения',
      category: 'equipment',
      cost: 300,
      x: 755,
      y: 435,
      width: 195,
      height: 105,
      description: 'Резервуар с форсунками туманообразования. Питает почву влагой и защищает от засухи.',
      effect: 'Автоматическое увлажнение почвы леса',
      isPurchased: false,
      deliveryItemType: 'auto_irrigation',
    },

    // --- БОКОВЫЕ СЕКЦИИ (НИЗ: ЛИЦЕНЗИИ И ДРОНЫ) ---
    {
      id: 'shelf-eco-cert',
      name: 'Гос-Эко-Сертификат',
      category: 'license',
      cost: 150,
      x: 80,
      y: 575,
      width: 200,
      height: 90,
      description: 'Государственная лицензия ответственного лесопользователя. Снижает штраф со 100 Br до 70 Br!',
      effect: 'Штраф инспектора снижен со 100 до 70 Br',
      isPurchased: false,
      deliveryItemType: 'eco_certificate',
    },
    {
      id: 'shelf-drone',
      name: 'Дрон-Сканер «Лесник-4»',
      category: 'license',
      cost: 380,
      x: 720,
      y: 575,
      width: 200,
      height: 90,
      description: 'Автономный квадрокоптер. Ведёт аэрофотосъёмку леса, мониторит спелые деревья и приближение проверки.',
      effect: 'Аэро-сканирование леса и мониторинг',
      isPurchased: false,
      deliveryItemType: 'drone_scanner',
    },
  ]);

  // Modals & Settings
  const [showRules, setShowRules] = useState<boolean>(true);
  const [showBankruptcyModal, setShowBankruptcyModal] = useState<boolean>(false);
  const [showNotificationLogModal, setShowNotificationLogModal] = useState<boolean>(false);
  const [showUpgradesModal, setShowUpgradesModal] = useState<boolean>(false);
  const [isTeleportBroken, setIsTeleportBroken] = useState<boolean>(false);
  const [teleportRebootTimer, setTeleportRebootTimer] = useState<number>(0);
  const [showTeleportGlitchModal, setShowTeleportGlitchModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<'BANKRUPTCY' | 'STRIKES' | 'FINES' | 'NO_TREES_NO_MONEY'>('NO_TREES_NO_MONEY');

  // Solar panels count
  const solarPanelsCount = placedMachines.filter((m) => m.type.startsWith('solar_panel')).length;

  // Teleport failure risk: starts at 25%, decreases with placed green energy machines!
  const totalGreenPower = placedMachines.reduce((sum, m) => sum + (m.energyOutput || 0.4), 0);
  const teleportFailureChance = Math.max(0, Math.round(25 - totalGreenPower * 10));

  // Inspector State
  const [inspector, setInspector] = useState<InspectorState>({
    nextInspectionTime: 50,
    cycleDuration: 50,
    minForestQuota: 45,
    fineAmount: 140,
    subsidyAmount: 100,
    lastReport: null,
    strikes: 0,
    nextWasteAudit: 45, // Проверка мусора
    nextSolarAudit: 60, // Проверка солнечной станции
  });

  const [trees, setTrees] = useState<Tree[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>(INITIAL_NPCS);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const nextTextId = useRef(1);

  const [notificationLogs, setNotificationLogs] = useState<NotificationLogItem[]>([
    {
      id: 1,
      text: 'Добро пожаловать в Эко-Лесоруб! Рубите зрелые деревья, сажайте саженцы за 20$, развивайте прилавок на рынке.',
      type: 'info',
      timestamp: 'Старт',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(
    'Разложите доски на прилавке рынка, заказывайте технику на фуре и не мусорите коробками!'
  );

  const logNotification = useCallback((text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setNotificationLogs((prev) => [
      { id: Date.now() + Math.random(), text, type, timestamp: time },
      ...prev.slice(0, 49),
    ]);
    setToastMessage(text);
  }, []);

  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#ffffff') => {
    const id = nextTextId.current++;
    setFloatingTexts((prev) => [
      ...prev,
      { id, text, x, y, color, life: 10, maxLife: 10 },
    ]);
  }, []);

  // Complete tutorial step helper
  const completeTutorialStep = useCallback((stepId: number) => {
    setTutorialSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: true } : s))
    );
    setCurrentStepIndex((prev) => Math.min(prev + 1, INITIAL_TUTORIAL_STEPS.length - 1));
  }, []);

  // Init forest (ONLY inside initially unlocked plots, trees on locked plots appear after buying)
  const initForest = useCallback(() => {
    const newTrees: Tree[] = [];
    const types: Array<'pine' | 'oak' | 'birch'> = ['pine', 'oak', 'birch'];

    // Spawn 10 trees exclusively within the initially unlocked central forest plot (plot-1-1: x: 345..655, y: 290..480)
    for (let i = 0; i < 10; i++) {
      const x = 360 + (i % 4) * 75 + (Math.random() * 20 - 10);
      const y = 300 + Math.floor(i / 4) * 60 + (Math.random() * 20 - 10);
      newTrees.push({
        id: `tree-${i}`,
        x,
        y,
        stage: 'mature',
        growthProgress: 100,
        woodYield: 2,
        ecoValue: 2,
        maxHealth: 3,
        health: 3,
        type: types[i % 3],
      });
    }

    // Single grand Ancient Oak tree in the central glade of plot-1-1
    newTrees.push({
      id: 'ancient-center',
      x: 500,
      y: 430,
      stage: 'ancient',
      growthProgress: 100,
      woodYield: 4,
      ecoValue: 5,
      maxHealth: 5,
      health: 5,
      type: 'oak',
    });

    setTrees(newTrees);
  }, []);

  // Full Restart function (Сброс карты и всей партии)
  const handleFullRestart = useCallback(() => {
    initForest();
    setPlots(INITIAL_PLOTS);
    setPlayer({
      x: 500,
      y: 320,
      direction: 'down',
      isMoving: false,
      isChopping: false,
      money: 140,
      energy: 100,
      maxEnergy: 100,
      logs: 0,
      planks: 4,
      saplings: 6,
      ecoTokens: 0,
      treesPlanted: 0,
      treesChopped: 0,
      finesPaid: 0,
      subsidiesReceived: 0,
      planksSold: 0,
      carriedBox: null,
    });
    setAxeLevel(1);
    setHasBioFertilizer(false);
    setHasEcoCertificate(false);
    setShelves((prev) => prev.map((s) => ({ ...s, isPurchased: false })));
    setDeliveryBoxes([]);
    setPlacedMachines([]);
    setWorkers([]);
    setPlayerStallStock({
      logsOnDisplay: 0,
      planksOnDisplay: 6,
      pricePerPlank: 18,
      pricePerLog: 12,
    });
    setInspector({
      nextInspectionTime: 50,
      cycleDuration: 50,
      minForestQuota: 45,
      fineAmount: 140,
      subsidyAmount: 100,
      lastReport: null,
      strikes: 0,
      nextWasteAudit: 45,
      nextSolarAudit: 60,
    });
    setDayNight({
      timeOfDay: 10.0,
      isNight: false,
      dayLengthSeconds: 120,
      sunIntensity: 0.8,
    });
    setGridPenalty({
      hasPenalty: false,
      fineAmount: 80,
      remainingSeconds: 300,
      isRefused: false,
    });
    setTutorialSteps(INITIAL_TUTORIAL_STEPS);
    setCurrentStepIndex(0);
    setLocation('FOREST');
    setGameState('PLAYING');
    setFloatingTexts([]);
    setNpcs(INITIAL_NPCS);
    setIsTeleportBroken(false);
    setTeleportRebootTimer(0);
    setShowTeleportGlitchModal(false);

    logNotification('КАРТА СБРОШЕНА: Лес восстановлен, территория и капитал сброшены к началу.', 'info');
    addFloatingText('Карта сброшена! 🌲', 500, 320, '#10b981');
    sounds.playTeleport();
  }, [initForest, logNotification, addFloatingText]);

  // Declare Bankruptcy action (Кнопка Банкрот)
  const handleConfirmBankruptcy = () => {
    sounds.playFine();
    setGameOverReason('BANKRUPTCY');
    setGameState('GAMEOVER');
    setShowBankruptcyModal(false);
    logNotification('Компания объявлена банкротом! Вы признали финансовую несостоятельность.', 'error');
  };

  // Teleport Repair: Pay 100 coins to fix immediately
  const handlePay100Teleport = useCallback(() => {
    if (player.money < 100) {
      setToastMessage('Не хватает 100$ для экспресс-ремонта телепорта!');
      sounds.playLowEnergy();
      return;
    }
    sounds.playCoin();
    sounds.playReboot();
    setPlayer((prev) => ({ ...prev, money: prev.money - 100 }));
    setIsTeleportBroken(false);
    setTeleportRebootTimer(0);
    setShowTeleportGlitchModal(false);
    addFloatingText('Телепорт запущен! -100 Br', player.x, player.y - 30, '#10b981');
    logNotification('⚡ Оплачено 100 Br за экспресс-ремонт: телепорт немедленно активирован!', 'success');
  }, [player.money, player.x, player.y, addFloatingText, logNotification]);

  // Teleport Repair: Wait 1 minute for automatic reboot
  const handleWait1MinTeleport = useCallback(() => {
    if (teleportRebootTimer <= 0) {
      setTeleportRebootTimer(60);
    }
    setToastMessage('Аварийный таймер: авто-перезагрузка телепорта через 60 сек.');
    logNotification('Запущен таймер авто-перезагрузки телепорта (60 секунд). Ожидайте или оплатите 100 Br.', 'warning');
  }, [teleportRebootTimer, logNotification]);

  // Countdown timer for teleport reboot
  useEffect(() => {
    if (!isTeleportBroken || teleportRebootTimer <= 0) return;
    const timer = setInterval(() => {
      setTeleportRebootTimer((prev) => {
        if (prev <= 1) {
          setIsTeleportBroken(false);
          sounds.playReboot();
          logNotification('⚡ Телепорт автоматически перезагрузился и готов к работе!', 'success');
          addFloatingText('Телепорт включён!', player.x, player.y - 30, '#10b981');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTeleportBroken, teleportRebootTimer, player.x, player.y, logNotification, addFloatingText]);

  // Upgrade Handlers
  const handleUpgradeAxe = () => {
    const cost = axeLevel === 1 ? 160 : axeLevel === 2 ? 420 : 0;
    if (cost === 0 || player.money < cost) {
      setToastMessage(`Не хватает денег для апгрейда инструмента! Нужно ${cost} Br.`);
      return;
    }
    sounds.playCoin();
    setPlayer((prev) => ({ ...prev, money: prev.money - cost }));
    const nextLvl = axeLevel + 1;
    setAxeLevel(nextLvl);
    const name = nextLvl === 2 ? 'Электропила "Лес-1"' : 'Бионический Лазер';
    addFloatingText(`Инструмент: ${name}!`, player.x, player.y - 35, '#a855f7');
    logNotification(`Апгрейд инструмента куплен: ${name}! Скорость рубки и выход древесины увеличены.`, 'success');
  };

  const handleBuySaplingsBundle = () => {
    const cost = 100;
    if (player.money < cost) {
      setToastMessage(`Нужно ${cost} Br для покупки оптового пакета из 15 саженцев!`);
      return;
    }
    sounds.playCoin();
    setPlayer((prev) => ({
      ...prev,
      money: prev.money - cost,
      saplings: prev.saplings + 15,
    }));
    addFloatingText('+15 Саженцев!', player.x, player.y - 35, '#4ade80');
    logNotification('Куплен оптовый пакет из 15 саженцев! Посадите их в лесу (+20 Br за каждое посаженное дерево).', 'success');
  };

  const handleBuyBioFertilizer = () => {
    const cost = 140;
    if (player.money < cost) {
      setToastMessage(`Нужно ${cost} Br для покупки био-удобрения!`);
      return;
    }
    sounds.playCoin();
    setPlayer((prev) => ({ ...prev, money: prev.money - cost }));
    setHasBioFertilizer(true);
    addFloatingText('Био-Ускоритель активирован!', player.x, player.y - 35, '#10b981');
    logNotification('Био-Ускоритель куплен! Саженцы растут во взрослые деревья в разы быстрее.', 'success');
  };

  const handleBuyEcoCertificate = () => {
    const cost = 250;
    if (player.money < cost) {
      setToastMessage(`Нужно ${cost} Br для получения эко-сертификата!`);
      return;
    }
    sounds.playCoin();
    setPlayer((prev) => ({ ...prev, money: prev.money - cost }));
    setHasEcoCertificate(true);
    addFloatingText('Зелёный Стандарт получен!', player.x, player.y - 35, '#f59e0b');
    logNotification('Сертификат «Зелёный Стандарт» получен! Субсидии выше, штрафы мягче.', 'success');
  };

  useEffect(() => {
    initForest();
  }, [initForest]);

  // Forest health
  const calculateForestHealth = useCallback((): number => {
    if (trees.length === 0) return 0;
    let score = 0;
    trees.forEach((t) => {
      if (t.stage === 'ancient') score += 4;
      else if (t.stage === 'mature') score += 2;
      else if (t.stage === 'young') score += 1;
      else if (t.stage === 'sapling') score += 0.5;
    });
    return Math.min(100, Math.max(0, (score / 44) * 100));
  }, [trees]);

  const currentForestHealth = calculateForestHealth();
  const livingTreesCount = trees.filter((t) => t.stage !== 'stump').length;

  // Defeat condition: "Проигрышь защитываеться после того как у тебя нету деревьев и денег 0"
  useEffect(() => {
    if (gameState !== 'PLAYING' || trees.length === 0) return;
    const livingCount = trees.filter((t) => t.stage !== 'stump').length;
    if (livingCount === 0 && player.money <= 0 && player.saplings <= 0) {
      setGameOverReason('NO_TREES_NO_MONEY');
      setGameState('GAMEOVER');
      sounds.playFine();
      logNotification('ПРОИГРЫШ: В лесу не осталось деревьев (0) и денег 0 Br! Игра окончена.', 'error');
    }
  }, [trees, player.money, player.saplings, gameState, logNotification]);

  // Find nearby shelf in STORE
  const getNearbyShelf = (): StoreShelf | null => {
    if (location !== 'STORE') return null;
    for (const shelf of shelves) {
      const cx = shelf.x + shelf.width / 2;
      const cy = shelf.y + shelf.height / 2;
      if (Math.hypot(player.x - cx, player.y - cy) < 95) return shelf;
    }
    return null;
  };
  const nearbyShelf = getNearbyShelf();

  // Find nearby delivery box in FOREST
  const getNearbyBox = (): DeliveryBox | null => {
    if (location !== 'FOREST') return null;
    for (const box of deliveryBoxes) {
      if (Math.hypot(player.x - box.x, player.y - box.y) < 45) return box;
    }
    return null;
  };
  const nearbyBox = getNearbyBox();

  // -------------------------------------------------------------
  // CUSTOMER PURCHASES AT PLAYER STALL
  // Customers walk up to the player's stall and buy 1-2 items!
  // -------------------------------------------------------------
  useEffect(() => {
    if (location !== 'MARKET' || gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      if (playerStallStock.planksOnDisplay > 0 || playerStallStock.logsOnDisplay > 0) {
        // Customer buys 1-2 items
        const isPlank = playerStallStock.planksOnDisplay > 0;
        const count = Math.min(isPlank ? playerStallStock.planksOnDisplay : playerStallStock.logsOnDisplay, Math.random() > 0.5 ? 2 : 1);
        const price = isPlank ? playerStallStock.pricePerPlank : playerStallStock.pricePerLog;
        const totalEarned = count * price;

        sounds.playCoin();
        setPlayer((prev) => {
          const newMoney = prev.money + totalEarned;
          if (prev.treesPlanted >= 1000 && newMoney >= 100000 && gameState === 'PLAYING') {
            setGameState('VICTORY');
            sounds.playMegaBoost();
            logNotification('🏆 ВЕЛИКАЯ ПОБЕДА! Вы посадили 1,000 деревьев и заработали 100,000 Br!', 'success');
          }
          return {
            ...prev,
            money: newMoney,
            planksSold: prev.planksSold + count,
          };
        });

        setPlayerStallStock((prev) => ({
          ...prev,
          planksOnDisplay: isPlank ? prev.planksOnDisplay - count : prev.planksOnDisplay,
          logsOnDisplay: !isPlank ? prev.logsOnDisplay - count : prev.logsOnDisplay,
        }));

        addFloatingText(`+${totalEarned} Br Куплено ${count} шт`, 200, 230, '#10b981');
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [location, gameState, playerStallStock]);

  // -------------------------------------------------------------
  // WORKER ACTIONS & WAGES
  // -------------------------------------------------------------
  useEffect(() => {
    if (gameState !== 'PLAYING' || workers.length === 0) return;

    const interval = setInterval(() => {
      // Workers plant saplings or chop random tree in unlocked plots
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) => {
          // Worker plants or chops
          if (Math.random() < 0.3) {
            // Plant sapling
            setTrees((prevTrees) => [
              ...prevTrees,
              {
                id: `worker-tree-${Date.now()}-${Math.random()}`,
                x: 100 + Math.random() * 800,
                y: 280 + Math.random() * 350,
                stage: 'sapling',
                growthProgress: 0,
                woodYield: 2,
                ecoValue: 2,
                maxHealth: 1,
                health: 1,
                type: 'pine',
              },
            ]);
          }
          return {
            ...w,
            x: Math.max(50, Math.min(950, w.x + (Math.random() * 40 - 20))),
            y: Math.max(250, Math.min(650, w.y + (Math.random() * 40 - 20))),
          };
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [gameState, workers]);

  // Main Tick Loop: Day/Night, Inspectors, Solar Charging
  useEffect(() => {
    if (gameState !== 'PLAYING' || showRules) return;

    const interval = setInterval(() => {
      // 1. Advance Day/Night time
      setDayNight((prev) => {
        const hoursDelta = (24 / prev.dayLengthSeconds) * 0.5;
        let nextHour = (prev.timeOfDay + hoursDelta) % 24;
        const isNight = nextHour >= 20.0 || nextHour < 6.0;

        let sunIntensity = 0;
        if (!isNight) {
          const noonDiff = Math.abs(13 - nextHour);
          sunIntensity = Math.max(0.2, 1 - noonDiff / 7);
        }

        return {
          ...prev,
          timeOfDay: nextHour,
          isNight,
          sunIntensity,
        };
      });

      // 2. City Grid Penalty Countdown
      setGridPenalty((prev) => {
        if (!prev.hasPenalty) return prev;
        const remaining = prev.remainingSeconds - 0.5;
        if (remaining <= 0) {
          addFloatingText('Энергосеть разблокирована!', player.x, player.y - 30, '#10b981');
          setToastMessage('5 минут штрафа истекли! Городская энергосеть и телепорт снова включены.');
          return {
            ...prev,
            hasPenalty: false,
            remainingSeconds: 300,
            isRefused: false,
          };
        }
        return {
          ...prev,
          remainingSeconds: remaining,
        };
      });

      // 3. Tree growth (daytime only)
      if (!dayNight.isNight) {
        const hasAutoIrrigation = placedMachines.some((m) => m.type === 'auto_irrigation');
        const growthStep = (hasBioFertilizer ? 3.5 : 1.8) + (hasAutoIrrigation ? 1.2 : 0);
        setTrees((prevTrees) =>
          prevTrees.map((tree) => {
            if (tree.stage === 'stump' || tree.stage === 'mature' || tree.stage === 'ancient') return tree;

            const nextProg = tree.growthProgress + growthStep;

            let nextStage: TreeStage = tree.stage;
            let nextHealth = tree.health;
            let nextMaxHealth = tree.maxHealth;

            if (tree.stage === 'sapling' && nextProg >= 40) {
              nextStage = 'young';
              nextHealth = 2;
              nextMaxHealth = 2;
            } else if (tree.stage === 'young' && nextProg >= 100) {
              nextStage = 'mature';
              nextHealth = 3;
              nextMaxHealth = 3;
            }

            return {
              ...tree,
              stage: nextStage,
              growthProgress: nextProg,
              health: nextHealth,
              maxHealth: nextMaxHealth,
            };
          })
        );
      }

      // 4. Floating text
      setFloatingTexts((prev) =>
        prev
          .map((ft) => ({ ...ft, life: ft.life - 1, y: ft.y - 0.4 }))
          .filter((ft) => ft.life > 0)
      );

      // 6. Update NPCs on Market
      if (location === 'MARKET') {
        const phrases = [
          'Куплю доски для дачи!',
          'У Бориса дерево сырое...',
          'Саженцы 20 Br за 2 шт — выгодно!',
          'Экологичные доски пахнут хвоей!',
          'Лес нужно беречь!',
          'Кто продает бревна?',
        ];

        setNpcs((prev) =>
          prev.map((npc) => {
            let nextSpeech = npc.speech;
            let nextTimer = npc.speechTimer - 1;
            if (nextTimer <= 0) {
              nextSpeech = phrases[Math.floor(Math.random() * phrases.length)];
              nextTimer = 8 + Math.floor(Math.random() * 8);
            }
            const dx = (Math.random() - 0.5) * 8;
            const dy = (Math.random() - 0.5) * 8;
            const nx = Math.max(120, Math.min(880, npc.x + dx));
            const ny = Math.max(220, Math.min(550, npc.y + dy));
            return {
              ...npc,
              x: nx,
              y: ny,
              speech: nextSpeech,
              speechTimer: nextTimer,
            };
          })
        );
      }

      // 7. WASTE INSPECTOR AUDIT (Напоминание о чистоте, без лишних штрафов)
      setInspector((prev) => {
        const nextWaste = prev.nextWasteAudit - 0.5;
        if (nextWaste <= 0) {
          const discardedTrash = deliveryBoxes.filter((b) => b.isDiscardedTrash);
          if (discardedTrash.length > 0) {
            logNotification(`Инспектор чистоты напоминает: выбросьте коробки в бак ♻️ (осталось ${discardedTrash.length} шт.).`, 'info');
          }
          return { ...prev, nextWasteAudit: 45 };
        }
        return { ...prev, nextWasteAudit: nextWaste };
      });

      // 8. General Eco-Forest Audit (Штраф даётся только если осталось из всех деревьев 2 дерева!)
      setInspector((prev) => {
        const nextTime = prev.nextInspectionTime - 0.5;
        if (nextTime <= 0) {
          handleInspectorInspection();
          return { ...prev, nextInspectionTime: prev.cycleDuration };
        }
        return { ...prev, nextInspectionTime: nextTime };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [gameState, showRules, dayNight, hasBioFertilizer, location, gridPenalty.hasPenalty, placedMachines, deliveryBoxes]);

  // Forest Inspector
  // Правило 1: Штраф даётся ТОЛЬКО если осталось из всех деревьев 2 дерева!
  // Правило 2: Проигрыш засчитывается ТОЛЬКО когда нету деревьев и денег 0$!
  const handleInspectorInspection = () => {
    const livingCount = trees.filter((t) => t.stage !== 'stump').length;

    if (livingCount <= 2 && livingCount > 0) {
      sounds.playFine();
      const fine = hasEcoCertificate ? 70 : 100;

      setPlayer((prev) => ({
        ...prev,
        money: Math.max(0, prev.money - fine),
        finesPaid: prev.finesPaid + fine,
      }));

      setInspector((prev) => ({
        ...prev,
        strikes: prev.strikes + 1,
        lastReport: {
          status: 'fined',
          message: `ШТРАФ ${fine} Br! В лесу осталось всего ${livingCount} дер. (штраф при 2 или меньше деревьях).`,
          amount: fine,
        },
      }));

      addFloatingText(`ШТРАФ: -${fine} Br!`, player.x, player.y - 40, '#ef4444');
      logNotification(`ШТРАФ: ${fine} Br! В лесу осталось всего ${livingCount} дерева из всех деревьев! Сажайте саженцы [E] (+20 Br)!`, 'error');
    } else if (livingCount === 0 && player.money <= 0 && player.saplings <= 0) {
      setGameOverReason('NO_TREES_NO_MONEY');
      setGameState('GAMEOVER');
      sounds.playFine();
      logNotification('ПРОИГРЫШ: В лесу не осталось деревьев (0) и денег 0 Br! Игра окончена.', 'error');
    } else {
      // More than 2 trees: NO FINE!
      logNotification(`Эко-Инспекция: В лесу ${livingCount} живых деревьев. Нарушений нет (штраф начисляется только если останется 2 дерева).`, 'info');
      setInspector((prev) => ({
        ...prev,
        lastReport: {
          status: 'passed',
          message: `Живых деревьев: ${livingCount}. Нарушений нет.`,
          amount: 0,
        },
      }));
    }
  };

  // Teleportation (Заменено требование заряда на механику риска сбоя и перезапуска)
  const teleportToLocation = (targetLoc: GameLocation) => {
    if (gridPenalty.hasPenalty) {
      sounds.playLowEnergy();
      setShowGridModal(true);
      setToastMessage('Энергосеть заблокирована за перегрузку! Оплатите штраф или ждите 5 мин.');
      return;
    }

    if (targetLoc === 'MARKET' && dayNight.isNight) {
      sounds.playLowEnergy();
      setToastMessage('НОЧЬ! Рынок закрыт до рассвета (06:00), а телепорт спит.');
      addFloatingText('РЫНОК ЗАКРЫТ НА НОЧЬ!', player.x, player.y - 30, '#93c5fd');
      return;
    }

    // Check if teleport is currently broken/offline
    if (isTeleportBroken) {
      sounds.playGlitch();
      setShowTeleportGlitchModal(true);
      setToastMessage('Телепорт отключен из-за сбоя! Оплатите $100 или дождитесь авто-перезагрузки.');
      addFloatingText('ТЕЛЕПОРТ ВЫКЛЮЧЕН!', player.x, player.y - 30, '#ef4444');
      return;
    }

    // Roll breakdown failure risk (25% initial, -5% per solar panel)
    const willFail = Math.random() * 100 < teleportFailureChance;
    if (willFail) {
      setIsTeleportBroken(true);
      sounds.playGlitch();
      setShowTeleportGlitchModal(true);
      logNotification(
        `⚠️ Аварийное отключение телепорта! Риск сбоя составлял ${teleportFailureChance}%. Оплатите 100 монет или ждите 1 мин авто-перезагрузки.`,
        'error'
      );
      addFloatingText('СБОЙ ТЕЛЕПОРТА!', player.x, player.y - 30, '#ef4444');
      return;
    }

    // Teleport successful! No charge requirement
    sounds.playTeleport();
    setPlayer((prev) => ({
      ...prev,
      x: targetLoc === 'MARKET' ? 500 : targetLoc === 'STORE' ? 500 : 840,
      y: targetLoc === 'MARKET' ? 450 : targetLoc === 'STORE' ? 600 : 200,
    }));

    setLocation(targetLoc);
    addFloatingText('Телепортация!', 500, 350, '#06b6d4');

    if (currentStepIndex === 2 && targetLoc === 'MARKET') {
      completeTutorialStep(3);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (showRules) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          setShowRules(false);
        }
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;

      if (e.key === ' ' || code === 'Space') {
        e.preventDefault();
        handleInteractAction();
      } else if (key === 'e' || key === 'у' || code === 'KeyE') {
        e.preventDefault();
        handleEAction();
      } else if (key === 't' || key === 'е' || code === 'KeyT') {
        if (location === 'FOREST') teleportToLocation('MARKET');
        else if (location === 'MARKET') teleportToLocation('FOREST');
        else if (location === 'STORE') setLocation('MARKET');
      } else if (key === 'm' || key === 'ь' || code === 'KeyM') {
        if (location === 'FOREST') teleportToLocation('MARKET');
        else setShowStallModal(true);
      } else if (key === 'u' || key === 'г' || code === 'KeyU') {
        setShowUpgradesModal((prev) => !prev);
      } else if (key === 'k' || key === 'л' || code === 'KeyK') {
        setShowTerritoryModal(true);
      } else if (key === 'h' || key === 'р' || code === 'KeyH') {
        setShowHireModal(true);
      } else if (key === 'b' || key === 'и' || code === 'KeyB') {
        setShowBankruptcyModal(true);
      } else if (key === 'r' || key === 'к' || code === 'KeyR') {
        setShowRules(true);
      } else if (key === 'j' || key === 'о' || code === 'KeyJ') {
        setShowNotificationLogModal((prev) => !prev);
      } else if (key === 'f' || key === 'а' || code === 'KeyF') {
        if (location === 'STORE') {
          if (nearbyShelf) handleBuyShelfItem(nearbyShelf);
          else setToastMessage('Подойдите к стеллажу в Строймаркете и нажмите F или пробел для покупки.');
        } else {
          setLocation('STORE');
          setPlayer((prev) => ({ ...prev, x: 500, y: 580 }));
        }
      } else if (e.key === 'Escape') {
        setShowStallModal(false);
        setShowHireModal(false);
        setShowTerritoryModal(false);
        setShowBankruptcyModal(false);
        setShowNotificationLogModal(false);
        setShowUpgradesModal(false);
        setInspectedCompetitor(null);
        setShowGridModal(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  });

  // Movement handler (WSAD)
  const handlePlayerMove = useCallback(
    (dx: number, dy: number) => {
      if (showRules) return;
      setPlayer((prev) => {
        const speed = 4.4;
        let newX = prev.x + dx * speed;
        let newY = prev.y + dy * speed;

        newX = Math.max(25, Math.min(975, newX));
        newY = Math.max(80, Math.min(675, newY));

        const dir =
          Math.abs(dx) > Math.abs(dy)
            ? dx > 0
              ? 'right'
              : 'left'
            : dy > 0
            ? 'down'
            : 'up';

        // Check door transitions:
        if (location === 'FOREST' && Math.hypot(newX - 840, newY - 125) < 36) {
          teleportToLocation('MARKET');
        } else if (location === 'MARKET' && Math.hypot(newX - 500, newY - 585) < 36) {
          teleportToLocation('FOREST');
        } else if (location === 'MARKET' && Math.hypot(newX - 500, newY - 135) < 40) {
          setLocation('STORE');
          newX = 500;
          newY = 580;
          setToastMessage('Вы зашли в Эко-Строймаркет! Выбирайте солнечные панели, генераторы и технику.');
        } else if (location === 'STORE' && Math.hypot(newX - 500, newY - 670) < 36) {
          setLocation('MARKET');
          newX = 500;
          newY = 175;
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          direction: dir,
          isMoving: true,
        };
      });
    },
    [location, dayNight.isNight, gridPenalty.hasPenalty, showRules]
  );

  // Left Click (ЛКМ: сломать коробку, срубить дерево или клик для движения)
  const handleLeftClickAction = (clickX: number, clickY: number) => {
    // 1. Check if clicked near a delivery box (ЛКМ: сломать пустую коробку)
    if (location === 'FOREST') {
      const clickedBox = deliveryBoxes.find((b) => Math.hypot(b.x - clickX, b.y - clickY) < 25);
      if (clickedBox) {
        sounds.playChop();
        // Break box
        setDeliveryBoxes((prev) => prev.filter((b) => b.id !== clickedBox.id));
        addFloatingText('Коробка утилизирована! ♻️', clickedBox.x, clickedBox.y - 20, '#4ade80');
        setToastMessage('Коробка сломана и отправлена в переработку.');
        if (currentStepIndex === 4) completeTutorialStep(5);
        return;
      }

      // Check if clicked on a tree
      const clickedTree = trees.find((t) => t.stage !== 'stump' && Math.hypot(t.x - clickX, t.y - clickY) < 35);
      if (clickedTree) {
        handleChopTree(clickedTree);
        return;
      }
    }

    // 2. Check clicks on Market
    if (location === 'MARKET') {
      // Competitor stalls
      const clickedComp = INITIAL_COMPETITORS.find(
        (c) => clickX >= c.x && clickX <= c.x + 190 && clickY >= c.y && clickY <= c.y + 115
      );
      if (clickedComp) {
        setInspectedCompetitor(clickedComp);
        return;
      }

      // Player stall (x: 60..250, y: 175..285)
      if (clickX >= 55 && clickX <= 255 && clickY >= 170 && clickY <= 285) {
        setShowStallModal(true);
        return;
      }

      // Notice board (x: 60..240, y: 310..410)
      if (clickX >= 55 && clickX <= 245 && clickY >= 305 && clickY <= 410) {
        setShowHireModal(true);
        return;
      }

      // Hardware store entrance (x: 400..600, y: 40..135)
      if (clickX >= 395 && clickX <= 605 && clickY >= 35 && clickY <= 140) {
        setLocation('STORE');
        setPlayer((prev) => ({ ...prev, x: 500, y: 580 }));
        setToastMessage('Вы зашли в Эко-Строймаркет! Выбирайте солнечные панели, генераторы и технику.');
        return;
      }

      // Teleport to Forest (x: 500, y: 585)
      if (Math.hypot(clickX - 500, clickY - 585) < 45) {
        teleportToLocation('FOREST');
        return;
      }

      // Decorative Stalls (Выставка - покупки закрыты!)
      const clickedDeco = DECORATIVE_STALLS.find(
        (s) => clickX >= s.x && clickX <= s.x + s.width && clickY >= s.y && clickY <= s.y + s.height
      );
      if (clickedDeco) {
        sounds.playCoin();
        addFloatingText(`${clickedDeco.icon} ${clickedDeco.clerkName}: "Товары только для осмотра!"`, clickedDeco.x + clickedDeco.width / 2, clickedDeco.y - 12, '#fef08a');
        setToastMessage(`${clickedDeco.name}: ${clickedDeco.flavorQuote} (Выставка без покупок)`);
        logNotification(`Ярмарка: лавка «${clickedDeco.name}». ${clickedDeco.flavorQuote} (Покупки недоступны).`, 'info');
        return;
      }
    }

    // 3. Check clicks in Store (Строймаркет)
    if (location === 'STORE') {
      // Info Kiosk / Express Terminal at (90, 55)
      if (Math.hypot(clickX - 90, clickY - 55) < 35) {
        sounds.playCoin();
        setToastMessage('Эко-Терминал: Выберите нужный товар на стеллаже и нажмите [F] или [Пробел] для покупки.');
        return;
      }

      // Consultant "Артём" at (220, 75)
      if (Math.hypot(clickX - 220, clickY - 75) < 35) {
        sounds.playCoin();
        const advice =
          player.money >= 400
            ? 'Консультант Артём: "Отличный капитал! Рекомендую Бионический Лазер или Панели Mk.2 Pro — максимальная производительность!"'
            : player.money >= 150
            ? 'Консультант Артём: "Советую взять Электропилу (160 Br) или Саженцы — они быстро окупятся!"'
            : 'Консультант Артём: "Присмотритесь к Титановому Топору (90 Br) или продаже досок на рынке для накопления средств."';
        addFloatingText('Консультант Артём 💬', 220, 45, '#fef08a');
        setToastMessage(advice);
        return;
      }

      // Click on any shelf
      const clickedShelf = shelves.find(
        (s) => clickX >= s.x && clickX <= s.x + s.width && clickY >= s.y && clickY <= s.y + s.height
      );
      if (clickedShelf) {
        handleBuyShelfItem(clickedShelf);
        return;
      }

      // Click on exit doors (x: 440..560, y: 640..700)
      if (clickX >= 430 && clickX <= 570 && clickY >= 635 && clickY <= 700) {
        setLocation('MARKET');
        setPlayer((prev) => ({ ...prev, x: 500, y: 175 }));
        setToastMessage('Вы вернулись на ярмарку.');
        return;
      }
    }

    // Default: Click-to-move
    handlePlayerMoveTowards(clickX, clickY);
  };

  const handlePlayerMoveTowards = (targetX: number, targetY: number) => {
    setPlayer((prev) => {
      const angle = Math.atan2(targetY - prev.y, targetX - prev.x);
      const speed = 30;
      const newX = Math.max(25, Math.min(975, prev.x + Math.cos(angle) * speed));
      const newY = Math.max(80, Math.min(675, prev.y + Math.sin(angle) * speed));

      if (location === 'FOREST' && Math.hypot(newX - 840, newY - 125) < 36) {
        teleportToLocation('MARKET');
      } else if (location === 'MARKET' && Math.hypot(newX - 500, newY - 585) < 36) {
        teleportToLocation('FOREST');
      } else if (location === 'MARKET' && Math.hypot(newX - 500, newY - 135) < 40) {
        setLocation('STORE');
        return { ...prev, x: 500, y: 580 };
      } else if (location === 'STORE' && Math.hypot(newX - 500, newY - 670) < 36) {
        setLocation('MARKET');
        return { ...prev, x: 500, y: 175 };
      }

      return {
        ...prev,
        x: newX,
        y: newY,
      };
    });
  };

  // Chop tree logic (Штраф начисляется только когда осталось 2 дерева!)
  const handleChopTree = (targetTree: Tree) => {
    sounds.playChop();

    const hitDamage = axeLevel >= 3 ? 3 : axeLevel >= 2 ? 2 : 1;
    const updatedHealth = targetTree.health - hitDamage;
    if (updatedHealth <= 0) {
      sounds.playTreeFall();
      const woodBonus = axeLevel >= 2 ? 2 : 1;
      const woodGained = targetTree.woodYield * woodBonus;

      const remainingLiving = trees.filter((t) => t.id !== targetTree.id && t.stage !== 'stump').length;

      setTrees((prev) =>
        prev.map((t) => (t.id === targetTree.id ? { ...t, stage: 'stump', health: 0 } : t))
      );

      // Правило: штраф даётся ТОЛЬКО если осталось из всех деревьев 2 дерева!
      if (remainingLiving === 2) {
        const fine = hasEcoCertificate ? 70 : 100;
        sounds.playFine();
        setPlayer((prev) => {
          const nextMoney = Math.max(0, prev.money - fine);
          return {
            ...prev,
            logs: prev.logs + woodGained,
            treesChopped: prev.treesChopped + 1,
            money: nextMoney,
            finesPaid: prev.finesPaid + fine,
          };
        });
        addFloatingText(`ШТРАФ: -${fine} Br (Осталось 2 дерева!)`, targetTree.x, targetTree.y - 40, '#ef4444');
        logNotification(`⚠️ ШТРАФ ${fine} Br! Из всех деревьев в лесу осталось только 2 дерева! Сажайте саженцы [E] (+20 Br)!`, 'error');
        setToastMessage(`Штраф -${fine} Br! Осталось всего 2 дерева из всех! Сажайте саженцы [E]!`);
      } else {
        setPlayer((prev) => ({
          ...prev,
          logs: prev.logs + woodGained,
          treesChopped: prev.treesChopped + 1,
        }));
        addFloatingText(`+${woodGained} Брёвен`, targetTree.x, targetTree.y - 30, '#fbbf24');
        if (remainingLiving === 1) {
          setToastMessage(`Дерево срублено! Внимание: осталось всего 1 дерево! Сажайте саженцы [E]!`);
        } else if (remainingLiving === 0) {
          setToastMessage(`Все деревья срублены (0 деревьев)! Если закончатся деньги (0 Br), наступит проигрыш!`);
        } else {
          setToastMessage(`Дерево срублено! Получено +${woodGained} брёвен (осталось ${remainingLiving} дер.).`);
        }
      }

      // Правило: проигрыш засчитывается ТОЛЬКО когда нету деревьев и денег 0 Br!
      if (remainingLiving === 0 && player.money <= 0 && player.saplings <= 0) {
        setGameOverReason('NO_TREES_NO_MONEY');
        setGameState('GAMEOVER');
        sounds.playFine();
        logNotification('ПРОИГРЫШ: Вы срубили все деревья (0) и баланс 0 Br! Игра окончена.', 'error');
      }

      if (currentStepIndex === 0) completeTutorialStep(1);
    } else {
      setTrees((prev) =>
        prev.map((t) => (t.id === targetTree.id ? { ...t, health: updatedHealth } : t))
      );
      addFloatingText(`Удар!`, targetTree.x, targetTree.y - 25, '#ffffff');
    }
  };

  // Action: [Пробел]
  const handleInteractAction = () => {
    // 1. In STORE: Buy from shelf, talk to consultant or open catalog kiosk!
    if (location === 'STORE') {
      // Info Kiosk / Express Terminal at (90, 55)
      if (Math.hypot(player.x - 90, player.y - 55) < 55) {
        sounds.playCoin();
        setToastMessage('Эко-Терминал: Выберите нужный товар на стеллаже и нажмите [F] или [Пробел] для покупки.');
        return;
      }

      // Consultant "Артём" at (220, 75)
      if (Math.hypot(player.x - 220, player.y - 75) < 55) {
        sounds.playCoin();
        const advice =
          player.money >= 400
            ? 'Консультант Артём: "Отличный капитал! Рекомендую Бионический Лазер или Панели Mk.2 Pro — максимальная энергоотдача!"'
            : player.money >= 150
            ? 'Консультант Артём: "Советую взять Электропилу (160 Br) или Алмазный Диск для лесопилки (190 Br)!"'
            : 'Консультант Артём: "Присмотритесь к Титановому Топору (90 Br) или продаже досок на рынке."';
        addFloatingText('Консультант Артём 💬', 220, 45, '#fef08a');
        setToastMessage(advice);
        return;
      }

      // Exit doors (x: 440..560, y: 640..700)
      if (Math.hypot(player.x - 500, player.y - 670) < 55) {
        setLocation('MARKET');
        setPlayer((prev) => ({ ...prev, x: 500, y: 175 }));
        setToastMessage('Вы вышли из Строймаркета на площадь Ярмарки.');
        return;
      }

      if (nearbyShelf) {
        handleBuyShelfItem(nearbyShelf);
      } else {
        setToastMessage('Нажмите [F], чтобы открыть каталог Строймаркета, или подойдите к стеллажам.');
      }
      return;
    }

    // 2. In MARKET:
    if (location === 'MARKET') {
      if (Math.hypot(player.x - 155, player.y - 230) < 75) {
        setShowStallModal(true);
        return;
      }
      if (Math.hypot(player.x - 150, player.y - 360) < 70) {
        setShowHireModal(true);
        return;
      }
      const nearDeco = DECORATIVE_STALLS.find(
        (s) => Math.hypot(player.x - (s.x + s.width / 2), player.y - (s.y + s.height / 2)) < 80
      );
      if (nearDeco) {
        sounds.playCoin();
        addFloatingText(`${nearDeco.icon} ${nearDeco.clerkName}: "Товары только для осмотра!"`, nearDeco.x + nearDeco.width / 2, nearDeco.y - 12, '#fef08a');
        setToastMessage(`${nearDeco.name}: ${nearDeco.flavorQuote} (Выставка без покупок)`);
        return;
      }
      return;
    }

    // 3. In FOREST:
    // Sawmill
    if (player.x >= 450 && player.x <= 610 && player.y >= 70 && player.y <= 180) {
      if (player.logs > 0) {
        sounds.playChop();
        const multiplier = sawmillBonus ? 3 : 2;
        const planksMade = player.logs * multiplier;
        const logsCount = player.logs;
        setPlayer((prev) => ({
          ...prev,
          planks: prev.planks + planksMade,
          logs: 0,
        }));
        addFloatingText(`+${planksMade} Досок!${sawmillBonus ? ' (Алмазный диск x3!)' : ''}`, player.x, player.y - 30, '#f59e0b');
        setToastMessage(`Лесопилка: распилено ${logsCount} брёвен в ${planksMade} досок!${sawmillBonus ? ' Алмазный диск дал +50% выхода!' : ''}`);
        if (currentStepIndex === 1) completeTutorialStep(2);
      } else {
        setToastMessage('На лесопилке пусто! Срубите деревья в лесу и принесите брёвна.');
      }
      return;
    }

    // Chop nearest tree
    let nearestTree: Tree | null = null;
    let minDistance = 45;
    trees.forEach((t) => {
      if (t.stage === 'stump') return;
      const dist = Math.hypot(t.x - player.x, t.y - player.y);
      if (dist < minDistance) {
        minDistance = dist;
        nearestTree = t;
      }
    });

    if (nearestTree) {
      handleChopTree(nearestTree);
    } else {
      setToastMessage('Рядом нет деревьев. Подойдите ближе к стволу или нажмите [E] для посадки.');
    }
  };

  // Action: [E]
  const handleEAction = () => {
    // 1. In STORE: Buy from shelf or open catalog kiosk!
    if (location === 'STORE') {
      if (Math.hypot(player.x - 90, player.y - 55) < 55) {
        sounds.playCoin();
        setToastMessage('Эко-Терминал: Выберите нужный товар на стеллаже и нажмите [E] или [F] для покупки.');
        return;
      }
      if (nearbyShelf) {
        handleBuyShelfItem(nearbyShelf);
      } else {
        setToastMessage('Подойдите к любому стеллажу в Строймаркете и нажмите [E] или [F] для покупки.');
      }
      return;
    }

    // 2. In MARKET:
    if (location === 'MARKET') {
      // Near player stall?
      if (Math.hypot(player.x - 155, player.y - 230) < 75) {
        setShowStallModal(true);
        return;
      }
      // Near notice board?
      if (Math.hypot(player.x - 150, player.y - 360) < 70) {
        setShowHireModal(true);
        return;
      }
      // Near decorative stall?
      const nearDeco = DECORATIVE_STALLS.find(
        (s) => Math.hypot(player.x - (s.x + s.width / 2), player.y - (s.y + s.height / 2)) < 80
      );
      if (nearDeco) {
        sounds.playCoin();
        addFloatingText(`${nearDeco.icon} ${nearDeco.clerkName}: "Товары только для осмотра!"`, nearDeco.x + nearDeco.width / 2, nearDeco.y - 12, '#fef08a');
        setToastMessage(`${nearDeco.name}: ${nearDeco.flavorQuote} (Выставка без покупок)`);
        return;
      }
      // Buy 2 saplings for 20 Br in nursery
      if (player.money >= 20) {
        sounds.playCoin();
        const added = 2;
        setPlayer((prev) => ({ ...prev, money: prev.money - 20, saplings: prev.saplings + added }));
        addFloatingText(`+${added} Саженцев!`, player.x, player.y - 25, '#4ade80');
        setToastMessage(`Куплено ${added} саженцев за 20 Br! Посадите их в лесу.`);
      } else {
        setToastMessage('Нужно 20 Br за саженцы!');
      }
      return;
    }

    // 3. In FOREST:
    // A. Check Dedicated Recycling Station (x: 280..405, y: 70..160)
    if (player.x >= 280 && player.x <= 405 && player.y >= 70 && player.y <= 160) {
      if (player.carriedBox) {
        sounds.playCoin();
        setDeliveryBoxes((prev) => prev.filter((b) => b.id !== player.carriedBox!.id));
        setPlayer((prev) => ({ ...prev, carriedBox: null, money: prev.money + 5 }));
        addFloatingText('Коробка утилизирована! +5 Br', player.x, player.y - 30, '#10b981');
        setToastMessage('Коробка сдана в пункт утилизации! Получено +5 Br эко-бонуса.');
        if (currentStepIndex === 4) completeTutorialStep(5);
        return;
      }
    }

    // B. Check Delivery Box interaction
    if (nearbyBox) {
      if (!nearbyBox.isOpened) {
        // Open box & unpack machine or tool!
        sounds.playChop();
        if (
          nearbyBox.contents === 'solar_panel' ||
          nearbyBox.contents === 'wind_turbine' ||
          nearbyBox.contents === 'solar_panel_mk2' ||
          nearbyBox.contents === 'battery_pack' ||
          nearbyBox.contents === 'auto_irrigation' ||
          nearbyBox.contents === 'drone_scanner'
        ) {
          // Place machine!
          let energy = 0.5;
          if (nearbyBox.contents === 'wind_turbine') energy = 0.3;
          else if (nearbyBox.contents === 'solar_panel_mk2') energy = 1.0;
          else if (nearbyBox.contents === 'battery_pack') energy = 0.8;
          else if (nearbyBox.contents === 'auto_irrigation') energy = 0.2;
          else if (nearbyBox.contents === 'drone_scanner') energy = 0.4;

          if (nearbyBox.contents === 'drone_scanner') {
            setHasDroneScanner(true);
          }

          const newMachine: PlacedMachine = {
            id: `machine-${Date.now()}`,
            type: nearbyBox.contents,
            x: nearbyBox.x,
            y: nearbyBox.y,
            energyOutput: energy,
          };
          setPlacedMachines((prev) => [...prev, newMachine]);
          addFloatingText(`Установлен: ${nearbyBox.contentName}!`, nearbyBox.x, nearbyBox.y - 20, '#06b6d4');
        } else if (nearbyBox.contents === 'tool_chainsaw') {
          setAxeLevel(2);
          addFloatingText('Электропила установлена!', nearbyBox.x, nearbyBox.y - 20, '#a855f7');
        } else if (nearbyBox.contents === 'tool_titanium_axe') {
          setAxeLevel(2);
          addFloatingText('Титановый Топор снаряжен! (x2 урона)', nearbyBox.x, nearbyBox.y - 20, '#38bdf8');
          logNotification('Титановый Топор снаряжен! Скорость рубки удвоена.', 'success');
        } else if (nearbyBox.contents === 'tool_laser') {
          setAxeLevel(3);
          addFloatingText('Бионический Лазер установлен!', nearbyBox.x, nearbyBox.y - 20, '#ec4899');
        } else if (nearbyBox.contents === 'sawmill_diamond_blade') {
          setSawmillBonus(true);
          addFloatingText('Алмазный Диск на лесопилке! (+50% досок)', nearbyBox.x, nearbyBox.y - 20, '#38bdf8');
          logNotification('Лесопилка модернизирована: алмазный диск даёт 3 доски с каждого бревна!', 'success');
        } else if (nearbyBox.contents === 'planter_kit_mega') {
          setPlayer((prev) => ({ ...prev, saplings: prev.saplings + 35 }));
          addFloatingText('+35 Саженцев распаковано!', nearbyBox.x, nearbyBox.y - 20, '#4ade80');
          logNotification('Мега-пакет саженцев (+35 шт) распакован в ваш ранец!', 'success');
        } else if (nearbyBox.contents === 'eco_certificate') {
          setHasEcoCertificate(true);
          addFloatingText('Сертификат получен!', nearbyBox.x, nearbyBox.y - 20, '#f59e0b');
          logNotification('Сертификат «Зелёный Стандарт» зарегистрирован!', 'success');
        }

        // Mark box as empty discarded trash
        setDeliveryBoxes((prev) =>
          prev.map((b) => (b.id === nearbyBox.id ? { ...b, isOpened: true, isDiscardedTrash: true } : b))
        );
        setToastMessage('Коробка распакована! Отнесите пустую коробку в пункт утилизации ♻️.');
        return;
      } else {
        // Pick up or throw away box
        setDeliveryBoxes((prev) => prev.filter((b) => b.id !== nearbyBox.id));
        setPlayer((prev) => ({ ...prev, carriedBox: nearbyBox }));
        setToastMessage('Вы взяли пустую коробку в руки. Отнесите её в пункт утилизации мусора ♻️.');
        return;
      }
    }

    // C. Plant sapling
    if (player.saplings <= 0) {
      setToastMessage('Закончились саженцы! Купите на Рынке [T] (20 Br за 2 шт).');
      return;
    }

    let replantedStump = false;
    trees.forEach((t) => {
      if (t.stage === 'stump' && Math.hypot(t.x - player.x, t.y - player.y) < 35) {
        replantedStump = true;
        setTrees((prev) =>
          prev.map((tree) =>
            tree.id === t.id
              ? { ...tree, stage: 'sapling', growthProgress: 0, health: 1, maxHealth: 1 }
              : tree
          )
        );
      }
    });

    if (!replantedStump) {
      const tooClose = trees.some((t) => t.stage !== 'stump' && Math.hypot(t.x - player.x, t.y - player.y) < 32);
      if (tooClose) {
        setToastMessage('Здесь слишком тесно для дерева. Отойдите на поляну.');
        return;
      }

      const newSapling: Tree = {
        id: `sapling-${Date.now()}`,
        x: player.x,
        y: player.y,
        stage: 'sapling',
        growthProgress: 0,
        woodYield: 2,
        ecoValue: 2,
        maxHealth: 1,
        health: 1,
        type: Math.random() > 0.5 ? 'pine' : 'oak',
        plantedByPlayer: true,
      };
      setTrees((prev) => [...prev, newSapling]);
    }

    sounds.playPlant();
    const plantReward = 20;
    const newTreesPlanted = player.treesPlanted + 1;
    const newMoney = player.money + plantReward;

    setPlayer((prev) => ({
      ...prev,
      money: prev.money + plantReward,
      saplings: prev.saplings - 1,
      treesPlanted: newTreesPlanted,
    }));

    addFloatingText(`+1 Саженец! +${plantReward} Br`, player.x, player.y - 25, '#4ade80');
    setToastMessage(`Посажен саженец! Награда за посадку: +${plantReward} Br. Саженец растет на солнце.`);

    // Victory Condition: planted >= 1000 saplings AND earned >= 100,000 coins!
    if (newTreesPlanted >= 1000 && newMoney >= 100000) {
      setGameState('VICTORY');
      sounds.playMegaBoost();
      logNotification('🏆 ВЕЛИКАЯ ПОБЕДА! Вы посадили 1,000 деревьев и заработали свыше 100,000 Br!', 'success');
    }
  };

  // Buy item in hardware store -> spawns box at delivery truck!
  const handleBuyShelfItem = (shelf: StoreShelf) => {
    if (shelf.isPurchased) {
      setToastMessage('Этот предмет уже куплен!');
      return;
    }
    if (player.money < shelf.cost) {
      sounds.playLowEnergy();
      setToastMessage(`Не хватает денег! Нужно ${shelf.cost} Br. Продайте доски на рынке.`);
      return;
    }

    sounds.playCoin();
    setPlayer((prev) => ({ ...prev, money: prev.money - shelf.cost }));

    setShelves((prev) =>
      prev.map((s) => (s.id === shelf.id ? { ...s, isPurchased: true } : s))
    );

    // Spawn Delivery Box at the Truck in Forest!
    if (shelf.deliveryItemType) {
      const newBox: DeliveryBox = {
        id: `box-${Date.now()}`,
        x: 165 + (deliveryBoxes.length % 3) * 25,
        y: 155 + Math.floor(deliveryBoxes.length / 3) * 22,
        contents: shelf.deliveryItemType,
        contentName: shelf.name,
        isOpened: false,
        isCarried: false,
        isDiscardedTrash: false,
      };
      setDeliveryBoxes((prev) => [...prev, newBox]);
      addFloatingText(`Фура привезла: ${shelf.name}!`, player.x, player.y - 30, '#f59e0b');
      setToastMessage(`🚚 Фура привезла заказ в коробке! Вернитесь в Лес [T], чтобы распаковать.`);
      if (currentStepIndex === 3) completeTutorialStep(4);
    }
  };

  // Buy 1 of 9 territory plots for 1000 Br
  const handleBuyPlot = (plot: TerritoryPlot) => {
    if (player.money < plot.cost) {
      setToastMessage('Не хватает денег! Нужно 1000 Br для покупки квадрата земли.');
      return;
    }
    sounds.playReboot();
    setPlayer((prev) => ({ ...prev, money: prev.money - plot.cost }));
    setPlots((prev) => prev.map((p) => (p.id === plot.id ? { ...p, unlocked: true } : p)));

    // Spawn new trees in unlocked plot (they now appear after buying the plot!)
    const plotW = 1000 / 3;
    const plotH = (700 - 70) / 3;
    const startX = plot.col * plotW + 35;
    const startY = 70 + plot.row * plotH + 35;

    const addedTrees: Tree[] = [];
    const types: Array<'pine' | 'oak' | 'birch'> = ['pine', 'oak', 'birch'];
    for (let i = 0; i < 6; i++) {
      const isAncient = i === 0 && (plot.row === 2 || plot.col === 0 || plot.col === 2);
      addedTrees.push({
        id: `plot-tree-${Date.now()}-${i}`,
        x: startX + Math.random() * (plotW - 70),
        y: startY + Math.random() * (plotH - 70),
        stage: isAncient ? 'ancient' : Math.random() > 0.3 ? 'mature' : 'young',
        growthProgress: 100,
        woodYield: isAncient ? 4 : 2,
        ecoValue: isAncient ? 5 : 2,
        maxHealth: isAncient ? 5 : 3,
        health: isAncient ? 5 : 3,
        type: isAncient ? 'oak' : types[i % 3],
      });
    }
    setTrees((prev) => [...prev, ...addedTrees]);

    addFloatingText('Квадрат куплен! +6 деревьев', player.x, player.y - 30, '#10b981');
    setToastMessage(`Сектор [${plot.row + 1},${plot.col + 1}] открыт за 1000 Br! На новой площади выросли деревья.`);
    if (currentStepIndex === 6) completeTutorialStep(7);
  };

  // Post hiring flyer
  const handlePostJobFlyer = () => {
    const cost = 25;
    if (player.money < cost) {
      setToastMessage('Нужно 25 Br для расклейки объявлений!');
      return;
    }
    sounds.playCoin();
    setPlayer((prev) => ({ ...prev, money: prev.money - cost }));

    const names = ['Алексей', 'Игорь', 'Михаил', 'Сергей', 'Дмитрий'];
    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      name: names[workers.length % names.length],
      x: 350 + Math.random() * 300,
      y: 350 + Math.random() * 200,
      targetX: 350,
      targetY: 350,
      state: 'idle',
      wageDue: 30,
    };
    setWorkers((prev) => [...prev, newWorker]);
    addFloatingText('Рабочий нанят! (З/П 30 Br)', player.x, player.y - 30, '#f59e0b');
    setToastMessage(`Листовки расклеены! Нанят помощник ${newWorker.name}. Ставка: 30 Br.`);
    if (currentStepIndex === 5) completeTutorialStep(6);
  };

  // Pay wages (30 Br per worker)
  const handlePayWages = () => {
    const total = workers.length * 30;
    if (player.money < total) {
      setToastMessage(`Нужно ${total} Br для выплаты зарплаты рабочим!`);
      return;
    }
    sounds.playCoin();
    setPlayer((prev) => ({ ...prev, money: prev.money - total }));
    addFloatingText(`Зарплата ${total} Br выплачена!`, player.x, player.y - 30, '#4ade80');
    setToastMessage(`Зарплата 30 Br каждому помощнику выплачена.`);
  };

  // Add items to stall display
  const handleAddPlanksToDisplay = (count: number) => {
    if (count <= 0 || player.planks < count) return;
    setPlayer((prev) => ({ ...prev, planks: prev.planks - count }));
    setPlayerStallStock((prev) => ({ ...prev, planksOnDisplay: prev.planksOnDisplay + count }));
    addFloatingText(`+${count} Досок на витрину!`, 200, 240, '#f59e0b');
    setToastMessage(`Выложено ${count} досок. Горожане подходят и покупают!`);
    if (currentStepIndex === 2) completeTutorialStep(3);
  };

  const handleAddLogsToDisplay = (count: number) => {
    if (count <= 0 || player.logs < count) return;
    setPlayer((prev) => ({ ...prev, logs: prev.logs - count }));
    setPlayerStallStock((prev) => ({ ...prev, logsOnDisplay: prev.logsOnDisplay + count }));
    addFloatingText(`+${count} Брёвен на витрину!`, 200, 240, '#fbbf24');
    setToastMessage(`Выложено ${count} брёвен.`);
  };

  return (
    <div className="min-h-screen bg-[#0a1210] text-[#e2e8f0] flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 border-b border-emerald-950/80 mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-emerald-400">
            Эко-Лесоруб: Баланс Природы
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
            {location === 'FOREST' && '🌲 Лесные Угодья'}
            {location === 'MARKET' && '🏙️ Рынок & Прилавки'}
            {location === 'STORE' && '🏬 Строймаркет'}
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-4 text-slate-400 font-medium">
          <button
            onClick={() => setShowUpgradesModal(true)}
            className="hover:text-emerald-400 transition-colors cursor-pointer text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>⚡ Апгрейды (U)</span>
          </button>
          <button
            onClick={() => setShowTerritoryModal(true)}
            className="hover:text-emerald-400 transition-colors cursor-pointer text-emerald-300 font-semibold"
          >
            Угодья (9 Квадратов)
          </button>
          <button
            onClick={() => {
              if (location === 'FOREST') teleportToLocation('MARKET');
              else teleportToLocation('FOREST');
            }}
            className="text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer font-medium"
          >
            {location === 'FOREST' ? 'Телепорт на Рынок [T]' : 'Телепорт в Лес [T]'}
          </button>
          <button
            onClick={() => {
              setLocation('STORE');
              setPlayer((prev) => ({ ...prev, x: 500, y: 580 }));
            }}
            className={`${location === 'STORE' ? 'text-purple-200 font-bold' : 'text-purple-300 hover:text-purple-200'} transition-colors cursor-pointer font-medium`}
          >
            Строймаркет
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col gap-2 flex-1 justify-center">
        {/* Tutorial Quest Bar */}
        <TutorialQuestBar
          currentStep={tutorialSteps[currentStepIndex]}
          stepIndex={currentStepIndex}
          totalSteps={tutorialSteps.length}
          onOpenFullGuide={() => setShowRules(true)}
        />

        {/* HUD */}
        <HUD
          player={player}
          forestHealth={currentForestHealth}
          livingTreesCount={livingTreesCount}
          inspector={inspector}
          dayNight={dayNight}
          gridPenalty={gridPenalty}
          isMuted={isMuted}
          isTeleportBroken={isTeleportBroken}
          teleportRebootTimer={teleportRebootTimer}
          teleportFailureChance={teleportFailureChance}
          solarPanelsCount={solarPanelsCount}
          onOpenTeleportGlitch={() => setShowTeleportGlitchModal(true)}
          onPay100Teleport={handlePay100Teleport}
          onOpenUpgrades={() => setShowUpgradesModal(true)}
          onToggleMute={() => {
            const next = sounds.toggleMute();
            setIsMuted(next);
          }}
          onOpenMarket={() => {
            if (location === 'FOREST') teleportToLocation('MARKET');
            else setShowStallModal(true);
          }}
          onOpenStore={() => {
            setLocation('STORE');
            setPlayer((prev) => ({ ...prev, x: 500, y: 580 }));
          }}
          onOpenTeleport={() => {
            if (location === 'FOREST') teleportToLocation('MARKET');
            else teleportToLocation('FOREST');
          }}
          onOpenGuide={() => setShowRules(true)}
          onOpenGridPenalty={() => setShowGridModal(true)}
          onInteractAction={handleInteractAction}
          onPlantAction={handleEAction}
          onOpenBankruptcy={() => setShowBankruptcyModal(true)}
          onOpenNotificationLog={() => setShowNotificationLogModal(true)}
          notificationCount={notificationLogs.length}
        />

        {/* 2D Canvas Playfield */}
        <div className="relative">
          <GameCanvas
            location={location}
            player={player}
            trees={trees}
            npcs={npcs}
            shelves={shelves}
            teleports={INITIAL_TELEPORTS}
            dayNight={dayNight}
            teleportChargeProgress={dayNight.sunIntensity * 100}
            isGridLocked={gridPenalty.hasPenalty}
            deliveryBoxes={deliveryBoxes}
            placedMachines={placedMachines}
            plots={plots}
            workers={workers}
            playerStallStock={playerStallStock}
            competitors={INITIAL_COMPETITORS}
            onPlayerMove={handlePlayerMove}
            onPlayerClickMove={handlePlayerMoveTowards}
            onLeftClickAction={handleLeftClickAction}
            onInteractAction={handleInteractAction}
            onPlantAction={handleEAction}
            floatingTexts={floatingTexts}
            axeLevel={axeLevel}
            forestHealth={currentForestHealth}
            nearbyShelf={nearbyShelf}
            nearbyBox={nearbyBox}
            onOpenTerritoryModal={() => setShowTerritoryModal(true)}
            onOpenStallModal={() => setShowStallModal(true)}
            onOpenHireModal={() => setShowHireModal(true)}
            onInspectCompetitor={(c) => setInspectedCompetitor(c)}
            isTeleportBroken={isTeleportBroken}
            teleportRebootTimer={teleportRebootTimer}
            teleportFailureChance={teleportFailureChance}
            onOpenTeleportGlitch={() => setShowTeleportGlitchModal(true)}
          />

          {/* Context Toast & Notification Feed Bar */}
          <div className="absolute bottom-3 left-4 right-4 sm:right-36 flex items-center justify-between gap-3 bg-[#0c1613]/95 border border-emerald-800/80 rounded-xl px-4 py-2 text-xs text-slate-200 shadow-xl backdrop-blur-xs select-none">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="truncate font-medium">{toastMessage || 'Следите за балансом леса и состоянием телепорта.'}</span>
            </div>
            <button
              onClick={() => setShowNotificationLogModal(true)}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Открыть полную историю всех надписей и оповещений"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Журнал ({notificationLogs.length})</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-5xl py-2 mt-1 border-t border-emerald-950/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>
          Управление: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">W,S,A,D</kbd> ход · <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">ЛКМ</kbd> рубка/коробка · <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">E</kbd> саженец/взять · <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">ПРОБЕЛ</kbd> действие · <kbd className="px-1 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">F</kbd> Каталог · <kbd className="px-1 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">U</kbd> Апгрейды
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBankruptcyModal(true)}
            className="text-rose-400/80 hover:text-rose-300 cursor-pointer transition-colors underline"
          >
            Объявить банкротство
          </button>
          <span>·</span>
          <span>9 Квадратов по 1000 Br · З/П рабочих 30 Br · Эко-бонус за мусор +5 Br</span>
        </div>
      </footer>



      {showUpgradesModal && (
        <UpgradesModal
          player={player}
          axeLevel={axeLevel}
          hasBioFertilizer={hasBioFertilizer}
          hasEcoCertificate={hasEcoCertificate}
          solarPanelsCount={solarPanelsCount}
          teleportFailureChance={teleportFailureChance}
          onClose={() => setShowUpgradesModal(false)}
          onUpgradeAxe={handleUpgradeAxe}
          onBuyBioFertilizer={handleBuyBioFertilizer}
          onBuyEcoCertificate={handleBuyEcoCertificate}
          onBuySaplingsBundle={handleBuySaplingsBundle}
        />
      )}

      {showBankruptcyModal && (
        <BankruptcyModal
          playerMoney={player.money}
          finesPaid={player.finesPaid}
          onConfirmBankruptcy={handleConfirmBankruptcy}
          onClose={() => setShowBankruptcyModal(false)}
        />
      )}

      {showNotificationLogModal && (
        <NotificationLogModal
          logs={notificationLogs}
          onClear={() => setNotificationLogs([])}
          onClose={() => setShowNotificationLogModal(false)}
        />
      )}

      {showTerritoryModal && (
        <TerritoryModal
          plots={plots}
          playerMoney={player.money}
          onBuyPlot={handleBuyPlot}
          onClose={() => setShowTerritoryModal(false)}
        />
      )}

      {showHireModal && (
        <WorkerHireModal
          workers={workers}
          playerMoney={player.money}
          onPostJobFlyer={handlePostJobFlyer}
          onPayWages={handlePayWages}
          onClose={() => setShowHireModal(false)}
        />
      )}

      {showStallModal && (
        <PlayerStallModal
          stock={playerStallStock}
          player={player}
          onAddPlanksToDisplay={handleAddPlanksToDisplay}
          onAddLogsToDisplay={handleAddLogsToDisplay}
          onClose={() => setShowStallModal(false)}
        />
      )}

      {inspectedCompetitor && (
        <CompetitorModal
          stall={inspectedCompetitor}
          onClose={() => setInspectedCompetitor(null)}
        />
      )}

      {showGridModal && (
        <CityFineModal
          fineAmount={gridPenalty.fineAmount}
          remainingSeconds={gridPenalty.remainingSeconds}
          playerMoney={player.money}
          onPayFine={() => {
            setPlayer((p) => ({ ...p, money: p.money - 80 }));
            setGridPenalty({ hasPenalty: false, fineAmount: 80, remainingSeconds: 300, isRefused: false });
            setShowGridModal(false);
            setToastMessage('Штраф 80 Br оплачен! Телепорт включен моментально.');
          }}
          onRefuseToPay={() => {
            setGridPenalty((p) => ({ ...p, isRefused: true }));
            setShowGridModal(false);
            setToastMessage('Вы отказались платить. Телепорт заблокирован на 5 минут.');
          }}
          onClose={() => setShowGridModal(false)}
          isRefused={gridPenalty.isRefused}
        />
      )}


      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Teleport Breakdown Glitch & Choice Modal */}
      <TeleportGlitchModal
        isOpen={showTeleportGlitchModal}
        onClose={() => setShowTeleportGlitchModal(false)}
        playerMoney={player.money}
        solarPanelsCount={solarPanelsCount}
        failureChance={teleportFailureChance}
        rebootTimer={teleportRebootTimer}
        onPay100={handlePay100Teleport}
        onWait1Min={handleWait1MinTeleport}
      />

      {gameState === 'VICTORY' && (
        <VictoryModal
          player={player}
          forestHealth={currentForestHealth}
          onRestart={handleFullRestart}
        />
      )}

      {gameState === 'GAMEOVER' && (
        <GameOverModal
          player={player}
          forestHealth={currentForestHealth}
          onRestart={handleFullRestart}
          reason={gameOverReason}
        />
      )}
    </div>
  );
}
