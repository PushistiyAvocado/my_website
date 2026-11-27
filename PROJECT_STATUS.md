# PROJECT_STATUS — персональный сайт риэлтора (Ксения Хазиева)

Сводка состояния проекта: что сделано, где лежит, что осталось. Обновлено **27.11.2026**.

## 1. Что это за проект

Визитка-сайт специалиста по недвижимости (Екатеринбург, Берёзовский, Верхняя Пышма).
Сейчас реализован **Этап 1 (проектирование)** и **визуальный прототип** двух экранов,
который открывается в браузере без сборки.

- Стек прототипа: чистый HTML + CSS + JS, **ноль зависимостей**, работает и по `file://`.
- Node.js/npm в системе нет — прототип сознательно сделан без сборки (см. `docs/README.md` §«Ограничения»).
- Хостинг: GitHub Pages, публикуется папка `./prototype` из ветки `main`.
- Живой адрес: <https://pushistiyavocado.github.io/my_website/>
- Репозиторий: <https://github.com/PushistiyAvocado/my_website>

## 2. Где что лежит (важно)

| Что | Путь |
| --- | --- |
| Рабочая папка проекта | `E:\Building web site\Недвижемость` |
| Локальная копия репозитория (git, Source Control, деплой) | `E:\Building web site\Real_estate\my_website` |
| Этот отчёт | `E:\Building web site\Real_estate\my_website\PROJECT_STATUS.md` |

⚠️ Вся работа последней сессии велась **напрямую в копии репозитория**
(`Real_estate\my_website`), потому что там лежат актуальные файлы.
Рабочая папка `Недвижемость` **устарела** (в ней старый вариант блока «Маршрут сделки»).
Если запустить оттуда `deploy.cmd`/`deploy.ps1`, она перезапишет свежие файлы в репозитории
старыми. До синхронизации публиковать из `Недвижемость` нельзя.

## 3. Структура репозитория

```
my_website/
├─ .github/workflows/deploy.yml   # push в main → публикация ./prototype на Pages
├─ .github/workflows/telegram.yml # собирает ленту Telegram-канала по запросу и коммитит её
├─ docs/
│  ├─ README.md                   # состав, запуск, деплой, проверки, ограничения
│  ├─ 01-design-concept.md        # позиционирование, палитра, типографика, анимация
│  ├─ 02-sitemap-and-flows.md     # карта сайта, URL, сценарии, состояния
│  ├─ 03-architecture.md          # стек, модель данных, API, SEO, 152-ФЗ, этапы
│  └─ 04-content-checklist.md     # что получить от Ксении, тексты, юридика, приёмка
├─ media/                         # исходники фото и SVG-иконок (не публикуются)
│  ├─ icons/                      # SVG-иконки этапов/услуг
│  └─ photo/                      # исходные фотографии
├─ prototype/                     # ← это и есть сайт
│  ├─ index.html       44.5 KB    # главная: 3 последних поста Telegram + «Все новости»
│  ├─ catalog.html     21.3 KB    # каталог: фильтры, сортировка, пагинация
│  ├─ telegram.html    13.3 KB    # все посты канала сеткой (копия шапки/футера главной)
│  └─ assets/
│     ├─ css/tokens.css   4.6 KB  # токены: цвет, шрифты, отступы, --tap, --focus-ring
│     ├─ css/site.css    53.5 KB  # компоненты + адаптив (в т. ч. .tg-feed--grid)
│     ├─ js/app.js       34.5 KB  # вся интерактивность (в т. ч. initTelegram)
│     ├─ js/data.js      12.2 KB  # 9 демо-объектов + тексты этапов маршрута
│     ├─ js/telegram-data.js 7.3 KB # снимок ленты @hazieva_realty: генерируется скриптом
│     ├─ js/icons.js      2.6 KB  # спрайт ICONS + render()
│     └─ img/                     # SVG-плейсхолдеры объектов, портрет-заглушка, фото
├─ scripts/                       # не публикуется на сайт, работает локально и в Actions
│  ├─ fetch-telegram.ps1          # t.me/s/<канал> → prototype/assets/js/telegram-data.js
│  └─ telegram-channel.txt        # @username канала — активная строка @hazieva_realty
├─ _shots/                        # стенды <iframe> + headless-тесты + скриншоты (трекается)
├─ _check.ps1 / _check.txt        # статические проверки разметки/JS/CSS
├─ serve.ps1 / start.cmd / restart.cmd   # локальный сервер на 127.0.0.1:5173
├─ deploy.ps1 / deploy.cmd        # синхронизация рабочей папки → repo, commit, push
├─ PROJECT_STATUS.md              # этот файл
└─ README.md
```

