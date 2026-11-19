import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import { createRoot } from 'react-dom/client';

import {
    Plus,
    Trash2,
    CalendarDays,
    List,
    ChevronLeft,
    ChevronRight,
    Globe2,
    Bell,
    SunMoon,
    Download,
    Upload,
    Mail,
    ArrowLeft
} from 'lucide-react';

import './style.css';


/* ==========================================================
   TYPES
   ========================================================== */

/* ==========================================================================
   00. ОБЩИЕ ТИПЫ ДАННЫХ: периоды, платежи, настройки, история
   ========================================================================== */

type Period = 'weekly' | 'monthly' | 'yearly' | 'custom';
type CustomUnit = 'days' | 'weeks' | 'months' | 'years';
type Lang = 'ru' | 'en' | 'kk' | 'tr' | 'zh';

type Payment = {
    id: string;
    name: string;
    amount: number;
    currency: string;
    startDate: string;
    period: Period;
    customInterval?: number;
    customUnit?: CustomUnit;
    createdAt: string;
};

type Settings = {
    lang: Lang;
    dark: boolean;
    notifications: boolean;
};

type Entry = {
    key: string;
    paymentId: string;
    name: string;
    amount: number;
    currency: string;
    date: string;
};


/* ==========================================================
   STORAGE
   ========================================================== */

/* ==========================================================================
   01. ХРАНИЛИЩЕ: ключ localStorage
   ========================================================================== */

const K = 'paycheck-v01';


/* ==========================================================
   TRANSLATIONS
   ========================================================== */

/* ==========================================================================
   02. ЛОКАЛИЗАЦИЯ: тексты интерфейса на пяти языках
   ========================================================================== */

