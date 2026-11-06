import React, { useRef, useEffect } from 'react';
import {
  GameLocation,
  PlayerStats,
  Tree,
  NPC,
  StoreShelf,
  TeleportPad,
  DayNightCycle,
  DeliveryBox,
  PlacedMachine,
  TerritoryPlot,
  Worker,
  MarketStallStock,
  CompetitorStall,
} from '../types/game';
import { DECORATIVE_STALLS } from '../types/marketStalls';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

interface GameCanvasProps {
  location: GameLocation;
  player: PlayerStats;
  trees: Tree[];
  npcs: NPC[];
  shelves: StoreShelf[];
  teleports: TeleportPad[];
  dayNight: DayNightCycle;
  teleportChargeProgress: number;
  isGridLocked: boolean;
  deliveryBoxes: DeliveryBox[];
  placedMachines: PlacedMachine[];
  plots: TerritoryPlot[];
  workers: Worker[];
  playerStallStock: MarketStallStock;
  competitors: CompetitorStall[];
  onPlayerMove: (dx: number, dy: number) => void;
  onPlayerClickMove: (x: number, y: number) => void;
  onLeftClickAction: (x: number, y: number) => void;
  onInteractAction: () => void;
  onPlantAction: () => void;
  floatingTexts: FloatingText[];
  axeLevel: number;
  forestHealth: number;
  nearbyShelf: StoreShelf | null;
  nearbyBox: DeliveryBox | null;
  onOpenTerritoryModal: () => void;
  onOpenStallModal: () => void;
  onOpenHireModal: () => void;
  onInspectCompetitor: (stall: CompetitorStall) => void;
  // Teleport breakdown props
  isTeleportBroken?: boolean;
  teleportRebootTimer?: number;
  teleportFailureChance?: number;
  onOpenTeleportGlitch?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  location,
  player,
  trees,
  npcs,
  shelves,
  teleports: _teleports,
  dayNight,
  teleportChargeProgress: _teleportChargeProgress,
  isGridLocked,
  deliveryBoxes,
  placedMachines,
  plots,
  workers,
  playerStallStock,
  competitors,
  onPlayerMove,
  onPlayerClickMove: _onPlayerClickMove,
  onLeftClickAction,
  floatingTexts,
  axeLevel,
  forestHealth: _forestHealth,
  nearbyShelf,
  nearbyBox,
  onOpenTerritoryModal,
  onOpenStallModal,
  onOpenHireModal,
  onInspectCompetitor,
  isTeleportBroken = false,
  teleportRebootTimer = 0,
  teleportFailureChance = 25,
  onOpenTeleportGlitch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const animationFrameRef = useRef<number | null>(null);

  // Key tracking for smooth continuous movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      keysPressed.current[e.key] = true;
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Movement loop running at 60fps
  useEffect(() => {
    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;
      const keys = keysPressed.current;

      const up = keys['w'] || keys['W'] || keys['ц'] || keys['Ц'] || keys['KeyW'] || keys['arrowup'] || keys['ArrowUp'];
      const down = keys['s'] || keys['S'] || keys['ы'] || keys['Ы'] || keys['KeyS'] || keys['arrowdown'] || keys['ArrowDown'];
      const left = keys['a'] || keys['A'] || keys['ф'] || keys['Ф'] || keys['KeyA'] || keys['arrowleft'] || keys['ArrowLeft'];
      const right = keys['d'] || keys['D'] || keys['в'] || keys['В'] || keys['KeyD'] || keys['arrowright'] || keys['ArrowRight'];

      if (up) dy -= 1;
      if (down) dy += 1;
      if (left) dx -= 1;
      if (right) dx += 1;

      if (dx !== 0 || dy !== 0) {
        onPlayerMove(dx, dy);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [onPlayerMove]);

  // Handle Left Click on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (e.button === 0) {
      // Check if clicking near teleport in Forest
      if (location === 'FOREST' && Math.hypot(clickX - 840, clickY - 125) < 45) {
        if (isTeleportBroken && onOpenTeleportGlitch) {
          onOpenTeleportGlitch();
          return;
        }
      }
      onLeftClickAction(clickX, clickY);
    }
  };