## 4. Что уже сделано (хронология)

1. **Документация Этапа 1** — 4 документа в `docs/` (концепция, карта сайта, архитектура,
   чек-лист контента) + `docs/README.md` с инструкциями по запуску/деплою.
2. **Прототип главной** (`prototype/index.html`): первый экран с портретом «внахлёст»,
   рабочая панель поиска, каталог-превью, «Маршрут сделки», «Обо мне», отзывы, лента Telegram,
   CTA, контакты, футер, модалка «Связаться» с валидацией и честным демо-сообщением.
3. **Прототип каталога** (`catalog.html`): сайдбар-фильтры (на ≤1024px — нижний лист),
   сортировка, счётчик, сброс, пустое состояние, пагинация, избранное в `localStorage`.
4. **Инфраструктура проверок**: `_check.ps1` (вложенность тегов, дубли/отсутствующие `id`,
   якоря без цели, `dialog[open]`, баланс скобок в JS, `-clamp(` в CSS) → отчёт `_check.txt`;
   стенды `_shots/test-desktop.html` (22 сценария) и `_shots/test-mobile.html` (15 сценариев)
   в `<iframe>` нужной ширины (обход ограничения headless Chrome ~500px).
5. **Публикация**: `deploy.ps1`/`deploy.cmd` (robocopy → git add/commit/push, сообщение коммита
   через временный файл UTF-8 без BOM) + GitHub Actions workflow на Pages.
6. **Итерации по иконкам и блоку «Маршрут сделки»** — серия коммитов от `83ec04e` до `e012a64`
   (размеры иконок 50→55→100px, откаты, замена иконок на SVG из `media/icons`).

### 4.1. Работа перед этим: стрелки листания этапов по бокам карточки

Задача: убрать стрелки из шапки карточки этапа и поставить их **по бокам карточки**.

| Шаг | Коммит | Что сделано |
| --- | --- | --- |
| 1 | `9440225` | стрелки листания этапов добавлены, боковой «задник» из фото зданий |
| 2 | `c8510a3` | стрелки переехали в строку шапки карточки, боковой задник убран |
| 3 | `6ec3e87` | **основное изменение**: оболочка `.route-shell`, стрелки по бокам карточки; на ≤1024px — под карточкой по краям |
| 4 | `92c7e9c` | актуализированы комментарии в `app.js` |
| 5 | `e012a64` | «увеличение иконок»: плашка `.route-detail__icon` 52→100px, картинка 28→50px |

**Итоговая разметка** (`prototype/index.html`, ~строки 254–276):

```html
<div class="route-shell">
  <button class="route__arrow route__arrow--prev" data-step-prev aria-controls="route-detail">…</button>
  <div class="route-detail" id="route-detail" role="region">
    <div class="route-detail__head">      <!-- только «Шаг 03 · Оформление» + иконка -->
      <div class="route-detail__head-text" aria-live="polite">…</div>
      <span class="route-detail__icon" id="route-detail-icon" hidden></span>
    </div>
    <ul class="route-detail__list" id="route-detail-list" aria-live="polite"></ul>
  </div>
  <button class="route__arrow route__arrow--next" data-step-next aria-controls="route-detail">…</button>
</div>
```

**CSS** (`prototype/assets/css/site.css`, блок ~736–816):

```css
.route-shell {
  margin-top: clamp(24px, 2.6vw, 36px);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas: "prev detail next";
  align-items: center;
  gap: clamp(10px, 1.1vw, 18px);
}
.route-detail { grid-area: detail; /* … */ }
.route__arrow { width: var(--tap); height: var(--tap); border-radius: 50%; background: var(--c-white); }
.route__arrow--prev { grid-area: prev; justify-self: start; }
.route__arrow--next { grid-area: next; justify-self: end; }
.route__arrow:focus-visible { border-radius: 50%; } /* глобальный :focus-visible ставит 4px */
```

В `@media (max-width: 1024px)` оболочка перестраивается — карточка на всю ширину,
стрелки под ней по краям:

