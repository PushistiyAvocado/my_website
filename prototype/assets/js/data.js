/* ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ ПРОТОТИПА.
   В продакшене эти объекты приходят из БД и проходят модерацию.
   Все записи помечены флагом isDemo и в интерфейсе отображаются с бейджем «демо». */
(function () {
  'use strict';

  var CITIES = [
    { value: 'ekb', label: 'Екатеринбург', districts: ['Академический', 'Ботанический', 'ВИЗ', 'Железнодорожный', 'Ленинский', 'Октябрьский', 'Орджоникидзевский', 'Чкаловский'] },
    { value: 'berez', label: 'Берёзовский', districts: ['Центральный', 'Шахтёрский', 'Первостроителей'] },
    { value: 'vpyshma', label: 'Верхняя Пышма', districts: ['Центр', 'Медный', 'Заречный'] }
  ];

  var TYPES = [
    { value: 'apartment', label: 'Квартира' },
    { value: 'house', label: 'Дом, коттедж' },
    { value: 'land', label: 'Земельный участок' },
    { value: 'commercial', label: 'Коммерческая' }
  ];

  var LISTINGS = [
    {
      id: 'L-101',
      slug: '2-komnatnaya-akademicheskiy-62',
      title: '2-комнатная квартира, ЖК «Клевер Парк»',
      type: 'apartment', typeLabel: 'Квартира',
      city: 'ekb', cityLabel: 'Екатеринбург', district: 'Академический',
      rooms: 2, area: 62, plot: null, floor: 5, floors: 16,
      price: 9850000,
      description: 'Светлая квартира с панорамными окнами в тихом дворе. Кухня-гостиная, отдельная спальня, места для хранения.',
      updatedAt: '18.11.2026', status: 'actual',
      image: 'assets/img/listing-living.svg',
      imageAlt: 'Демонстрационное изображение: гостиная с панорамным окном',
      featured: true, isDemo: true
    },
    {
      id: 'L-102',
      slug: '3-komnatnaya-botanicheskiy-84',
      title: '3-комнатная квартира рядом с Ботаническим садом',
      type: 'apartment', typeLabel: 'Квартира',
      city: 'ekb', cityLabel: 'Екатеринбург', district: 'Ботанический',
      rooms: 3, area: 84, plot: null, floor: 7, floors: 12,
      price: 13400000,
      description: 'Квартира для семьи: две детские, большая кухня, окна на две стороны. Документы подготовлены к проверке.',
      updatedAt: '16.11.2026', status: 'actual',
      image: 'assets/img/listing-kitchen.svg',
      imageAlt: 'Демонстрационное изображение: светлая кухня',
      featured: true, isDemo: true
    },
    {
      id: 'L-103',
      slug: '1-komnatnaya-viz-38',
      title: '1-комнатная квартира, ВИЗ',
      type: 'apartment', typeLabel: 'Квартира',
      city: 'ekb', cityLabel: 'Екатеринбург', district: 'ВИЗ',
      rooms: 1, area: 38, plot: null, floor: 3, floors: 9,
      price: 6200000,
      description: 'Компактная квартира с функциональной планировкой. Подойдёт для первого жилья или сдачи в аренду.',
      updatedAt: '14.11.2026', status: 'actual',
      image: 'assets/img/listing-bedroom.svg',
      imageAlt: 'Демонстрационное изображение: спальня',
      featured: true, isDemo: true
    },
    {
      id: 'L-104',
      slug: 'dom-berezovskiy-180',
      title: 'Дом 180 м² с участком 8 соток',
      type: 'house', typeLabel: 'Дом, коттедж',
      city: 'berez', cityLabel: 'Берёзовский', district: 'Центральный',
      rooms: 4, area: 180, plot: 8, floor: null, floors: 2,
      price: 12900000,
      description: 'Двухэтажный дом для круглогодичного проживания. Ухоженный участок, гараж, отдельная котельная.',
      updatedAt: '12.11.2026', status: 'actual',
      image: 'assets/img/listing-house.svg',
      imageAlt: 'Демонстрационное изображение: загородный дом с участком',
      featured: true, isDemo: true
    },
    {
      id: 'L-105',
      slug: 'uchastok-vpyshma-12',
      title: 'Земельный участок 12 соток в Верхней Пышме',
      type: 'land', typeLabel: 'Земельный участок',
      city: 'vpyshma', cityLabel: 'Верхняя Пышма', district: 'Медный',
      rooms: null, area: null, plot: 12, floor: null, floors: null,
      price: 3400000,
      description: 'Ровный участок под индивидуальное жилищное строительство. Свет и газ по границе, подъезд круглый год.',
      updatedAt: '10.11.2026', status: 'actual',
      image: 'assets/img/listing-land.svg',
      imageAlt: 'Демонстрационное изображение: земельный участок',
      featured: true, isDemo: true
    },
    {
      id: 'L-106',
      slug: 'pomeshchenie-ekb-96',
      title: 'Помещение 96 м², свободное назначение',
      type: 'commercial', typeLabel: 'Коммерческая',
      city: 'ekb', cityLabel: 'Екатеринбург', district: 'Ленинский',
      rooms: null, area: 96, plot: null, floor: 1, floors: 9,
      price: 11500000,
      description: 'Первая линия, отдельный вход, витринные окна. Подходит под офис, студию или небольшой магазин.',
      updatedAt: '08.11.2026', status: 'actual',
      image: 'assets/img/listing-office.svg',
      imageAlt: 'Демонстрационное изображение: помещение свободного назначения',
      featured: false, isDemo: true
    },
    {
      id: 'L-107',
      slug: '2-komnatnaya-vpyshma-58',
      title: '2-комнатная квартира, Верхняя Пышма',
      type: 'apartment', typeLabel: 'Квартира',
      city: 'vpyshma', cityLabel: 'Верхняя Пышма', district: 'Центр',
      rooms: 2, area: 58, plot: null, floor: 4, floors: 10,
      price: 7300000,
      description: 'Квартира с раздельными комнатами и лоджией. Дом рядом с остановкой и школой, двор закрытый.',
      updatedAt: '05.11.2026', status: 'actual',
      image: 'assets/img/listing-living.svg',
      imageAlt: 'Демонстрационное изображение: гостиная',
      featured: false, isDemo: true
    },
    {
      id: 'L-108',
      slug: '4-komnatnaya-chkalovskiy-110',
      title: '4-комнатная квартира, Чкаловский район',
      type: 'apartment', typeLabel: 'Квартира',
      city: 'ekb', cityLabel: 'Екатеринбург', district: 'Чкаловский',
      rooms: 4, area: 110, plot: null, floor: 9, floors: 14,
      price: 15800000,
      description: 'Просторная квартира на высоком этаже. Две ванные комнаты, большая кухня-гостиная, вид на город.',
      updatedAt: '02.11.2026', status: 'sold',
      image: 'assets/img/listing-kitchen.svg',
      imageAlt: 'Демонстрационное изображение: кухня-гостиная',
      featured: false, isDemo: true
    },
    {
      id: 'L-109',
      slug: '3-komnatnaya-oktyabrskiy-76',
      title: '3-комнатная квартира, Октябрьский район',
      type: 'apartment', typeLabel: 'Квартира',
      city: 'ekb', cityLabel: 'Екатеринбург', district: 'Октябрьский',
      rooms: 3, area: 76, plot: null, floor: 2, floors: 5,
      price: 11200000,
      description: 'Квартира с ремонтом в доме среди зелени. Документы подготовлены к проверке, обременений не заявлено.',
      updatedAt: '28.10.2026', status: 'actual',
      image: 'assets/img/listing-bedroom.svg',
      imageAlt: 'Демонстрационное изображение: спальня',
      featured: false, isDemo: true
    }
  ];

  /* Временная шкала первого экрана: 4 этапа из раздела «Сопровождение сделки» */
  var ROUTE_STEPS = [
    {
      num: '01', icon: 'shield', title: 'Проверка объекта и документов',
      text: 'Закрываем вопрос «с чем именно мы имеем дело» до внесения аванса.',
      label: 'Шаг 01 · Проверка',
      detailTitle: 'Что входит в этап проверки',
      bullets: [
        'Право собственности и основания его возникновения',
        'История перехода прав и текущие ограничения',
        'Состав собственников, доли, согласия',
        'Технические особенности и перепланировки',
        'Обстоятельства, требующие отдельной юридической оценки'
      ]
    },
    {
      num: '02', icon: 'talks', title: 'Переговоры и согласование условий',
      text: 'Договариваемся о цене, сроках, порядке расчётов и передаче объекта.',
      label: 'Шаг 02 · Переговоры',
      detailTitle: 'Что фиксируем на этом этапе',
      bullets: [
        'Итоговую цену и порядок расчётов',
        'Сроки освобождения и передачи недвижимости',
        'Перечень имущества, остающегося в объекте',
        'Условия задатка и ответственность сторон',
        'Порядок и дату подписания договора'
      ]
    },
    {
      num: '03', icon: 'contract', title: 'Подготовка и оформление сделки',
      text: 'Собираем комплект документов и проверяем формулировки договора.',
      label: 'Шаг 03 · Оформление',
      detailTitle: 'Что делаем при оформлении',
      bullets: [
        'Сверяем данные во всех документах',
        'Согласовываем формулировки договора',
        'Организуем безопасный порядок расчётов',
        'Готовим пакет для регистрации',
        'При необходимости рекомендуем профильного юриста'
      ]
    },
    {
      num: '04', icon: 'keys', title: 'Регистрация и передача ключей',
      text: 'Доводим сделку до результата и сопровождаем приём-передачу объекта.',
      label: 'Шаг 04 · Передача',
      detailTitle: 'Завершение сделки',
      bullets: [
        'Подача документов на регистрацию и контроль статуса',
        'Проверка выписок после регистрации',
        'Организация приёма-передачи объекта',
        'Фиксация показаний счётчиков и отсутствия долгов',
        'Передача ключей и итоговая консультация'
      ]
    }
  ];

  window.HZ_DATA = {
    cities: CITIES,
    types: TYPES,
    listings: LISTINGS,
    routeSteps: ROUTE_STEPS
  };
})();
