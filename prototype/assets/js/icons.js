/* Авторский набор линейных иконок: одна толщина штриха, цвет — currentColor. */
(function () {
  'use strict';

  var ICONS = {
    shield: '<path d="M12 3.2 4.8 6v6.1c0 4.1 3 7.4 7.2 8.7 4.2-1.3 7.2-4.6 7.2-8.7V6z"/><path d="m8.9 12.2 2.1 2.1 4.2-4.4"/>',
    talks: '<circle cx="9" cy="8.4" r="3.1"/><path d="M3.4 19.4c0-3 2.5-5 5.6-5s5.6 2 5.6 5"/><path d="M15.8 6.6a3 3 0 0 1 0 5.7"/><path d="M17.2 14.6c2 .5 3.4 2.2 3.4 4.8"/>',
    contract: '<path d="M6 3.6h7.6L18 8v12.4H6z"/><path d="M13.4 3.7V8H18"/><path d="M9 12.8h6M9 16.2h4.2"/>',
    keys: '<circle cx="8.6" cy="9.4" r="3.9"/><path d="m11.5 12.2 7.6 7.6M16 14.5l2.3 2.3M14.2 16.9l1.9 1.9"/>',
    heart: '<path d="M12 20.1S3.8 15.3 3.8 9.6A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.2 2.4c0 5.7-8.2 10.5-8.2 10.5z"/>',
    close: '<path d="m6.2 6.2 11.6 11.6M17.8 6.2 6.2 17.8"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4M12 7.9v.6"/>',
    search: '<circle cx="11" cy="11" r="6.4"/><path d="m15.8 15.8 4 4"/>',
    sliders: '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
    pin: '<path d="M12 21s6.2-5.9 6.2-10.4A6.2 6.2 0 0 0 5.8 10.6C5.8 15.1 12 21 12 21z"/><circle cx="12" cy="10.4" r="2.3"/>',
    check: '<path d="m5.4 12.6 4.2 4.2 9-9.4"/>',
    arrow: '<path d="M4.8 12h14M13.4 6.6 18.8 12l-5.4 5.4"/>',
    home: '<path d="M4 10.6 12 4l8 6.6V20H4z"/><path d="M9.6 20v-5.4h4.8V20"/>',
    chart: '<path d="M4 19V9M10 19V5M16 19v-6M22 19H2"/>',
    tg: '<path d="m20.4 4.6-2.6 14.2c-.2 1-.8 1.2-1.6.8l-4.4-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.6-.2L6.6 13.2l-4.2-1.3c-.9-.3-.9-.9.2-1.3L19 4.1c.8-.3 1.5.2 1.4.5z"/>',
    doc: '<path d="M7 3.6h7.4L18 7.4v13H7z"/><path d="M9.8 11h5.4M9.8 14.4h5.4M9.8 17.4h3"/>',
    map: '<path d="M3.6 6.4 9 4.4l6 2 5.4-2v13.2L15 19.6l-6-2-5.4 2z"/><path d="M9 4.4v13.2M15 6.4v13.2"/>'
  };

  function render() {
    var nodes = document.querySelectorAll('[data-icon]');
    for (var i = 0; i < nodes.length; i++) {
      var name = nodes[i].getAttribute('data-icon');
      if (!ICONS[name]) continue;
      nodes[i].innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
        ICONS[name] + '</svg>';
    }
  }

  window.HZ_ICONS = ICONS;
  window.HZ_renderIcons = render;
})();