```css
.route-shell {
  grid-template-columns: auto auto;
  grid-template-areas: "detail detail" "prev next";
  justify-content: space-between;
  row-gap: 16px;
}
```

**JS** (`prototype/assets/js/app.js`, `initRoute()` ~617–682): кнопки-стрелки не пересоздаются,
меняются только текстовые узлы, поэтому фокус и клавиши сохраняются. Обработчик `keydown`
(`←` `→` `Home` `End`) перенесён с карточки на `.route-shell` (fallback — сама карточка) плюс
группа `.route`, иначе с фокуса на стрелке клавиши не работали бы.

**Проверено** (headless Chrome, локально, по `getBoundingClientRect`):

| Ширина viewport | Раскладка оболочки | Стрелки | overflowX |
| --- | --- | --- | --- |
| 1684 / 1424 / 1264 | `44px 1fr 44px` | слева и справа от карточки, по центру по вертикали (dY = 0) | 0 |
| 1008 / 744 / 500 / 420 | карточка на всю ширину | под карточкой, прижаты к краям | 0 |

Дополнительно: цикл 01→04→01 и обратно, ровно одна `aria-pressed="true"`,
фокус на стрелке сохраняется после клика, `ArrowLeft` листает назад, иконка этапа видна
на всех ширинах, `_check.ps1` — без ошибок. Живой Pages проверен запросами: `route-shell`
и `route__arrow--prev/next` есть, `route-detail__nav` / `route-detail__actions` — 0,
в `site.css` есть `.route-shell`, `prev detail next`, `justify-self: start`.

### 4.2. Последняя работа: живая лента Telegram-канала без бэкенда

Задача: показать в блоке главной «Новые объекты и короткие разборы — в канале» **настоящие**
посты канала, не переделывая статический хостинг и не заводя сервер.

Сначала проверено, что прямой запрос из браузера невозможен: у веб-превью `https://t.me/s/<канал>`
нет `Access-Control-Allow-Origin` (это обычная HTML-страница для людей), а Bot API требует токен,
который нельзя держать в клиентском JS. Поэтому выбран вариант **снимок на сборке**: лента
собирается скриптом (локально или в GitHub Actions) и публикуется как обычный JS-файл — CORS
не нужен, токенов нет, сайт остаётся статическим.

| Файл | Роль |
| --- | --- |
| `scripts/fetch-telegram.ps1` | скачивает `t.me/s/<канал>`, разбирает посты (id, ссылка, дата, просмотры, первое фото, текст), чистит разметку по белому списку, пишет `telegram-data.js`. Ключи `-Channel`, `-OutFile`, `-MaxPosts` (50 — практически всё превью), `-MaxChars` (700); канал также берётся из `TELEGRAM_CHANNEL` или `scripts/telegram-channel.txt` |
| `scripts/telegram-channel.txt` | единственная настройка: активная строка — `@hazieva_realty` (канал Ксении), остальное — комментарии-подсказки |
| `.github/workflows/telegram.yml` | только `workflow_dispatch` с полем `channel` (расписания нет — обновление по запросу); собирает файл и коммитит в `main`, дальше срабатывает `deploy.yml` |
| `prototype/assets/js/telegram-data.js` | `window.HZ_TELEGRAM` — снимок ленты. Пока канал не задан, это пустой объект: скрипт без канала не трогает существующий файл, а если файла нет — создаёт такую заглушку, чтобы страницы не получали 404 |
| `prototype/assets/js/app.js` | `TG_MONTHS`, `tgTime()`, `tgCard()`, `tgProfile()`, `initTelegram()`: если канал есть — показывает `[data-tg-link]`, скрывает `[data-tg-fallback]`, рисует посты в каждом `[data-tg-feed]` (лимит из `data-tg-limit`: 3 на главной, без лимита на `telegram.html`), заполняет профиль канала `[data-tg-profile]`, счётчик `[data-tg-count]` и показывает кнопку `[data-tg-more]` |
| `prototype/index.html`, `catalog.html`, `telegram.html` | обёртка `.tg-feed[data-tg-feed]` вокруг демо-карточки; на главной — `data-tg-limit="3"` и кнопка «Все новости», на `telegram.html` — `tg-feed--grid` без лимита; кнопка «Открыть канал» и пара ссылок в футере/контактах скрыты до подключения канала; подключён `assets/js/telegram-data.js` (defer, до `icons.js`/`app.js`) |
| `prototype/assets/css/site.css` | `.tg-feed`, `.tg-post__avatar--photo`, `.tg-post__text a`, `.tg-post__media img` (`max-height: 300px`), `.tg-post__more`, `.tg-feed--grid`, `.tg-col`, `.tg-more`, `.tg-profile*`, плюс `[data-tg-fallback][hidden], [data-tg-link][hidden] { display: none !important; }` — без этого `hidden` не работает, т.к. `.btn`/`.tag` задают `display` |