  // Helper: check if a coordinate falls inside an unlocked territory plot
  const isPlotUnlockedForCoord = (x: number, y: number) => {
    const plotW = 1000 / 3;
    const plotH = (700 - 70) / 3;
    const col = Math.min(2, Math.max(0, Math.floor(x / plotW)));
    const row = Math.min(2, Math.max(0, Math.floor((y - 70) / plotH)));
    const plot = plots.find((p) => p.row === row && p.col === col);
    return plot ? plot.unlocked : true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (location === 'FOREST') {
        renderForestLocation(ctx, canvas, tick);
      } else if (location === 'MARKET') {
        renderMarketLocation(ctx, canvas, tick);
      } else if (location === 'STORE') {
        renderStoreLocation(ctx, canvas, tick);
      }

      // Draw Floating Texts
      floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Tooltip for delivery box in reach
      if (nearbyBox && location === 'FOREST') {
        drawBoxTooltip(ctx, nearbyBox, player.carriedBox);
      }

      // Tooltip for store shelf in reach
      if (nearbyShelf && location === 'STORE') {
        drawShelfTooltip(ctx, nearbyShelf, player.money);
      }

      // Day/Night ambient lighting overlay
      if (dayNight.isNight) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 15, 35, 0.55)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Flashlight / lantern around player
        const gradient = ctx.createRadialGradient(player.x, player.y, 25, player.x, player.y, 140);
        gradient.addColorStop(0, 'rgba(255, 230, 150, 0.35)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    location,
    player,
    trees,
    npcs,
    shelves,
    dayNight,
    deliveryBoxes,
    placedMachines,
    plots,
    workers,
    playerStallStock,
    competitors,
    floatingTexts,
    axeLevel,
    nearbyShelf,
    nearbyBox,
    isTeleportBroken,
    teleportRebootTimer,
    teleportFailureChance,
  ]);

  // =========================================================================
  // 1. FOREST LOCATION (9 Квадратов, Лесопилка, Фура, Мусорка отдельно, Телепорт)
  // =========================================================================
  const renderForestLocation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tick: number) => {
    // Background grass
    ctx.fillStyle = '#0f241a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grass texture dots
    ctx.fillStyle = '#133324';
    for (let gx = 15; gx < canvas.width; gx += 45) {
      for (let gy = 80; gy < canvas.height; gy += 45) {
        ctx.fillRect(gx + ((gy * 7) % 13), gy, 3, 2);
      }
    }

    const plotW = canvas.width / 3;
    const plotH = (canvas.height - 70) / 3;

    // Draw 9 Territory plots
    plots.forEach((p) => {
      const px = p.col * plotW;
      const py = 70 + p.row * plotH;

      if (p.unlocked) {
        ctx.fillStyle = '#173626';
        ctx.fillRect(px, py, plotW, plotH);
        ctx.strokeStyle = '#235038';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, plotW, plotH);
      } else {
        // Locked plot with boundary fence and hatched pattern
        ctx.fillStyle = '#09130e';
        ctx.fillRect(px, py, plotW, plotH);

        // Diagonal hazard stripes for locked land
        ctx.save();
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
        ctx.lineWidth = 1.5;
        for (let offset = -plotH; offset < plotW; offset += 30) {
          ctx.beginPath();
          ctx.moveTo(px + Math.max(0, offset), py);
          ctx.lineTo(px + Math.min(plotW, offset + plotH), py + plotH);
          ctx.stroke();
        }
        ctx.restore();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(px + 4, py + 4, plotW - 8, plotH - 8);
        ctx.setLineDash([]);

        // Lock label & Price
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(px + plotW / 2 - 80, py + plotH / 2 - 28, 160, 56, 8);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`🔒 Сектор [${p.row + 1},${p.col + 1}] ЗАКРЫТ`, px + plotW / 2, py + plotH / 2 - 8);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`Купить: ${p.cost} Br`, px + plotW / 2, py + plotH / 2 + 14);
      }
    });

    // Central pathway connecting zones
    ctx.strokeStyle = '#382c22';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(195, 125);
    ctx.lineTo(530, 125);
    ctx.lineTo(840, 125);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(530, 125);
    ctx.lineTo(500, 480);
    ctx.stroke();

    // 1. DELIVERY TRUCK (Фура со стройматериалами на погрузке)
    drawDeliveryTruckModel(ctx, 40, 85, tick);

    // 2. SEPARATE ECO-WASTE / TRASH RECYCLING STATION (Мусор размещен отдельно)
    drawTrashRecyclingStation(ctx, 290, 78, tick, !!player.carriedBox);

    // 3. INDUSTRIAL CIRCULAR SAWMILL (Модель лесопилки с вращающейся пилой и деталями)
    drawSawmillModel(ctx, 455, 70, tick);

    // 4. TELEPORT PAD (Телепорт с шансом сбоя, перезагрузкой и защитой панелями)
    drawTeleportPad(ctx, 840, 125, tick, isTeleportBroken, teleportRebootTimer, teleportFailureChance);

    // 5. Draw Placed Machines (Солнечные панели и ветряки)
    placedMachines.forEach((machine) => {
      drawMachine(ctx, machine, tick);
    });

    // 6. Draw Delivery Boxes
    deliveryBoxes.forEach((box) => {
      drawDeliveryBox(ctx, box, nearbyBox?.id === box.id);
    });

    // 7. Draw Hired Workers
    workers.forEach((worker) => {
      drawWorker(ctx, worker, tick);
    });

    // 8. Draw Trees & Player (ONLY draw trees on UNLOCKED plots!)
    const entities: Array<{ type: 'tree' | 'player'; y: number; data?: Tree }> = [];
    trees.forEach((tree) => {
      // ONLY render trees that are inside unlocked territory plots!
      if (isPlotUnlockedForCoord(tree.x, tree.y)) {
        entities.push({ type: 'tree', y: tree.y, data: tree });
      }
    });
    entities.push({ type: 'player', y: player.y });
    entities.sort((a, b) => a.y - b.y);

    entities.forEach((ent) => {
      if (ent.type === 'tree' && ent.data) {
        drawDetailedTree(ctx, ent.data, tick);
      } else if (ent.type === 'player') {
        drawPlayer(ctx, player, axeLevel, tick);
      }
    });

    // Top-left Territory Expansion HUD button hint
    ctx.fillStyle = 'rgba(15, 23, 21, 0.85)';
    ctx.beginPath();
    ctx.roundRect(15, 15, 280, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('🗺️ КАРТА 9 КВАДРАТОВ [Купить за 1000 Br]', 25, 32);
  };

  // =========================================================================
  // MODEL 1: DELIVERY TRUCK
  // =========================================================================
  const drawDeliveryTruckModel = (ctx: CanvasRenderingContext2D, x: number, y: number, _tick: number) => {
    // Red cabin
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.roundRect(x, y, 75, 45, 6);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Windshield
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(x + 5, y + 6, 22, 18);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 20);
    ctx.lineTo(x + 23, y + 8);
    ctx.lineTo(x + 20, y + 8);
    ctx.lineTo(x + 6, y + 20);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 2, y + 30, 4, 8);

    // Silver container trailer
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(x + 75, y - 5, 105, 55, 6);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Container corrugation lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let cx = x + 85; cx < x + 170; cx += 10) {
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(cx, y + 42);
      ctx.stroke();
    }

    // Wheels
    ctx.fillStyle = '#0f172a';
    [x + 20, x + 55, x + 105, x + 155].forEach((wx) => {
      ctx.beginPath();
      ctx.arc(wx, y + 48, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(wx, y + 48, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
    });

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🚚 ФУРА ДОСТАВКИ', x + 125, y + 24);
  };

  // =========================================================================
  // MODEL 2: DEDICATED SEPARATE ECO-WASTE / TRASH RECYCLING STATION
  // =========================================================================
  const drawTrashRecyclingStation = (ctx: CanvasRenderingContext2D, x: number, y: number, tick: number, isCarryingBox: boolean) => {
    const w = 105;
    const h = 72;

    // 1. Concrete platform base
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    // Yellow & Black hazard border tape around waste perimeter
    ctx.save();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.restore();

    // 2. Green Big Heavy-Duty Dumpster for cardboards & boxes
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 14, 46, 42, 5);
    ctx.fill();
    ctx.strokeStyle = isCarryingBox ? '#4ade80' : '#166534';
    ctx.lineWidth = isCarryingBox ? 2.5 : 1.5;
    ctx.stroke();

    // Dumpster lid
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 10, 50, 7, 3);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 16, y + 58, 4, 0, Math.PI * 2);
    ctx.arc(x + 50, y + 58, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Blue Sorting Bin for plastics & metals
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(x + 62, y + 20, 32, 36, 4);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Blue lid
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.roundRect(x + 60, y + 17, 36, 5, 2);
    ctx.fill();

    // 4. Stack of flattened cardboard boxes tied with twine
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 14, y + 36, 18, 5);
    ctx.fillRect(x + 13, y + 42, 20, 5);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 13, y + 36, 20, 11);

    // Universal recycling symbol on green dumpster
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('♻️', x + 33, y + 32);

    // Label on blue bin
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('СОРТ.', x + 78, y + 38);

    // Title label on station
    ctx.fillStyle = isCarryingBox ? '#4ade80' : '#cbd5e1';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('ПУНКТ УТИЛИЗАЦИИ', x + w / 2, y + 78);

    // Pulsing highlight if player is holding a delivery box
    if (isCarryingBox) {
      const pulse = Math.sin(tick * 0.15) * 3;
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - pulse, y - pulse, w + pulse * 2, h + pulse * 2);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('[E] СДАТЬ КОРОБКУ ♻️', x + w / 2, y - 5);
    }
  };

  // =========================================================================
  // MODEL 3: INDUSTRIAL CIRCULAR SAWMILL (Лесопилка с мощной циркулярной пилой)
  // =========================================================================
  const drawSawmillModel = (ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) => {
    const w = 150;
    const h = 95;

    // 1. Heavy cast-iron chassis foundation
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Corner bolts
    ctx.fillStyle = '#94a3b8';
    [
      [x + 6, y + 6],
      [x + w - 6, y + 6],
      [x + 6, y + h - 6],
      [x + w - 6, y + h - 6],
    ].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Conveyor bed with stainless steel rollers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 15, y + 20, 120, 48);

    ctx.fillStyle = '#64748b';
    for (let rx = x + 22; rx < x + 130; rx += 14) {
      ctx.fillRect(rx, y + 22, 6, 44);
    }

    // 3. Fresh pine log on conveyor feed
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(x + 20, y + 36, 48, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Log end rings
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 44, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Electric motor housing with cooling fins
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.roundRect(x + 95, y + 24, 32, 40, 4);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Motor cooling vents
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    for (let my = y + 28; my < y + 60; my += 5) {
      ctx.beginPath();
      ctx.moveTo(x + 98, my);
      ctx.lineTo(x + 124, my);
      ctx.stroke();
    }

    // Green power indicator light
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + 120, y + 30, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Red emergency stop mushroom button
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x + 104, y + 30, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Sawdust mound underneath
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(x + 75, y + 64, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Fast-spinning Circular Carbide Saw Blade
    const sawCenterX = x + 75;
    const sawCenterY = y + 44;
    const sawAngle = tick * 0.28;

    ctx.save();
    ctx.translate(sawCenterX, sawCenterY);
    ctx.rotate(sawAngle);

    // Steel blade disc
    const bladeGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
    bladeGrad.addColorStop(0, '#e2e8f0');
    bladeGrad.addColorStop(0.7, '#94a3b8');
    bladeGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // 16 sharp triangular cutting teeth
    ctx.fillStyle = '#f8fafc';
    const numTeeth = 16;
    for (let t = 0; t < numTeeth; t++) {
      const angle = (t * Math.PI * 2) / numTeeth;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(17, -2);
      ctx.lineTo(22, 0);
      ctx.lineTo(17, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Blade center arbor nut
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Dynamic sparks shooting from the saw
    ctx.save();
    for (let s = 0; s < 4; s++) {
      const sparkX = sawCenterX + (Math.sin(tick * 0.3 + s) * 12);
      const sparkY = sawCenterY + 10 + (Math.random() * 8);
      ctx.fillStyle = s % 2 === 0 ? '#fde047' : '#f97316';
      ctx.fillRect(sparkX, sparkY, 2, 2);
    }
    ctx.restore();

    // 7. Transparent acrylic safety hood / guard
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(sawCenterX, sawCenterY - 4, 22, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 8. Header label
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚙️ ЭКО-ЛЕСОПИЛКА', x + w / 2, y + 84);
  };

  // =========================================================================
  // MODEL 4: TELEPORT PAD (С шансом сбоя 25%, снижением панелями и перезагрузкой)
  // =========================================================================
  const drawTeleportPad = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tick: number,
    isBroken: boolean,
    rebootTime: number,
    failureRisk: number
  ) => {
    const pulse = Math.sin(tick * 0.08) * 3;

    ctx.save();
    // Parking pad background
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x - 42, y - 28, 84, 56, 10);
    ctx.fill();
    ctx.strokeStyle = isBroken ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Sleek Electric Car (Tesla style)
    const carX = x;
    const carY = y;

    // Car shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + 12, 28, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(carX - 22, carY + 6, 9, 7);
    ctx.fillRect(carX + 13, carY + 6, 9, 7);

    // Car Body (Red aerodynamic sedan)
    ctx.fillStyle = isBroken ? '#7f1d1d' : '#dc2626';
    ctx.beginPath();
    ctx.roundRect(carX - 26, carY - 8, 52, 18, [8, 14, 4, 4]);
    ctx.fill();

    // Windshield & Roof
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(carX - 14, carY - 8);
    ctx.lineTo(carX - 8, carY - 20);
    ctx.lineTo(carX + 14, carY - 20);
    ctx.lineTo(carX + 18, carY - 8);
    ctx.closePath();
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(carX + 24, carY - 4, 3, 4);

    if (isBroken) {
      // Broken / Hazard lights flashing & sparks
      ctx.fillStyle = (Math.floor(tick / 15) % 2 === 0) ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(carX + 24, carY - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Sparks
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      for (let arc = 0; arc < 3; arc++) {
        const angle = (tick * 0.15 + arc * 2.0) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(carX + Math.cos(angle) * 16, carY + Math.sin(angle) * 16 - 6);
        ctx.lineTo(carX + Math.cos(angle) * 28, carY + Math.sin(angle) * 28 - 6);
        ctx.stroke();
      }

      // Status labels
      ctx.fillStyle = '#ef4444';
      ctx.font = 'black 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ СБОЙ ЗАРЯДКИ ТЕСЛЫ!', x, y - 36);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px system-ui';
      if (rebootTime > 0) {
        ctx.fillText(`Авто-перезарядка: ${rebootTime}с`, x, y + 46);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '9px system-ui';
        ctx.fillText('[Клик/T: Заплатить 100 Br]', x, y + 60);
      } else {
        ctx.fillText('Оплатите 100 Br или ждите 1 мин', x, y + 46);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '9px system-ui';
        ctx.fillText('[Клик/T: Выбрать способ]', x, y + 60);
      }
    } else {
      // Online / Charging indicator
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(carX, carY - 14, 4 + pulse * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🚗 ЭЛЕКТРОКАР НА РЫНОК [T]', x, y + 46);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px system-ui';
      ctx.fillText(`Риск сбоя: ${failureRisk}%`, x, y + 60);
    }
    ctx.restore();
  };

  // =========================================================================
  // MODEL 5: DETAILED HIGH-FIDELITY TREES (Pine, Oak, Birch, Ancient, Sapling, Stump)
  // =========================================================================
  const drawDetailedTree = (ctx: CanvasRenderingContext2D, tree: Tree, tick: number) => {
    const { x, y, stage, type, health, maxHealth } = tree;
    const sway = Math.sin(tick * 0.035 + x * 0.08) * 2;

    // 1. STUMP: Tree growth rings & chopped detail
    if (stage === 'stump') {
      ctx.save();
      // Stump shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x, y - 2, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bark cylinder
      ctx.fillStyle = '#5c3818';
      ctx.beginPath();
      ctx.ellipse(x, y - 5, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flat cut wood face with annual growth rings
      ctx.fillStyle = '#b4783f';
      ctx.beginPath();
      ctx.ellipse(x, y - 7, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y - 7, 7, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, y - 7, 3, 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Axe notch mark
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 2, y - 8);
      ctx.lineTo(x + 4, y - 6);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // 2. SAPLING: Sprout with wooden support stake & soil mound
    if (stage === 'sapling') {
      ctx.save();
      // Fresh soil mound
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(x, y - 1, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Support wooden stick
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x - 4, y - 18);
      ctx.stroke();

      // Twine tie
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 10);
      ctx.lineTo(x - 1, y - 10);
      ctx.stroke();

      // Tender shoot stem
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 1);
      ctx.quadraticCurveTo(x + sway * 0.4, y - 10, x + 2 + sway * 0.7, y - 20);
      ctx.stroke();

      // Fresh leaves
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(x - 2 + sway * 0.5, y - 14, 5, 2.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 5 + sway * 0.7, y - 18, 5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 2 + sway * 0.7, y - 22, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // 3. MATURE / YOUNG / ANCIENT TREES
    ctx.save();
    const isAncient = stage === 'ancient';
    const trunkW = isAncient ? 18 : stage === 'mature' ? 11 : 6;
    const trunkH = isAncient ? 36 : stage === 'mature' ? 26 : 18;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y - 2, isAncient ? 34 : 22, isAncient ? 12 : 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk rendering based on tree type
    if (type === 'birch') {
      // Birch: white bark with horizontal dark notches
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);

      // Dark horizontal notches on bark
      ctx.fillStyle = '#1e293b';
      for (let by = y - trunkH + 4; by < y - 2; by += 6) {
        ctx.fillRect(x - trunkW / 2 + 1, by, trunkW * 0.6, 1.5);
      }
    } else {
      // Pine / Oak / Ancient: dark wood with grain fissures
      ctx.fillStyle = isAncient ? '#3e2212' : '#5c3116';
      ctx.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);

      // Bark vertical striations
      ctx.strokeStyle = '#381e0d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - trunkW / 4, y - trunkH);
      ctx.lineTo(x - trunkW / 4, y);
      ctx.moveTo(x + trunkW / 4, y - trunkH);
      ctx.lineTo(x + trunkW / 4, y);
      ctx.stroke();

      // Buttress roots spreading at base
      if (isAncient) {
        ctx.fillStyle = '#3e2212';
        ctx.beginPath();
        ctx.moveTo(x - trunkW, y);
        ctx.lineTo(x - trunkW / 2, y - 10);
        ctx.lineTo(x + trunkW / 2, y - 10);
        ctx.lineTo(x + trunkW, y);
        ctx.closePath();
        ctx.fill();

        // Moss on trunk base
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x - trunkW / 2, y - 6, trunkW, 4);
      }
    }

    // Canopy rendering based on type
    if (type === 'pine') {
      // PINE: 3-tiered triangular needle boughs
      const boughWidths = isAncient ? [56, 44, 30] : [38, 28, 18];
      const boughHeights = isAncient ? [24, 20, 18] : [16, 14, 12];
      const tierYs = [
        y - trunkH - 6,
        y - trunkH - 18,
        y - trunkH - 30,
      ];

      for (let tier = 0; tier < 3; tier++) {
        const bw = boughWidths[tier];
        const bh = boughHeights[tier];
        const ty = tierYs[tier];
        const tierSway = sway * (1 + tier * 0.3);

        // Dark forest shadow layer
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.moveTo(x + tierSway, ty - bh);
        ctx.lineTo(x + bw / 2 + tierSway, ty);
        ctx.lineTo(x - bw / 2 + tierSway, ty);
        ctx.closePath();
        ctx.fill();

        // Bright green needle highlight fringe
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.moveTo(x + tierSway, ty - bh);
        ctx.lineTo(x + (bw / 2) * 0.8 + tierSway, ty - 2);
        ctx.lineTo(x - (bw / 2) * 0.8 + tierSway, ty - 2);
        ctx.closePath();
        ctx.fill();
      }

      // Pine cones
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(x - 10 + sway, y - trunkH - 4, 2.5, 4, 0.2, 0, Math.PI * 2);
      ctx.ellipse(x + 10 + sway, y - trunkH - 8, 2.5, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'birch') {
      // BIRCH: delicate, golden-green dancing cloud foliage
      const crownR = isAncient ? 28 : 18;
      const cy = y - trunkH - crownR * 0.8;

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(x + sway, cy, crownR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(x - 5 + sway, cy - 4, crownR * 0.7, 0, Math.PI * 2);
      ctx.arc(x + 6 + sway, cy - 2, crownR * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(x + sway, cy - 8, crownR * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // OAK / ANCIENT: Multi-lobed lush crown with highlights
      const crownR = isAncient ? 36 : 22;
      const cy = y - trunkH - crownR * 0.7;

      // Dark foliage shadow
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(x + sway, cy, crownR, 0, Math.PI * 2);
      ctx.fill();

      // Overlapping organic leafy lobes
      const lobes = [
        { dx: -crownR * 0.5, dy: crownR * 0.1, r: crownR * 0.65 },
        { dx: crownR * 0.5, dy: crownR * 0.1, r: crownR * 0.65 },
        { dx: -crownR * 0.3, dy: -crownR * 0.4, r: crownR * 0.6 },
        { dx: crownR * 0.3, dy: -crownR * 0.4, r: crownR * 0.6 },
        { dx: 0, dy: -crownR * 0.55, r: crownR * 0.55 },
      ];

      ctx.fillStyle = isAncient ? '#166534' : '#15803d';
      lobes.forEach((l) => {
        ctx.beginPath();
        ctx.arc(x + l.dx + sway, cy + l.dy, l.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sunlight highlights on upper lobes
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x - 4 + sway, cy - crownR * 0.35, crownR * 0.45, 0, Math.PI * 2);
      ctx.arc(x + 5 + sway, cy - crownR * 0.3, crownR * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Magical glowing cyan/gold spores for ancient trees
      if (isAncient) {
        ctx.fillStyle = '#67e8f9';
        for (let sp = 0; sp < 3; sp++) {
          const spX = x + Math.sin(tick * 0.05 + sp * 2) * (crownR * 0.8);
          const spY = cy - 10 + Math.cos(tick * 0.04 + sp * 3) * (crownR * 0.5);
          ctx.beginPath();
          ctx.arc(spX, spY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Health bar when tree is damaged
    if (health < maxHealth && health > 0) {
      const barW = 28;
      const barH = 4;
      const barX = x - barW / 2;
      const barY = y - trunkH - (isAncient ? 50 : 36);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const healthPct = health / maxHealth;
      ctx.fillStyle = healthPct > 0.5 ? '#22c55e' : '#ef4444';
      ctx.fillRect(barX, barY, barW * healthPct, barH);
    }
    ctx.restore();
  };

  // Helper: Draw Machine (Солнечные панели, ветряки, батареи, орошение, дроны)
  const drawMachine = (ctx: CanvasRenderingContext2D, m: PlacedMachine, tick: number) => {
    if (m.type === 'solar_panel') {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(m.x - 20, m.y - 14, 40, 26, 4);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Solar grid lines
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(m.x - 20, m.y);
      ctx.lineTo(m.x + 20, m.y);
      ctx.moveTo(m.x - 7, m.y - 14);
      ctx.lineTo(m.x - 7, m.y + 12);
      ctx.moveTo(m.x + 7, m.y - 14);
      ctx.lineTo(m.x + 7, m.y + 12);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('☀️ ПАНЕЛЬ', m.x, m.y + 3);
    } else if (m.type === 'solar_panel_mk2') {
      // Sleek Monocrystalline Stealth Panel Mk.2 Pro
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(m.x - 22, m.y - 15, 44, 28, 4);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Gold grid
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(m.x - 18, m.y - 11, 36, 20);

      // Green status LED
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(m.x + 16, m.y - 9, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ MK.2 PRO', m.x, m.y + 3);
    } else if (m.type === 'wind_turbine') {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(m.x - 3, m.y - 25, 6, 25);
      const angle = tick * 0.1;
      ctx.save();
      ctx.translate(m.x, m.y - 25);
      ctx.rotate(angle);
      ctx.fillStyle = '#f8fafc';
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.fillRect(-2, 0, 4, 16);
      }
      ctx.restore();
    } else if (m.type === 'battery_pack') {
      // PowerBank Cabinet
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(m.x - 14, m.y - 18, 28, 32, 4);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Green LED level bars
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(m.x - 9, m.y - 12 + b * 7, 18, 4);
      }
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🔋 АКБ', m.x, m.y + 11);
    } else if (m.type === 'auto_irrigation') {
      // Irrigation Tank & Sprinkler
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(m.x - 15, m.y - 15, 30, 24, 4);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sprinkler mist droplets
      const mistPhase = (tick * 0.2) % 6;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.6)';
      ctx.beginPath();
      ctx.arc(m.x, m.y - 18 - mistPhase, 2 + mistPhase * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('💧 ПОЛИВ', m.x, m.y + 3);
    } else if (m.type === 'drone_scanner') {
      // Drone Landing Pad & Hovering Quadcopter
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Drone hovering above pad
      const droneY = m.y - 18 + Math.sin(tick * 0.15) * 3;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(m.x - 8, droneY - 4, 16, 8);
      // Spinning rotors
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(m.x - 9, droneY - 5, 6, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(m.x + 9, droneY - 5, 6, 2, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🛸 ДРОН', m.x, m.y + 11);
    }
  };

  // Helper: Draw Delivery Box
  const drawDeliveryBox = (ctx: CanvasRenderingContext2D, box: DeliveryBox, isNearby: boolean) => {
    if (box.isCarried) return;
    const { x, y, isDiscardedTrash } = box;

    ctx.fillStyle = isDiscardedTrash ? '#78716c' : '#d97706';
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 10, 20, 20, 3);
    ctx.fill();

    ctx.strokeStyle = isNearby ? '#ffffff' : isDiscardedTrash ? '#dc2626' : '#b45309';
    ctx.lineWidth = isNearby ? 2 : 1;
    ctx.stroke();

    // Tape
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x - 10, y - 2, 20, 4);

    if (isDiscardedTrash) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('МУСОР', x, y + 18);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('КОРОБКА', x, y + 18);
    }
  };

  // Helper: Draw Worker
  const drawWorker = (ctx: CanvasRenderingContext2D, w: Worker, tick: number) => {
    const bob = Math.sin(tick * 0.2 + w.x) * 2;
    ctx.fillStyle = '#065f46'; // Green overalls
    ctx.fillRect(w.x - 5, w.y - 20 + bob, 10, 18);
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(w.x, w.y - 24 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(w.x - 5, w.y - 28 + bob, 10, 3); // Helmet
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(w.name, w.x, w.y - 32 + bob);
  };

  const drawBoxTooltip = (ctx: CanvasRenderingContext2D, box: DeliveryBox, _carried: DeliveryBox | null) => {
    ctx.save();
    const bw = 250;
    const bh = 55;
    const bx = Math.max(20, Math.min(1000 - bw - 20, box.x - bw / 2));
    const by = Math.max(50, box.y - bh - 15);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 8);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`📦 Коробка: ${box.contentName}`, bx + 10, by + 18);

    ctx.font = '10px system-ui';
    ctx.fillStyle = box.isDiscardedTrash ? '#f87171' : '#fde047';
    if (box.isDiscardedTrash) {
      ctx.fillText('Пустая коробка! Отнесите в пункт утилизации [E]', bx + 10, by + 36);
    } else {
      ctx.fillText('[E] Взять и открыть коробку · ЛКМ сломать', bx + 10, by + 36);
    }
    ctx.restore();
  };

  // =========================================================================
  // HELPER: DRAW DETAILED MARKET STALL (С полосатым навесом, продавцом и товарами)
  // =========================================================================
  const drawDetailedMarketStall = (
    ctx: CanvasRenderingContext2D,
    stall: {
      name: string;
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
      isDecorativeOnly?: boolean;
    },
    tick: number,
    playerStallStock?: MarketStallStock,
    competitor?: CompetitorStall
  ) => {
    const { x, y, width, height, primaryColor, stripeColor, icon, name, goods, clerkName, isDecorativeOnly } = stall;

    ctx.save();

    // 1. Drop shadow on cobblestones
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height - 2, width / 2 + 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Back Wall (Деревянная задняя стена)
    ctx.fillStyle = '#271509';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 24, width - 20, height - 28, 4);
    ctx.fill();

    // Back wall wooden horizontal slats
    ctx.strokeStyle = '#3e200e';
    ctx.lineWidth = 1;
    for (let sy = y + 36; sy < y + height - 35; sy += 12) {
      ctx.beginPath();
      ctx.moveTo(x + 12, sy);
      ctx.lineTo(x + width - 12, sy);
      ctx.stroke();
    }

    // 3. Timber corner posts (Опорные деревянные столбы)
    ctx.fillStyle = '#5c2d12';
    ctx.fillRect(x + 6, y + 18, 9, height - 22);
    ctx.fillRect(x + width - 15, y + 18, 9, height - 22);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 7, y + 18, 2, height - 22);
    ctx.fillRect(x + width - 14, y + 18, 2, height - 22);

    // 4. Shopkeeper NPC behind counter (Продавец за прилавком)
    const clerkX = x + width / 2;
    const clerkY = y + 48;
    const isBlinking = tick % 90 < 5;

    // Body / Apron
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(clerkX - 12, clerkY + 6, 24, 22, [6, 6, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Apron straps
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(clerkX - 8, clerkY + 6);
    ctx.lineTo(clerkX - 4, clerkY + 20);
    ctx.moveTo(clerkX + 8, clerkY + 6);
    ctx.lineTo(clerkX + 4, clerkY + 20);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(clerkX, clerkY, 9, 0, Math.PI * 2);
    ctx.fill();

    // Hat / Hair based on craft
    if (goods === 'bread') {
      // White baker's hat (Поварской колпак)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(clerkX - 9, clerkY - 14, 18, 8, [4, 4, 0, 0]);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 14, 9, Math.PI, 0);
      ctx.fill();
    } else if (goods === 'smith') {
      // Orange forge bandana (Бандана кузнеца)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 2, 9.5, Math.PI, 0);
      ctx.fill();
    } else if (goods === 'player_wood') {
      // Golden master cap (Фуражка управляющего)
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 3, 9.5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(clerkX - 10, clerkY - 2, 20, 2.5);
    } else if (goods === 'samovar') {
      // Merchant ushanka cap with fur trim
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 3, 9, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(clerkX - 10, clerkY - 3, 20, 4);
    } else if (goods === 'apothecary') {
      // Herbalist pointed hood/beret
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(clerkX - 9, clerkY - 2);
      ctx.lineTo(clerkX, clerkY - 14);
      ctx.lineTo(clerkX + 9, clerkY - 2);
      ctx.closePath();
      ctx.fill();
    } else if (goods === 'cheese') {
      // Alpine straw hat
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(clerkX - 11, clerkY - 3, 22, 3);
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 4, 7, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.fillRect(clerkX - 7, clerkY - 4, 14, 1.5);
    } else if (goods === 'fish') {
      // Sailor beanie
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 2, 9, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(clerkX - 9, clerkY - 2, 18, 3);
    } else if (goods === 'books') {
      // Scholar bonnet with tassel
      ctx.fillStyle = '#312e81';
      ctx.fillRect(clerkX - 10, clerkY - 8, 20, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(clerkX + 6, clerkY - 6, 2, 6);
    } else if (goods === 'amber') {
      // Jeweler cap with brass loupe
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 3, 9, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(clerkX + 4, clerkY - 1, 3, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Cozy merchant hair / beret
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(clerkX, clerkY - 4, 9, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#0f172a';
    if (isBlinking) {
      ctx.fillRect(clerkX - 5, clerkY - 1, 3, 1);
      ctx.fillRect(clerkX + 2, clerkY - 1, 3, 1);
    } else {
      ctx.beginPath();
      ctx.arc(clerkX - 3.5, clerkY - 1, 1.3, 0, Math.PI * 2);
      ctx.arc(clerkX + 3.5, clerkY - 1, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smile
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(clerkX, clerkY + 2, 3, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // 5. Wooden Counter (Прилавок с полированной крышкой)
    const counterY = y + height - 36;
    const counterH = 26;

    // Front facade (нижняя часть прилавка)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.roundRect(x + 8, counterY + 6, width - 16, counterH - 6, [0, 0, 5, 5]);
    ctx.fill();

    // Facade vertical planks
    ctx.strokeStyle = '#270e02';
    ctx.lineWidth = 1;
    for (let px = x + 20; px < x + width - 16; px += 14) {
      ctx.beginPath();
      ctx.moveTo(px, counterY + 6);
      ctx.lineTo(px, counterY + counterH);
      ctx.stroke();
    }

    // Counter table top with beveled edges (Крышка прилавка)
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.roundRect(x + 4, counterY, width - 8, 8, 3);
    ctx.fill();

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x + 5, counterY + 1, width - 10, 2); // Highlight

    // 6. Detailed 3D Goods on Display (Уникальные модельки товаров на прилавке)
    const gx = x + 16;
    const gy = counterY - 2;

    if (goods === 'player_wood' && playerStallStock) {
      // Golden sawn planks stacked
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(gx, gy - 8, 32, 7);
      ctx.fillRect(gx + 3, gy - 14, 26, 6);
      ctx.strokeStyle = '#78350f';
      ctx.strokeRect(gx, gy - 8, 32, 7);
      ctx.strokeRect(gx + 3, gy - 14, 26, 6);

      // Stacked round logs with rings
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(gx + 40, gy - 10, 30, 9, 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(gx + 43, gy - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.stroke();

      // Brass scales / ledger
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(gx + 78, gy - 8, 14, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(gx + 80, gy - 7, 10, 5);
    } else if (goods === 'competitor_boris') {
      // Rough bark pine logs
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(gx + 4, gy - 12, 34, 11, 3);
      ctx.fill();
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(gx + 7, gy - 6.5, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // Hatchet on counter
      ctx.fillStyle = '#64748b';
      ctx.fillRect(gx + 48, gy - 10, 10, 6);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(gx + 54, gy - 6, 12, 3);
    } else if (goods === 'competitor_taiga') {
      // Birch logs with white bark and black flecks
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(gx + 6, gy - 12, 36, 11, 3);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(gx + 14, gy - 10, 4, 2);
      ctx.fillRect(gx + 26, gy - 6, 5, 2);
      ctx.fillRect(gx + 34, gy - 11, 3, 2);
    } else if (goods === 'bread') {
      // Wicker bread basket
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(gx + 4, gy - 11, 24, 10, 3);
      ctx.fill();
      // Golden baguettes sticking out
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(gx + 12, gy - 12, 3.5, 9, -0.2, 0, Math.PI * 2);
      ctx.ellipse(gx + 20, gy - 13, 3.5, 9, 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Round sourdough loaf
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(gx + 44, gy - 6, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Pretzel
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.strokeRect(gx + 60, gy - 8, 10, 7);
    } else if (goods === 'smith') {
      // Heavy iron anvil
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(gx + 8, gy);
      ctx.lineTo(gx + 12, gy - 9);
      ctx.lineTo(gx + 26, gy - 9);
      ctx.lineTo(gx + 22, gy);
      ctx.closePath();
      ctx.fill();
      // Glowing red hot ingot with spark particles
      ctx.fillStyle = '#f97316';
      ctx.fillRect(gx + 32, gy - 6, 14, 5);
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 6;
      ctx.fillRect(gx + 34, gy - 5, 10, 3);
      ctx.shadowBlur = 0;
      // Sparks
      const sparkY = gy - 9 - Math.sin(tick * 0.3) * 4;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(gx + 38, sparkY, 1.5, 1.5);
      ctx.fillRect(gx + 42, sparkY - 3, 1.5, 1.5);
      // Hammer
      ctx.fillStyle = '#64748b';
      ctx.fillRect(gx + 54, gy - 10, 8, 5);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 58, gy - 6, 14, 2.5);
    } else if (goods === 'pottery') {
      // Turquoise amphora
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(gx + 12, gy - 8, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(gx + 10, gy - 17, 4, 3);
      // Terracotta clay pot
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(gx + 26, gy - 11, 12, 10, [2, 2, 4, 4]);
      ctx.fill();
      // Painted decorative plate
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(gx + 49, gy - 6, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (goods === 'honey') {
      // Amber honey jars with checkered cloth caps
      for (let j = 0; j < 3; j++) {
        const jx = gx + 8 + j * 16;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(jx, gy - 9, 10, 9);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(jx - 1, gy - 12, 12, 3.5);
      }
      // Honeycomb frame
      ctx.fillStyle = '#fef08a';
      ctx.strokeRect(gx + 56, gy - 12, 14, 11);
      ctx.fillRect(gx + 57, gy - 11, 12, 9);
      // Tiny flying bee
      const beeX = gx + 52 + Math.sin(tick * 0.15) * 6;
      const beeY = gy - 16 + Math.cos(tick * 0.2) * 3;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(beeX, beeY, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(beeX - 1, beeY - 1, 2, 1.5);
    } else if (goods === 'produce') {
      // Produce wooden crate with red apples
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 6, gy - 9, 22, 9);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(gx + 11, gy - 7, 3.5, 0, Math.PI * 2);
      ctx.arc(gx + 18, gy - 7, 3.5, 0, Math.PI * 2);
      ctx.arc(gx + 14, gy - 11, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Mini orange pumpkin
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(gx + 40, gy - 6, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.fillRect(gx + 39, gy - 13, 2, 3);
    } else if (goods === 'flowers') {
      // 2 Terracotta pots with blooms
      for (let f = 0; f < 2; f++) {
        const fx = gx + 10 + f * 20;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(fx, gy - 7, 9, 7);
        ctx.fillStyle = f === 0 ? '#ec4899' : '#a855f7';
        ctx.beginPath();
        ctx.arc(fx + 4.5, gy - 11, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Golden brass watering can
      ctx.fillStyle = '#eab308';
      ctx.fillRect(gx + 48, gy - 9, 12, 8);
      ctx.fillRect(gx + 58, gy - 12, 6, 2.5);
    } else if (goods === 'apothecary') {
      // Glowing green potion bottle
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(gx + 12, gy - 7, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 10.5, gy - 16, 3, 3); // Cork
      // Purple phial
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.ellipse(gx + 26, gy - 6, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 24.5, gy - 14, 3, 3);
      // Stone mortar & pestle
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(gx + 46, gy - 5, 7, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillRect(gx + 44, gy - 13, 4, 10);
      // Dried herb bundle
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(gx + 60, gy - 10, 10, 8);
      ctx.strokeStyle = '#ca8a04';
      ctx.strokeRect(gx + 60, gy - 10, 10, 8);
    } else if (goods === 'samovar') {
      // Polished copper Russian Samovar
      const sx = gx + 22;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(sx - 7, gy - 18, 14, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(sx - 3, gy - 23, 6, 5); // Chimney
      ctx.fillRect(sx - 5, gy - 26, 10, 3); // Teapot on top
      // Spigot tap
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(sx + 7, gy - 10, 4, 2);
      // Animated steam puff
      const steamY = gy - 28 - ((tick * 0.3) % 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(sx, steamY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Ring of golden bagels/sushki hanging
      for (let b = 0; b < 3; b++) {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gx + 48 + b * 7, gy - 8, 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Painted teacup & saucer
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(gx + 55, gy - 5, 8, 5);
      ctx.strokeStyle = '#dc2626';
      ctx.strokeRect(gx + 55, gy - 5, 8, 5);
    } else if (goods === 'cheese') {
      // Large golden cheese wheel with wedge missing
      const cx = gx + 18;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, gy - 7, 9, 0.3, Math.PI * 1.8);
      ctx.lineTo(cx, gy - 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(cx - 3, gy - 9, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 2, gy - 5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      // Cut cheese wedge on board
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 36, gy - 4, 26, 4); // Board
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(gx + 42, gy - 4);
      ctx.lineTo(gx + 54, gy - 4);
      ctx.lineTo(gx + 48, gy - 14);
      ctx.closePath();
      ctx.fill();
      // Cheese knife
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(gx + 52, gy - 7, 10, 2);
    } else if (goods === 'woodcarver') {
      // Carved wooden rocking horse
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(gx + 16, gy - 8, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(gx + 18, gy - 15, 4, 8); // Head/neck
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(gx + 12, gy - 3, 14, 2); // Rocker runner
      // Hand-painted Matryoshka doll
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(gx + 38, gy - 7, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(gx + 38, gy - 10, 3, 0, Math.PI * 2);
      ctx.fill();
      // Chisel & curly wood shavings
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(gx + 52, gy - 7, 10, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 60, gy - 6, 6, 2);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx + 55, gy - 3, 2.5, 0, Math.PI);
      ctx.stroke();
    } else if (goods === 'weaver') {
      // 3 Fabric rolls (purple, crimson, emerald)
      const fabrics = ['#7c3aed', '#dc2626', '#059669'];
      fabrics.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(gx + 6 + idx * 14, gy - 12, 10, 11);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(gx + 8 + idx * 14, gy - 12, 3, 11);
      });
      // Wooden weaving shuttle
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(gx + 58, gy - 6, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(gx + 55, gy - 7, 6, 2); // Thread on bobbin
    } else if (goods === 'fish') {
      // Half-barrel of ice with fish
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 6, gy - 10, 22, 10);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(gx + 7, gy - 11, 20, 3); // Ice
      // Silver trout
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(gx + 16, gy - 9, 8, 3.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(gx + 8, gy - 10, 2.5, 2.5); // Tail
      // Smoked golden sturgeon
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(gx + 42, gy - 8, 10, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Fish net on counter with cork floats
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(gx + 56, gy - 9, 14, 8);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(gx + 58, gy - 11, 3, 3);
      ctx.fillRect(gx + 65, gy - 11, 3, 3);
    } else if (goods === 'books') {
      // Stack of 3 leatherbound books
      const bookCols = ['#7f1d1d', '#1e3a8a', '#14532d'];
      bookCols.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(gx + 6, gy - 4 - idx * 4, 22, 4);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(gx + 6, gy - 4 - idx * 4, 2, 4); // Gold spine
      });
      // Rolled parchment map with red seal
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.roundRect(gx + 34, gy - 10, 18, 9, 3);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(gx + 43, gy - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Inkwell and feather quill
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(gx + 58, gy - 6, 6, 6);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(gx + 61, gy - 6);
      ctx.lineTo(gx + 68, gy - 16);
      ctx.lineTo(gx + 66, gy - 16);
      ctx.closePath();
      ctx.fill();
    } else if (goods === 'amber') {
      // Midnight velvet jewelry pad
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(gx + 6, gy - 8, 38, 8, 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(gx + 6, gy - 8, 38, 8);
      // Polished glowing amber gems
      const ambers = [gx + 12, gx + 22, gx + 32];
      ambers.forEach((ax, idx) => {
        ctx.fillStyle = idx === 1 ? '#ea580c' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(ax, gy - 5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax - 1, gy - 7, 1.5, 1.5);
      });
      // Brass jeweler's loupe
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(gx + 56, gy - 6, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(gx + 59, gy - 4, 8, 2);
    }

    // 7. Striped 3D Awning Canopy (Объёмный полосатый навес с волнистым краем)
    const awningY = y + 2;
    const awningH = 24;
    const stripeCount = 7;
    const stripeW = width / stripeCount;

    // Awning slope shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 2, awningY + awningH, width - 4, 5);

    // Draw awning stripes
    for (let i = 0; i < stripeCount; i++) {
      const sx = x + i * stripeW;
      ctx.fillStyle = i % 2 === 0 ? primaryColor : stripeColor;

      ctx.beginPath();
      ctx.moveTo(sx, awningY);
      ctx.lineTo(sx + stripeW, awningY);
      ctx.lineTo(sx + stripeW + 1, awningY + awningH);
      ctx.lineTo(sx - 1, awningY + awningH);
      ctx.closePath();
      ctx.fill();

      // Scalloped hem at bottom (волнистый тканевый край)
      ctx.beginPath();
      ctx.arc(sx + stripeW / 2, awningY + awningH, stripeW / 2, 0, Math.PI);
      ctx.fill();
    }

    // Top highlight on the roof ridge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(x, awningY, width, 3);

    // 8. Hanging Signboard (Подвесная деревянная вывеска на цепочках)
    const signW = Math.min(width - 16, 155);
    const signX = x + (width - signW) / 2;
    const signY = y - 10;

    // Little chains
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(signX + 16, awningY);
    ctx.lineTo(signX + 16, signY + 12);
    ctx.moveTo(signX + signW - 16, awningY);
    ctx.lineTo(signX + signW - 16, signY + 12);
    ctx.stroke();

    // Signboard plank
    ctx.fillStyle = '#3b1803';
    ctx.beginPath();
    ctx.roundRect(signX, signY, signW, 19, 4);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Signboard text
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9.5px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${icon} ${name}`, signX + signW / 2, signY + 13);

    // 9. Bottom Info / Interaction Banner (Нижняя статусная плашка)
    const badgeY = y + height + 1;
    ctx.textAlign = 'center';

    if (goods === 'player_wood' && playerStallStock) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(`🌟 ВАШ ПРИЛАВОК [E]`, x + width / 2, badgeY + 12);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#fed7aa';
      ctx.fillText(`Досок: ${playerStallStock.planksOnDisplay} · Брёвен: ${playerStallStock.logsOnDisplay}`, x + width / 2, badgeY + 23);
    } else if (competitor) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(`${competitor.ownerName} [Клик]`, x + width / 2, badgeY + 12);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Цена: $${competitor.pricePerUnit} · Запас: ${competitor.stockCount}`, x + width / 2, badgeY + 23);
    } else if (isDecorativeOnly) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 9px system-ui';
      ctx.fillText(`Выставка · Покупки закрыты`, x + width / 2, badgeY + 12);
    }

    ctx.restore();
  };

  // =========================================================================
  // HELPER: DRAW NOTICE BOARD (Павильон вакансий и найма)
  // =========================================================================
  const drawNoticeBoard = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, workersCount: number, tick: number) => {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height - 2, width / 2 + 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden timber frame
    ctx.fillStyle = '#3f1f0a';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 16, width - 16, height - 20, 6);
    ctx.fill();

    // Cork / Wood Notice Board Surface
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(x + 14, y + 22, width - 28, height - 32, 4);
    ctx.fill();

    // Pinned job flyers with seals
    const papers = [
      { px: x + 20, py: y + 26, w: 28, h: 22, col: '#fef08a' },
      { px: x + 54, py: y + 28, w: 32, h: 20, col: '#ffffff' },
      { px: x + 92, py: y + 25, w: 30, h: 24, col: '#fef9c3' },
      { px: x + 128, py: y + 27, w: 26, h: 22, col: '#fed7aa' },
    ];
    papers.forEach((p) => {
      ctx.fillStyle = p.col;
      ctx.fillRect(p.px, p.py, p.w, p.h);
      // Red pin
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(p.px + p.w / 2, p.py + 2.5, 2, 0, Math.PI * 2);
      ctx.fill();
      // Text lines
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.px + 4, p.py + 8);
      ctx.lineTo(p.px + p.w - 4, p.py + 8);
      ctx.moveTo(p.px + 4, p.py + 14);
      ctx.lineTo(p.px + p.w - 6, p.py + 14);
      ctx.stroke();
    });

    // Wooden Gazebo Roof
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 16);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width - 2, y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lantern hanging with warm pulse
    const lanternGlow = Math.sin(tick * 0.1) * 3;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 18, 4 + lanternGlow * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('📋 ДОСКА ВАКАНСИЙ [E]', x + width / 2, y + height + 8);
    ctx.font = '9px system-ui';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(`Нанято рабочих: ${workersCount} чел.`, x + width / 2, y + height + 20);

    ctx.restore();
  };

  // =========================================================================
  // HELPER: DRAW HARDWARE STORE ENTRANCE (Фасад Эко-Строймаркета)
  // =========================================================================
  const drawHardwareStoreEntrance = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, tick: number) => {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 6, y + height - 2, width - 12, 10);

    // Stone / Brick Storefront Building
    ctx.fillStyle = '#311042';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [8, 8, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Brick texture bands
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 1;
    for (let by = y + 18; by < y + height - 10; by += 14) {
      ctx.beginPath();
      ctx.moveTo(x + 6, by);
      ctx.lineTo(x + width - 6, by);
      ctx.stroke();
    }

    // 2 Showcase Glass Bay Windows (Витрины с подсветкой)
    // Left Window: Solar panel display
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(x + 16, y + 36, 42, 38);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 16, y + 36, 42, 38);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 22, y + 44, 30, 22);
    ctx.strokeStyle = '#bae6fd';
    ctx.strokeRect(x + 22, y + 44, 30, 22);

    // Right Window: Generator display
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(x + width - 58, y + 36, 42, 38);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + width - 58, y + 36, 42, 38);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + width - 52, y + 46, 30, 20);

    // Center Grand Double Glass Doors (Входные двери)
    const doorX = x + width / 2 - 24;
    const doorY = y + 32;
    ctx.fillStyle = '#1e1035';
    ctx.fillRect(doorX, doorY, 48, 52);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX, doorY, 48, 52);

    // Door glass panels
    ctx.fillStyle = '#581c87';
    ctx.fillRect(doorX + 4, doorY + 4, 18, 38);
    ctx.fillRect(doorX + 26, doorY + 4, 18, 38);

    // Brass handles
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(doorX + 18, doorY + 22, 2.5, 8);
    ctx.fillRect(doorX + 27, doorY + 22, 2.5, 8);

    // Welcome Floor Mat
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(doorX - 6, y + height - 2, 60, 10);
    ctx.fillStyle = '#f3e8ff';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ВХОД В СТРОЙМАГ', doorX + 24, y + height + 6);

    // Backlit Neon Marquee Sign (Неоновая вывеска)
    const neonPulse = Math.sin(tick * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(168, 85, 247, ${neonPulse * 0.3})`;
    ctx.beginPath();
    ctx.roundRect(x + 20, y + 6, width - 40, 20, 4);
    ctx.fill();

    ctx.fillStyle = '#f3e8ff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🏬 ЭКО-СТРОЙМАРКЕТ', x + width / 2, y + 20);

    ctx.restore();
  };

  // =========================================================================
  // HELPER: DRAW CENTRAL FOUNTAIN (Резной каменный фонтан ярмарки)
  // =========================================================================
  const drawCentralFountain = (ctx: CanvasRenderingContext2D, cx: number, cy: number, tick: number) => {
    ctx.save();

    // Outer stone cobblestone ring
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner Water Pool
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx, cy, 33, 0, Math.PI * 2);
    ctx.fill();

    // Water ripple waves
    const r1 = (tick * 0.4) % 30;
    const r2 = ((tick * 0.4) + 15) % 30;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r1, 0, Math.PI * 2);
    ctx.arc(cx, cy, r2, 0, Math.PI * 2);
    ctx.stroke();

    // Central Stone Tier Pedestal
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Upper bowl
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Animated water jets & fountain splash droplets
    const jetHeight = Math.sin(tick * 0.15) * 4 + 14;
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - jetHeight);
    ctx.stroke();

    // Droplets
    ctx.fillStyle = '#ffffff';
    for (let a = 0; a < 4; a++) {
      const angle = a * (Math.PI / 2) + tick * 0.08;
      const dropDist = 12 + Math.sin(tick * 0.2 + a) * 6;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dropDist, cy + Math.sin(angle) * dropDist, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4 Corner Flower Planters around fountain
    const planters = [
      { px: cx - 48, py: cy - 20, col: '#f43f5e' },
      { px: cx + 48, py: cy - 20, col: '#38bdf8' },
      { px: cx - 48, py: cy + 20, col: '#fbbf24' },
      { px: cx + 48, py: cy + 20, col: '#a855f7' },
    ];
    planters.forEach((p) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(p.px - 6, p.py - 5, 12, 10, 2);
      ctx.fill();
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.px, p.py - 6, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  // =========================================================================
  // HELPER: DRAW STREET LAMP (Старинный фонарный столб с мягким светом)
  // =========================================================================
  const drawStreetLamp = (ctx: CanvasRenderingContext2D, lx: number, ly: number, tick: number) => {
    ctx.save();

    // Light aura on ground
    const glow = Math.sin(tick * 0.1) * 3 + 28;
    const radGlow = ctx.createRadialGradient(lx, ly - 20, 2, lx, ly - 20, glow);
    radGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    radGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(lx, ly - 20, glow, 0, Math.PI * 2);
    ctx.fill();

    // Cast-iron pole
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(lx - 2, ly - 36, 4, 36);

    // Pole base
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fill();

    // Lantern cage
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(lx - 4, ly - 42, 8, 8);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(lx - 4, ly - 42, 8, 8);

    // Lantern roof
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(lx - 6, ly - 42);
    ctx.lineTo(lx, ly - 48);
    ctx.lineTo(lx + 6, ly - 42);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // 2. MARKET LOCATION (Полностью обновлённая ярмарка: модельки, лавки, фонтан)
  // =========================================================================
  const renderMarketLocation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tick: number) => {
    // 1. Cobblestone Plaza Base (Каменная брусчатка ярмарочной площади)
    ctx.fillStyle = '#1e2630';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw staggered cobblestone pavement flags
    for (let y = 0; y < canvas.height; y += 32) {
      const rowOffset = (Math.floor(y / 32) % 2) * 24;
      for (let x = -24; x < canvas.width + 48; x += 48) {
        ctx.strokeStyle = '#2d3b48';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + rowOffset, y, 48, 32);

        // Subtle granite texture flecks
        if ((x + y) % 96 === 0) {
          ctx.fillStyle = '#25303c';
          ctx.fillRect(x + rowOffset + 6, y + 6, 36, 20);
        }
      }
    }

    // 2. Decorative Central Plaza Pathways (Широкие мощёные аллеи)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(40, 280, canvas.width - 80, 50); // Horizontal avenue
    ctx.fillRect(440, 30, 120, canvas.height - 60); // Vertical grand avenue

    // 3. Central Fountain (Резной каменный фонтан в центре площади)
    drawCentralFountain(ctx, 500, 245, tick);

    // 4. Festive Market Bunting Strings (Разноцветные гирлянды флажков ярмарки)
    const buntingStrings = [
      { x1: 200, y1: 155, x2: 440, y2: 155, sag: 18 },
      { x1: 560, y1: 155, x2: 780, y2: 155, sag: 18 },
      { x1: 200, y1: 430, x2: 440, y2: 430, sag: 18 },
      { x1: 560, y1: 430, x2: 780, y2: 430, sag: 18 },
    ];
    const flagColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    buntingStrings.forEach((str) => {
      ctx.save();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(str.x1, str.y1);
      const midX = (str.x1 + str.x2) / 2;
      const midY = (str.y1 + str.y2) / 2 + str.sag;
      ctx.quadraticCurveTo(midX, midY, str.x2, str.y2);
      ctx.stroke();

      // Flags
      for (let t = 0.1; t < 0.95; t += 0.12) {
        const u = 1 - t;
        const fx = u * u * str.x1 + 2 * u * t * midX + t * t * str.x2;
        const fy = u * u * str.y1 + 2 * u * t * midY + t * t * str.y2;
        const colIdx = Math.floor(t * 10) % flagColors.length;

        ctx.fillStyle = flagColors[colIdx];
        ctx.beginPath();
        ctx.moveTo(fx - 4, fy);
        ctx.lineTo(fx + 4, fy);
        ctx.lineTo(fx, fy + 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // 5. Street Lamps (Старинные фонари на перекрёстках аллей)
    drawStreetLamp(ctx, 350, 175, tick);
    drawStreetLamp(ctx, 650, 175, tick);
    drawStreetLamp(ctx, 350, 440, tick);
    drawStreetLamp(ctx, 650, 440, tick);

    // 6. Draw All Decorative Stalls (Модельки новых лавок без покупок)
    DECORATIVE_STALLS.forEach((stall) => {
      drawDetailedMarketStall(ctx, stall, tick);
    });

    // 7. Draw Player's Main Stall (ВАШ ТОРГОВЫЙ ПРИЛАВОК - полнофункциональный)
    drawDetailedMarketStall(
      ctx,
      {
        name: 'ВАШ ТОРГОВЫЙ ПРИЛАВОК',
        icon: '🌟',
        primaryColor: '#15803d',
        stripeColor: '#fef08a',
        x: 60,
        y: 175,
        width: 190,
        height: 105,
        goods: 'player_wood',
        clerkName: 'Вы (Владелец)',
        isDecorativeOnly: false,
      },
      tick,
      playerStallStock
    );

    // 8. Draw Competitor 1 (Лавка Лесоруба Бориса)
    const comp1 = competitors[0] || {
      id: 'comp-1',
      ownerName: 'Лавка Лесоруба Бориса',
      woodType: 'Сырые брёвна сосны',
      pricePerUnit: 22,
      stockCount: 18,
      x: 750,
      y: 175,
    };
    drawDetailedMarketStall(
      ctx,
      {
        name: comp1.ownerName,
        icon: '🏪',
        primaryColor: '#78350f',
        stripeColor: '#fde047',
        x: 750,
        y: 175,
        width: 190,
        height: 105,
        goods: 'competitor_boris',
        clerkName: 'Борис',
        isDecorativeOnly: false,
      },
      tick,
      undefined,
      comp1
    );

    // 9. Draw Competitor 2 («Северная Тайга»)
    const comp2 = competitors[1] || {
      id: 'comp-2',
      ownerName: 'Северная Тайга',
      woodType: 'Необработанная берёза',
      pricePerUnit: 25,
      stockCount: 12,
      x: 750,
      y: 310,
    };
    drawDetailedMarketStall(
      ctx,
      {
        name: comp2.ownerName,
        icon: '🏪',
        primaryColor: '#1e3a8a',
        stripeColor: '#e0f2fe',
        x: 750,
        y: 310,
        width: 190,
        height: 105,
        goods: 'competitor_taiga',
        clerkName: 'Олаф',
        isDecorativeOnly: false,
      },
      tick,
      undefined,
      comp2
    );

    // 10. Notice Board Gazebo (Павильон найма рабочих)
    drawNoticeBoard(ctx, 60, 310, 180, 95, workers.length, tick);

    // 11. Hardware Store Building (Фасад Эко-Строймаркета)
    drawHardwareStoreEntrance(ctx, 400, 40, 200, 95, tick);

    // 12. Electric Car Return to Forest on Market Roadway (Электрокар / Tesla для возврата в лес)
    const portalPulse = Math.sin(tick * 0.08) * 3;
    const carX = 500;
    const carY = 585;

    ctx.save();
    // Roadway / parking stall marking
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(carX - 44, carY - 26, 88, 52, 10);
    ctx.fill();
    ctx.strokeStyle = isTeleportBroken ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Car shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + 12, 28, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(carX - 22, carY + 6, 9, 7);
    ctx.fillRect(carX + 13, carY + 6, 9, 7);

    // Car Body (Red aerodynamic sedan)
    ctx.fillStyle = isTeleportBroken ? '#7f1d1d' : '#dc2626';
    ctx.beginPath();
    ctx.roundRect(carX - 26, carY - 8, 52, 18, [8, 14, 4, 4]);
    ctx.fill();

    // Windshield & Roof
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(carX - 14, carY - 8);
    ctx.lineTo(carX - 8, carY - 20);
    ctx.lineTo(carX + 14, carY - 20);
    ctx.lineTo(carX + 18, carY - 8);
    ctx.closePath();
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(carX + 24, carY - 4, 3, 4);

    if (isTeleportBroken) {
      // Hazard lights & sparks
      ctx.fillStyle = (Math.floor(tick / 15) % 2 === 0) ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(carX + 24, carY - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Sparks
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      for (let arc = 0; arc < 3; arc++) {
        const angle = (tick * 0.15 + arc * 2.0) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(carX + Math.cos(angle) * 16, carY + Math.sin(angle) * 16 - 6);
        ctx.lineTo(carX + Math.cos(angle) * 28, carY + Math.sin(angle) * 28 - 6);
        ctx.stroke();
      }

      ctx.fillStyle = '#ef4444';
      ctx.font = 'black 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ СБОЙ ЗАРЯДКИ ТЕСЛЫ (Жмите [T])', carX, carY - 34);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(carX, carY - 14, 4 + portalPulse * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🚗 ТЕСЛА В ЛЕС [T]', carX, carY + 42);
    }
    ctx.restore();

    // Draw NPCs
    npcs.forEach((npc) => drawNPC(ctx, npc, tick));

    // Draw Player
    drawPlayer(ctx, player, axeLevel, tick);
  };

  // =========================================================================
  // 3. STORE LOCATION (Строительный Эко-Гипермаркет: стеллажи, техника, консультант)
  // =========================================================================
  const renderStoreLocation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tick: number) => {
    // 1. Polished Concrete Industrial Epoxy Floor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floor expansion joint grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Overhead Light Reflection Sheen on Floor
    const lightGlow1 = ctx.createRadialGradient(250, 200, 20, 250, 200, 220);
    lightGlow1.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
    lightGlow1.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = lightGlow1;
    ctx.fillRect(0, 50, 500, 350);

    const lightGlow2 = ctx.createRadialGradient(750, 200, 20, 750, 200, 220);
    lightGlow2.addColorStop(0, 'rgba(168, 85, 247, 0.07)');
    lightGlow2.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = lightGlow2;
    ctx.fillRect(500, 50, 500, 350);

    // Yellow safety lanes & forklift traffic lines
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    // Vertical thoroughfare between aisles
    ctx.beginPath();
    ctx.moveTo(265, 120);
    ctx.lineTo(265, 550);
    ctx.moveTo(500, 120);
    ctx.lineTo(500, 550);
    ctx.moveTo(735, 120);
    ctx.lineTo(735, 550);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Grand Entrance Header & Steel Trusses
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, 50);

    // Illuminated Marquee Title
    ctx.fillStyle = '#f3e8ff';
    ctx.font = 'black 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🏬 СТРОИТЕЛЬНЫЙ ЭКО-ГИПЕРМАРКЕТ «СТРОЙ-ТАЙГА»', canvas.width / 2, 24);

    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('Секции: ⚡ Энергетика · 🪚 Проф-Инструмент · 🌱 Сад & Био · ⚙️ Станки & Лицензии', canvas.width / 2, 40);

    // 3. Overhead Department Category Banners
    drawStoreDepartmentBanner(ctx, '⚡ ЭКО-ЭНЕРГЕТИКА', 147, 122, 195);
    drawStoreDepartmentBanner(ctx, '🪚 ИНСТРУМЕНТ & СТАНКИ', 382, 122, 195);
    drawStoreDepartmentBanner(ctx, '🌱 САДОВОДСТВО & ЛЕС', 617, 122, 195);
    drawStoreDepartmentBanner(ctx, '⚙️ ОБОРУДОВАНИЕ', 852, 122, 195);

    // 4. Interactive Info Kiosk / Express Catalog Terminal
    drawInfoKiosk(ctx, 90, 55, tick);

    // 5. Store Consultant NPC "Артём"
    drawStoreConsultant(ctx, 220, 75, tick);

    // 6. Express Checkout & Delivery Dispatch Desk
    drawCheckoutDesk(ctx, 820, 55, tick);

    // 7. Electric Forklift Truck with Pallet
    drawForklift(ctx, 890, 575, tick);

    // 8. Draw All Heavy-Duty Warehouse Storage Racks & 3D Item Models
    shelves.forEach((shelf) => {
      drawStoreShelf(ctx, shelf, nearbyShelf?.id === shelf.id, tick);
    });

    // 9. Automatic Glass Exit Lobby & Doors at Bottom Center
    const exitX = 500;
    const exitY = 665;
    ctx.save();
    // Doormat
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(exitX - 70, exitY - 20, 140, 45);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(exitX - 70, exitY - 20, 140, 45);

    // Yellow tactile floor strip
    ctx.fillStyle = '#eab308';
    ctx.fillRect(exitX - 60, exitY - 18, 120, 4);

    // Glass Double Sliding Doors
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillRect(exitX - 55, exitY - 12, 52, 36);
    ctx.fillRect(exitX + 3, exitY - 12, 52, 36);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(exitX - 55, exitY - 12, 52, 36);
    ctx.strokeRect(exitX + 3, exitY - 12, 52, 36);

    // Handles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(exitX - 6, exitY + 2, 2, 12);
    ctx.fillRect(exitX + 4, exitY + 2, 2, 12);

    // Exit Sign Overhead
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(exitX - 60, exitY - 32, 120, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 ВЫХОД НА РЫНОК [E]', exitX, exitY - 20);
    ctx.restore();

    // Draw Player
    drawPlayer(ctx, player, axeLevel, tick);
  };

  // Helper: Draw Department Overhead Banner
  const drawStoreDepartmentBanner = (ctx: CanvasRenderingContext2D, title: string, cx: number, y: number, _w: number) => {
    ctx.save();
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(cx - 85, y - 11, 170, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'black 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, y + 1);
    ctx.restore();
  };

  // Helper: Interactive Touch Terminal / Catalog Kiosk
  const drawInfoKiosk = (ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) => {
    ctx.save();
    // Base pedestal
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x - 22, y + 16, 44, 12, 3);
    ctx.fill();

    // Angled stand
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 4, y, 8, 18);

    // Touchscreen monitor with neon glow
    const glow = Math.sin(tick * 0.1) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(168, 85, 247, ${glow * 0.3})`;
    ctx.beginPath();
    ctx.roundRect(x - 26, y - 24, 52, 32, 5);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x - 24, y - 22, 48, 28, 4);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Screen graphics
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('💻 КАТАЛОГ [F]', x, y - 10);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('14 ТОВАРОВ', x, y - 1);

    ctx.restore();
  };

  // Helper: Store Consultant NPC "Артём"
  const drawStoreConsultant = (ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) => {
    ctx.save();
    const bob = Math.sin(tick * 0.1) * 1.5;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 5, y + 2, 4, 10);
    ctx.fillRect(x + 1, y + 2, 4, 10);

    // Hi-Vis Orange Store Vest
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(x - 7, y - 12 + bob, 14, 14, 3);
    ctx.fill();

    // Reflective Silver Stripe on Vest
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 7, y - 6 + bob, 14, 2.5);

    // Clipboard in hand
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 5, y - 7 + bob, 7, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 6, y - 6 + bob, 5, 8);

    // Head & Cap
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(x, y - 16 + bob, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7'; // Blue store cap
    ctx.beginPath();
    ctx.arc(x, y - 18 + bob, 5.5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - 2, y - 18 + bob, 9, 2);

    // Speech balloon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x - 48, y - 38 + bob, 96, 15, 4);
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 7.5px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Консультант Артём [E]', x, y - 27 + bob);

    ctx.restore();
  };

  // Helper: Express Checkout & Delivery Dispatch Desk
  const drawCheckoutDesk = (ctx: CanvasRenderingContext2D, x: number, y: number, _tick: number) => {
    ctx.save();
    // Wooden / metal counter
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x - 30, y - 15, 60, 30, 4);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Register screen
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 12, y - 12, 24, 14);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('КАССА', x, y - 2);

    // Barcode scanner
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 15, y - 5, 5, 8);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('ФУРА 🚚', x, y + 10);
    ctx.restore();
  };

  // Helper: Electric Forklift Truck
  const drawForklift = (ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) => {
    ctx.save();
    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x - 14, y + 12, 5, 0, Math.PI * 2);
    ctx.arc(x + 10, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();

    // Yellow Body with safety stripes
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(x - 18, y - 4, 30, 16, 3);
    ctx.fill();

    // Roll cage
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 12, y - 18, 16, 14);

    // Flashing orange beacon
    const beaconFlash = tick % 30 < 15;
    ctx.fillStyle = beaconFlash ? '#f97316' : '#7c2d12';
    ctx.beginPath();
    ctx.arc(x - 4, y - 21, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mast & Forks
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 12, y - 22, 3, 30);
    ctx.fillRect(x + 12, y + 6, 16, 3);

    // Wooden Pallet on forks
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 15, y - 2, 14, 8);
    ctx.restore();
  };

  // =========================================================================
  // DETAILED INDUSTRIAL WAREHOUSE SHELF & 3D EQUIPMENT RENDERING
  // =========================================================================
  const drawStoreShelf = (ctx: CanvasRenderingContext2D, shelf: StoreShelf, isNearby: boolean, tick: number) => {
    const { x, y, width, height, name, cost, isPurchased } = shelf;
    ctx.save();

    // 1. Shadow underneath rack
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x + 4, y + height - 2, width - 8, 10);

    // 2. Heavy-Duty Steel Warehouse Upright Frame (Синие опорные стойки)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x, y, 7, height);
    ctx.fillRect(x + width - 7, y, 7, height);

    // Punch slots on steel uprights
    ctx.fillStyle = '#0f172a';
    for (let py = y + 8; py < y + height - 8; py += 10) {
      ctx.fillRect(x + 2, py, 3, 4);
      ctx.fillRect(x + width - 5, py, 3, 4);
    }

    // 3. Safety Orange Load Beams (Оранжевые поперечные балки)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x, y + 20, width, 5); // Upper storage deck beam
    ctx.fillRect(x, y + height - 26, width, 6); // Main display deck beam

    // Deck mesh / wood plate
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 7, y + 25, width - 14, height - 51);

    // 4. Upper Tier: Overstock Pallets with Cardboard Boxes (Верхний ярус хранения)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 14, y + 16, width - 28, 4); // Wooden pallet
    const boxCount = Math.floor((width - 30) / 32);
    for (let b = 0; b < boxCount; b++) {
      const bx = x + 16 + b * 32;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(bx, y + 4, 26, 12);
      ctx.fillStyle = '#fde047'; // Tape
      ctx.fillRect(bx + 11, y + 4, 4, 12);
    }

    // 5. Center Display Pedestal with Spotlight
    const dispX = x + width / 2;
    const dispY = y + height - 32;

    // Spotlight pool
    const spot = ctx.createRadialGradient(dispX, dispY - 10, 4, dispX, dispY - 10, 40);
    spot.addColorStop(0, isNearby ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255, 255, 255, 0.18)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.arc(dispX, dispY - 10, 40, 0, Math.PI * 2);
    ctx.fill();

    // 6. Draw High-Detail 3D Item Model
    drawStoreItemModel(ctx, shelf, dispX, dispY, tick);

    // 7. Interactive Proximity Pulse / Border
    if (isNearby) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }

    // 8. Bottom Information & Price Bar (Формат в белорусских рублях Br!)
    const barY = y + height - 20;
    ctx.fillStyle = isPurchased ? '#064e3b' : '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + 4, barY, width - 8, 18, 3);
    ctx.fill();
    ctx.strokeStyle = isPurchased ? '#10b981' : isNearby ? '#a855f7' : '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Item Name
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(name, x + 8, barY + 12);

    // Price / Purchased Status
    ctx.textAlign = 'right';
    if (isPurchased) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'black 9px system-ui';
      ctx.fillText('КУПЛЕНО ✓', x + width - 8, barY + 12);
    } else {
      ctx.fillStyle = '#facc15';
      ctx.font = 'black 9.5px monospace';
      ctx.fillText(`${cost} Br`, x + width - 8, barY + 12);
    }

    ctx.restore();
  };

  // Helper: Detailed 3D Canvas Goods Models on Store Shelves
  const drawStoreItemModel = (ctx: CanvasRenderingContext2D, shelf: StoreShelf, cx: number, cy: number, tick: number) => {
    const id = shelf.id;
    ctx.save();

    if (id === 'shelf-solar') {
      // Photovoltaic Silicon Solar Panel Mk.1
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(cx - 24, cy - 22, 48, 20, 3);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Grid cells
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 12);
      ctx.lineTo(cx + 24, cy - 12);
      ctx.moveTo(cx - 8, cy - 22);
      ctx.lineTo(cx - 8, cy - 2);
      ctx.moveTo(cx + 8, cy - 22);
      ctx.lineTo(cx + 8, cy - 2);
      ctx.stroke();

      // Sun reflection glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(cx - 16, cy - 18, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'shelf-solar-2') {
      // Monocrystalline Stealth Panel Mk.2 Pro
      ctx.fillStyle = '#0a0e17';
      ctx.beginPath();
      ctx.roundRect(cx - 26, cy - 24, 52, 22, 3);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gold traces
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cx - 20, cy - 20, 40, 14);

      // Green power LED
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cx + 18, cy - 18, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'shelf-tool-titanium') {
      // Titanium Lumberjack Axe
      // Handle
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 8, 32, 4, 1.5);
      ctx.fill();
      // Titanium Blue Head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 16);
      ctx.lineTo(cx + 22, cy - 22);
      ctx.lineTo(cx + 24, cy - 2);
      ctx.lineTo(cx + 14, cy - 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (id === 'shelf-tool-2') {
      // Chainsaw "Лес-1"
      // Guide bar
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 26, cy - 12, 24, 6);
      ctx.strokeStyle = '#0f172a';
      ctx.strokeRect(cx - 26, cy - 12, 24, 6);
      // Motor body
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(cx - 2, cy - 18, 26, 14, 3);
      ctx.fill();
      // Handle
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx + 4, cy - 24, 14, 6);
    } else if (id === 'shelf-wind') {
      // Rotating Eco-Wind Turbine
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 2.5, cy - 24, 5, 22);
      // Rotor hub
      const angle = tick * 0.08;
      ctx.save();
      ctx.translate(cx, cy - 24);
      ctx.rotate(angle);
      ctx.fillStyle = '#f8fafc';
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.fillRect(-2, 0, 4, 15);
      }
      ctx.restore();
    } else if (id === 'shelf-battery') {
      // PowerBank 5000 Cabinet
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 24, 32, 22, 3);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(cx - 11, cy - 20 + b * 6, 22, 3.5);
      }
    } else if (id === 'shelf-tool-3') {
      // Bionic Laser "Taiga"
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx - 18, cy - 12, 36, 6);
      // Glowing emerald coil
      const pulse = Math.sin(tick * 0.2) * 2;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cx - 18, cy - 9, 4 + pulse * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Laser beam preview dot
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(cx - 26, cy - 10, 6, 2);
    } else if (id === 'shelf-sawmill-blade') {
      // Diamond Saw Blade
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'shelf-planter') {
      // Nursery Saplings Box (+15)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 18, cy - 10, 36, 9);
      // 4 Sprouting pine seedlings
      for (let s = 0; s < 4; s++) {
        const sx = cx - 12 + s * 8;
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(sx - 3, cy - 10);
        ctx.lineTo(sx, cy - 20);
        ctx.lineTo(sx + 3, cy - 10);
        ctx.closePath();
        ctx.fill();
      }
    } else if (id === 'shelf-planter-mega') {
      // Mega Saplings Cart (+35)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - 22, cy - 8, 44, 7);
      // Green canopy cluster
      for (let s = 0; s < 5; s++) {
        const sx = cx - 16 + s * 8;
        ctx.fillStyle = s % 2 === 0 ? '#16a34a' : '#15803d';
        ctx.beginPath();
        ctx.arc(sx, cy - 16, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'shelf-bio') {
      // Bio Fertilizer Agrochemical Canister
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.roundRect(cx - 10, cy - 20, 20, 18, 4);
      ctx.fill();
      // Dial gauge
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - 11, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 11);
      ctx.lineTo(cx + 2, cy - 13);
      ctx.stroke();
    } else if (id === 'shelf-irrigation') {
      // Auto-Irrigation Water Cistern & Sprinkler
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 20, 32, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 14, cy - 18, 4, 14); // Level tube
      // Mist spray
      const mistY = cy - 24 - (tick % 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(cx, mistY, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'shelf-eco-cert') {
      // Eco Certificate Plaque
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 22, 32, 20, 3);
      ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(cx - 13, cy - 19, 26, 14);
      // Green seal
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(cx, cy - 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'shelf-drone') {
      // Forest Ranger Quadcopter Drone
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 10, cy - 14, 20, 8);
      // Rotors spinning
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx - 12, cy - 15, 6, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 12, cy - 15, 6, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Glowing camera eye
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // =========================================================================
  // DETAILED SHELF TOOLTIP (Форматирование в белорусских рублях Br)
  // =========================================================================
  const drawShelfTooltip = (ctx: CanvasRenderingContext2D, shelf: StoreShelf, playerCash: number) => {
    const { x, y, name, cost, description, effect, isPurchased } = shelf;
    const canAfford = playerCash >= cost;
    const bw = 320;
    const bh = 95;
    const bx = Math.max(15, Math.min(665, x - bw / 2 + shelf.width / 2));
    const by = Math.max(50, y - bh - 12);

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 8);
    ctx.fill();
    ctx.strokeStyle = isPurchased ? '#10b981' : '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'black 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(name, bx + 12, by + 18);

    // Effect badge
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(`✨ Эффект: ${effect}`, bx + 12, by + 34);

    // Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9.5px system-ui';
    ctx.fillText(description, bx + 12, by + 50);

    // Price & Call to Action (В белорусских рублях Br!)
    ctx.fillStyle = isPurchased ? '#4ade80' : canAfford ? '#fbbf24' : '#f87171';
    ctx.font = 'black 11px system-ui';
    ctx.fillText(
      isPurchased
        ? '✓ Оборудование уже установлено!'
        : `Цена: ${cost} Br — [E / Клик] Заказать доставку фурой 🚚`,
      bx + 12,
      by + 76
    );

    ctx.restore();
  };

  const drawNPC = (ctx: CanvasRenderingContext2D, npc: NPC, tick: number) => {
    const { x, y, color, speech, speechTimer } = npc;
    const bob = Math.sin(tick * 0.18 + x * 0.1) * 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y - 2, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 5, y - 10 + bob, 4, 9);
    ctx.fillRect(x + 1, y - 10 - bob, 4, 9);
    ctx.fillStyle = color;
    ctx.fillRect(x - 6, y - 21 + bob, 12, 12);
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(x, y - 25 + bob, 5.5, 0, Math.PI * 2);
    ctx.fill();

    if (speech && speechTimer > 0) {
      ctx.save();
      ctx.font = 'bold 10px system-ui';
      const textWidth = ctx.measureText(speech).width;
      const bw = textWidth + 12;
      const bx = x - bw / 2;
      const by = y - 46;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, 20, 5);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(speech, x, by + 14);
      ctx.restore();
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: PlayerStats, _toolLvl: number, tick: number) => {
    const { x, y, isMoving, carriedBox } = p;
    const bob = isMoving ? Math.sin(tick * 0.25) * 2 : 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y - 2, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x - 6, y - 11 + bob, 5, 10);
    ctx.fillRect(x + 1, y - 11 - bob, 5, 10);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 7, y - 24 + bob, 14, 13);

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(x, y - 28 + bob, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#14532d';
    ctx.fillRect(x - 7, y - 35 + bob, 14, 5);

    // If carrying a delivery box:
    if (carriedBox) {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x - 8, y - 22 + bob, 16, 14);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x - 8, y - 16 + bob, 16, 2);
    }
  };

  return (
    <div className="relative w-full aspect-[10/7] max-h-[640px] bg-[#0f1715] rounded-xl overflow-hidden shadow-2xl border border-emerald-950/60 select-none">
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        onMouseDown={handleCanvasMouseDown}
        className="w-full h-full object-contain cursor-crosshair"
      />

      {/* On-screen WSAD controls overlay */}
      <div className="absolute bottom-3 right-4 flex flex-col items-center gap-1 bg-black/60 p-2 rounded-xl border border-white/10 backdrop-blur-xs select-none shadow-lg">
        <button
          onPointerDown={() => { keysPressed.current['w'] = true; }}
          onPointerUp={() => { keysPressed.current['w'] = false; }}
          onPointerLeave={() => { keysPressed.current['w'] = false; }}
          className="w-10 h-10 rounded-lg bg-slate-800/90 hover:bg-emerald-600 active:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center border border-white/20 shadow active:scale-95 transition-all cursor-pointer"
          title="Вверх (W / Ц)"
        >
          <span className="font-mono">W</span>
          <span className="text-[8px] text-slate-400 leading-none">▲</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onPointerDown={() => { keysPressed.current['a'] = true; }}
            onPointerUp={() => { keysPressed.current['a'] = false; }}
            onPointerLeave={() => { keysPressed.current['a'] = false; }}
            className="w-10 h-10 rounded-lg bg-slate-800/90 hover:bg-emerald-600 active:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center border border-white/20 shadow active:scale-95 transition-all cursor-pointer"
            title="Влево (A / Ф)"
          >
            <span className="font-mono">A</span>
            <span className="text-[8px] text-slate-400 leading-none">◀</span>
          </button>
          <button
            onPointerDown={() => { keysPressed.current['s'] = true; }}
            onPointerUp={() => { keysPressed.current['s'] = false; }}
            onPointerLeave={() => { keysPressed.current['s'] = false; }}
            className="w-10 h-10 rounded-lg bg-slate-800/90 hover:bg-emerald-600 active:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center border border-white/20 shadow active:scale-95 transition-all cursor-pointer"
            title="Вниз (S / Ы)"
          >
            <span className="font-mono">S</span>
            <span className="text-[8px] text-slate-400 leading-none">▼</span>
          </button>
          <button
            onPointerDown={() => { keysPressed.current['d'] = true; }}
            onPointerUp={() => { keysPressed.current['d'] = false; }}
            onPointerLeave={() => { keysPressed.current['d'] = false; }}
            className="w-10 h-10 rounded-lg bg-slate-800/90 hover:bg-emerald-600 active:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center border border-white/20 shadow active:scale-95 transition-all cursor-pointer"
            title="Вправо (D / В)"
          >
            <span className="font-mono">D</span>
            <span className="text-[8px] text-slate-400 leading-none">▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};