const dict: any = {
    ru: {
        home: 'Главная',
        history: 'История',
        settings: 'Настройки',
        empty: 'У вас пока нет активных платежей!',
        empty2: 'Нажмите +, чтобы добавить.',
        add: 'Добавить платеж',
        edit: 'Редактировать платеж',
        service: 'Название сервиса',
        amount: 'Сумма',
        date: 'Дата платежа',
        period: 'Период',
        confirm: 'Подтвердить',
        weekly: 'Еженедельно',
        monthly: 'Ежемесячно',
        yearly: 'Ежегодно',
        custom: 'Индивидуально',
        days: 'Дни',
        weeks: 'Недели',
        months: 'Месяцы',
        years: 'Годы',
        customHeading: 'Настроить период',
        saveCustom: 'Сохранить',
        language: 'Язык',
        notifications: 'Уведомления',
        theme: 'Тема',
        light: 'Светлая',
        dark: 'Тёмная',
        enabled: 'Включены',
        disabled: 'Выключены',
        export: 'Экспортировать платежи',
        import: 'Импортировать платежи',
        support: 'Служба поддержки',
        contact: 'Почта для связи',
        yes: 'Да',
        no: 'Нет',
        sure: 'Подтвердить действие?',
        total: 'Общий расход',
        nohistory: 'История пока пуста',
        calendar: 'Календарь',
        list: 'Список'
    },

    en: {
        home: 'Home',
        history: 'History',
        settings: 'Settings',
        empty: 'No active payments yet!',
        empty2: 'Press + to add one.',
        add: 'Add payment',
        edit: 'Edit payment',
        service: 'Service name',
        amount: 'Amount',
        date: 'Payment date',
        period: 'Period',
        confirm: 'Confirm',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
        custom: 'Custom',
        days: 'Days',
        weeks: 'Weeks',
        months: 'Months',
        years: 'Years',
        customHeading: 'Custom interval',
        saveCustom: 'Save',
        language: 'Language',
        notifications: 'Notifications',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        enabled: 'Enabled',
        disabled: 'Disabled',
        export: 'Export payments',
        import: 'Import payments',
        support: 'Support',
        contact: 'Contact email',
        yes: 'Yes',
        no: 'No',
        sure: 'Confirm action?',
        total: 'Total spent',
        nohistory: 'History is empty',
        calendar: 'Calendar',
        list: 'List'
    },

    kk: {
        home: 'Басты бет',
        history: 'Тарих',
        settings: 'Баптаулар',
        empty: 'Әзірге белсенді төлемдер жоқ!',
        empty2: 'Қосу үшін + басыңыз.',
        add: 'Төлем қосу',
        edit: 'Төлемді өзгерту',
        service: 'Қызмет атауы',
        amount: 'Сома',
        date: 'Төлем күні',
        period: 'Кезең',
        confirm: 'Растау',
        weekly: 'Апта сайын',
        monthly: 'Ай сайын',
        yearly: 'Жыл сайын',
        custom: 'Жеке',
        days: 'Күн',
        weeks: 'Апта',
        months: 'Ай',
        years: 'Жыл',
        customHeading: 'Аралықты баптау',
        saveCustom: 'Сақтау',
        language: 'Тіл',
        notifications: 'Хабарландырулар',
        theme: 'Тақырып',
        light: 'Ашық',
        dark: 'Қараңғы',
        enabled: 'Қосулы',
        disabled: 'Өшірулі',
        export: 'Төлемдерді экспорттау',
        import: 'Төлемдерді импорттау',
        support: 'Қолдау қызметі',
        contact: 'Байланыс поштасы',
        yes: 'Иә',
        no: 'Жоқ',
        sure: 'Әрекетті растау керек пе?',
        total: 'Жалпы шығын',
        nohistory: 'Тарих әзірге бос',
        calendar: 'Күнтізбе',
        list: 'Тізім'
    },

    tr: {
        home: 'Ana Sayfa',
        history: 'Geçmiş',
        settings: 'Ayarlar',
        empty: 'Henüz aktif ödeme yok!',
        empty2: 'Eklemek için + düğmesine basın.',
        add: 'Ödeme ekle',
        edit: 'Ödemeyi düzenle',
        service: 'Hizmet adı',
        amount: 'Tutar',
        date: 'Ödeme tarihi',
        period: 'Dönem',
        confirm: 'Onayla',
        weekly: 'Haftalık',
        monthly: 'Aylık',
        yearly: 'Yıllık',
        custom: 'Özel',
        days: 'Gün',
        weeks: 'Hafta',
        months: 'Ay',
        years: 'Yıl',
        customHeading: 'Aralığı ayarla',
        saveCustom: 'Kaydet',
        language: 'Dil',
        notifications: 'Bildirimler',
        theme: 'Tema',
        light: 'Açık',
        dark: 'Koyu',
        enabled: 'Açık',
        disabled: 'Kapalı',
        export: 'Ödemeleri dışa aktar',
        import: 'Ödemeleri içe aktar',
        support: 'Destek',
        contact: 'İletişim e-postası',
        yes: 'Evet',
        no: 'Hayır',
        sure: 'İşlemi onaylıyor musunuz?',
        total: 'Toplam harcama',
        nohistory: 'Geçmiş henüz boş',
        calendar: 'Takvim',
        list: 'Liste'
    },

    zh: {
        home: '主页',
        history: '历史',
        settings: '设置',
        empty: '暂无活跃付款！',
        empty2: '点击 + 添加付款。',
        add: '添加付款',
        edit: '编辑付款',
        service: '服务名称',
        amount: '金额',
        date: '付款日期',
        period: '周期',
        confirm: '确认',
        weekly: '每周',
        monthly: '每月',
        yearly: '每年',
        custom: '自定义',
        days: '天',
        weeks: '周',
        months: '月',
        years: '年',
        customHeading: '设置周期',
        saveCustom: '保存',
        language: '语言',
        notifications: '通知',
        theme: '主题',
        light: '浅色',
        dark: '深色',
        enabled: '已开启',
        disabled: '已关闭',
        export: '导出付款',
        import: '导入付款',
        support: '支持',
        contact: '联系邮箱',
        yes: '是',
        no: '否',
        sure: '确认此操作？',
        total: '总支出',
        nohistory: '暂无历史记录',
        calendar: '日历',
        list: '列表'
    }
};


/* ==========================================================
   LANGUAGES
   ========================================================== */

/* ==========================================================================
   03. НАСТРОЙКИ ЯЗЫКА: список языков и локали
   ========================================================================== */

const langs: {
    id: Lang;
    name: string;
    sub: string;
    flag: string;
}[] = [
    {
        id: 'kk',
        name: 'Қазақша',
        sub: 'Қазақ тілі',
        flag: './flags/kz.svg'
    },
    {
        id: 'ru',
        name: 'Русский',
        sub: 'Русский язык',
        flag: './flags/ru.svg'
    },
    {
        id: 'en',
        name: 'English',
        sub: 'English',
        flag: './flags/gb.svg'
    },
    {
        id: 'tr',
        name: 'Türkçe',
        sub: 'Türkçe',
        flag: './flags/tr.svg'
    },
    {
        id: 'zh',
        name: '中文',
        sub: '简体中文',
        flag: './flags/cn.svg'
    }
];

const localeByLang: Record<Lang, string> = {
    ru: 'ru-RU',
    en: 'en-GB',
    kk: 'kk-KZ',
    tr: 'tr-TR',
    zh: 'zh-CN'
};


/* ==========================================================
   SERVICE AVATARS
   ========================================================== */

/* ==========================================================================
   04. ОБЩИЕ КОМПОНЕНТЫ: аватары сервисов
   ========================================================================== */

const avatarPalette = [
    '#E5484D',
    '#E16F24',
    '#D99A00',
    '#30A46C',
    '#12A594',
    '#0091FF',
    '#5B5BD6',
    '#8E4EC6',
    '#D6409F',
    '#6E56CF',
    '#3E63DD',
    '#0D9B8A'
];