Безопасность: текст поста вставляется через `innerHTML`, поэтому скрипт оставляет только
`b`, `strong`, `i`, `em`, `u`, `s`, `del`, `code`, `pre`, `blockquote`, `br` и ссылки
`http(s)`/`mailto`; `script`, `iframe`, `style`, `on*`-атрибуты и прочее вырезаются вместе с тегом;
после обрезки незакрытые теги закрываются. Ссылки получают `target="_blank" rel="noopener nofollow"`.
Остальные поля (название, дата, просмотры) выводятся через `esc()`.

**Проверено локально:**

- **канал Ксении `@hazieva_realty`** (27.11.2026): 3 поста (id 709–711), название
  «Ксения Хазиева|Риелтор|Екатеринбург», 183 подписчика, фото на `cdn4.telesco.pe`,
  просмотры 20 / 46 / 43, тексты с эмодзи, `<b>`/`<u>`/`<br>` и обрезкой на 700 знаках;
- прогон по реальным каналам (`@durov`, `@telegram`): 3 и 2 поста, эмодзи, `<br>`, ссылки,
  фото с `cdn*.telesco.pe`, просмотры («579 тыс.», «1,09 млн»), подписчики, название канала;
- `-Channel` принимает `@name`, `name`, `https://t.me/name`, `t.me/s/name`, `t.me/name/123`;
- пустой канал → код выхода 0: существующий `telegram-data.js` не меняется, а если файла нет —
  создаётся пустая заглушка (иначе страницы получали бы 404 по этому скрипту);
  закрытый/несуществующий канал → код 1 с сообщением;
- `ConvertTo-Json` для одного поста отдаёт объект, а не массив — `initTelegram()` нормализует
  через `[].concat(cfg.posts)`;
- сгенерированный `telegram-data.js` и `app.js` прошли проверку синтаксиса парсером JScript;
- `_check.ps1` — без ошибок: `index.html`/`catalog.html`/`telegram.html` без ошибок вложенности,
  дублей `id` и якорей без цели.

### 4.3. Страница «Все посты» и кнопка «Все новости»

Задача: показывать не только 3 поста на главной, а **всю** ленту канала, не ломая главную.
Решение — отдельная страница `prototype/telegram.html` с той же шапкой, футером, мобильным меню
и диалогом, что у главной (скопированы дословно, правились только `href` и подписи).

| Что | Как сделано |
| --- | --- |
| Главная | блок Telegram: `data-tg-feed data-tg-limit="3"`, под лентой — `.tg-more` с кнопкой **«Все новости»** на `telegram.html`; демо-раздел «Блог» с анонсами «скоро» убран (его заменила живая лента), `id="blog"` перенесён на секцию Telegram, чтобы старые якоря `#blog` не ломались |
| `telegram.html` | хлебные крошки `Главная / Все посты`, `h1`, карточка канала (аватар, название, подписчики, число постов, время снимка) и `tg-feed tg-feed--grid` **без** `data-tg-limit` — рендерятся все посты снимка |
| Лимит | один `initTelegram()` читает `data-tg-limit` из разметки: нет атрибута — выводятся все посты. HTML остаётся источником правды, JS не знает про конкретные страницы |
| Кнопка «Все новости» | `[data-tg-more hidden]`, `initTelegram()` снимает `hidden`, когда канал подключён и посты есть; при неподключённом канале остаётся демо-карточка и кнопки нет |
| Навигация | «Блог» в шапке, мобильном меню и футере всех трёх страниц ведёт на `telegram.html` (`aria-current="page"` на самой странице) |
| Сетка | `.tg-feed--grid`: 2 колонки на широком экране, 1 колонка на ≤860px; карточки выровнены по верху (`align-items: start`), фото ограничены 340px по высоте |
| Проверки | `_check.ps1` теперь проверяет и `telegram.html` (вложенность, дубли `id`, обязательные `id`, якоря, `dialog[open]`); отдельный шаблон проверки — без ложных «отсутствующих id» каталога |

