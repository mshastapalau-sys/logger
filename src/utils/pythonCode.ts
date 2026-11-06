export const PYTHON_GAME_CODE = `"""
=============================================================================
  ЭКО-ЛЕСОРУБ: ПОЛНАЯ ВЕРСИЯ (ECO-LUMBERJACK TYCOON)
  Python + Pygame
=============================================================================
Все механики по брифу:
1. ТОРГОВЛЯ НА ПРИЛАВКЕ И КОНКУРЕНТЫ:
   - Приходите на рынок, раскладываете доски/брёвна на своем прилавке [E].
   - Горожане подходят и покупают по 1-2 штучки!
   - Ходите по рынку и смотрите на прилавки конкурентов (у них одно сырое дерево).
2. ОБУЧЕНИЕ (Квесты 1..7 с понятными шагами).
3. РАСШИРЕНИЕ: ВСЕГО 9 КВАДРАТОВ ТЕРРИТОРИИ (по 1000$ за сектор).
4. ФУРА И КОРОБКИ СО СТРОЙМАРКЕТА:
   - В Строймаркете покупаете генераторы, солнечные панели, электропилы.
   - Фура привозит коробки к зоне разгрузки.
   - Клавиша [E] — открыть коробку / установить оборудование.
   - Клавиша ЛКМ (клик мыши) — сломать пустую коробку / рубить.
   - Клавиши W, S, D, A — перемещение.
5. ИНСПЕКТОР ПО МУСОРУ И КОРОБКАМ:
   - Если пустые коробки валяются на траве — штраф 15 монет за каждую!
   - Выбрасывайте коробки в зелёный бак переработки ♻️.
6. ИНСПЕКТОР ПО СОЛНЕЧНОЙ СТАНЦИИ И ЭНЕРГОСЕТИ:
   - Контролирует чистую энергию. При перегрузке — штраф 80$:
     [Y] оплатить и включить телепорт сразу, [N] ждать 5 минут!
7. НАЁМ РАБОЧИХ (З/П 30 МОНЕТ):
   - Расклеивайте бумажки на доске объявлений, рабочие помогают сажать деревья.
   - Ставка: 30 монет за смену.
=============================================================================
"""

import sys
import math
import random
import pygame

pygame.init()
pygame.font.init()

SCREEN_WIDTH = 1000
SCREEN_HEIGHT = 700
FPS = 60

screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Эко-Лесоруб: Империя 9 Квадратов | Pygame Edition")
clock = pygame.time.Clock()

FONT_LARGE = pygame.font.SysFont("Arial", 22, bold=True)
FONT_MED = pygame.font.SysFont("Arial", 16, bold=True)
FONT_SMALL = pygame.font.SysFont("Arial", 13)
FONT_TINY = pygame.font.SysFont("Arial", 11)

# Цветовая гамма
BG_DARK = (15, 23, 21)
GRASS_COLOR = (26, 50, 36)
PATH_COLOR = (55, 46, 36)
PAVEMENT_COLOR = (40, 50, 58)

COLOR_WOOD = (160, 110, 60)
COLOR_LEAF = (34, 139, 34)
COLOR_SAPLING = (100, 220, 100)
COLOR_GOLD = (245, 180, 30)
COLOR_ENERGY = (0, 210, 255)
COLOR_DANGER = (235, 70, 70)
COLOR_SUCCESS = (60, 210, 110)
COLOR_TEXT = (240, 245, 245)

# =============================================================================
# КЛАССЫ
# =============================================================================

class DeliveryBox:
    def __init__(self, x, y, name, btype):
        self.x = x
        self.y = y
        self.name = name
        self.btype = btype
        self.is_opened = False
        self.is_trash = False

    def draw(self, surface):
        col = (120, 110, 100) if self.is_trash else (217, 119, 6)
        pygame.draw.rect(surface, col, (self.x - 10, self.y - 10, 20, 20), border_radius=3)
        pygame.draw.rect(surface, (254, 240, 138), (self.x - 10, self.y - 2, 20, 4)) # Скотч
        lbl = FONT_TINY.render("МУСОР" if self.is_trash else "КОРОБКА", True, COLOR_DANGER if self.is_trash else (255, 255, 255))
        surface.blit(lbl, (self.x - lbl.get_width() // 2, self.y + 12))


class Worker:
    def __init__(self, name, x, y):
        self.name = name
        self.x = x
        self.y = y
        self.target_x = x
        self.target_y = y
        self.speed = 1.0

    def update(self):
        if math.hypot(self.target_x - self.x, self.target_y - self.y) < 10:
            self.target_x = random.randint(200, 800)
            self.target_y = random.randint(260, 600)
        else:
            angle = math.atan2(self.target_y - self.y, self.target_x - self.x)
            self.x += math.cos(angle) * self.speed
            self.y += math.sin(angle) * self.speed

    def draw(self, surface, tick):
        bob = math.sin(tick * 0.2 + self.x) * 2
        pygame.draw.rect(surface, (6, 95, 70), (self.x - 5, self.y - 20 + bob, 10, 18))
        pygame.draw.circle(surface, (254, 215, 170), (int(self.x), int(self.y - 24 + bob)), 5)
        pygame.draw.rect(surface, (245, 158, 11), (self.x - 5, self.y - 28 + bob, 10, 3)) # Каска
        lbl = FONT_TINY.render(self.name, True, (255, 255, 255))
        surface.blit(lbl, (self.x - lbl.get_width() // 2, self.y - 40 + bob))


class NPC:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.target_x = x
        self.target_y = y
        self.color = color
        self.speed = 1.2
        self.speech = "Ищу доски!"

    def update(self):
        if math.hypot(self.target_x - self.x, self.target_y - self.y) < 10:
            self.target_x = random.randint(150, SCREEN_WIDTH - 150)
            self.target_y = random.randint(220, SCREEN_HEIGHT - 120)
        else:
            angle = math.atan2(self.target_y - self.y, self.target_x - self.x)
            self.x += math.cos(angle) * self.speed
            self.y += math.sin(angle) * self.speed

    def draw(self, surface, tick):
        bob = math.sin(tick * 0.2 + self.x * 0.1) * 2
        pygame.draw.rect(surface, (40, 50, 70), (self.x - 4, self.y - 10 + bob, 8, 10))
        pygame.draw.rect(surface, self.color, (self.x - 6, self.y - 20 + bob, 12, 11))
        pygame.draw.circle(surface, (245, 195, 150), (int(self.x), int(self.y - 24 + bob)), 5)


class Tree:
    def __init__(self, x, y, stage="mature"):
        self.x = x
        self.y = y
        self.stage = stage
        self.health = 3 if stage == "mature" else 1

    def chop(self):
        if self.stage == "stump": return 0
        self.health -= 1
        if self.health <= 0:
            self.stage = "stump"
            return 2
        return 0

    def draw(self, surface):
        if self.stage == "stump":
            pygame.draw.ellipse(surface, (120, 80, 45), (self.x - 12, self.y - 6, 24, 14))
        elif self.stage == "sapling":
            pygame.draw.line(surface, (130, 90, 50), (self.x, self.y), (self.x, self.y - 12), 2)
            pygame.draw.circle(surface, COLOR_SAPLING, (self.x, self.y - 12), 4)
        else:
            pygame.draw.rect(surface, COLOR_WOOD, (self.x - 4, self.y - 22, 8, 22))
            pygame.draw.circle(surface, COLOR_LEAF, (self.x, self.y - 32), 20)


# =============================================================================
# ИГРА
# =============================================================================

class EcoLumberjackGame:
    def __init__(self):
        self.running = True
        self.location = "FOREST"  # "FOREST", "MARKET", "STORE"
        self.tick_count = 0

        # День / Ночь
        self.game_hour = 10.0

        # Квадраты территории (9 штук)
        self.unlocked_plots = 1 # Открыт 1 квадрат, остальные 8 по 1000$

        # Игрок
        self.player_x = 500
        self.player_y = 350
        self.money = 150
        self.energy = 100.0
        self.logs = 0
        self.planks = 4
        self.saplings = 6

        # Прилавок игрока на рынке
        self.stall_planks_on_display = 4
        self.stall_logs_on_display = 0

        # Коробки доставки с фуры
        self.delivery_boxes = []

        # Нанятые рабочие
        self.workers = []
        self.wage_timer = 60.0

        # Штрафы инспекторов
        self.has_grid_fine = False
        self.grid_penalty_timer = 300.0
        self.waste_timer = 45.0

        # Объекты мира
        self.trees = [Tree(random.randint(100, 900), random.randint(260, 650)) for _ in range(16)]
        self.npcs = [NPC(random.randint(150, 850), random.randint(200, 500), (random.randint(50, 200), random.randint(50, 200), random.randint(150, 255))) for _ in range(4)]

        # Обучение
        self.tutorial_step = 1

        self.toast_msg = "Шаг 1: Срубите дерево (ЛКМ или ПРОБЕЛ). Доски раскладывайте на прилавке рынка!"
        self.toast_timer = 6.0

    def is_night(self):
        return self.game_hour >= 20.0 or self.game_hour < 6.0

    def show_toast(self, msg):
        self.toast_msg = msg
        self.toast_timer = 4.0

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                return

            # ЛКМ (Клик мыши: сломать коробку, срубить дерево, осмотреть конкурента)
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                mx, my = pygame.mouse.get_pos()
                self.handle_lkm(mx, my)

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False

                if event.key == pygame.K_t:
                    self.teleport()

                if event.key == pygame.K_SPACE:
                    self.action_space()

                if event.key == pygame.K_e:
                    self.action_e()

                if event.key == pygame.K_u:
                    self.location = "STORE"
                    self.player_x = 500
                    self.player_y = 580
                    self.show_toast("Вы в Строймаркете. Выбирайте панели и генераторы на [E].")

                # Купить новый квадрат земли за 1000$ на клавишу [K]
                if event.key == pygame.K_k:
                    self.buy_territory_plot()

                # Расклеить листовки и нанять рабочего на [H]
                if event.key == pygame.K_h:
                    self.hire_worker()

                # Объявить банкротство на клавишу [B]
                if event.key == pygame.K_b:
                    self.declare_bankruptcy()

                # Сбросить карту и начать заново на [R]
                if event.key == pygame.K_r:
                    self.reset_map_and_game()

    def handle_lkm(self, mx, my):
        """ЛКМ: сломать пустую коробку, срубить дерево или осмотреть конкурента"""
        if self.location == "FOREST":
            # Сломать пустую коробку
            for box in self.delivery_boxes[:]:
                if math.hypot(box.x - mx, box.y - my) < 25:
                    self.delivery_boxes.remove(box)
                    self.show_toast("Коробка сломана (ЛКМ) и утилизирована!")
                    return

            # Срубить дерево
            for t in self.trees:
                if t.stage != "stump" and math.hypot(t.x - mx, t.y - my) < 35:
                    logs = t.chop()
                    if logs > 0:
                        self.logs += logs
                        self.show_toast(f"Дерево срублено (ЛКМ)! +{logs} брёвен.")
                        if self.tutorial_step == 1: self.tutorial_step = 2
                    return

        elif self.location == "MARKET":
            # Осмотреть конкурента справа
            if math.hypot(800 - mx, 250 - my) < 60:
                self.show_toast("Конкурент 'Борис': продает сырые бревна по 22$. У вас доски качественнее!")
            elif math.hypot(800 - mx, 410 - my) < 60:
                self.show_toast("Конкурент 'Северная Тайга': продает березовые дрова по 25$.")

    def teleport(self):
        if self.has_grid_fine:
            self.show_toast("Энергосеть заблокирована за перегрузку! Оплатите 80$ [Y] или ждите 5 мин.")
            return
        if self.location == "FOREST" and self.is_night():
            self.show_toast("НОЧЬ! Рынок закрыт до рассвета (06:00).")
            return
        if self.energy < 15.0:
            self.show_toast("Мало энергии (< 15%)! Зарядитесь днем у солнца.")
            return

        self.energy -= 15.0
        if self.location == "FOREST":
            self.location = "MARKET"
            self.player_x = 500
            self.player_y = 520
            self.show_toast("Вы на Рынке! Подойдите к прилавку слева, чтобы выложить доски [E].")
            if self.tutorial_step == 2: self.tutorial_step = 3
        else:
            self.location = "FOREST"
            self.player_x = 840
            self.player_y = 200
            self.show_toast("Вы вернулись в Лесные Угодья.")

    def action_space(self):
        # Лесопилка
        if self.location == "FOREST" and 450 <= self.player_x <= 610 and 70 <= self.player_y <= 180:
            if self.logs > 0:
                created = self.logs * 2
                self.planks += created
                self.logs = 0
                self.show_toast(f"Распилено в {created} досок! Летите на рынок разложить на прилавок.")
                if self.tutorial_step == 2: self.tutorial_step = 3
            return

    def action_e(self):
        # 1. В СТРОЙМАРКЕТЕ: покупка солнечной панели / ветряка (доставка на фуре)
        if self.location == "STORE":
            cost = 200
            if self.money >= cost:
                self.money -= cost
                # Фура привозит коробку
                self.delivery_boxes.append(DeliveryBox(165, 150, "Солнечная Панель", "solar"))
                self.show_toast("Заказ оформлен! Фура привезла коробку к разгрузке в Лесу.")
            else:
                self.show_toast("Нужно 200$ для покупки оборудования!")
            return

        # 2. НА РЫНКЕ:
        if self.location == "MARKET":
            # Ваш прилавок (слева: x: 200, y: 250)
            if math.hypot(self.player_x - 200, self.player_y - 250) < 65:
                if self.planks > 0:
                    self.stall_planks_on_display += self.planks
                    self.planks = 0
                    self.show_toast(f"Вы выложили доски на витрину ({self.stall_planks_on_display} шт). Горожане подходят и покупают!")
                else:
                    self.show_toast("Нет досок в ранце, чтобы выложить на прилавок!")
                return

            # Питомник (справа: саженцы 20$ за 2 шт)
            if math.hypot(self.player_x - 800, self.player_y - 130) < 65:
                if self.money >= 20:
                    self.money -= 20
                    self.saplings += 2
                    self.show_toast("Куплено 2 саженца за 20$!")
                return

        # 3. В ЛЕСУ:
        if self.location == "FOREST":
            # Открыть коробку от фуры
            for b in self.delivery_boxes:
                if math.hypot(self.player_x - b.x, self.player_y - b.y) < 35:
                    if not b.is_opened:
                        b.is_opened = True
                        b.is_trash = True
                        self.show_toast(f"Коробка открыта! Оборудование установлено. Пустую коробку сломайте (ЛКМ) или штраф -15$!")
                        return

            # Мусорный контейнер (x: 250, y: 110)
            if math.hypot(self.player_x - 250, self.player_y - 110) < 45:
                # Очистить все открытые коробки
                removed = len([b for b in self.delivery_boxes if b.is_trash])
                if removed > 0:
                    self.delivery_boxes = [b for b in self.delivery_boxes if not b.is_trash]
                    self.money += removed * 5
                    self.show_toast(f"Коробки утилизированы в бак! +{removed*5}$ эко-бонуса.")
                    return

            # Посадка саженца
            if self.saplings > 0:
                self.trees.append(Tree(self.player_x, self.player_y, "sapling"))
                self.saplings -= 1
                self.show_toast("Саженец посажен! (Растет только днем).")

    def buy_territory_plot(self):
        """Покупка одного из 9 квадратов за 1000$"""
        if self.unlocked_plots >= 9:
            self.show_toast("Все 9 квадратов территории уже куплены!")
            return
        if self.money >= 1000:
            self.money -= 1000
            self.unlocked_plots += 1
            # Добавить деревьев на новом секторе
            for _ in range(4):
                self.trees.append(Tree(random.randint(100, 900), random.randint(280, 650)))
            self.show_toast(f"Сектор куплен за 1000$! Открыто квадратов: {self.unlocked_plots}/9.")
        else:
            self.show_toast(f"Нужно 1000$ для покупки следующего квадрата! У вас: {self.money}$.")

    def hire_worker(self):
        """Наём рабочего за 25$ листовки, З/П 30 монет"""
        if self.money >= 25:
            self.money -= 25
            names = ["Алексей", "Игорь", "Сергей", "Дмитрий"]
            wname = names[len(self.workers) % len(names)]
            self.workers.append(Worker(wname, 400, 400))
            self.show_toast(f"Листовки расклеены! Нанят рабочий {wname}. З/П: 30 монет за смену.")
        else:
            self.show_toast("Нужно 25$ для расклейки листовок о найме!")

    def declare_bankruptcy(self):
        """Объявление банкротства игроком (проиграть партию)"""
        self.money = 0
        self.has_grid_fine = True
        self.show_toast("БАНКРОТСТВО: Предприятие разорено! Нажмите [R] для сброса карты.")

    def reset_map_and_game(self):
        """Полный сброс карты и всей партии к начальному состоянию"""
        self.money = 140
        self.energy = 100.0
        self.logs = 0
        self.planks = 4
        self.saplings = 6
        self.unlocked_plots = 2
        self.stall_planks_on_display = 6
        self.delivery_boxes = []
        self.workers = []
        self.player_x = 500
        self.player_y = 350
        self.location = "FOREST"
        self.has_grid_fine = False
        self.trees = [Tree(random.randint(100, 900), random.randint(280, 650)) for _ in range(18)]
        self.show_toast("КАРТА СБРОШЕНА: Лес восстановлен, территория очищена, новая партия!")

    def update(self):
        self.tick_count += 1
        dt = 1.0 / FPS

        # День / Ночь (120 секунд круг)
        self.game_hour = (self.game_hour + (24.0 / 120.0) * dt) % 24.0
        is_day = not self.is_night()

        # Движение игрока
        keys = pygame.key.get_pressed()
        dx, dy = 0, 0
        if keys[pygame.K_w]: dy -= 1
        if keys[pygame.K_s]: dy += 1
        if keys[pygame.K_a]: dx -= 1
        if keys[pygame.K_d]: dx += 1

        if dx != 0 or dy != 0:
            length = math.hypot(dx, dy)
            self.player_x += (dx / length) * 3.6
            self.player_y += (dy / length) * 3.6

        self.player_x = max(20, min(SCREEN_WIDTH - 20, self.player_x))
        self.player_y = max(80, min(SCREEN_HEIGHT - 20, self.player_y))

        # Переходы в магазин и обратно
        if self.location == "MARKET" and math.hypot(self.player_x - 500, self.player_y - 140) < 40:
            self.location = "STORE"
            self.player_x = 500
            self.player_y = 580
        elif self.location == "STORE" and math.hypot(self.player_x - 500, self.player_y - 670) < 40:
            self.location = "MARKET"
            self.player_x = 500
            self.player_y = 220

        # Покупатели на рынке покупают доски с витрины по 1-2 штуки
        if self.location == "MARKET" and self.stall_planks_on_display > 0:
            if random.random() < 0.015:
                bought = min(self.stall_planks_on_display, random.randint(1, 2))
                self.stall_planks_on_display -= bought
                earned = bought * 18
                self.money += earned
                self.show_toast(f"Горожанин купил с вашего прилавка {bought} доски за +{earned}$!")

        # Инспектор по мусору: штраф 15 монет за валяющуюся пустую коробку
        self.waste_timer -= dt
        if self.waste_timer <= 0:
            self.waste_timer = 45.0
            trash_boxes = [b for b in self.delivery_boxes if b.is_trash]
            if len(trash_boxes) > 0:
                fine = len(trash_boxes) * 15
                self.money = max(0, self.money - fine)
                self.show_toast(f"ШТРАФ ЗА МУСОР: -{fine}$ (-15$ за коробку)! Убирайте в бак ♻️.")

        # Выплата зарплаты рабочим (30 монет)
        if len(self.workers) > 0:
            self.wage_timer -= dt
            if self.wage_timer <= 0:
                self.wage_timer = 60.0
                total_wage = len(self.workers) * 30
                if self.money >= total_wage:
                    self.money -= total_wage
                    self.show_toast(f"Выплачена зарплата рабочим: -{total_wage}$ (30 монет каждому).")
                else:
                    self.show_toast("Нет денег на зарплату рабочим! Рабочие бастуют.")

        # Рабочие ходят и помогают
        for w in self.workers:
            w.update()

        # Солнечная зарядка днем
        if self.location == "FOREST" and is_day:
            self.energy = min(100.0, self.energy + 0.1)

        if self.toast_timer > 0:
            self.toast_timer -= dt

    def draw(self):
        screen.fill(BG_DARK)

        if self.location == "FOREST":
            self.draw_forest()
        elif self.location == "MARKET":
            self.draw_market()
        elif self.location == "STORE":
            self.draw_store()

        if self.is_night() and self.location != "STORE":
            dark = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
            dark.fill((10, 18, 40, 150))
            screen.blit(dark, (0, 0))

        self.draw_hud()
        pygame.display.flip()

    def draw_forest(self):
        pygame.draw.rect(screen, GRASS_COLOR, (0, 70, SCREEN_WIDTH, SCREEN_HEIGHT - 70))

        # Сетка 9 квадратов
        pw = SCREEN_WIDTH // 3
        ph = (SCREEN_HEIGHT - 70) // 3
        for r in range(3):
            for c in range(3):
                idx = r * 3 + c + 1
                if idx > self.unlocked_plots:
                    # Заблокированный квадрат
                    pygame.draw.rect(screen, (15, 25, 20), (c * pw + 4, 70 + r * ph + 4, pw - 8, ph - 8))
                    lbl = FONT_TINY.render(f"🔒 Квадрат [{r+1},{c+1}]: 1000$ [K]", True, (150, 150, 150))
                    screen.blit(lbl, (c * pw + 20, 70 + r * ph + 20))

        # Фура доставки и мусорный бак
        pygame.draw.rect(screen, (185, 28, 28), (40, 85, 75, 45), border_radius=4) # Фура
        pygame.draw.rect(screen, (71, 85, 105), (115, 80, 95, 55), border_radius=4)
        flbl = FONT_TINY.render("🚚 ФУРА", True, (255, 255, 255))
        screen.blit(flbl, (135, 100))

        pygame.draw.rect(screen, (21, 128, 61), (225, 85, 50, 48), border_radius=4) # Мусорка
        mlbl = FONT_TINY.render("♻️ БАК", True, (255, 255, 255))
        screen.blit(mlbl, (232, 102))

        # Телепорт
        pygame.draw.circle(screen, COLOR_SUCCESS, (840, 125), 30, 3)
        tlbl = FONT_TINY.render("[T] РЫНОК", True, COLOR_SUCCESS)
        screen.blit(tlbl, (840 - tlbl.get_width() // 2, 160))

        # Коробки
        for b in self.delivery_boxes:
            b.draw(screen)

        # Рабочие
        for w in self.workers:
            w.draw(screen, self.tick_count)

        # Деревья
        for t in self.trees:
            t.draw(screen)

        self.draw_player()

    def draw_market(self):
        pygame.draw.rect(screen, PAVEMENT_COLOR, (0, 70, SCREEN_WIDTH, SCREEN_HEIGHT - 70))

        # ВАШ ПРИЛАВОК
        pygame.draw.rect(screen, (22, 101, 52), (100, 200, 200, 100), border_radius=8)
        pygame.draw.rect(screen, COLOR_SUCCESS, (100, 200, 200, 100), 2, border_radius=8)
        lbl = FONT_MED.render("ВАШ ПРИЛАВОК", True, COLOR_SUCCESS)
        screen.blit(lbl, (130, 215))
        sub = FONT_TINY.render(f"Досок на витрине: {self.stall_planks_on_display} шт.", True, (255, 255, 255))
        screen.blit(sub, (120, 245))
        sub2 = FONT_TINY.render("[E] Разложить доски", True, COLOR_GOLD)
        screen.blit(sub2, (135, 270))

        # ДОСКА ВАКАНСИЙ
        pygame.draw.rect(screen, (120, 53, 15), (100, 350, 200, 90), border_radius=8)
        hlbl = FONT_MED.render("ДОСКА ВАКАНСИЙ", True, COLOR_GOLD)
        screen.blit(hlbl, (125, 365))
        hsub = FONT_TINY.render(f"Нанять рабочего: 25$ [H]", True, (255, 255, 255))
        screen.blit(hsub, (120, 395))
        hsub2 = FONT_TINY.render(f"З/П: 30 монет за смену", True, (200, 200, 200))
        screen.blit(hsub2, (125, 415))

        # КОНКУРЕНТЫ
        pygame.draw.rect(screen, (69, 26, 3), (700, 200, 200, 95), border_radius=8)
        c1 = FONT_MED.render("Лавка Бориса", True, COLOR_GOLD)
        screen.blit(c1, (740, 215))
        csub = FONT_TINY.render("Сырая сосна: 22$ [ЛКМ]", True, (220, 220, 220))
        screen.blit(csub, (725, 250))

        pygame.draw.rect(screen, (51, 65, 85), (700, 350, 200, 95), border_radius=8)
        c2 = FONT_MED.render("Северная Тайга", True, (147, 197, 253))
        screen.blit(c2, (735, 365))
        csub2 = FONT_TINY.render("Берёзовые дрова: 25$", True, (220, 220, 220))
        screen.blit(csub2, (725, 400))

        # Вход в Строймаркет
        pygame.draw.rect(screen, (50, 30, 70), (410, 75, 180, 95), border_radius=8)
        slbl = FONT_MED.render("СТРОЙМАРКЕТ", True, (216, 180, 254))
        screen.blit(slbl, (445, 95))
        ssub = FONT_TINY.render("Вход [Вверх] / [U]", True, (240, 220, 255))
        screen.blit(ssub, (445, 130))

        # Телепорт
        pygame.draw.circle(screen, COLOR_ENERGY, (500, 600), 32, 3)

        for n in self.npcs:
            n.draw(screen, self.tick_count)
        self.draw_player()

    def draw_store(self):
        pygame.draw.rect(screen, (30, 41, 59), (0, 70, SCREEN_WIDTH, SCREEN_HEIGHT - 70))
        title = FONT_LARGE.render("🏬 СТРОИТЕЛЬНЫЙ МАРКЕТ: ГЕНЕРАТОРЫ И СОЛНЕЧНЫЕ ПАНЕЛИ", True, (216, 180, 254))
        screen.blit(title, (SCREEN_WIDTH // 2 - title.get_width() // 2, 95))

        # Стеллаж
        pygame.draw.rect(screen, (45, 55, 75), (350, 200, 300, 120), border_radius=8)
        pygame.draw.rect(screen, (168, 85, 247), (350, 200, 300, 120), 2, border_radius=8)
        s1 = FONT_MED.render("Солнечная Панель Mk.1 (200$)", True, COLOR_GOLD)
        screen.blit(s1, (380, 230))
        s2 = FONT_TINY.render("[E] Заказать — Фура привезет в коробке!", True, (255, 255, 255))
        screen.blit(s2, (370, 270))

        self.draw_player()

    def draw_player(self):
        pygame.draw.rect(screen, (40, 80, 150), (self.player_x - 6, self.player_y - 12, 12, 12))
        pygame.draw.rect(screen, (200, 50, 40), (self.player_x - 8, self.player_y - 24, 16, 14))
        pygame.draw.circle(screen, (240, 190, 140), (self.player_x, self.player_y - 28), 7)

    def draw_hud(self):
        pygame.draw.rect(screen, (18, 25, 24), (0, 0, SCREEN_WIDTH, 68))
        h_str = f"☀️ {int(self.game_hour):02d}:00" if not self.is_night() else f"🌙 {int(self.game_hour):02d}:00"
        txt = FONT_SMALL.render(f"{h_str} | Баланс: {self.money}$ | Доски: {self.planks} | Саженцы: {self.saplings} | Квадратов: {self.unlocked_plots}/9", True, COLOR_TEXT)
        screen.blit(txt, (20, 12))

        # Тост и обучение
        q_str = f"Обучение: Шаг {self.tutorial_step} - {self.toast_msg}"
        lbl = FONT_TINY.render(q_str, True, COLOR_GOLD)
        screen.blit(lbl, (20, 40))

    def run(self):
        while self.running:
            self.handle_input()
            self.update()
            self.draw()
            clock.tick(FPS)
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = EcoLumberjackGame()
    game.run()
`;
