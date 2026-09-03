/**
 * NOPS categories and specializations from the TO BE spec (Appendix B).
 */

function item(id, label, nopsPct, extra) {
  return Object.assign({ id: id, label: label, nopsPct: nopsPct }, extra || {});
}

export const NOPS_CATEGORIES = Object.freeze([
  {
    id: "medicine",
    label: "Медицина",
    items: [
      item("med_general", "Медичні підрозділи загального профілю", 68.3),
      item(
        "med_tb_psych",
        "Туберкульозні, психіатричні та патолого-анатомічні підрозділи",
        71.5
      ),
      item("med_operating", "Хірурги, ендоскопісти й анестезіологи, які оперують у госпіталях", 78),
      item("med_immuno", "Лабораторії інфекційної імунології", 100),
    ],
  },
  {
    id: "vsp",
    label: "Військова служба правопорядку",
    items: [
      item("vsp_posts", "Посади у Військовій службі правопорядку", 68.3),
      item("vsp_disciplinary", "Посади у дисциплінарних військових частинах", 81.3),
      item("vsp_special", "Спецпідрозділи Військової служби правопорядку", 87.8),
    ],
  },
  {
    id: "special_units",
    label: "Спеціальні умови та військові частини",
    items: [
      item("spec_underground", "Служба глибше 20 м або в захищених пунктах управління", 68.3),
      item(
        "spec_listed_zmiinyi",
        "Військовослужбовці частин А1556, А1778, А1927, А4267, А3715, А3892, А3029, А3620 та охорона острова Зміїний",
        100
      ),
    ],
  },
  {
    id: "air_defense",
    label: "ППО та бойове чергування",
    items: [
      item(
        "pvo_duty",
        "Бойові чергування ППО, морської оборони й прикриття об’єктів (від 4)",
        78
      ),
      item("pvo_sam", "Обслуги гусеничних пускових установок і станцій ЗРК", 84.5),
    ],
  },
  {
    id: "armor",
    label: "Бронетехніка",
    items: [
      item("armor_commanders", "Командири й старші механіки-водії танків та гаубичних САУ", 78),
      item(
        "armor_crews",
        "Екіпажі танків, САУ, ЗСУ, БМП, розвідувальних і десантних машин та інструктори водіння",
        84.5
      ),
    ],
  },
  {
    id: "aviation",
    label: "Авіація",
    items: [
      item(
        "avia_ground",
        "Наземний авіаційний склад: безпека польотів і випробування (за переліком)",
        78
      ),
      item("avia_cabin", "Льотний склад пасажирського та вантажного салону", 100, {
        premiumPct: 650,
      }),
      item("avia_crew", "Льотний склад льотного екіпажу", 100, {
        premiumPct: 780,
        isPilot: true,
      }),
      item("avia_test_crew", "Льотно-випробний склад у складі екіпажу", 100),
    ],
  },
  {
    id: "navy",
    label: "ВМС",
    items: [
      item("navy_divers", "Водолази з допуском до водолазних робіт", 87.8),
      item("navy_crews", "Екіпажі надводних кораблів, суден і катерів", 87.8),
      item(
        "navy_command",
        "Управління корабельних з’єднань із постійним розміщенням на кораблях",
        87.8
      ),
      item("navy_marines", "Морська піхота та визначені частини ВМС", 87.8),
    ],
  },
  {
    id: "dshv",
    label: "ДШВ",
    items: [
      item(
        "dshv_units",
        "ДШВ, профільні заклади, парашутні служби, спорткоманди та випробувачі",
        87.8
      ),
    ],
  },
  {
    id: "sso",
    label: "ССО",
    items: [
      item("sso_units", "Військові частини Сил спеціальних операцій", 87.8, {
        needsSsoPosition: true,
      }),
    ],
  },
  {
    id: "snipers",
    label: "Снайпери",
    items: [
      item(
        "sniper_sso_a2772",
        "Сертифіковані снайпери груп спецпризначення ССО і групи підготовки А2772 (без змінного складу)",
        100,
        { premiumPct: 630 }
      ),
      item(
        "sniper_recon",
        "Сертифіковані снайпери снайперських та розвідувальних підрозділів",
        100,
        { premiumPct: 720, premiumPctDshv: 880 }
      ),
      item(
        "sniper_a2900",
        "Сертифіковані снайпери навчальних взводів А2900 (без змінного складу)",
        100,
        { premiumPct: 880 }
      ),
      item(
        "sniper_a1414",
        "Сертифіковані снайпери навчального відділення й груп А1414 (без змінного складу)",
        100,
        { premiumPct: 720 }
      ),
    ],
  },
  {
    id: "atgm",
    label: "ПТРК",
    items: [
      item(
        "atgm_stugna",
        "Сертифіковані військовослужбовці підрозділів ПТРК «Стугна-П» або «Корсар»",
        100,
        { premiumPct: 735, premiumPctDshv: 900 }
      ),
      item("atgm_a1499", "Батарея протитанкових керованих комплексів А1499", 100, {
        premiumPct: 510,
      }),
    ],
  },
  {
    id: "instructors",
    label: "Навчання та інструктори",
    items: [
      item("instr_centers", "Інструктори й викладачі навчальних центрів та полігонів", 81.3),
      item("instr_bas_staff", "Штатні інструктори бойової армійської системи", 81.3),
      item(
        "instr_bas_certified",
        "Сертифіковані інструктори бойової армійської системи, які проводять заняття",
        81.3
      ),
    ],
  },
  {
    id: "honor_guard",
    label: "Почесна варта",
    items: [
      item("honor_a0222", "Батальйон та оркестр почесної варти А0222", 85),
    ],
  },
  {
    id: "fire",
    label: "Пожежна служба",
    items: [
      item("fire_crews", "Штатні пожежні розрахунки під час ліквідації пожеж", 100),
    ],
  },
  {
    id: "uav",
    label: "БпАК",
    items: [
      item(
        "uav_crews",
        "Сертифіковані зовнішні екіпажі БпАК із допуском і фактичними польотами",
        100,
        { premiumPct: 770, premiumPctSso: 620, premiumPctDshv: 890 }
      ),
    ],
  },
]);

const BY_ID = {};
NOPS_CATEGORIES.forEach(function (category) {
  category.items.forEach(function (spec) {
    BY_ID[spec.id] = spec;
  });
});

export function getNopsCategory(id) {
  for (let i = 0; i < NOPS_CATEGORIES.length; i += 1) {
    if (NOPS_CATEGORIES[i].id === id) return NOPS_CATEGORIES[i];
  }
  return null;
}

export function getNopsSpecialization(id) {
  return BY_ID[id] || null;
}

export function formatNopsPct(value) {
  return String(value).replace(".", ",") + "%";
}
