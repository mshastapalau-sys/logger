export interface MarketStallData {
  id: string;
  name: string;
  category: string;
  icon: string;
  primaryColor: string;
  stripeColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  goods:
    | 'player_wood'
    | 'competitor_boris'
    | 'competitor_taiga'
    | 'bread'
    | 'smith'
    | 'pottery'
    | 'honey'
    | 'produce'
    | 'flowers'
    | 'apothecary'
    | 'samovar'
    | 'cheese'
    | 'woodcarver'
    | 'weaver'
    | 'fish'
    | 'books'
    | 'amber';
  clerkName: string;
  flavorQuote: string;
  isDecorativeOnly: boolean;
}

export const DECORATIVE_STALLS: MarketStallData[] = [
  // --- СЕВЕРНЫЙ РЯД (TOP) ---
  {
    id: 'stall-smith',
    name: 'Кузница «Стальной Клин»',
    category: 'Кузнечное дело',
    icon: '⚒️',
    primaryColor: '#334155',
    stripeColor: '#ea580c',
    x: 40,
    y: 35,
    width: 170,
    height: 85,
    goods: 'smith',
    clerkName: 'Кузнец Влад',
    flavorQuote: 'Кованые топоры, пилы и подковы! Заказы расписаны на месяц вперёд — покупки закрыты.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-bread',
    name: 'Пекарня «Хрустящий Багет»',
    category: 'Выпечка',
    icon: '🥐',
    primaryColor: '#b45309',
    stripeColor: '#fef3c7',
    x: 230,
    y: 35,
    width: 170,
    height: 85,
    goods: 'bread',
    clerkName: 'Пекарь Густав',
    flavorQuote: 'Свежайший ржаной каравай и плетёные булки! Выставочный стол ярмарки, не для продажи.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-apothecary',
    name: 'Аптека «Таёжная Травница»',
    category: 'Зельеварение',
    icon: '🧪',
    primaryColor: '#065f46',
    stripeColor: '#a7f3d0',
    x: 600,
    y: 35,
    width: 170,
    height: 85,
    goods: 'apothecary',
    clerkName: 'Травница Марфа',
    flavorQuote: 'Настойки из хвои, мяты и сушёный чабрец. Выставка целебных трав — торговля закрыта.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-flowers',
    name: 'Цветочная «Лесная Фиалка»',
    category: 'Флористика',
    icon: '💐',
    primaryColor: '#047857',
    stripeColor: '#fbcfe8',
    x: 790,
    y: 35,
    width: 170,
    height: 85,
    goods: 'flowers',
    clerkName: 'Флорист Елена',
    flavorQuote: 'Горные папоротники, розы и вереск. Праздничная цветочная композиция для ярмарки.',
    isDecorativeOnly: true,
  },

  // --- СРЕДНЕ-ВЕРХНИЙ РЯД ---
  {
    id: 'stall-samovar',
    name: 'Чайная «Русский Самовар»',
    category: 'Трактир',
    icon: '🫖',
    primaryColor: '#b91c1c',
    stripeColor: '#fef08a',
    x: 235,
    y: 155,
    width: 165,
    height: 95,
    goods: 'samovar',
    clerkName: 'Чайник Савелий',
    flavorQuote: 'Медный самовар на сосновых шишках и связки баранок! Только чаепитие гостей, товар не продаётся.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-cheese',
    name: 'Сыроварня «Лесной Край»',
    category: 'Деликатесы',
    icon: '🧀',
    primaryColor: '#ca8a04',
    stripeColor: '#fef9c3',
    x: 600,
    y: 155,
    width: 165,
    height: 95,
    goods: 'cheese',
    clerkName: 'Сыродел Пётр',
    flavorQuote: 'Выдержанные альпийские сырные головы с травами. Выставочные образцы мастеров.',
    isDecorativeOnly: true,
  },

  // --- СРЕДНЕ-НИЖНИЙ РЯД ---
  {
    id: 'stall-woodcarver',
    name: 'Резчик «Берёзовая Сказка»',
    category: 'Резьба по дереву',
    icon: '🪵',
    primaryColor: '#854d0e',
    stripeColor: '#fde68a',
    x: 235,
    y: 285,
    width: 165,
    height: 95,
    goods: 'woodcarver',
    clerkName: 'Мастер Лука',
    flavorQuote: 'Резные деревянные лошадки и матрёшки из липы. Экспонаты гильдии ремесленников.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-fish',
    name: 'Рыбная «Озёрный Улов»',
    category: 'Рыболовство',
    icon: '🐟',
    primaryColor: '#0369a1',
    stripeColor: '#bae6fd',
    x: 600,
    y: 285,
    width: 165,
    height: 95,
    goods: 'fish',
    clerkName: 'Рыбак Назар',
    flavorQuote: 'Копчёный сиг и свежая форель на чистом таёжном льду. Демонстрация улова!',
    isDecorativeOnly: true,
  },

  // --- ЮЖНЫЙ РЯД (BOTTOM) ---
  {
    id: 'stall-weaver',
    name: 'Ткацкая «Северный Лён»',
    category: 'Текстиль',
    icon: '🧵',
    primaryColor: '#7c3aed',
    stripeColor: '#ede9fe',
    x: 40,
    y: 415,
    width: 170,
    height: 90,
    goods: 'weaver',
    clerkName: 'Ткачиха Ольга',
    flavorQuote: 'Рулоны натурального льна и яркая шерстяная пряжа. Только показ народных промыслов.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-produce',
    name: 'Ферма «Яблонька»',
    category: 'Урожай',
    icon: '🍎',
    primaryColor: '#dc2626',
    stripeColor: '#fef2f2',
    x: 230,
    y: 415,
    width: 170,
    height: 90,
    goods: 'produce',
    clerkName: 'Фермерша Анна',
    flavorQuote: 'Спелые яблоки, тыквы и лесные ягоды! Товары выставлены для осмотра гостей.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-pottery',
    name: 'Гончарная «Глиняный Кот»',
    category: 'Керамика',
    icon: '🏺',
    primaryColor: '#0284c7',
    stripeColor: '#e0f2fe',
    x: 600,
    y: 415,
    width: 170,
    height: 90,
    goods: 'pottery',
    clerkName: 'Гончар Илья',
    flavorQuote: 'Расписные глиняные кувшины и керамика ручной работы! Только осмотр.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-books',
    name: 'Книжная «Старый Свиток»',
    category: 'Книгопечатание',
    icon: '📜',
    primaryColor: '#4338ca',
    stripeColor: '#e0e7ff',
    x: 790,
    y: 415,
    width: 170,
    height: 90,
    goods: 'books',
    clerkName: 'Архивариус Семён',
    flavorQuote: 'Старинные географические карты леса и свитки травников. Редкие раритеты без продаж.',
    isDecorativeOnly: true,
  },

  // --- ЮЖНЫЕ УГЛОВЫЕ ЛАВКИ ---
  {
    id: 'stall-honey',
    name: 'Пасека «Золотой Бор»',
    category: 'Продукты',
    icon: '🍯',
    primaryColor: '#d97706',
    stripeColor: '#fef9c3',
    x: 130,
    y: 540,
    width: 170,
    height: 85,
    goods: 'honey',
    clerkName: 'Пасечник Денис',
    flavorQuote: 'Дикий таёжный мёд и соты! Сегодня только праздничная выставка, покупок нет.',
    isDecorativeOnly: true,
  },
  {
    id: 'stall-amber',
    name: 'Янтарная «Солнечный Бор»',
    category: 'Ювелирное дело',
    icon: '✨',
    primaryColor: '#b45309',
    stripeColor: '#fed7aa',
    x: 700,
    y: 540,
    width: 170,
    height: 85,
    goods: 'amber',
    clerkName: 'Ювелир Глеб',
    flavorQuote: 'Шлифованный лесной янтарь и самоцветы. Музейная витрина ярмарки, не продаётся.',
    isDecorativeOnly: true,
  },
];