/* Цвет аватара определяется названием сервиса. */
function avatarColor(name: string) {
    let h = 0;

    for (const ch of name.trim().toLocaleLowerCase()) {
        h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
    }

    return avatarPalette[Math.abs(h) % avatarPalette.length];
}

/* Круглый аватар с первой буквой названия. */
function ServiceAvatar({
    name,
    small = false
}: {
    name: string;
    small?: boolean;
}) {
    /* --- ОБЩИЙ КАРКАС: тема, навигация, страницы, модальные окна --- */

    return (
        <div
            className={'avatar' + (small ? ' sm' : '')}
            style={{ background: avatarColor(name) }}
        >
            {name.trim()[0]?.toLocaleUpperCase() || '₸'}
        </div>
    );
}


/* ==========================================================
   DATE / PAYMENT HELPERS
   ========================================================== */

/* ==========================================================================
   05. РАСЧЁТЫ: даты повторных платежей и форматирование
   ========================================================================== */

function addPeriod(d: Date, p: Period, interval = 1, unit: CustomUnit = 'days') {
    // Индивидуальный интервал использует ту же логику календарных месяцев.
    if (p === 'custom') {
        if (unit === 'days') return addCalendarInterval(d, interval, 'days');
        if (unit === 'weeks') return addCalendarInterval(d, interval * 7, 'days');
        return addCalendarInterval(d, interval, unit);
    }
    const n = new Date(d);

    if (p === 'weekly') {
        n.setDate(n.getDate() + 7);
    }

    if (p === 'monthly') {
        const day = n.getDate();

        n.setDate(1);
        n.setMonth(n.getMonth() + 1);
        n.setDate(
            Math.min(
                day,
                new Date(
                    n.getFullYear(),
                    n.getMonth() + 1,
                    0
                ).getDate()
            )
        );
    }

    if (p === 'yearly') {
        n.setFullYear(n.getFullYear() + 1);
    }

    return n;
}

/* Сдвиг календарной даты с ограничением последнего дня месяца. */
function addCalendarInterval(d: Date, count: number, unit: 'days' | 'months' | 'years') {
    const n = new Date(d);
    if (unit === 'days') {
        n.setDate(n.getDate() + count);
    } else {
        const day = n.getDate();
        n.setDate(1);
        if (unit === 'months') n.setMonth(n.getMonth() + count);
        else n.setFullYear(n.getFullYear() + count);
        const last = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
        n.setDate(Math.min(day, last));
    }
    return n;
}

/* Преобразование даты в YYYY-MM-DD. */
const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')}`;

/* Формирование истории всех наступивших повторных платежей. */
function entries(payments: Payment[]) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const out: Entry[] = [];

    for (const p of payments) {
        let d = new Date(p.startDate + 'T12:00:00');
        let guard = 0;

        while (d <= today && guard++ < 1500) {
            const date = iso(d);

            out.push({
                key: p.id + date,
                paymentId: p.id,
                name: p.name,
                amount: p.amount,
                currency: p.currency,
                date
            });

            d = addPeriod(d, p.period, p.customInterval, p.customUnit);
        }
    }

    return out.sort(
        (a, b) => b.date.localeCompare(a.date)
    );
}

/* Форматирование суммы с учётом языка и валюты. */
function money(
    n: number,
    c: string,
    lang: Lang = 'ru'
) {
    return (
        new Intl.NumberFormat(localeByLang[lang], {
            maximumFractionDigits: 2
        }).format(n) +
        ' ' +
        c
    );
}


/* ==========================================================
   MAIN APP
   ========================================================== */

/* ==========================================================================
   06. APP: СОСТОЯНИЕ, ОБРАБОТЧИКИ И ТРИ СТРАНИЦЫ
   ========================================================================== */