**Замеры раскладки** (headless Chrome через `<iframe>` фиксированной ширины, `getComputedStyle`
+ `getBoundingClientRect`, временные файлы удалены):

| Ширина | Главная | `telegram.html` | Переполнение |
| --- | --- | --- | --- |
| 390px | 3 поста, карточка 350×1140, кнопка «Все новости» 134×44 | 1 колонка 350px, профиль на всю ширину | нет (`scrollWidth = 390`) |
| 820px | — | 1 колонка 740px | нет (`scrollWidth = 820`) |
| 1280px | 3 поста, карточка 460px, две колонки `.tg-wrap` 502/614 | 2 колонки по 570px | нет (`scrollWidth = 1280`) |

`-MaxPosts` в `scripts/fetch-telegram.ps1` поднят с 3 до 50: иначе «все посты» на новой странице
означали бы те же три записи. Глубина ограничена самим веб-превью `t.me/s/<канал>`.

## 5. Изменённые файлы (главный коммит `6ec3e87`)

| Файл | Что изменилось |
| --- | --- |
| `prototype/index.html` | новая обёртка `.route-shell` вокруг стрелок и карточки; из шапки убраны `.route-detail__actions`/`.route-detail__nav` |
| `prototype/assets/css/site.css` | добавлен `.route-shell` (grid `"prev detail next"`), `.route__arrow--prev/--next` + `grid-area`, фон стрелок `--c-white`, возврат `border-radius: 50%` в `:focus-visible`, перестроение на ≤1024px, удалены правила `.route-detail__actions` / `.route-detail__nav`, убрано скрытие `.route-detail__icon` на ≤720px |
| `prototype/assets/js/app.js` | `keydown` навешен на `.route-shell` (fallback — карточка) + группа `.route`; комментарии |
| `docs/04-content-checklist.md` | описан новый порядок стрелок (по бокам, на ≤1024px — снизу) |
| `_check.txt` | перегенерированный отчёт статических проверок |

Дальше `e012a64` («увеличение иконок») правит одну строку в `site.css`:
`.route-detail__icon` 52×52 → 100×100, картинка 28 → 50px.

