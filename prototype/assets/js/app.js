/* Интерактивность прототипа: всё, что выглядит кликабельным, действительно работает
   в рамках клиентской логики. Отправка форм намеренно не выполняется — бэкенда ещё нет,
   и пользователь получает об этом честное сообщение. */
(function () {
  'use strict';

  var DATA = window.HZ_DATA || { listings: [], cities: [], types: [], routeSteps: [] };
  var nf = new Intl.NumberFormat('ru-RU');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function money(v) { return nf.format(v) + ' ₽'; }
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function icons() { if (window.HZ_renderIcons) window.HZ_renderIcons(); }

  /* ---------- Уведомления ---------- */
  var toastTimer = null;
  function toast(message) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3200);
  }

  /* ---------- Хедер ---------- */
  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    function onScroll() { header.classList.toggle('is-stuck', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Мобильное меню ---------- */
  function initDrawer() {
    var drawer = $('#mobile-menu');
    if (!drawer) return;
    var openers = $$('[data-open-menu]');
    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      drawer.classList.add('is-open');
      drawer.removeAttribute('hidden');
      document.body.classList.add('is-locked');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      var first = drawer.querySelector('a, button');
      if (first) first.focus();
    }
    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('hidden', '');
      document.body.classList.remove('is-locked');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (lastFocused) lastFocused.focus();
    }

    openers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (drawer.classList.contains('is-open')) close(); else open();
      });
    });
    $$('[data-close-menu]', drawer).forEach(function (b) { b.addEventListener('click', close); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080 && drawer.classList.contains('is-open')) close();
    });
  }

  /* ---------- Диалоги ---------- */
  function initDialogs() {
    $$('[data-open-dialog]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-open-dialog');
        var dlg = document.getElementById(id);
        if (!dlg) return;
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');
        var field = dlg.querySelector('input, textarea, select');
        if (field) setTimeout(function () { field.focus(); }, 60);
      });
    });

    $$('dialog.dialog').forEach(function (dlg) {
      function close() {
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
      }
      $$('[data-close-dialog]', dlg).forEach(function (b) { b.addEventListener('click', close); });
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) close();
      });
    });
  }

  /* ---------- Избранное (localStorage, работает без сервера) ---------- */
  var FAV_KEY = 'hz_favorites_v1';
  function readFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch (err) { return []; }
  }
  function writeFavs(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (err) { /* приватный режим */ }
  }
  function toggleFav(id, btn) {
    var list = readFavs();
    var idx = list.indexOf(id);
    var added = idx === -1;
    if (added) list.push(id); else list.splice(idx, 1);
    writeFavs(list);
    btn.setAttribute('aria-pressed', added ? 'true' : 'false');
    toast(added ? 'Объект добавлен в избранное (сохраняется в этом браузере)' : 'Объект удалён из избранного');
  }
  function syncFavs() {
    var list = readFavs();
    $$('[data-fav]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', list.indexOf(btn.getAttribute('data-fav')) !== -1 ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-fav]') : null;
    if (btn) toggleFav(btn.getAttribute('data-fav'), btn);
  });

  /* ---------- Валидация форм ---------- */
  function setError(wrap, message) {
    if (!wrap) return;
    wrap.classList.toggle('has-error', !!message);
    var box = wrap.querySelector('.field__error');
    if (!box) return;
    if (message) { box.textContent = message; box.hidden = false; }
    else { box.textContent = ''; box.hidden = true; }
  }

  function validate(form) {
    var ok = true;
    $$('[required]', form).forEach(function (el) {
      var wrap = el.closest('.field') || el.parentNode;
      var msg = '';
      if (el.type === 'checkbox') {
        if (!el.checked) msg = 'Без согласия отправить данные нельзя';
      } else if (!el.value.trim()) {
        msg = 'Заполните поле';
      } else if (el.type === 'tel') {
        if (el.value.replace(/\D/g, '').length < 10) msg = 'Проверьте номер: нужно не меньше 10 цифр';
      } else if (el.minLength > 0 && el.value.trim().length < el.minLength) {
        msg = 'Минимум ' + el.minLength + ' символа';
      }
      setError(wrap, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  function initForms() {
    $$('form[data-demo-form]').forEach(function (form) {
      var result = $('[data-form-result]', form);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) {
          toast('Проверьте выделенные поля');
          var firstError = $('.has-error input, .has-error textarea, .has-error select', form);
          if (firstError) firstError.focus();
          return;
        }
        if (result) {
          result.hidden = false;
          result.classList.add('is-visible');
          result.innerHTML = '<strong>Данные заполнены корректно.</strong> ' +
            'Это прототип: заявка никуда не отправляется. После подключения серверной части ' +
            'и политики обработки персональных данных здесь появится подтверждение отправки.';
        }
        toast('Проверка пройдена — отправка пока не выполняется (демо)');
      });

      $$('input, textarea, select', form).forEach(function (el) {
        function clear() { setError(el.closest('.field') || el.parentNode, ''); }
        el.addEventListener('input', clear);
        el.addEventListener('change', clear);
      });
    });
  }

  /* ---------- Карточка объекта ---------- */
  function cardSpecs(item) {
    var parts = [];
    if (item.rooms) parts.push(item.rooms + '-комн.');
    if (item.area) parts.push(item.area + ' м²');
    if (item.floor) parts.push(item.floor + '/' + item.floors + ' эт.');
    if (item.plot) parts.push((item.type === 'land' ? '' : 'уч. ') + item.plot + ' сот.');
    return parts;
  }

  function listingCard(item) {
    var sold = item.status === 'sold';
    var specs = cardSpecs(item).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
    return '' +
      '<article class="listing reveal' + (sold ? ' listing--sold' : '') + '">' +
        '<div class="listing__media">' +
          '<img src="' + esc(item.image) + '" alt="' + esc(item.imageAlt) + '" width="800" height="600" loading="lazy" decoding="async">' +
          '<span class="listing__status' + (sold ? ' listing__status--sold' : '') + '">' + (sold ? 'Продано' : 'Актуально') + '</span>' +
          '<button class="listing__fav" type="button" aria-pressed="false" data-fav="' + esc(item.id) + '"' +
            ' aria-label="Добавить в избранное: ' + esc(item.title) + '">' +
            '<span data-icon="heart"></span></button>' +
        '</div>' +
        '<div class="listing__body">' +
          '<p class="listing__price">' + money(item.price) + '</p>' +
          '<h3 class="listing__title">' + esc(item.title) + '</h3>' +
          '<p class="listing__specs">' + specs + '</p>' +
          '<p class="listing__place">' + esc(item.cityLabel) + ', ' + esc(item.district) + '</p>' +
          '<p class="listing__text">' + esc(item.description) + '</p>' +
          '<div class="listing__foot">' +
            '<span>Обновлено ' + esc(item.updatedAt) + '</span>' +
            '<span class="tag tag--demo">демо</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function emptyMarkup(title, text) {
    return '' +
      '<div class="empty-state">' +
        '<span class="empty-state__icon" data-icon="search"></span>' +
        '<h3 class="empty-state__title">' + esc(title) + '</h3>' +
        '<p class="empty-state__text">' + esc(text) + '</p>' +
        '<button class="btn btn--ghost" type="button" data-reset-filters>Сбросить фильтры</button>' +
      '</div>';
  }

  /* ---------- Общие помощники фильтрации ---------- */
  function toNum(value) {
    var n = parseInt(String(value == null ? '' : value).replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? null : n;
  }

  function plural(n, forms) {
    var a = Math.abs(n) % 100;
    var b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  }

  function matches(item, f) {
    if (f.type && item.type !== f.type) return false;
    if (f.city && item.city !== f.city) return false;
    if (f.district && item.district !== f.district) return false;
    if (f.rooms) {
      if (f.rooms === '4+') {
        if (!item.rooms || item.rooms < 4) return false;
      } else if (String(item.rooms) !== f.rooms) return false;
    }
    if (f.priceMin != null && item.price < f.priceMin) return false;
    if (f.priceMax != null && item.price > f.priceMax) return false;
    if (f.areaMin != null && !(item.area >= f.areaMin)) return false;
    if (f.areaMax != null && !(item.area && item.area <= f.areaMax)) return false;
    if (f.plotMin != null && !(item.plot >= f.plotMin)) return false;
    if (f.floorMin != null && !(item.floor >= f.floorMin)) return false;
    return true;
  }

  function typeLabel(value) {
    var found = '';
    DATA.types.forEach(function (t) { if (t.value === value) found = t.label; });
    return found;
  }

  function cityLabel(value) {
    var found = '';
    DATA.cities.forEach(function (c) { if (c.value === value) found = c.label; });
    return found;
  }

  function fillDistrictSelect(select, cityValue, placeholder) {
    if (!select) return;
    var city = null;
    DATA.cities.forEach(function (c) { if (c.value === cityValue) city = c; });
    var current = select.value;
    var html = '<option value="">' + placeholder + '</option>';
    if (city) {
      city.districts.forEach(function (d) {
        html += '<option value="' + esc(d) + '">' + esc(d) + '</option>';
      });
    }
    select.innerHTML = html;
    if (city && city.districts.indexOf(current) !== -1) select.value = current;
  }

  /* ---------- Поиск на главной ---------- */
  function initHomeSearch() {
    var form = $('#search-form');
    var grid = $('#listings-grid');
    if (!form || !grid) return;

    var resultEl = $('#search-result');
    var citySel = $('#s-city');
    var distSel = $('#s-district');

    function read() {
      return {
        type: $('#s-type').value,
        city: citySel.value,
        district: distSel.value,
        rooms: $('#s-rooms').value,
        priceMin: toNum($('#s-price-min').value),
        priceMax: toNum($('#s-price-max').value),
        areaMin: toNum($('#s-area-min').value)
      };
    }

    function render() {
      var f = read();
      var found = DATA.listings.filter(function (it) { return matches(it, f); });
      var shown = found.slice(0, 6);
      renderGrid(grid, found.length ? shown : [], 'Попробуйте выбрать другой район, тип или диапазон цены — подходящих объектов в демо-наборе нет.');
      if (resultEl) {
        if (!found.length) {
          resultEl.innerHTML = 'По заданным условиям ничего не найдено';
        } else {
          resultEl.innerHTML = 'Найдено <strong>' + found.length + '</strong> ' +
            plural(found.length, ['объект', 'объекта', 'объектов']) +
            (found.length > shown.length ? ' · показаны первые ' + shown.length : '');
        }
      }
    }

    function reset() {
      $$('.field__control', form).forEach(function (el) { el.value = ''; });
      fillDistrictSelect(distSel, citySel.value, 'Любой район');
      render();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      render();
      var target = $('#actual');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('Фильтр применён к демонстрационной подборке');
    });

    citySel.addEventListener('change', function () {
      fillDistrictSelect(distSel, citySel.value, 'Любой район');
      render();
    });

    $$('select, input', form).forEach(function (el) {
      if (el === citySel) return;
      el.addEventListener('change', render);
    });

    window.HZ_reset = reset;
    render();
  }

  function renderGrid(grid, items, emptyText) {
    if (!grid) return;
    if (!items.length) {
      grid.innerHTML = emptyMarkup('Подходящих объектов не нашлось', emptyText ||
        'Попробуйте убрать один из фильтров или расширить диапазон цены.');
    } else {
      grid.innerHTML = items.map(listingCard).join('');
    }
    icons();
    syncFavs();
    revealScan();
  }

  /* ---------- Каталог ---------- */
  function initCatalog() {
    var grid = $('#catalog-grid');
    if (!grid) return;

    var dlg = $('#filters');
    var countEl = $('#catalog-count');
    var chipsEl = $('#active-filters');
    var pagerEl = $('#catalog-pagination');
    var sortSel = $('#catalog-sort');
    var submitBtn = $('#filters-submit');
    var PAGE = 6;
    var page = 1;
    var found = [];

    var f = {
      type: $('#f-type'), city: $('#f-city'), district: $('#f-district'), rooms: $('#f-rooms'),
      priceMin: $('#f-price-min'), priceMax: $('#f-price-max'),
      areaMin: $('#f-area-min'), areaMax: $('#f-area-max'),
      plotMin: $('#f-plot-min'), floorMin: $('#f-floor-min')
    };
    var distSel = f.district;

    function read() {
      return {
        type: f.type.value,
        city: f.city.value,
        district: distSel.value,
        rooms: f.rooms.value,
        priceMin: toNum(f.priceMin.value),
        priceMax: toNum(f.priceMax.value),
        areaMin: toNum(f.areaMin.value),
        areaMax: toNum(f.areaMax.value),
        plotMin: toNum(f.plotMin.value),
        floorMin: toNum(f.floorMin.value)
      };
    }

    function dateVal(str) {
      var p = String(str).split('.');
      return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0])).getTime() || 0;
    }

    function sorted(list) {
      var mode = sortSel ? sortSel.value : 'new';
      var copy = list.slice();
      if (mode === 'cheap') copy.sort(function (a, b) { return a.price - b.price; });
      else if (mode === 'expensive') copy.sort(function (a, b) { return b.price - a.price; });
      else if (mode === 'area') copy.sort(function (a, b) { return (b.area || 0) - (a.area || 0); });
      else copy.sort(function (a, b) { return dateVal(b.updatedAt) - dateVal(a.updatedAt); });
      return copy;
    }

    function chips(filters) {
      var list = [];
      if (filters.type) list.push({ key: 'type', text: typeLabel(filters.type) });
      if (filters.city) list.push({ key: 'city', text: cityLabel(filters.city) });
      if (filters.district) list.push({ key: 'district', text: filters.district });
      if (filters.rooms) {
        list.push({
          key: 'rooms',
          text: filters.rooms === '4+' ? '4+ комнаты'
            : filters.rooms + ' ' + plural(Number(filters.rooms), ['комната', 'комнаты', 'комнат'])
        });
      }
      if (filters.priceMin != null) list.push({ key: 'priceMin', text: 'цена от ' + money(filters.priceMin) });
      if (filters.priceMax != null) list.push({ key: 'priceMax', text: 'цена до ' + money(filters.priceMax) });
      if (filters.areaMin != null) list.push({ key: 'areaMin', text: 'площадь от ' + filters.areaMin + ' м²' });
      if (filters.areaMax != null) list.push({ key: 'areaMax', text: 'площадь до ' + filters.areaMax + ' м²' });
      if (filters.plotMin != null) list.push({ key: 'plotMin', text: 'участок от ' + filters.plotMin + ' сот.' });
      if (filters.floorMin != null) list.push({ key: 'floorMin', text: 'этаж от ' + filters.floorMin });
      return list;
    }

    function renderChips(filters) {
      if (!chipsEl) return;
      var list = chips(filters);
      chipsEl.innerHTML = list.map(function (c) {
        return '<span class="active-filter">' + esc(c.text) +
          '<button type="button" data-clear="' + c.key + '" aria-label="Убрать фильтр: ' + esc(c.text) + '">×</button></span>';
      }).join('');
      chipsEl.hidden = list.length === 0;
    }

    function renderPager(pages) {
      if (!pagerEl) return;
      if (pages < 2) { pagerEl.innerHTML = ''; pagerEl.hidden = true; return; }
      pagerEl.hidden = false;
      function btn(target, label, extra) {
        return '<button class="pagination__btn" type="button" data-page="' + target + '"' + extra + '>' + label + '</button>';
      }
      var html = btn(page - 1, '←', ' aria-label="Предыдущая страница"' + (page === 1 ? ' disabled' : ''));
      for (var i = 1; i <= pages; i++) {
        html += btn(i, String(i), i === page ? ' aria-current="page"' : '');
      }
      html += btn(page + 1, '→', ' aria-label="Следующая страница"' + (page === pages ? ' disabled' : ''));
      pagerEl.innerHTML = html;
    }

    function updateCount() {
      if (!countEl) return;
      var n = found.length;
      var pages = Math.max(1, Math.ceil(n / PAGE));
      countEl.innerHTML = n
        ? 'Найдено <strong>' + n + '</strong> ' + plural(n, ['объект', 'объекта', 'объектов']) +
          ' · страница ' + page + ' из ' + pages
        : 'Ничего не найдено';
      if (submitBtn) submitBtn.textContent = 'Показать ' + n + ' ' + plural(n, ['объект', 'объекта', 'объектов']);
    }

    function render() {
      var filters = read();
      found = sorted(DATA.listings.filter(function (it) { return matches(it, filters); }));
      var pages = Math.max(1, Math.ceil(found.length / PAGE));
      if (page > pages) page = pages;
      var slice = found.slice((page - 1) * PAGE, page * PAGE);
      renderGrid(grid, slice, 'В демонстрационном наборе нет объектов под эти условия. Снимите часть фильтров — например, минимальную площадь или этаж.');
      renderChips(filters);
      renderPager(pages);
      updateCount();
      $$('[data-quick-type]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-quick-type') === filters.type ? 'true' : 'false');
      });
    }

    function update() { page = 1; render(); }

    function reset() {
      Object.keys(f).forEach(function (k) { if (f[k]) f[k].value = ''; });
      fillDistrictSelect(distSel, '', 'Любой район');
      if (sortSel) sortSel.value = 'new';
      update();
    }
    window.HZ_reset = reset;

    if (f.city) {
      fillDistrictSelect(distSel, f.city.value, 'Любой район');
      f.city.addEventListener('change', function () {
        fillDistrictSelect(distSel, f.city.value, 'Любой район');
        update();
      });
    }
    [f.type, f.rooms, f.priceMin, f.priceMax, f.areaMin, f.areaMax, f.plotMin, f.floorMin].forEach(function (el) {
      if (el) el.addEventListener('change', update);
    });
    if (distSel) distSel.addEventListener('change', update);
    if (sortSel) sortSel.addEventListener('change', update);

    if (chipsEl) {
      chipsEl.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('[data-clear]') : null;
        if (!b) return;
        var key = b.getAttribute('data-clear');
        if (key === 'city') {
          f.city.value = '';
          fillDistrictSelect(distSel, '', 'Любой район');
        } else if (f[key]) {
          f[key].value = '';
        }
        update();
      });
    }

    if (pagerEl) {
      pagerEl.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('[data-page]') : null;
        if (!b || b.disabled) return;
        page = Number(b.getAttribute('data-page'));
        render();
        var anchor = $('#catalog-top');
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    $$('[data-quick-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        var value = b.getAttribute('data-quick-type');
        f.type.value = f.type.value === value ? '' : value;
        update();
      });
    });

    /* Нижний лист фильтров на планшете и телефоне: <dialog> в модальном режиме */
    function isWide() { return window.innerWidth > 1024; }

    function syncViewport() {
      if (!dlg) return;
      if (isWide()) {
        dlg.setAttribute('data-static', 'true');
        if (!dlg.open) dlg.setAttribute('open', '');
      } else {
        dlg.removeAttribute('data-static');
        if (dlg.open) {
          if (typeof dlg.close === 'function') dlg.close();
          else dlg.removeAttribute('open');
        }
      }
    }

    $$('[data-open-filters]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!dlg || isWide()) return;
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');
        /* Переводим фокус на первое поле, иначе браузер оставляет его на ссылке «Сбросить» */
        var field = dlg.querySelector('select, input');
        if (field) setTimeout(function () { field.focus(); }, 60);
      });
    });
    $$('[data-close-filters]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!dlg) return;
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
      });
    });
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        if (dlg && !isWide()) {
          if (typeof dlg.close === 'function') dlg.close();
          else dlg.removeAttribute('open');
        }
        toast('Фильтры применены к демонстрационной подборке');
      });
    }
    if (dlg) {
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg && !isWide()) {
          if (typeof dlg.close === 'function') dlg.close();
        }
      });
      syncViewport();
      window.addEventListener('resize', syncViewport);
    }

    render();
  }

  /* ---------- Маршрут сделки ---------- */
  /* Стрелки листания стоят по бокам карточки этапа, поэтому обновляем только
     текстовые узлы: кнопки не пересоздаются и не теряют фокус. */
  function initRoute() {
    var steps = $$('.step[data-step]');
    var panel = $('#route-detail');
    var labelEl = $('#route-detail-label');
    var titleEl = $('#route-detail-title');
    var iconEl = $('#route-detail-icon');
    var listEl = $('#route-detail-list');
    var prevBtn = $('[data-step-prev]');
    var nextBtn = $('[data-step-next]');
    if (!steps.length || !panel || !DATA.routeSteps.length) return;
    if (!labelEl || !titleEl || !listEl) return;

    var current = 0;

    function select(index) {
      var step = DATA.routeSteps[index];
      if (!step) return;
      current = index;
      steps.forEach(function (btn, i) {
        btn.classList.toggle('is-active', i === index);
        btn.setAttribute('aria-pressed', i === index ? 'true' : 'false');
      });
      /* Иконка берётся из самого этапа: работает и для <img>, и для data-icon. */
      var iconBox = steps[index].querySelector('.step__icon');
      var iconHTML = iconBox ? iconBox.innerHTML.trim() : '';

      labelEl.textContent = step.label;
      titleEl.textContent = step.detailTitle;
      if (iconEl) {
        iconEl.innerHTML = iconHTML;
        if (iconHTML) iconEl.removeAttribute('hidden');
        else iconEl.setAttribute('hidden', '');
      }
      listEl.innerHTML = step.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
    }

    /* Листание по кругу: с 04 «вперёд» возвращает к 01 и наоборот */
    function shift(delta) {
      select((current + delta + steps.length) % steps.length);
    }

    steps.forEach(function (btn, i) {
      btn.addEventListener('click', function () { select(i); });
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { shift(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { shift(1); });

    /* Клавиши ← → Home End работают, когда фокус на этапе, в карточке или на стрелке */
    function onKeydown(e) {
      if (e.key === 'ArrowRight') { shift(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { shift(-1); e.preventDefault(); }
      else if (e.key === 'Home') { select(0); e.preventDefault(); }
      else if (e.key === 'End') { select(steps.length - 1); e.preventDefault(); }
    }
    /* Клавиши работают, когда фокус на этапе, на карточке или на стрелке по боку */
    var shell = $('.route-shell') || panel;
    var group = $('.route');
    if (group) group.addEventListener('keydown', onKeydown);
    shell.addEventListener('keydown', onKeydown);

    select(0);
  }

  /* ---------- Лента Telegram-канала ---------- */
  /* Запрос к t.me из браузера невозможен: у веб-превью канала нет CORS-заголовков,
     а Bot API требует секретный токен. Поэтому посты заранее собирает
     scripts/fetch-telegram.ps1 (GitHub Actions → .github/workflows/telegram.yml)
     и складывает в assets/js/telegram-data.js. Пока канал не подключён, файл
     содержит пустой объект и блок остаётся в демонстрационном виде. */
  var TG_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                   'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  function tgTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var hh = d.getHours();
    var mm = d.getMinutes();
    return d.getDate() + ' ' + TG_MONTHS[d.getMonth()] + ' в ' +
      (hh < 10 ? '0' + hh : hh) + ':' + (mm < 10 ? '0' + mm : mm);
  }

  /* Текст поста скрипт уже почистил: разрешены только br, b, strong, i, em, u,
     s, del, code, pre, blockquote и ссылки http(s)/mailto. Поэтому text
     вставляется как разметка, а всё остальное — через esc(). */
  function tgCard(post, cfg) {
    var avatar = cfg.photo
      ? '<span class="tg-post__avatar tg-post__avatar--photo"><img src="' + esc(cfg.photo) +
        '" alt="" width="34" height="34" loading="lazy" decoding="async"></span>'
      : '<span class="tg-post__avatar" aria-hidden="true">КХ</span>';
    var photo = post.photo
      ? '<div class="tg-post__media"><img src="' + esc(post.photo) +
        '" alt="Изображение из записи Telegram-канала" loading="lazy" decoding="async"></div>'
      : '';

    return '<article class="tg-post">' +
      '<div class="tg-post__head">' + avatar +
        '<div>' +
          '<p class="tg-post__channel">' + esc(cfg.title || ('@' + cfg.channel)) + '</p>' +
          '<p class="tg-post__time">' + esc(tgTime(post.datetime)) + '</p>' +
        '</div>' +
      '</div>' +
      (post.text ? '<div class="tg-post__text">' + post.text + '</div>' : '') +
      photo +
      '<p class="tg-post__foot">' +
        '<a class="tg-post__more" href="' + esc(post.url) + '" target="_blank" rel="noopener">Читать в Telegram</a>' +
        (post.views ? '<span>' + esc(post.views) + ' просмотров</span>' : '') +
      '</p>' +
    '</article>';
  }

  /* Профиль канала на странице «Все посты»: аватар, название, подписчики
     и время последнего сбора ленты. Раскладку задаёт .tg-profile. */
  function tgProfile(cfg, count) {
    var avatar = cfg.photo
      ? '<span class="tg-profile__avatar"><img src="' + esc(cfg.photo) +
        '" alt="" width="48" height="48" loading="lazy" decoding="async"></span>'
      : '<span class="tg-profile__avatar" aria-hidden="true">КХ</span>';
    var meta = [];
    if (cfg.subscribers) {
      var subs = parseInt(String(cfg.subscribers).replace(/\s/g, ''), 10);
      meta.push(esc(cfg.subscribers) + ' ' +
        plural(isNaN(subs) ? count : subs, ['подписчик', 'подписчика', 'подписчиков']));
    }
    meta.push('в ленте ' + count + ' ' + plural(count, ['пост', 'поста', 'постов']));
    if (cfg.updatedAt) meta.push('обновлено ' + tgTime(cfg.updatedAt));

    return avatar +
      '<div class="tg-profile__body">' +
        '<p class="tg-profile__name">' + esc(cfg.title || ('@' + cfg.channel)) + '</p>' +
        '<p class="tg-profile__meta">' + meta.join(' · ') + '</p>' +
      '</div>';
  }

  function initTelegram() {
    var cfg = window.HZ_TELEGRAM || {};
    var channel = String(cfg.channel || '').replace(/^@/, '').trim();
    if (!channel) return;

    /* Канал известен: показываем живые ссылки вместо заглушек. */
    $$('[data-tg-link]').forEach(function (el) {
      el.setAttribute('href', 'https://t.me/' + channel);
      el.removeAttribute('hidden');
    });
    $$('[data-tg-fallback]').forEach(function (el) { el.setAttribute('hidden', ''); });

    /* ConvertTo-Json в Windows PowerShell отдаёт один пост объектом, а не массивом. */
    var posts = cfg.posts ? [].concat(cfg.posts) : [];
    if (!posts.length) return;

    /* Карточка канала есть только в блоге (telegram.html) */
    var profile = $('[data-tg-profile]');
    var feeds = $$('[data-tg-feed]');

    /* Сколько постов реально видно: самый строгий лимит из разметки.
       Главная — 3 поста в карусели, блог — 5 последних, снимок хранит до 50. */
    var pageLimit = 0;
    feeds.forEach(function (feed) {
      var l = parseInt(feed.getAttribute('data-tg-limit'), 10);
      if (l > 0 && (!pageLimit || l < pageLimit)) pageLimit = l;
    });
    var visibleCount = pageLimit > 0 ? Math.min(pageLimit, posts.length) : posts.length;

    if (profile) {
      profile.innerHTML = tgProfile(cfg, visibleCount);
      profile.removeAttribute('hidden');
    }

    var countEl = $('[data-tg-count]');
    if (countEl) {
      countEl.innerHTML = visibleCount < posts.length
        ? 'Последние <strong>' + visibleCount + '</strong> из ' + posts.length + ' ' +
          plural(posts.length, ['публикации', 'публикаций', 'публикаций'])
        : 'Всего <strong>' + posts.length + '</strong> ' +
          plural(posts.length, ['публикация', 'публикации', 'публикаций']);
    }

    /* Один компонент на две страницы: главная задаёт data-tg-limit="3" и
       включает карусель, блог — data-tg-limit="5" и обычную сетку.
       Лимит читается из разметки, поэтому HTML остаётся источником правды. */
    feeds.forEach(function (feed) {
      var limit = parseInt(feed.getAttribute('data-tg-limit'), 10);
      var shown = limit > 0 ? posts.slice(0, limit) : posts;
      feed.innerHTML = shown.map(function (post) { return tgCard(post, cfg); }).join('');
    });

    /* Карусель собирается после отрисовки карточек */
    initTgCarousel();

    /* «Все новости» показываем при подключённом канале: полная лента живёт
       на отдельной странице, поэтому кнопка нужна даже при трёх постах,
       когда обрезать на главной пока нечего. */
    var more = $('[data-tg-more]');
    if (more) more.removeAttribute('hidden');
  }

  /* ---------- Карусель постов на главной ---------- */
  /* В окне один пост. Прокрутка нативная (overflow-x + scroll-snap), поэтому
     свайп на телефоне работает без JS; стрелки лежат поверх карточки,
     клавиши ← → Home End листают, когда фокус внутри карусели. */
  function initTgCarousel() {
    $$('[data-tg-carousel]').forEach(function (root) {
      if (root.getAttribute('data-tg-ready')) return;
      var track = $('[data-tg-feed]', root);
      var prev = $('[data-tg-prev]', root);
      var next = $('[data-tg-next]', root);
      var status = $('[data-tg-status]', root);
      if (!track) return;
      root.setAttribute('data-tg-ready', 'true');

      var slides = $$('.tg-post', track);
      var count = slides.length;

      slides.forEach(function (slide, i) {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'слайд');
        slide.setAttribute('aria-label', 'Пост ' + (i + 1) + ' из ' + count);
      });

      /* Демо-карточка или единственный пост: листать нечего, стрелки скрыты */
      if (count < 2) return;

      var index = 0;
      var lockUntil = 0;
      var snapTimer = null;

      function gap() {
        var cs = window.getComputedStyle(track);
        return parseFloat(cs.columnGap || cs.gap) || 0;
      }
      function step() {
        return (slides[0] ? slides[0].getBoundingClientRect().width : track.clientWidth) + gap();
      }
      function current() {
        return Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / step())));
      }
      function sync(i) {
        if (prev) prev.disabled = i <= 0;
        if (next) next.disabled = i >= count - 1;
        if (status) status.textContent = 'Пост ' + (i + 1) + ' из ' + count;
      }
      function smooth() {
        return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      }
      function go(target) {
        index = Math.max(0, Math.min(count - 1, target));
        var left = index * step();
        var startedAt = track.scrollLeft;
        lockUntil = Date.now() + 420;
        if (typeof track.scrollTo === 'function') {
          try { track.scrollTo({ left: left, behavior: smooth() ? 'smooth' : 'auto' }); }
          catch (err) { track.scrollLeft = left; }
        } else {
          track.scrollLeft = left;
        }
        /* Страховка: если плавная прокрутка так и не началась (контейнер вне
           области рендера, старый браузер), ставим позицию напрямую. */
        clearTimeout(snapTimer);
        snapTimer = setTimeout(function () {
          if (Math.abs(track.scrollLeft - startedAt) < 2 && Math.abs(startedAt - left) > 2) {
            track.scrollLeft = left;
          }
        }, 400);
        sync(index);
      }

      if (prev) {
        prev.hidden = false;
        prev.addEventListener('click', function () { go(index - 1); });
      }
      if (next) {
        next.hidden = false;
        next.addEventListener('click', function () { go(index + 1); });
      }

      /* Свайп и колесо двигают scrollLeft сами — подхватываем позицию */
      track.addEventListener('scroll', function () {
        if (Date.now() < lockUntil) return;
        var i = current();
        if (i !== index) { index = i; sync(i); }
      }, { passive: true });

      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { go(index + 1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { go(index - 1); e.preventDefault(); }
        else if (e.key === 'Home') { go(0); e.preventDefault(); }
        else if (e.key === 'End') { go(count - 1); e.preventDefault(); }
      });

      /* Ширина карточки изменилась — пересчитываем позицию без анимации */
      window.addEventListener('resize', function () {
        index = current();
        track.scrollLeft = index * step();
        sync(index);
      });

      sync(0);
    });
  }

  /* ---------- Появление блоков при скролле ---------- */
  var revealObserver = null;
  function revealScan() {
    var nodes = $$('.reveal:not(.is-visible)');
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window) ||
        (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      nodes.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -48px 0px', threshold: 0.06 });
    }
    nodes.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Сброс фильтров (кнопки в пустом состоянии) ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-reset-filters]') : null;
    if (!btn) return;
    if (typeof window.HZ_reset === 'function') {
      window.HZ_reset();
      toast('Фильтры сброшены');
    }
  });

  /* ---------- Запуск ---------- */
  function init() {
    icons();
    initHeader();
    initDrawer();
    initDialogs();
    initForms();
    initHomeSearch();
    initCatalog();
    initRoute();
    initTelegram();
    syncFavs();
    revealScan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