function App() {
    /* --- Загрузка сохранённых данных --- */

    const saved = (() => {
        try {
            return JSON.parse(
                localStorage.getItem(K) || 'null'
            );
        } catch {
            return null;
        }
    })();

    /* --- Состояние: платежи, настройки, вкладка, модальные окна --- */

    const [payments, setPayments] = useState<Payment[]>(
        saved?.payments || []
    );

    const [settings, setSettings] = useState<Settings>(
        saved?.settings || {
            lang: 'ru',
            dark: false,
            notifications: true
        }
    );

    const [tab, setTab] = useState<
        'home' | 'history' | 'settings'
    >('home');

    const [modal, setModal] = useState<
        'form' |
        'delete' |
        'languages' |
        'support' |
        'day' |
        null
    >(null);

    const [editing, setEditing] =
        useState<Payment | null>(null);

    const [deleteId, setDeleteId] =
        useState<string | null>(null);

    const [selectedDate, setSelectedDate] =
        useState('');

    const [historyMode, setHistoryMode] =
        useState<'list' | 'calendar'>('list');

    const [month, setMonth] =
        useState(() => new Date());

    const fileRef =
        useRef<HTMLInputElement>(null);

    /* --- Активные переводы и вычисленная история --- */

    const t = {
        ...dict.ru,
        ...(dict[settings.lang] || {})
    };

    const hist = useMemo(
        () => entries(payments),
        [payments]
    );


    /* =========================
       SAVE STATE
       ========================= */

    useEffect(() => {
        localStorage.setItem(
            K,
            JSON.stringify({
                payments,
                settings
            })
        );
    }, [payments, settings]);


    /* =========================
       LIVE THEME + LANGUAGE
       ========================= */

    useEffect(() => {
        document.documentElement.dataset.theme =
            settings.dark ? 'dark' : 'light';

        document.documentElement.lang =
            settings.lang;
    }, [settings.dark, settings.lang]);


    /* =========================
       PAYMENT ACTIONS
       ========================= */

    /* --- ГЛАВНАЯ: открытие формы и сохранение платежа --- */

    const openForm = (p?: Payment) => {
        setEditing(p || null);
        setModal('form');
    };

    const save = (p: Payment) => {
        setPayments(x =>
            editing
                ? x.map(q =>
                    q.id === p.id ? p : q
                )
                : [...x, p]
        );

        setModal(null);
    };


    /* =========================
       EXPORT
       ========================= */

    /* --- НАСТРОЙКИ: экспорт резервной копии JSON --- */

    const exportData = () => {
        const b = new Blob(
            [
                JSON.stringify(
                    {
                        version: 1,
                        exportedAt:
                            new Date().toISOString(),
                        payments,
                        settings
                    },
                    null,
                    2
                )
            ],
            {
                type: 'application/json'
            }
        );

        const a =
            document.createElement('a');

        a.href =
            URL.createObjectURL(b);

        a.download =
            'PayCheck_backup.json';

        a.click();

        URL.revokeObjectURL(a.href);
    };


    /* =========================
       IMPORT
       ========================= */

    /* --- НАСТРОЙКИ: импорт резервной копии JSON --- */

    const importData = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const f = e.target.files?.[0];

        if (!f) {
            return;
        }

        try {
            const d =
                JSON.parse(await f.text());

            if (!Array.isArray(d.payments)) {
                throw 0;
            }

            setPayments(d.payments);

            if (d.settings) {
                setSettings(d.settings);
            }

            alert('PayCheck: импорт завершён');
        } catch {
            alert(
                'Не удалось прочитать резервную копию'
            );
        }

        e.target.value = '';
    };


    /* =========================
       RENDER
       ========================= */

    return (
        <div
            className={
                'app ' +
                (
                    settings.dark
                        ? 'theme-dark'
                        : 'theme-light'
                )
            }
        >
            {/* --- Навигация: Главная / История / Настройки --- */}

            <header>
                <nav>
                    {(
                        [
                            'home',
                            'history',
                            'settings'
                        ] as const
                    ).map(k => (
                        <button
                            className={
                                tab === k
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => setTab(k)}
                            key={k}
                        >
                            {t[k]}
                        </button>
                    ))}
                </nav>
            </header>

            <main>

{/* ===== 07. СТРАНИЦА «ГЛАВНАЯ»: список платежей и добавление ===== */}

                {/* HOME */}

                {tab === 'home' && (
                    <section className="home">
                        {/* --- Пустое состояние или список активных платежей --- */}

                        {payments.length === 0 ? (
                            <div className="empty">
                                <div className="emptyIcon">
                                    ₸
                                </div>

                                <b>{t.empty}</b>

                                <span>
                                    {t.empty2}
                                </span>
                            </div>
                        ) : (
                            <div className="cards">
                                {/* --- Карточки платежей: название, сумма, дата, период --- */}

                                {payments.map(p => (
                                    <div
                                        className="payment"
                                        key={p.id}
                                        onClick={() =>
                                            openForm(p)
                                        }
                                    >
                                        <ServiceAvatar
                                            name={p.name}
                                        />

                                        <div className="ptext">
                                            <b>
                                                {p.name}
                                            </b>

                                            <span>
                                                {money(
                                                    p.amount,
                                                    p.currency,
                                                    settings.lang
                                                )}
                                            </span>

                                            <small>
                                                {new Date(
                                                    p.startDate +
                                                    'T12:00'
                                                ).toLocaleDateString(
                                                    localeByLang[
                                                        settings.lang
                                                    ]
                                                )}

                                                {' · '}

                                                {p.period === 'custom'
                                                        ? `${p.customInterval || 1} ${t[p.customUnit || 'days']}`
                                                        : t[p.period]}
                                            </small>
                                        </div>

                                        {/* --- Удаление платежа с подтверждением --- */}

                                        <button
                                            className="trash"
                                            onClick={e => {
                                                e.stopPropagation();

                                                setDeleteId(
                                                    p.id
                                                );

                                                setModal(
                                                    'delete'
                                                );
                                            }}
                                        >
                                            <Trash2 />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- Плавающая кнопка добавления платежа --- */}

                        <button
                            className="fab"
                            onClick={() =>
                                openForm()
                            }
                        >
                            <Plus />
                        </button>
                    </section>
                )}


{/* ===== 08. СТРАНИЦА «ИСТОРИЯ»: список и календарь ===== */}

                {/* HISTORY */}

                {tab === 'history' && (
                    <section className="history">
                        {/* --- Переключатель режимов: список / календарь --- */}

                        <div className="mode">
                            <button
                                className={
                                    historyMode ===
                                    'list'
                                        ? 'sel'
                                        : ''
                                }
                                onClick={() =>
                                    setHistoryMode(
                                        'list'
                                    )
                                }
                            >
                                <List />
                                {t.list}
                            </button>

                            <button
                                className={
                                    historyMode ===
                                    'calendar'
                                        ? 'sel'
                                        : ''
                                }
                                onClick={() =>
                                    setHistoryMode(
                                        'calendar'
                                    )
                                }
                            >
                                <CalendarDays />
                                {t.calendar}
                            </button>
                        </div>

                        {/* --- Отображение истории и открытие деталей выбранного дня --- */}

                        {historyMode === 'list' ? (
                            <HistoryList
                                hist={hist}
                                t={t}
                                lang={settings.lang}
                                openDay={d => {
                                    setSelectedDate(d);
                                    setModal('day');
                                }}
                            />
                        ) : (
                            <Calendar
                                hist={hist}
                                lang={settings.lang}
                                month={month}
                                setMonth={setMonth}
                                openDay={d => {
                                    setSelectedDate(d);
                                    setModal('day');
                                }}
                            />
                        )}
                    </section>
                )}


{/* ===== 09. СТРАНИЦА «НАСТРОЙКИ»: параметры и данные ===== */}

                {/* SETTINGS */}

                {tab === 'settings' && (
                    <section className="settings">

                        {/* --- Выбор языка --- */}

                        <Setting
                            icon={<Globe2 />}
                            title={t.language}
                            sub={
                                langs.find(
                                    x =>
                                        x.id ===
                                        settings.lang
                                )?.name ||
                                'Русский'
                            }
                            onClick={() =>
                                setModal(
                                    'languages'
                                )
                            }
                        />

                        {/* --- Уведомления --- */}

                        <Setting
                            icon={<Bell />}
                            title={t.notifications}
                            sub={
                                settings.notifications
                                    ? t.enabled
                                    : t.disabled
                            }
                            onClick={() =>
                                setSettings(s => ({
                                    ...s,
                                    notifications:
                                        !s.notifications
                                }))
                            }
                            toggle={
                                settings.notifications
                            }
                        />

                        {/* --- Светлая и тёмная темы --- */}

                        <Setting
                            icon={<SunMoon />}
                            title={t.theme}
                            sub={
                                settings.dark
                                    ? t.dark
                                    : t.light
                            }
                            onClick={() =>
                                setSettings(s => ({
                                    ...s,
                                    dark: !s.dark
                                }))
                            }
                        />

                        {/* --- Экспорт данных --- */}

                        <Setting
                            icon={<Download />}
                            title={t.export}
                            onClick={exportData}
                        />

                        {/* --- Импорт данных --- */}

                        <Setting
                            icon={<Upload />}
                            title={t.import}
                            onClick={() =>
                                fileRef.current?.click()
                            }
                        />

                        {/* --- Контакты поддержки --- */}

                        <Setting
                            icon={<Mail />}
                            title={t.support}
                            onClick={() =>
                                setModal('support')
                            }
                        />

                        {/* --- Скрытый выбор файла для импорта --- */}

                        <input
                            hidden
                            ref={fileRef}
                            type="file"
                            accept="application/json"
                            onChange={importData}
                        />
                    </section>
                )}
            </main>


            {/* =========================
                MODALS
                ========================= */}

{/* ===== 10. ОБЩИЕ МОДАЛЬНЫЕ ОКНА ===== */}

            {modal && (
                <div
                    className="shade"
                    onMouseDown={e => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setModal(null);
                        }
                    }}
                >
                    <div className="sheet">

                        {/* --- Форма создания и редактирования --- */}

                        {modal === 'form' && (
                            <PaymentForm
                                initial={editing}
                                t={t}
                                onSave={save}
                                onClose={() =>
                                    setModal(null)
                                }
                            />
                        )}

                        {/* --- Подтверждение удаления --- */}

                        {modal === 'delete' && (
                            <>
                                <h2>
                                    {t.sure}
                                </h2>

                                <button
                                    className="yes"
                                    onClick={() => {
                                        setPayments(x =>
                                            x.filter(
                                                p =>
                                                    p.id !==
                                                    deleteId
                                            )
                                        );

                                        setModal(null);
                                    }}
                                >
                                    {t.yes}
                                </button>

                                <button
                                    className="no"
                                    onClick={() =>
                                        setModal(null)
                                    }
                                >
                                    {t.no}
                                </button>
                            </>
                        )}

                        {/* --- Выбор языка --- */}

                        {modal ===
                            'languages' && (
                            <>
                                <div className="sheetTitle">
                                    <button
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        <ArrowLeft />
                                    </button>

                                    <h2>
                                        {t.language}
                                    </h2>
                                </div>

                                {langs.map(l => (
                                    <button
                                        className="lang"
                                        key={l.id}
                                        onClick={() => {
                                            setSettings(
                                                s => ({
                                                    ...s,
                                                    lang:
                                                        l.id
                                                })
                                            );

                                            setModal(
                                                null
                                            );
                                        }}
                                    >
                                        <img
                                            className="flag"
                                            src={l.flag}
                                            alt=""
                                        />

                                        <span>
                                            <b>
                                                {l.name}
                                            </b>

                                            <small>
                                                {l.sub}
                                            </small>
                                        </span>
                                    </button>
                                ))}
                            </>
                        )}

                        {/* --- Контакты поддержки --- */}

                        {modal === 'support' && (
                            <>
                                <h2>
                                    {t.contact}
                                </h2>

                                <a
                                    className="email"
                                    href="mailto:40503@iitu.edu.kz"
                                >
                                    40503@iitu.edu.kz
                                </a>
                            </>
                        )}

                        {/* --- Детали платежей за день --- */}

                        {modal === 'day' && (
                            <Day
                                date={selectedDate}
                                hist={hist}
                                t={t}
                                lang={
                                    settings.lang
                                }
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


/* ==========================================================
   SETTING COMPONENT
   ========================================================== */

/* ==========================================================================
   11. КОМПОНЕНТ НАСТРОЙКИ: строка параметра
   ========================================================================== */

function Setting({
    icon,
    title,
    sub,
    onClick,
    toggle
}: {
    icon: any;
    title: string;
    sub?: string;
    onClick: () => void;
    toggle?: boolean;
}) {
    return (
        <button
            className="setting"
            onClick={onClick}
        >
            <span className="seticon">
                {icon}
            </span>

            <span className="settext">
                <b>{title}</b>

                {sub && (
                    <small>{sub}</small>
                )}
            </span>

            {toggle !== undefined ? (
                <span
                    className={
                        'switch ' +
                        (toggle ? 'on' : '')
                    }
                >
                    <i />
                </span>
            ) : (
                <ChevronRight />
            )}
        </button>
    );
}


/* ==========================================================
   PAYMENT FORM
   ========================================================== */

/* ==========================================================================
   12. ФОРМА ПЛАТЕЖА: создание и редактирование
   ========================================================================== */

function PaymentForm({
    initial,
    t,
    onSave,
    onClose
}: {
    initial: Payment | null;
    t: any;
    onSave: (p: Payment) => void;
    onClose: () => void;
}) {
    /* --- Поля формы и начальные значения --- */

    const [f, setF] = useState({
        name: initial?.name || '',
        amount: String(
            initial?.amount || ''
        ),
        currency:
            initial?.currency || '₸',
        startDate:
            initial?.startDate ||
            iso(new Date()),
        period:
            initial?.period ||
            ('monthly' as Period)
    });

    /* --- Индивидуальный период: состояние и небольшое модальное окно --- */
    const [customOpen, setCustomOpen] = useState(false);
    const [customValue, setCustomValue] = useState(String(initial?.customInterval || 1));
    const [customUnit, setCustomUnit] = useState<CustomUnit>(initial?.customUnit || 'days');

    return (
        <>
            <div className="grab" />

            <h2>
                {initial
                    ? t.edit
                    : t.add}
            </h2>

            {/* --- Проверка полей и отправка формы --- */}

            <form
                onSubmit={e => {
                    e.preventDefault();

                    if (
                        !f.name ||
                        !f.amount
                    ) {
                        return;
                    }

                    onSave({
                        id:
                            initial?.id ||
                            crypto.randomUUID(),

                        createdAt:
                            initial?.createdAt ||
                            new Date().toISOString(),

                        name: f.name,
                        amount: Number(f.amount),
                        currency: f.currency,
                        startDate: f.startDate,
                        period: f.period,
                        ...(f.period === 'custom' ? {
                            customInterval: Math.max(1, Math.floor(Number(customValue) || 1)),
                            customUnit
                        } : {})
                    });
                }}
            >
                <input
                    placeholder={t.service}
                    value={f.name}
                    onChange={e =>
                        setF({
                            ...f,
                            name:
                                e.target.value
                        })
                    }
                />

                <div className="amountrow">
                    <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder={t.amount}
                        value={f.amount}
                        onChange={e =>
                            setF({
                                ...f,
                                amount:
                                    e.target.value
                            })
                        }
                    />

                    <select
                        value={f.currency}
                        onChange={e =>
                            setF({
                                ...f,
                                currency:
                                    e.target.value
                            })
                        }
                    >
                        <option>₸</option>
                        <option>₽</option>
                        <option>$</option>
                        <option>€</option>
                    </select>
                </div>

                <input
                    type="date"
                    value={f.startDate}
                    onChange={e =>
                        setF({
                            ...f,
                            startDate:
                                e.target.value
                        })
                    }
                />

                <select
                    value={f.period}
                    onChange={e => {
                        const period = e.target.value as Period;
                        setF({ ...f, period });
                        if (period === 'custom') setCustomOpen(true);
                    }}
                >
                    <option value="weekly">
                        {t.weekly}
                    </option>

                    <option value="monthly">
                        {t.monthly}
                    </option>

                    <option value="yearly">
                        {t.yearly}
                    </option>
                    <option value="custom">{t.custom}</option>
                </select>
                {f.period === 'custom' && (
                    <button type="button" className="custom-period-trigger"
                        onClick={() => setCustomOpen(true)}>
                        {t.custom}: {customValue} {t[customUnit]}
                    </button>
                )}

                <button className="confirm">
                    {t.confirm}
                </button>

                <button
                    type="button"
                    className="cancel"
                    onClick={onClose}
                >
                    ×
                </button>
            </form>

            {/* --- Модальное окно настройки индивидуального интервала --- */}
            {customOpen && (
                <div className="custom-period-overlay" onMouseDown={e => {
                    if (e.target === e.currentTarget) setCustomOpen(false);
                }}>
                    <div className="custom-period-dialog" role="dialog" aria-modal="true"
                        aria-label={t.customHeading}>
                        <h3>{t.customHeading}</h3>
                        <div className="custom-period-row">
                            <input type="number" min="1" step="1" value={customValue}
                                onChange={e => setCustomValue(e.target.value)} />
                            <select value={customUnit}
                                onChange={e => setCustomUnit(e.target.value as CustomUnit)}>
                                {(['days', 'weeks', 'months', 'years'] as const).map(unit =>
                                    <option key={unit} value={unit}>{t[unit]}</option>
                                )}
                            </select>
                        </div>
                        <button type="button" className="custom-period-save"
                            onClick={() => {
                                setCustomValue(String(Math.max(1, Math.floor(Number(customValue) || 1))));
                                setCustomOpen(false);
                            }}>{t.saveCustom}</button>
                    </div>
                </div>
            )}
        </>
    );
}


/* ==========================================================
   HISTORY LIST
   ========================================================== */

/* ==========================================================================
   13. ИСТОРИЯ: группировка и список операций
   ========================================================================== */

function HistoryList({
    hist,
    t,
    lang,
    openDay
}: {
    hist: Entry[];
    t: any;
    lang: Lang;
    openDay: (d: string) => void;
}) {
    /* --- Группировка платежей по дате --- */

    const groups =
        hist.reduce<Record<string, Entry[]>>(
            (a, x) => {
                (a[x.date] ??= []).push(x);
                return a;
            },
            {}
        );

    if (!hist.length) {
        return (
            <div className="empty small">
                <b>{t.nohistory}</b>
            </div>
        );
    }

    return (
        <div className="historylist">
            {Object.entries(groups).map(
                ([d, items]) => (
                    <div key={d}>
                        <button
                            className="datepill"
                            onClick={() =>
                                openDay(d)
                            }
                        >
                            {new Date(
                                d + 'T12:00'
                            ).toLocaleDateString(
                                localeByLang[
                                    lang
                                ],
                                {
                                    day: 'numeric',
                                    month: 'long'
                                }
                            )}
                        </button>

                        {items!.map(x => (
                            <div
                                className="transaction"
                                key={x.key}
                            >
                                <ServiceAvatar
                                    name={x.name}
                                    small
                                />

                                <b>
                                    {x.name}
                                </b>

                                <span>
                                    {money(
                                        x.amount,
                                        x.currency,
                                        lang
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}


/* ==========================================================
   CALENDAR
   ========================================================== */

/* ==========================================================================
   14. ИСТОРИЯ: календарь операций
   ========================================================================== */

function Calendar({
    hist,
    lang,
    month,
    setMonth,
    openDay
}: {
    hist: Entry[];
    lang: Lang;
    month: Date;
    setMonth: (d: Date) => void;
    openDay: (d: string) => void;
}) {
    /* --- Расчёт дней, отступов и отмеченных дат месяца --- */

    const y = month.getFullYear();
    const m = month.getMonth();

    const first =
        (
            new Date(
                y,
                m,
                1
            ).getDay() + 6
        ) % 7;

    const days =
        new Date(
            y,
            m + 1,
            0
        ).getDate();

    const has =
        new Set(
            hist.map(x => x.date)
        );

    const cells = [
        ...Array(first).fill(null),

        ...Array.from(
            { length: days },
            (_, i) => i + 1
        )
    ];

    /* --- Подписи дней недели для каждого языка --- */

    const weekdays: {
        [k: string]: string[];
    } = {
        ru: [
            'Пн',
            'Вт',
            'Ср',
            'Чт',
            'Пт',
            'Сб',
            'Вс'
        ],

        en: [
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sun'
        ],

        kk: [
            'Дс',
            'Сс',
            'Ср',
            'Бс',
            'Жм',
            'Сб',
            'Жс'
        ],

        tr: [
            'Pzt',
            'Sal',
            'Çar',
            'Per',
            'Cum',
            'Cmt',
            'Paz'
        ],

        zh: [
            '一',
            '二',
            '三',
            '四',
            '五',
            '六',
            '日'
        ]
    };

    return (
        <div className="cal">

            {/* --- Переключение месяцев --- */}

            <div className="calhead">
                <button
                    onClick={() =>
                        setMonth(
                            new Date(
                                y,
                                m - 1,
                                1
                            )
                        )
                    }
                >
                    <ChevronLeft />
                </button>

                <b>
                    {month.toLocaleDateString(
                        localeByLang[lang],
                        {
                            month: 'long',
                            year: 'numeric'
                        }
                    )}
                </b>

                <button
                    onClick={() =>
                        setMonth(
                            new Date(
                                y,
                                m + 1,
                                1
                            )
                        )
                    }
                >
                    <ChevronRight />
                </button>
            </div>


            {/* --- Заголовки дней недели --- */}

            <div className="week">
                {weekdays[lang].map(x => (
                    <span key={x}>
                        {x}
                    </span>
                ))}
            </div>


            {/* --- Сетка дней и выбор даты с платежами --- */}

            <div className="grid">
                {cells.map((d, i) => {
                    if (!d) {
                        return (
                            <span key={i} />
                        );
                    }

                    const date =
                        `${y}-${String(
                            m + 1
                        ).padStart(
                            2,
                            '0'
                        )}-${String(
                            d
                        ).padStart(
                            2,
                            '0'
                        )}`;

                    return (
                        <button
                            key={i}
                            className={
                                has.has(date)
                                    ? 'paid'
                                    : ''
                            }
                            onClick={() => {
                                if (
                                    has.has(date)
                                ) {
                                    openDay(
                                        date
                                    );
                                }
                            }}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


/* ==========================================================
   DAY DETAILS
   ========================================================== */

/* ==========================================================================
   15. ИСТОРИЯ: детали дня и итоги по валютам
   ========================================================================== */

function Day({
    date,
    hist,
    t,
    lang
}: {
    date: string;
    hist: Entry[];
    t: any;
    lang: Lang;
}) {
    /* --- Операции выбранной даты --- */

    const es =
        hist.filter(
            x => x.date === date
        );

    return (
        <>
            <div className="grab" />

            <h2>
                {new Date(
                    date + 'T12:00'
                ).toLocaleDateString(
                    localeByLang[lang],
                    {
                        day: 'numeric',
                        month: 'long'
                    }
                )}
            </h2>

            {es.map(x => (
                <div
                    className="dayrow"
                    key={x.key}
                >
                    <ServiceAvatar
                        name={x.name}
                        small
                    />

                    <b>
                        {x.name}
                    </b>

                    <span>
                        {money(
                            x.amount,
                            x.currency,
                            lang
                        )}
                    </span>
                </div>
            ))}

            {/* --- Итоги отдельно по каждой валюте --- */}

            <div className="totals">
                {[
                    ...new Set(
                        es.map(
                            x => x.currency
                        )
                    )
                ].map(c => (
                    <b key={c}>
                        {t.total}:{' '}

                        {money(
                            es
                                .filter(
                                    x =>
                                        x.currency ===
                                        c
                                )
                                .reduce(
                                    (s, x) =>
                                        s +
                                        x.amount,
                                    0
                                ),
                            c,
                            lang
                        )}
                    </b>
                ))}
            </div>
        </>
    );
}


/* ==========================================================
   START REACT
   ========================================================== */

/* ==========================================================================
   16. ТОЧКА ВХОДА: запуск React
   ========================================================================== */

createRoot(
    document.getElementById('root')!
).render(
    <App />
);