**Закоммичено и опубликовано:** `b885557` — весь блок Telegram-ленты из §4.2 (`scripts/`,
`.github/workflows/telegram.yml`, `prototype/assets/js/telegram-data.js`, правки
`index.html`/`catalog.html`/`site.css`/`app.js`, документы); прогон деплоя упал на шаге
`deploy-pages` (transient), поэтому следом `2e9cd08` добавил в `deploy.yml` группу
`concurrency: pages` — публикация прошла успешно (run #27). Живой сайт
`https://pushistiyavocado.github.io/my_website/` отдаёт ленту канала: 2 карточки реальных
постов, 5 ссылок `t.me/hazieva_realty`, ни одна заглушка `data-tg-fallback` не видна.
В рабочем дереве остался только `media/icons/recraft-svg-converter.svg` (untracked, не
используется сайтом) — решить: хранить как исходник или удалить.

**Рабочая папка `E:\Building web site\Недвижемость` синхронизирована из репозитория** (15 файлов:
`index.html`, `catalog.html`, `app.js`, `site.css`, `telegram-data.js`, `scripts/*`, оба
workflow, `docs/*`, `PROJECT_STATUS.md`, `_check.txt`). Она отставала на несколько правок,
поэтому следующий `deploy.cmd` без этой синхронизации откатил бы ленту Telegram обратно
в демо-состояние.

**Текущая правка (страница «Все посты»):** новый `prototype/telegram.html`; `prototype/index.html`
(блок Telegram с `data-tg-limit="3"` и кнопкой «Все новости», ссылки «Блог», удалён демо-раздел
блога); `prototype/catalog.html` (ссылки «Блог»); `prototype/assets/js/app.js` (`tgProfile()`,
лимит из разметки); `prototype/assets/css/site.css` (`.tg-feed--grid`, `.tg-col`, `.tg-more`,
`.tg-profile`); `scripts/fetch-telegram.ps1` (`-MaxPosts` 50); `_check.ps1` (проверка третьей
страницы); `docs/README.md`, `docs/02-sitemap-and-flows.md`, `docs/04-content-checklist.md`,
`PROJECT_STATUS.md`.

## 6. Текущее состояние

- `_check.ps1`: вложенность тегов — 0 ошибок, дублей `id` нет, обязательные `id` на месте,
  якорей без цели нет, `dialog[open]` — 0, скобки в `data.js`/`icons.js`/`app.js`
  сбалансированы, `-clamp(` в CSS — 0.
- Брейкпоинты в `site.css`: `1080`, `1025` (min), `1024`, `860`, `720`, `480`, `420`,
  `prefers-reduced-motion`, `print`.
- Ключевые токены: `--tap: 44px`, `--c-milk #f5f2ec`, `--c-white #ffffff`,
  `--c-line-strong #d7d5cc`, `--focus-ring`.
- Текущие размеры иконок: `.step__icon` 55×55 (картинка 50px), `.route-detail__icon` 100×100
  (картинка 50px).
- Telegram-лента: канал `@hazieva_realty` подключён, `telegram-data.js` собран (3 поста,
  название канала, 183 подписчика, фото, просмотры); на главной вместо демо-карточки стоят
  три реальных поста и кнопка «Все новости», на `telegram.html` — вся лента сеткой с карточкой
  канала и счётчиком; ссылки на канал показаны. Обновление — **по запросу**: Actions →
  «Telegram channel feed» → Run workflow (cron убран).

## 7. Оставшиеся задачи

### 7.1. Адаптивность (приоритет — сразу после последней правки иконок)

1. **Проверить плашку иконки 100×100 после `e012a64`.** Она стала вдвое больше, а шапка
   карточки — `flex` с `flex-wrap: wrap` и `justify-content: space-between`; на 720/480/420px
   нужно убедиться, что заголовок не сжимается в «столбик слов» и карточка не растёт по высоте
   некрасиво. Если жмёт — уменьшить через `clamp(64px, 9vw, 100px)`, картинку
   `clamp(32px, 5vw, 50px)`, либо вернуть иконку в `.route-detail__head-text` как строчный элемент.
2. **Стрелки на границе 1024/1025px.** Перестроение «вбок → вниз» происходит ровно на 1024px:
   проверить 1024 и 1025 отдельно (при 1025 карточка получает ~840px, стрелки по бокам —
   не должно быть переноса слов в заголовке).
3. **Реальные ширины 320–390px.** Headless Chrome не создаёт окно уже ~500px, поэтому 420px
   снималось через iframe-стенд. Нужен прогон 320/360/375/390 (`_shots/frame.html`):
   ниже 420px `.route-shell` ещё не проверялся. Особое внимание — `gap: 10px` между карточкой
   и стрелками + `--tap: 44px`: на 320px карточка должна остаться ≥ 200px.
4. **Соседние блоки на тех же узких ширинах** (после правки иконок не перепроверялись):
   `.step` в 2 колонки на ≤860px с иконкой 55px, `.hero__portrait` 116px на ≤720px,
   шапка с `white-space: nowrap` на ≤480px, поиск в одну колонку на ≤420px.
5. **Клавиатура и скринридер** на мобильной раскладке: `Tab` до стрелки, `←/→`, `Home/End`,
   корректное озвучивание `aria-controls` / `aria-live` / `aria-pressed`.
6. **`@media print` и `prefers-reduced-motion`** для нового блока: убедиться, что `.route-shell`
   не ломает печать (стрелки декоративные — можно скрыть).
7. **Визуальный регресс**: добавить в `_shots/` скриншоты блока «Маршрут сделки»
   1440 / 1024 / 390 для сравнения будущих правок.

### 7.2. Инфраструктура и гигиена

8. **Синхронизировать рабочую папку** `E:\Building web site\Недвижемость` с репозиторием
   (или удалить её и работать только в `Real_estate\my_website`) — иначе `deploy.ps1`
   перезапишет свежие файлы старыми.
9. Решить судьбу `media/icons/recraft-svg-converter.svg` (добавить или удалить).
10. Каталог `C:\Windows\Temp\rp` (профили headless Chrome) не удаляется — «Отказано в доступе»
    на самом каталоге; удалить вручную или после перезагрузки.
11. Тяжёлые картинки: `prototype/assets/img/had_interior.jpg` — 1 МБ,
    `main_photo_person.jpg` — 200 КБ; сжать / перевести в WebP перед боевым запуском.

### 7.3. Контент, юридика, архитектура (детали — `docs/04-content-checklist.md`)

12. **Блокеры контента:** телефон, Telegram, e-mail, подтверждение городов/районов,
    6–10 реальных объектов с фото, портрет Ксении, подтверждённые цифры опыта, отзывы.
13. **Юридика:** политика ПД (`/privacy`), чекбокс согласия в формах, данные продавца
    в футере, разрешения на фото и отзывы.
14. **Бэкенд:** формы пока только валидируются и показывают «данные не отправлены» —
    нужен приём заявок (почта + Telegram).
15. **Этап 2+:** перенос в Next.js по `docs/03-architecture.md` (требует установки Node.js),
    остальные страницы (услуги, карточка объекта, блог, `/privacy`), SEO (`sitemap.xml`,
    JSON-LD), админка и модерация.

### 7.4. Telegram-лента

16. **Обновлять ленту по запросу:** Actions → **Telegram channel feed** → **Run workflow**
    (расписания нет: cron `17 */2 * * *` убран намеренно). После нового поста в канале
    достаточно одного запуска — workflow перезапишет `telegram-data.js` и закоммитит его.
17. **Проверить ленту на реальных постах — на обеих страницах:** 1200 / 820 / 390px, длинный текст
    (обрезка 700 знаков + ссылка «Читать в Telegram»), пост без фото, альбом из нескольких фото,
    эмодзи и `<br>`; на `telegram.html` — сетку из 2 колонок и карточку канала.
    При необходимости поправить `-MaxChars` / `-MaxPosts` (по умолчанию 50) при запуске скрипта.
18. **Если канал станет закрытым** (веб-превью `t.me/s/<канал>` перестанет открываться) — снимок
    не соберётся: либо официальный виджет `https://t.me/<канал>?embed=1` в `<iframe>`, либо
    Bot API на Этапе 4 (`docs/03-architecture.md` §9).
19. **Автопостинг объектов в канал** из будущей админки остаётся задачей Этапа 4 — текущая лента
    только читает канал.

## 8. Как проверять и публиковать

```powershell
# локальный сервер (или двойной щелчок по start.cmd)
powershell -NoProfile -ExecutionPolicy Bypass -File .\serve.ps1
# → http://127.0.0.1:5173/index.html , http://127.0.0.1:5173/catalog.html

# статические проверки → отчёт в _check.txt
powershell -NoProfile -ExecutionPolicy Bypass -File .\_check.ps1

# лента Telegram-канала → prototype/assets/js/telegram-data.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\fetch-telegram.ps1 -Channel '@channel'

# headless-проверка новой раскладки (пример: позиции стрелок на 1440px)
#   Chrome --headless=new --dump-dom --window-size=1440,900 <стенд из _shots>

# публикация из копии репозитория
git add -A; git commit -m "сообщение"; git push origin main
# затем 1–2 мин на GitHub Actions и Ctrl+F5 на сайте
```

Тесты в браузере: `_shots/test-desktop.html` (22 сценария, 1200px),
`_shots/test-mobile.html` (15 сценариев, 390px), скриншоты — `_shots/shot.html#filters|#dialog`.

## 9. Грабли, на которые уже наступали

1. **Headless Chrome не делает окно уже ~500px** → узкие ширины меряются через `<iframe>`
   нужной ширины (`_shots/frame.html`, `_shots/frame-catalog.html`).
2. **Глобальный `:focus-visible` задаёт `border-radius: 4px`** — круглым кнопкам радиус нужно
   возвращать явно (`.route__arrow:focus-visible`).
3. **`justify-content: space-between` в grid** не прижимает элементы к краям сам по себе —
   нужен `justify-self: start/end` у стрелок (поймано пробой на ≤1024px).
4. **Скрипты `*.ps1` должны быть в UTF-8 с BOM**, иначе Windows PowerShell 5.1 ломает кириллицу.
5. **Git-коммиты с кириллицей**: писать сообщение в файл UTF-8 без BOM и делать `git commit -F`
   (так делает `deploy.ps1`).
6. **GitHub Pages кэшируется** — без `Ctrl+F5` видна старая версия `site.css`/`app.js`.
7. **Временные пробники** (`prototype/_probe*`, `_shot*`) нужно удалять после проверки,
   иначе они попадают в публикуемую папку `./prototype`.

