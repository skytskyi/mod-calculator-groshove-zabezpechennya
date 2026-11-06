/**
 * Wizard + results for the monetary allowance calculator.
 */

const wizardProgress = document.getElementById("wizard-progress");
const wizardQuestion = document.getElementById("wizard-question");
const wizardHelp = document.getElementById("wizard-help");
const wizardError = document.getElementById("wizard-error");
const wizardBack = document.getElementById("wizard-back");
const wizardContinue = document.getElementById("wizard-continue");
const wizardSteps = document.querySelectorAll(".wizard-step");
const wizardPanel = document.getElementById("wizard-panel");
const wizardResults = document.getElementById("wizard-results");
const wizardRestart = document.getElementById("wizard-restart");
const wizardEdit = document.getElementById("wizard-edit");
const wizardResultsExplanation = document.getElementById(
  "wizard-results-explanation"
);
const wizardResultsTotal = document.getElementById("wizard-results-total");
const wizardResultsInputsList = document.getElementById("wizard-results-inputs-list");

const rankTitleField = document.getElementById("rank-title-field");
const rankTitleOptions = document.getElementById("rank-title-options");
const tariffField = document.getElementById("tariff-field");
const tariffInput = document.getElementById("tariff-input");
const tariffError = document.getElementById("tariff-error");
const tariffWarning = document.getElementById("tariff-warning");
const tariffInc = document.getElementById("tariff-inc");
const tariffDec = document.getElementById("tariff-dec");

let currentStepIndex = 0;

const WIZARD_STEPS = [
  "basics",
  "years",
  "conditions",
  "qualification",
  "rewards",
  "rewards_additional",
  "combat_results",
  "discipline",
];

const STEP_META = {
  basics: {
    title: "Звання та тарифний розряд",
    help: "Оберіть ваше звання та тарифний розряд.",
  },
  years: {
    title: "Вислуга років",
    help: "Вкажіть вашу вислугу.",
  },
  conditions: {
    title: "Умови військової служби",
    help: "Вкажіть, де ви проходите службу, та розмір надбавки за її особливості.",
  },
  qualification: {
    title: "Секретність, кваліфікація та додаткові звання",
    help: "Заповніть, якщо у вас є ступінь секретності, класна кваліфікація або додаткові звання.",
  },
  rewards: {
    title: "Одноразові та штурмові винагороди",
    help: "Оберіть розрахунковий місяць і вкажіть ваші одноразові та штурмові винагороди.",
  },
  rewards_additional: {
    title: "Додаткові винагороди",
    help: "Вкажіть ваші додаткові винагороди, підготовку особового складу та дні навчання чи відпустки.",
  },
  combat_results: {
    title: "Винагороди за полонених і знищення",
    help: "Вкажіть кількість полонених або знищених і скільки осіб брали участь.",
  },
  discipline: {
    title: "Дисципліна",
    help: "Якщо у вас були порушення, оберіть тип і конкретне порушення.",
  },
};

const RANK_LABELS = {
  r1: "Рядовий",
  r2: "Сержантський / старшинський",
  r3: "Офіцерський",
  r4: "Вищий офіцерський",
};

const RANK_TITLES = {
  r1: ["Рекрут", "Солдат, матрос", "Старший солдат, старший матрос"],
  r2: [
    "Молодший сержант, старшина 2 статті",
    "Сержант, старшина 1 статті",
    "Старший сержант, головний старшина",
    "Головний сержант, головний корабельний старшина",
    "Штаб-сержант, штаб-старшина",
    "Майстер-сержант, майстер-старшина",
    "Старший майстер-сержант, старший майстер-старшина",
    "Головний майстер-сержант, головний майстер-старшина",
  ],
  r3: [
    "Молодший лейтенант",
    "Лейтенант",
    "Старший лейтенант",
    "Капітан, капітан-лейтенант",
    "Майор, капітан 3 рангу",
    "Підполковник, капітан 2 рангу",
    "Полковник, капітан 1 рангу",
  ],
  r4: [
    "Бригадний генерал, коммодор",
    "Генерал-майор, контр-адмірал",
    "Генерал-лейтенант, віце-адмірал",
    "Генерал, адмірал",
  ],
};

/** Орієнтовний діапазон тарифних розрядів за військовим званням (мін–макс). */
const TARIFF_RANGE_BY_RANK_TITLE = {
  Рекрут: { min: 1, max: 2 },
  "Солдат, матрос": { min: 1, max: 6 },
  "Старший солдат, старший матрос": { min: 2, max: 7 },
  "Молодший сержант, старшина 2 статті": { min: 4, max: 10 },
  "Сержант, старшина 1 статті": { min: 6, max: 13 },
  "Старший сержант, головний старшина": { min: 8, max: 16 },
  "Головний сержант, головний корабельний старшина": { min: 10, max: 18 },
  "Штаб-сержант, штаб-старшина": { min: 12, max: 20 },
  "Майстер-сержант, майстер-старшина": { min: 14, max: 22 },
  "Старший майстер-сержант, старший майстер-старшина": { min: 16, max: 24 },
  "Головний майстер-сержант, головний майстер-старшина": { min: 18, max: 26 },
  "Молодший лейтенант": { min: 12, max: 22 },
  Лейтенант: { min: 14, max: 26 },
  "Старший лейтенант": { min: 17, max: 30 },
  "Капітан, капітан-лейтенант": { min: 20, max: 35 },
  "Майор, капітан 3 рангу": { min: 26, max: 42 },
  "Підполковник, капітан 2 рангу": { min: 32, max: 50 },
  "Полковник, капітан 1 рангу": { min: 38, max: 58 },
  "Бригадний генерал, коммодор": { min: 50, max: 60 },
  "Генерал-майор, контр-адмірал": { min: 54, max: 60 },
  "Генерал-лейтенант, віце-адмірал": { min: 57, max: 60 },
  "Генерал, адмірал": { min: 59, max: 60 },
};

const YEARS_LABELS = {
  y0: "Менше 1 року",
  y1: "1–4 роки",
  y2: "5–9 років",
  y3: "10–14 років",
  y4: "15–19 років",
  y5: "20–24 роки",
  y6: "25 років і більше",
};

const SERVICE_PLACE_LABELS = {
  general:
    "На посадах рядового, сержантського, старшинського та офіцерського складу",
  sso: "Сили спеціальних операцій (ССО)",
  dshv_vms: "ДШВ / ВМС / Морська піхота",
  a0952: "У військовій частині А0952",
};

const NOPS_MODE_LABELS = {
  default: "За замовчуванням",
  other: "Інша",
};

const DEFAULT_NOPS_PCT_BY_PLACE = {
  general: 65,
  sso: 87.8,
  dshv_vms: 87.8,
  a0952: 100,
};

/** Branch NOPS already implied by service place — hide from «Інша». */
const NOPS_BRANCH_CATEGORY_IDS = {
  sso: true,
  dshv: true,
  navy: true,
};

const SSO_POSITION_LABELS = {
  sso_main:
    "Посади інструкторів і основних підрозділів центрів спеціального призначення та навчально-тренувальних центрів",
  sso_command: "Посади в Командуванні ССО та управліннях центрів",
  sso_support:
    "Посади у підрозділах забезпечення та визначених управліннях і основних підрозділах спеціальних центрів",
  sso_other: "Інші військовослужбовці ССО",
};

const MEDICAL_QUAL_CATEGORY_LABELS = {
  second: "Друга кваліфікаційна категорія",
  first: "Перша кваліфікаційна категорія",
  higher: "Вища кваліфікаційна категорія",
};

const MEDICAL_QUAL_POST_LABELS = {
  surgical: "Визначені хірургічні посади",
  other: "Інші медичні посади",
  junior: "Молодші спеціалісти",
};

const SECRECY_LABELS = {
  none: "Відсутній",
  secret: "Таємно",
  top_secret: "Цілком таємно",
  special: "Особливої важливості",
};

const RSO_AFFILIATION_LABELS = {
  no: "Ні",
  yes: "Так",
};

const CIPHER_TENURE_LABELS = {
  lt1: "Відсутній",
  y1_3: "1–2 роки",
  y3_5: "3–4 роки",
  gt5: "5 років і більше",
};

const CLASS_QUALIFICATION_LABELS = {
  none: "Відсутня",
  class_2: "2 клас",
  class_1: "1 клас",
  master: "Клас майстра",
  sniper: "Клас снайпера (для льотного складу)",
  medical: "Кваліфікації для медичного і фармацевтичного складу",
};

const EXTRA_RANKS_LABELS = {
  yes: "Так",
  no: "Ні",
};

const HONORARY_TITLE_LABELS = {
  none: "Відсутнє",
  honored: "Почесне звання “заслужений”",
  peoples: "Почесне звання “народний”",
};

const SPORTS_TITLE_LABELS = {
  none: "Відсутнє",
  honored_coach: "Заслужений тренер",
  honored_master: "Заслужений майстер спорту",
  intl_master: "Майстер спорту міжнародного класу",
  master: "Майстер спорту",
};

const SCIENCE_DEGREE_LABELS = {
  none: "Відсутній",
  phd: "Науковий ступінь доктора філософії (кандидата наук)",
  doctor: "Науковий ступінь доктора наук",
};

const ACADEMIC_TITLE_LABELS = {
  none: "Відсутній",
  docent: "Вчене звання доцента (старшого наукового співробітника)",
  professor: "Вчене звання професора",
};

const HAS_VIOLATIONS_LABELS = {
  no: "Ні",
  yes: "Так",
};

const VIOLATION_TYPE_LABELS = {
  disciplinary: "Дисциплінарні порушення (догани)",
  service: "Службові порушення",
  legal: "Судові та правові наслідки",
  qualification: "Кваліфікація та освіта",
};

const DISCIPLINARY_VIOLATION_LABELS = {
  reprimand: "Дисциплінарне стягнення «догана»",
  severe_reprimand: "Дисциплінарне стягнення «сувора догана»",
  two_reprimands: "Два дисциплінарних стягнень «догана» («сувора догана»)",
  three_reprimands: "Три дисциплінарних стягнень «догана» («сувора догана»)",
  more_than_three:
    "Більше трьох дисциплінарних стягнень, крім дисциплінарного стягнення «зауваження»",
};

const SERVICE_VIOLATION_LABELS = {
  absence: "Невихід на службу (навчання) без поважних причин",
  alcohol_drugs:
    "Вживання алкогольних напоїв (наркотичних речовин) на території військової частини як у службовий, так і в позаслужбовий час, прибуття на службу в нетверезому стані (у стані наркотичного сп’яніння)",
};

const LEGAL_VIOLATION_LABELS = {
  court_ruling:
    "Постанова суду про накладення адміністративного стягнення за вчинення військового адміністративного правопорушення або адміністративного правопорушення, пов’язаного з корупцією",
  material_damage:
    "Порушення вимог законів та інших нормативно-правових актів, які призвели до матеріальних збитків",
  accidents_deaths:
    "Скоєння у військовій частині аварій, подій, пов’язаних із загибеллю людей з вини військовослужбовців під час виконання ними службових обов’язків, чи злочинів - за місяць, у якому сталася аварія, подія, пов’язана із загибеллю людей",
};

const QUALIFICATION_VIOLATION_LABELS = {
  incomplete_fitness:
    "Дисциплінарне стягнення у вигляді попередження про неповну службову відповідність, пониження в посаді, пониження у військовому званні на один ступінь, позбавлення військового звання",
  unsuccessful_studies:
    "Неуспішне закінчення ад’юнктури або докторантури вищого військового навчального закладу, військового навчального підрозділу закладу вищої освіти або науково-дослідної установи",
  expulsion_studies:
    "Відрахування з ад’юнктури або докторантури вищого військового навчального закладу, військового навчального підрозділу закладу вищої освіти або науково-дослідної установи через невиконання індивідуального навчального плану (індивідуального плану наукової роботи) або недисциплінованість",
};

const VIOLATION_DETAIL_FIELDS = [
  {
    type: "disciplinary",
    fieldId: "field-disciplinary-violation",
    name: "disciplinaryViolation",
    labels: DISCIPLINARY_VIOLATION_LABELS,
  },
  {
    type: "service",
    fieldId: "field-service-violation",
    name: "serviceViolation",
    labels: SERVICE_VIOLATION_LABELS,
  },
  {
    type: "legal",
    fieldId: "field-legal-violation",
    name: "legalViolation",
    labels: LEGAL_VIOLATION_LABELS,
  },
  {
    type: "qualification",
    fieldId: "field-qualification-violation",
    name: "qualificationViolation",
    labels: QUALIFICATION_VIOLATION_LABELS,
  },
];

const MONTH_LABELS = {
  "1": "Січень",
  "2": "Лютий",
  "3": "Березень",
  "4": "Квітень",
  "5": "Травень",
  "6": "Червень",
  "7": "Липень",
  "8": "Серпень",
  "9": "Вересень",
  "10": "Жовтень",
  "11": "Листопад",
  "12": "Грудень",
};

const REWARD_GROUP_COMBAT_IDS = [
  "combat_actions",
  "command_posts",
  "combat_special",
];

const REWARD_GROUP_TRAINING_IDS = [
  "train_commander",
  "train_basic",
  "train_mid",
  "train_advanced",
  "train_ubd",
];

const REWARD_GROUP_ONETIME_IDS = ["stronghold_platoon", "stronghold_company"];

const REWARD_GROUP_ASSAULT_IDS = ["restore_positions", "capture_positions"];

const TRAINING_LEAVE_ID = "training_leave";

const REWARD_GROUPS = [
  {
    id: "onetime",
    rewardIds: REWARD_GROUP_ONETIME_IDS,
    summaryLabel: "Одноразові винагороди",
  },
  {
    id: "assault",
    rewardIds: REWARD_GROUP_ASSAULT_IDS,
    summaryLabel: "Винагороди за штурмові дії",
  },
  {
    id: "combat",
    rewardIds: REWARD_GROUP_COMBAT_IDS,
    summaryLabel: "Бойові або службові завдання з додатковою винагородою",
  },
  {
    id: "training",
    rewardIds: REWARD_GROUP_TRAINING_IDS,
    summaryLabel: "Обіймали посаду інструкторського складу",
  },
];

const REWARD_GROUPS_PRIMARY = REWARD_GROUPS.filter(function (group) {
  return group.id === "onetime" || group.id === "assault";
});

const REWARD_GROUPS_ADDITIONAL = REWARD_GROUPS.filter(function (group) {
  return group.id === "combat" || group.id === "training";
});

const ALL_REWARD_IDS = REWARD_GROUP_COMBAT_IDS.concat(
  REWARD_GROUP_TRAINING_IDS,
  [TRAINING_LEAVE_ID],
  REWARD_GROUP_ONETIME_IDS,
  REWARD_GROUP_ASSAULT_IDS
);

const REWARD_LABELS = {
  combat_actions: "Участь у бойових діях (100 000 грн за повний місяць)",
  command_posts: "Виконання завдань на пунктах управління (50 000 грн за повний місяць)",
  combat_special: "Виконання бойових (спеціальних) завдань (30 000 грн за повний місяць)",
  train_commander: "Командир інструкторського підрозділу (25 000 грн за повний місяць)",
  train_basic:
    "Базовий сержантський / інструкторський рівень (15 000 грн за повний місяць)",
  train_mid:
    "Середній сержантський рівень + підвищення кваліфікації інструкторів (25 000 грн за повний місяць)",
  train_advanced:
    "Вищий сержантський рівень + академічний інструктор (30 000 грн за повний місяць)",
  train_ubd:
    "Рівень підготовки не нижче базового + інструктор зі статусом УБД (30 000 грн за повний місяць)",
  training_leave: "Чи були періоди навчання чи відпустки?",
  stronghold_platoon:
    "Виконання бойових завдань до взводного опорного пункту (170 000 грн за повний місяць)",
  stronghold_company:
    "Виконання бойових завдань до ротного опорного пункту (70 000 грн за повний місяць)",
  restore_positions: "Відновлення позицій (20 000 грн/добу)",
  capture_positions: "Захоплення позицій (40 000 грн/добу)",
};

const REWARD_GROUP_LABELS = {
  yes: "Так",
  no: "Ні",
};

const settlementPeriodField = document.getElementById("field-settlement-period");
const settlementMonthInput = document.getElementById("settlement-month");
const settlementYearInput = document.getElementById("settlement-year");
const settlementPeriodLabel = document.getElementById("settlement-period-label");
const settlementPeriodInc = document.getElementById("settlement-period-inc");
const settlementPeriodDec = document.getElementById("settlement-period-dec");
const nopsCategoryOptions = document.getElementById("nops-category-options");
const nopsSpecializationOptions = document.getElementById(
  "nops-specialization-options"
);
let filledNopsSpecCategoryId = null;

const SETTLEMENT_YEAR_MIN = Number(
  (settlementPeriodField && settlementPeriodField.dataset.min) || 2022
);
const SETTLEMENT_YEAR_MAX = Number(
  (settlementPeriodField && settlementPeriodField.dataset.max) || 2035
);

const TARIFF_MIN = Number((tariffField && tariffField.dataset.min) || 1);
const TARIFF_MAX = Number((tariffField && tariffField.dataset.max) || 60);

const WIZARD_STEP_COUNT = WIZARD_STEPS.length;

function getCurrentStepId() {
  return WIZARD_STEPS[currentStepIndex];
}

function getSelectedValue(name) {
  const selected = document.querySelector('input[name="' + name + '"]:checked');
  return selected ? selected.value : null;
}

function getYesNoValue(name) {
  const input = document.querySelector('input[name="' + name + '"]');
  if (!input) return null;
  if (input.type === "checkbox") return input.checked ? "yes" : "no";
  return getSelectedValue(name);
}

function getSelectedRankTitleLabel() {
  const selected = document.querySelector('input[name="rankTitle"]:checked');
  if (!selected) return null;
  return selected.dataset.rankTitleLabel || selected.value;
}

function getTariffRangeForSelectedRank() {
  const label = getSelectedRankTitleLabel();
  if (!label) return null;
  return TARIFF_RANGE_BY_RANK_TITLE[label] || null;
}

function parseTariff() {
  if (!tariffInput) return { ok: false };
  const raw = tariffInput.value.trim();
  if (!raw || !/^\d+$/.test(raw)) return { ok: false };
  const n = Number.parseInt(raw, 10);
  if (n < TARIFF_MIN || n > TARIFF_MAX) return { ok: false, n };
  return { ok: true, n };
}

function setTariffRankWarning(show) {
  if (tariffWarning) tariffWarning.hidden = !show;
}

function setTariffValidity(valid) {
  if (!tariffField || !tariffError || !tariffInput) return;
  tariffField.classList.toggle("is-invalid", !valid);
  tariffError.hidden = valid;
  tariffInput.setAttribute("aria-invalid", valid ? "false" : "true");
  if (!valid) setTariffRankWarning(false);
}

function updateTariffRankWarning() {
  const result = parseTariff();
  if (!result.ok) {
    setTariffRankWarning(false);
    return;
  }
  const range = getTariffRangeForSelectedRank();
  if (!range) {
    setTariffRankWarning(false);
    return;
  }
  setTariffRankWarning(result.n < range.min || result.n > range.max);
}

function validateTariff() {
  const result = parseTariff();
  setTariffValidity(result.ok);
  if (result.ok) updateTariffRankWarning();
  return result;
}

function applyTariffDefaultForSelectedRank() {
  const range = getTariffRangeForSelectedRank();
  if (!range || !tariffInput) return;
  tariffInput.value = String(range.min);
}

function applyTariffDelta(delta) {
  if (!tariffInput) return;
  const result = parseTariff();
  let base;
  if (result.ok) {
    base = result.n;
  } else if (!tariffInput.value.trim()) {
    base = delta > 0 ? 0 : TARIFF_MIN;
  } else {
    const n = Number.parseInt(tariffInput.value.trim(), 10);
    base = Number.isFinite(n)
      ? Math.min(TARIFF_MAX, Math.max(TARIFF_MIN, n))
      : TARIFF_MIN;
  }
  let next = base + delta;
  if (next < TARIFF_MIN) next = TARIFF_MIN;
  if (next > TARIFF_MAX) next = TARIFF_MAX;
  tariffInput.value = String(next);
  validateTariff();
  onWizardInputChange();
}

function clearRankTitleOptions() {
  if (rankTitleOptions) rankTitleOptions.replaceChildren();
}

function renderRankTitleOptions(tier) {
  if (!rankTitleOptions) return;
  clearRankTitleOptions();
  const titles = RANK_TITLES[tier];
  if (!titles || !titles.length) return;

  const row = document.createElement("div");
  row.className = "radio-row radio-row--wizard";

  titles.forEach(function (text, idx) {
    const label = document.createElement("label");
    label.className = "radio-card";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "rankTitle";
    input.value = tier + ":" + idx;
    input.dataset.rankTitleLabel = text;

    const ui = document.createElement("span");
    ui.className = "radio-card__ui";

    const content = document.createElement("span");
    content.className = "radio-card__content";
    const textEl = document.createElement("span");
    textEl.className = "radio-card__text";
    textEl.textContent = text;
    content.appendChild(textEl);

    label.appendChild(input);
    label.appendChild(ui);
    label.appendChild(content);
    row.appendChild(label);
  });

  rankTitleOptions.appendChild(row);

  rankTitleOptions.querySelectorAll('input[name="rankTitle"]').forEach(function (input) {
    input.addEventListener("change", onRankTitleChange);
  });
}

function syncRankTitleField() {
  if (!rankTitleField) return;
  const tier = getSelectedValue("rank");
  if (!tier || !RANK_TITLES[tier]) {
    rankTitleField.hidden = true;
    clearRankTitleOptions();
    setTariffRankWarning(false);
    return;
  }
  rankTitleField.hidden = false;
  renderRankTitleOptions(tier);
  setTariffRankWarning(false);
}

function onRankTitleChange() {
  applyTariffDefaultForSelectedRank();
  validateTariff();
  onWizardInputChange();
}

function isBasicsFilled() {
  if (!getSelectedValue("rank")) return false;
  if (!getSelectedValue("rankTitle")) return false;
  if (!parseTariff().ok) return false;
  return true;
}

function isYearsFilled() {
  return Boolean(getSelectedValue("years"));
}

function getDefaultNopsPct() {
  const place = getSelectedValue("servicePlace");
  if (place && DEFAULT_NOPS_PCT_BY_PLACE[place] != null) {
    return DEFAULT_NOPS_PCT_BY_PLACE[place];
  }
  return 65;
}

function formatNopsRadioTerm(value) {
  return "НОПС: " + formatNopsPct(value);
}

/**
 * Premium % for a NOPS specialization, respecting current service place overrides.
 * @param {{ premiumPct?: number, premiumPctSso?: number, premiumPctDshv?: number } | null | undefined} spec
 * @returns {number | null}
 */
function resolveSpecPremiumPct(spec) {
  if (!spec) return null;
  const place = getSelectedValue("servicePlace");
  if (place === "sso" && spec.premiumPctSso != null) return spec.premiumPctSso;
  if (
    (place === "dshv_vms" || place === "a0952") &&
    spec.premiumPctDshv != null
  ) {
    return spec.premiumPctDshv;
  }
  if (spec.premiumPct != null) return spec.premiumPct;
  return null;
}

/**
 * Radio subtitle: NOPS % and, when it differs between options, monthly premium %.
 * @param {{ nopsPct: number, premiumPct?: number, premiumPctSso?: number, premiumPctDshv?: number }} spec
 * @returns {string}
 */
function formatNopsSpecRadioTerm(spec) {
  let text = formatNopsRadioTerm(spec.nopsPct);
  const premium = resolveSpecPremiumPct(spec);
  if (premium != null) {
    text += " · премія " + formatNopsPct(premium);
  }
  return text;
}

function syncNopsDefaultPct() {
  const el = document.getElementById("nops-default-pct");
  if (!el) return;
  el.hidden = false;
  el.textContent = formatNopsRadioTerm(getDefaultNopsPct());
}

function isNopsCategoryAllowed(categoryId) {
  return !NOPS_BRANCH_CATEGORY_IDS[categoryId];
}

function isNopsSpecAllowed(spec) {
  if (!spec) return false;
  if (
    spec.id === "spec_listed_zmiinyi" &&
    getSelectedValue("servicePlace") === "a0952"
  ) {
    return false;
  }
  return true;
}

function getVisibleNopsSpecs(category) {
  if (!category) return [];
  return category.items.filter(isNopsSpecAllowed);
}

function nopsSpecCalcKey(spec) {
  return [
    spec.nopsPct,
    spec.premiumPct == null ? "" : spec.premiumPct,
    spec.premiumPctSso == null ? "" : spec.premiumPctSso,
    spec.premiumPctDshv == null ? "" : spec.premiumPctDshv,
    spec.isPilot ? "1" : "0",
    spec.needsSsoPosition ? "1" : "0",
  ].join("|");
}

function nopsCategorySkipsSpecialization(category) {
  const items = getVisibleNopsSpecs(category);
  if (!items.length) return false;
  const key = nopsSpecCalcKey(items[0]);
  for (let i = 1; i < items.length; i += 1) {
    if (nopsSpecCalcKey(items[i]) !== key) return false;
  }
  return true;
}

function nopsCategoryDisplayPct(category) {
  if (!nopsCategorySkipsSpecialization(category)) return null;
  const items = getVisibleNopsSpecs(category);
  return items.length ? items[0].nopsPct : null;
}

function requiresNopsDetails() {
  return getSelectedValue("nopsMode") === "other";
}

function getSelectedNopsSpec() {
  const id = getSelectedValue("nopsSpecialization");
  if (!id) return null;
  return getNopsSpecialization(id);
}

function requiresSsoPosition() {
  if (getSelectedValue("servicePlace") === "sso") return true;
  const spec = getSelectedNopsSpec();
  return Boolean(spec && spec.needsSsoPosition);
}

function fillNopsCategoryRadios() {
  if (!nopsCategoryOptions) return;
  let current = getSelectedValue("nopsCategory");
  if (current && !isNopsCategoryAllowed(current)) {
    clearChecked("nopsCategory");
    current = null;
  }
  nopsCategoryOptions.replaceChildren();
  NOPS_CATEGORIES.forEach(function (category) {
    if (!isNopsCategoryAllowed(category.id)) return;
    const visibleItems = category.items.filter(isNopsSpecAllowed);
    if (!visibleItems.length) return;

    const label = document.createElement("label");
    label.className = "radio-card";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "nopsCategory";
    input.value = category.id;
    if (current === category.id) input.checked = true;

    const ui = document.createElement("span");
    ui.className = "radio-card__ui";

    const content = document.createElement("span");
    content.className = "radio-card__content";
    const textEl = document.createElement("span");
    textEl.className = "radio-card__text";
    textEl.textContent = category.label;
    content.appendChild(textEl);

    label.appendChild(input);
    label.appendChild(ui);
    label.appendChild(content);
    const displayPct = nopsCategoryDisplayPct(category);
    if (displayPct != null) {
      const percent = document.createElement("span");
      percent.className = "radio-card__term";
      const firstSpec = visibleItems[0];
      percent.textContent = firstSpec
        ? formatNopsSpecRadioTerm(firstSpec)
        : formatNopsRadioTerm(displayPct);
      content.appendChild(percent);
    }
    nopsCategoryOptions.appendChild(label);
  });

  nopsCategoryOptions.querySelectorAll('input[name="nopsCategory"]').forEach(function (input) {
    input.addEventListener("change", onNopsCategoryChange);
  });
}

function onNopsCategoryChange() {
  onWizardInputChange();
}

function fillNopsSpecializationRadios(categoryId) {
  if (!nopsSpecializationOptions) return;
  const place = getSelectedValue("servicePlace") || "";
  const nextId = (categoryId || "") + "|" + place;
  if (nextId === filledNopsSpecCategoryId) return;

  let current = getSelectedValue("nopsSpecialization");
  const currentSpec = current ? getNopsSpecialization(current) : null;
  if (current && !isNopsSpecAllowed(currentSpec)) {
    clearChecked("nopsSpecialization");
    current = null;
  }
  nopsSpecializationOptions.replaceChildren();
  filledNopsSpecCategoryId = nextId;
  const category = getNopsCategory(categoryId || "");
  if (!category) return;

  const visible = getVisibleNopsSpecs(category);
  if (nopsCategorySkipsSpecialization(category) && visible.length) {
    const currentAllowed = visible.some(function (spec) {
      return spec.id === current;
    });
    if (!currentAllowed) current = visible[0].id;
  }

  visible.forEach(function (spec) {
    const label = document.createElement("label");
    label.className = "radio-card";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "nopsSpecialization";
    input.value = spec.id;
    if (current === spec.id) input.checked = true;

    const ui = document.createElement("span");
    ui.className = "radio-card__ui";

    const content = document.createElement("span");
    content.className = "radio-card__content";
    const textEl = document.createElement("span");
    textEl.className = "radio-card__text";
    textEl.textContent = spec.label;
    content.appendChild(textEl);

    const percent = document.createElement("span");
    percent.className = "radio-card__term";
    percent.textContent = formatNopsSpecRadioTerm(spec);
    content.appendChild(percent);

    label.appendChild(input);
    label.appendChild(ui);
    label.appendChild(content);
    nopsSpecializationOptions.appendChild(label);
  });

  nopsSpecializationOptions
    .querySelectorAll('input[name="nopsSpecialization"]')
    .forEach(function (input) {
      input.addEventListener("change", onWizardInputChange);
    });
}

function syncNopsFields() {
  const place = getSelectedValue("servicePlace");
  if (place && !getSelectedValue("nopsMode")) {
    const nopsDefault = document.querySelector(
      'input[name="nopsMode"][value="default"]'
    );
    if (nopsDefault) nopsDefault.checked = true;
  }

  syncNopsDefaultPct();
  const show = requiresNopsDetails();
  fillNopsCategoryRadios();
  const categoryId = getSelectedValue("nopsCategory");
  const category = categoryId ? getNopsCategory(categoryId) : null;
  const skipSpec = nopsCategorySkipsSpecialization(category);
  const categoryField = document.getElementById("field-nops-category");
  const specField = document.getElementById("field-nops-specialization");
  if (categoryField) categoryField.hidden = !show;
  if (specField) specField.hidden = !(show && categoryId && !skipSpec);
  if (!show) {
    clearChecked("nopsCategory");
    fillNopsSpecializationRadios("");
  } else {
    fillNopsSpecializationRadios(categoryId || "");
  }
  syncSsoPositionField();
}

function syncSsoPositionField() {
  const field = document.getElementById("field-sso-position");
  if (!field) return;

  const show = requiresSsoPosition();
  field.hidden = !show;
  if (!show) {
    clearChecked("ssoPosition");
  }
}

function isConditionsFilled() {
  if (!getSelectedValue("nopsMode")) return false;
  if (requiresNopsDetails()) {
    if (!getSelectedValue("nopsCategory")) return false;
    if (!getSelectedValue("nopsSpecialization")) return false;
  }
  if (!getSelectedValue("servicePlace")) return false;
  if (requiresSsoPosition() && !getSelectedValue("ssoPosition")) return false;
  return true;
}

function isSecrecyFilled() {
  if (hasSecrecyLevel() && !getSelectedValue("secrecy")) return false;
  if (hasCipherTenure() && !getSelectedValue("cipherTenure")) return false;
  return true;
}

function hasSecrecyLevel() {
  return getYesNoValue("hasSecrecy") === "yes";
}

function getSecrecyValue() {
  if (!hasSecrecyLevel()) return "none";
  return getSelectedValue("secrecy");
}

function requiresRsoAffiliation() {
  return hasSecrecyLevel();
}

function syncSecrecyFields() {
  const details = document.getElementById("secrecy-level-details");
  const show = hasSecrecyLevel();
  if (details) details.hidden = !show;
  if (!show) {
    clearChecked("secrecy");
    clearChecked("rsoAffiliation");
  }
}

function hasCipherTenure() {
  return getYesNoValue("hasCipherTenure") === "yes";
}

function getCipherTenureValue() {
  if (!hasCipherTenure()) return "lt1";
  return getSelectedValue("cipherTenure");
}

function syncCipherTenureFields() {
  const details = document.getElementById("cipher-tenure-details");
  const show = hasCipherTenure();
  if (details) details.hidden = !show;
  if (!show) {
    clearChecked("cipherTenure");
  }
}

function isQualificationFilled() {
  if (!isSecrecyFilled()) return false;
  if (hasClassQualification() && !getSelectedValue("classQualification")) return false;
  if (requiresMedicalQualification()) {
    if (!getSelectedValue("medicalQualCategory")) return false;
    if (!getSelectedValue("medicalQualPost")) return false;
  }
  if (requiresExtraRankDetails()) {
    for (let i = 0; i < EXTRA_RANK_ITEMS.length; i += 1) {
      const item = EXTRA_RANK_ITEMS[i];
      if (hasExtraRankItem(item.switchName) && !getSelectedValue(item.radioName)) {
        return false;
      }
    }
  }
  return true;
}

function hasClassQualification() {
  return getYesNoValue("hasClassQualification") === "yes";
}

function getClassQualificationValue() {
  if (!hasClassQualification()) return "none";
  return getSelectedValue("classQualification");
}

function requiresMedicalQualification() {
  return getClassQualificationValue() === "medical";
}

function syncClassQualificationFields() {
  const details = document.getElementById("class-qualification-details");
  const show = hasClassQualification();
  if (details) details.hidden = !show;
  if (!show) {
    clearChecked("classQualification");
  }
  syncMedicalQualificationFields();
}

function syncMedicalQualificationFields() {
  const show = requiresMedicalQualification();
  ["field-medical-qual-category", "field-medical-qual-post"].forEach(function (id) {
    const field = document.getElementById(id);
    if (!field) return;
    field.hidden = !show;
  });
  if (!show) {
    clearChecked("medicalQualCategory");
    clearChecked("medicalQualPost");
  }
}

const EXTRA_RANK_ITEMS = [
  {
    switchName: "hasHonoraryTitle",
    radioName: "honoraryTitle",
    detailsId: "honorary-title-details",
  },
  {
    switchName: "hasSportsTitle",
    radioName: "sportsTitle",
    detailsId: "sports-title-details",
  },
  {
    switchName: "hasScienceDegree",
    radioName: "scienceDegree",
    detailsId: "science-degree-details",
  },
  {
    switchName: "hasAcademicTitle",
    radioName: "academicTitle",
    detailsId: "academic-title-details",
  },
];

function requiresExtraRankDetails() {
  return getYesNoValue("extraRanks") === "yes";
}

function hasExtraRankItem(switchName) {
  return getYesNoValue(switchName) === "yes";
}

function getExtraRankItemValue(switchName, radioName) {
  if (!requiresExtraRankDetails() || !hasExtraRankItem(switchName)) return "none";
  return getSelectedValue(radioName) || "none";
}

function syncExtraRankDetailsFields() {
  const wrap = document.getElementById("extra-ranks-details");
  const show = requiresExtraRankDetails();
  if (wrap) wrap.hidden = !show;

  EXTRA_RANK_ITEMS.forEach(function (item) {
    const details = document.getElementById(item.detailsId);
    const itemShow = show && hasExtraRankItem(item.switchName);
    if (details) details.hidden = !itemShow;
    if (!itemShow) {
      clearChecked(item.radioName);
    }
    if (!show) {
      clearChecked(item.switchName);
    }
  });
}

function requiresViolationType() {
  return getYesNoValue("hasViolations") === "yes";
}

function syncDisciplineFields() {
  const details = document.getElementById("discipline-details");
  const show = requiresViolationType();
  if (details) details.hidden = !show;

  if (!show) {
    clearChecked("violationType");
  }

  const type = show ? getSelectedValue("violationType") : null;
  VIOLATION_DETAIL_FIELDS.forEach(function (item) {
    const field = document.getElementById(item.fieldId);
    const itemShow = Boolean(type && type === item.type);
    if (field) field.hidden = !itemShow;
    if (!itemShow) clearChecked(item.name);
  });
}

function syncDisciplineDisclaimer() {
  syncDisciplineFields();
}

function isDisciplineFilled() {
  if (getYesNoValue("hasViolations") !== "yes") return true;
  const type = getSelectedValue("violationType");
  if (!type) return false;
  for (let i = 0; i < VIOLATION_DETAIL_FIELDS.length; i += 1) {
    const item = VIOLATION_DETAIL_FIELDS[i];
    if (item.type === type) return Boolean(getSelectedValue(item.name));
  }
  return false;
}

function getDefaultSettlementDate() {
  const now = new Date();
  let year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (year < SETTLEMENT_YEAR_MIN) year = SETTLEMENT_YEAR_MIN;
  if (year > SETTLEMENT_YEAR_MAX) year = SETTLEMENT_YEAR_MAX;
  return { year: year, month: month };
}

function applyDefaultSettlementPeriod() {
  const def = getDefaultSettlementDate();
  if (settlementMonthInput) settlementMonthInput.value = String(def.month);
  if (settlementYearInput) settlementYearInput.value = String(def.year);
  updateSettlementPeriodDisplay();
}

function parseSettlementYear() {
  if (!settlementYearInput) return { ok: false };
  const raw = String(settlementYearInput.value || "").trim();
  if (!raw || !/^\d+$/.test(raw)) return { ok: false };
  const n = Number.parseInt(raw, 10);
  if (n < SETTLEMENT_YEAR_MIN || n > SETTLEMENT_YEAR_MAX) return { ok: false, n };
  return { ok: true, n };
}

function updateSettlementPeriodDisplay() {
  const month = getSettlementMonth();
  const year = parseSettlementYear();
  if (settlementPeriodLabel) {
    const monthName = MONTH_LABELS[month] || "";
    settlementPeriodLabel.textContent = year.ok
      ? monthName + " " + year.n
      : monthName;
  }
  const monthNum = Number(month);
  const atMin = year.ok && monthNum === 1 && year.n === SETTLEMENT_YEAR_MIN;
  const atMax = year.ok && monthNum === 12 && year.n === SETTLEMENT_YEAR_MAX;
  if (settlementPeriodDec) settlementPeriodDec.disabled = atMin;
  if (settlementPeriodInc) settlementPeriodInc.disabled = atMax;
}

function applySettlementPeriodDelta(deltaMonths) {
  const yearResult = parseSettlementYear();
  let month = Number(getSettlementMonth() || 1);
  let year = yearResult.ok ? yearResult.n : SETTLEMENT_YEAR_MIN;
  month += deltaMonths;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  if (year < SETTLEMENT_YEAR_MIN || year > SETTLEMENT_YEAR_MAX) return;
  if (settlementMonthInput) settlementMonthInput.value = String(month);
  if (settlementYearInput) settlementYearInput.value = String(year);
  updateSettlementPeriodDisplay();
  onWizardInputChange();
}

function getSettlementMonth() {
  return settlementMonthInput && settlementMonthInput.value
    ? settlementMonthInput.value
    : null;
}

function getDaysInSettlementMonth() {
  const month = getSettlementMonth();
  const year = parseSettlementYear();
  if (!month || !year.ok) return null;
  return new Date(year.n, Number(month), 0).getDate();
}

function getDaysInput(rewardId) {
  return document.getElementById("days-" + rewardId);
}

function parseDaysValue(rewardId) {
  const input = getDaysInput(rewardId);
  if (!input) return { ok: false };
  const raw = input.value.trim();
  if (!raw || !/^\d+$/.test(raw)) return { ok: false };
  const n = Number.parseInt(raw, 10);
  if (n < 0) return { ok: false, n };
  return { ok: true, n };
}

function getRewardChoice(rewardId) {
  return getYesNoValue("reward_" + rewardId);
}

function getRewardGroupChoice(groupId) {
  return getYesNoValue("rewardGroup_" + groupId);
}

function clearRewardItem(rewardId) {
  clearChecked("reward_" + rewardId);
  const daysInput = getDaysInput(rewardId);
  if (daysInput) daysInput.value = "0";
  syncRewardDaysField(rewardId);
}

function syncRewardDaysField(rewardId) {
  const field = document.getElementById("field-days-" + rewardId);
  if (!field) return;
  const show = getRewardChoice(rewardId) === "yes";
  field.hidden = !show;
  if (!show) {
    const input = getDaysInput(rewardId);
    if (input) input.value = "0";
  }
  const card = field.parentElement;
  if (card && card.classList.contains("switch-group-card")) {
    const info = card.querySelector(":scope > .wizard-info-box");
    if (info) info.hidden = !show;
  }
}

function syncRewardGroupDetails(group) {
  const details = document.getElementById("reward-group-" + group.id + "-details");
  if (!details) return;

  const show = getRewardGroupChoice(group.id) === "yes";
  details.hidden = !show;

  const card = details.parentElement;
  if (card) {
    const info = card.querySelector(":scope > .wizard-info-box");
    if (info) info.hidden = !show;
  }

  if (!show) {
    group.rewardIds.forEach(clearRewardItem);
    return;
  }

  group.rewardIds.forEach(syncRewardDaysField);
}

function syncAllRewardGroupDetails() {
  REWARD_GROUPS.forEach(syncRewardGroupDetails);
  syncRewardDaysField(TRAINING_LEAVE_ID);
}

function sumPoolDays(rewardIds) {
  let total = 0;
  for (let i = 0; i < rewardIds.length; i += 1) {
    const id = rewardIds[i];
    if (getRewardChoice(id) !== "yes") continue;
    const parsed = parseDaysValue(id);
    if (!parsed.ok) return null;
    total += parsed.n;
  }
  return total;
}

const ADDITIONAL_POOL_IDS = REWARD_GROUP_COMBAT_IDS.concat(
  REWARD_GROUP_TRAINING_IDS,
  [TRAINING_LEAVE_ID]
);
const ONETIME_POOL_IDS = REWARD_GROUP_ONETIME_IDS.slice();
const ASSAULT_POOL_IDS = REWARD_GROUP_ASSAULT_IDS.slice();

function getRewardPoolIds(rewardId) {
  if (ONETIME_POOL_IDS.indexOf(rewardId) !== -1) return ONETIME_POOL_IDS;
  if (ASSAULT_POOL_IDS.indexOf(rewardId) !== -1) return ASSAULT_POOL_IDS;
  return ADDITIONAL_POOL_IDS;
}

function daysWord(n) {
  const abs = Math.abs(Number(n));
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дні";
  return "днів";
}

function setDaysBadge(el, used, monthDays) {
  if (!el) return;
  if (monthDays == null || used == null) {
    el.textContent = "Можна вказати ще — днів";
    el.classList.remove("is-over");
    return;
  }
  const left = Math.max(0, monthDays - used);
  el.textContent = "Можна вказати ще " + left + " " + daysWord(left);
  el.classList.toggle("is-over", used > monthDays);
}

function setDaysBadges(pool, used, monthDays) {
  document.querySelectorAll('[data-days-badge="' + pool + '"]').forEach(function (el) {
    setDaysBadge(el, used, monthDays);
  });
}

function updateDaysBadges() {
  const monthDays = getDaysInSettlementMonth();
  setDaysBadges("additional", sumPoolDays(ADDITIONAL_POOL_IDS), monthDays);
  setDaysBadges("onetime", sumPoolDays(ONETIME_POOL_IDS), monthDays);
  setDaysBadges("assault", sumPoolDays(ASSAULT_POOL_IDS), monthDays);
}

function formatRewardLiveAmount(value) {
  return formatMoney(value) + " грн";
}

function computeRewardLiveAmount(rewardId, days, monthDays) {
  const def = REWARD_DEFS[rewardId];
  if (!def || def.amount <= 0 || monthDays == null || monthDays <= 0) return null;
  if (def.kind === "storm") return round2(def.amount * days);
  return round2((def.amount / monthDays) * days);
}

function updateRewardAmounts() {
  const monthDays = getDaysInSettlementMonth();
  document.querySelectorAll("[data-reward-amount]").forEach(function (el) {
    const id = el.getAttribute("data-reward-amount");
    const parsed = parseDaysValue(id);
    const amount =
      parsed.ok ? computeRewardLiveAmount(id, parsed.n, monthDays) : null;
    el.textContent =
      "Сума винагороди: " +
      (amount == null ? "—" : formatRewardLiveAmount(amount));
  });
}

function poolExceeds(rewardIds, monthDays) {
  const used = sumPoolDays(rewardIds);
  return used != null && used > monthDays;
}

function areRewardItemsFilled(rewardIds) {
  const monthDays = getDaysInSettlementMonth();
  if (monthDays == null) return false;

  for (let i = 0; i < rewardIds.length; i += 1) {
    const id = rewardIds[i];
    const choice = getRewardChoice(id);
    if (!choice) return false;
    if (choice === "yes") {
      const parsed = parseDaysValue(id);
      if (!parsed.ok || parsed.n > monthDays) return false;
    }
  }
  return true;
}

function isPeriodFilled() {
  if (!getSettlementMonth()) return false;
  return parseSettlementYear().ok;
}

function areRewardGroupsFilled(groups) {
  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    const choice = getRewardGroupChoice(group.id);
    if (!choice) return false;
    if (choice === "yes" && !areRewardItemsFilled(group.rewardIds)) return false;
  }
  return true;
}

function isRewardsPrimaryFilled() {
  const monthDays = getDaysInSettlementMonth();
  if (monthDays == null) return false;
  if (!isPeriodFilled()) return false;
  if (!areRewardGroupsFilled(REWARD_GROUPS_PRIMARY)) return false;
  if (poolExceeds(ONETIME_POOL_IDS, monthDays)) return false;
  if (poolExceeds(ASSAULT_POOL_IDS, monthDays)) return false;
  return true;
}

function isRewardsAdditionalFilled() {
  const monthDays = getDaysInSettlementMonth();
  if (monthDays == null) return false;
  if (!areRewardGroupsFilled(REWARD_GROUPS_ADDITIONAL)) return false;
  if (!areRewardItemsFilled([TRAINING_LEAVE_ID])) return false;
  if (poolExceeds(ADDITIONAL_POOL_IDS, monthDays)) return false;
  return true;
}

function parseNumberInput(id, min, max) {
  const input = document.getElementById(id);
  if (!input) return { ok: false };
  const raw = input.value.trim();
  if (!raw || !/^\d+$/.test(raw)) return { ok: false };
  const n = Number.parseInt(raw, 10);
  if (n < min || n > max) return { ok: false, n };
  return { ok: true, n };
}

function hasEnemiesDestruction() {
  return getYesNoValue("hasEnemiesDestruction") === "yes";
}

function hasPrisonersCapture() {
  return getYesNoValue("hasPrisoners") === "yes";
}

function resetCombatResultFields(countId, participantsId) {
  const count = document.getElementById(countId);
  const participants = document.getElementById(participantsId);
  if (count) count.value = "1";
  if (participants) participants.value = "1";
}

function syncCombatResultsFields() {
  const enemiesDetails = document.getElementById("enemies-details");
  const prisonersDetails = document.getElementById("prisoners-details");
  const disclaimer = document.getElementById("combat-results-disclaimer");
  const showEnemies = hasEnemiesDestruction();
  const showPrisoners = hasPrisonersCapture();

  if (enemiesDetails) enemiesDetails.hidden = !showEnemies;
  if (prisonersDetails) prisonersDetails.hidden = !showPrisoners;

  if (!showEnemies) resetCombatResultFields("enemies-count", "enemies-participants");
  if (!showPrisoners) resetCombatResultFields("prisoners-count", "prisoners-participants");

  if (!disclaimer) return;
  const showDisclaimer = showEnemies || showPrisoners;
  disclaimer.hidden = !showDisclaimer;
  if (!showDisclaimer) return;

  const host = showEnemies ? enemiesDetails : prisonersDetails;
  if (host && host.firstElementChild !== disclaimer) {
    host.insertBefore(disclaimer, host.firstChild);
  }
}

function isCombatResultsFilled() {
  if (hasEnemiesDestruction()) {
    if (!parseNumberInput("enemies-count", 1, 999).ok) return false;
    if (!parseNumberInput("enemies-participants", 1, 999).ok) return false;
  }
  if (hasPrisonersCapture()) {
    if (!parseNumberInput("prisoners-count", 1, 999).ok) return false;
    if (!parseNumberInput("prisoners-participants", 1, 999).ok) return false;
  }
  return true;
}

function isStepFilled(stepId) {
  const meta = STEP_META[stepId];
  if (meta && meta.placeholder) return true;

  switch (stepId) {
    case "basics":
      return isBasicsFilled();
    case "years":
      return isYearsFilled();
    case "conditions":
      return isConditionsFilled();
    case "qualification":
      return isQualificationFilled();
    case "discipline":
      return isDisciplineFilled();
    case "rewards":
      return isRewardsPrimaryFilled();
    case "rewards_additional":
      return isRewardsAdditionalFilled();
    case "combat_results":
      return isCombatResultsFilled();
    default:
      return false;
  }
}

function validateCurrentStep(stepId) {
  if (!isStepFilled(stepId)) {
    if (stepId === "rewards" || stepId === "rewards_additional") {
      const monthDays = getDaysInSettlementMonth();
      if (monthDays != null) {
        const monthName =
          MONTH_LABELS[getSettlementMonth()] || "вибраному місяці";
        if (
          stepId === "rewards_additional" &&
          poolExceeds(ADDITIONAL_POOL_IDS, monthDays)
        ) {
          return [
            "Загальна кількість днів додаткових винагород не може перевищувати кількість календарних днів у " +
              monthName +
              " (" +
              monthDays +
              "). Якщо за один день ви мали право на кілька винагород, врахуйте його лише для винагороди більшого розміру.",
          ];
        }
        if (stepId === "rewards" && poolExceeds(ONETIME_POOL_IDS, monthDays)) {
          return [
            "Загальна кількість днів одноразових винагород не може перевищувати кількість календарних днів у " +
              monthName +
              " (" +
              monthDays +
              "). Якщо за один день ви мали право на обидві винагороди, врахуйте його лише для винагороди більшого розміру.",
          ];
        }
        if (stepId === "rewards" && poolExceeds(ASSAULT_POOL_IDS, monthDays)) {
          return [
            "Загальна кількість днів штурмових винагород не може перевищувати кількість календарних днів у " +
              monthName +
              " (" +
              monthDays +
              "). Якщо за один день ви мали право на обидві винагороди, врахуйте його лише для винагороди більшого розміру.",
          ];
        }
      }
    }
    return ["Заповніть усі поля на цьому кроці, щоб продовжити."];
  }
  return [];
}

function clearWizardError() {
  if (!wizardError) return;
  wizardError.hidden = true;
  wizardError.textContent = "";
}

function showWizardError(message) {
  if (!wizardError) return;
  wizardError.textContent = message;
  wizardError.hidden = false;
}

function updateContinueButton() {
  if (!wizardContinue) return;
  const stepId = getCurrentStepId();
  wizardContinue.disabled = !isStepFilled(stepId);
  wizardContinue.textContent =
    currentStepIndex === WIZARD_STEP_COUNT - 1 ? "Розрахувати" : "Продовжити";
}

function renderWizardStep() {
  const stepId = getCurrentStepId();

  wizardSteps.forEach(function (el) {
    el.hidden = el.dataset.stepId !== stepId;
  });

  if (wizardProgress) {
    wizardProgress.textContent = currentStepIndex + 1 + "/" + WIZARD_STEP_COUNT;
  }

  if (wizardQuestion) {
    wizardQuestion.textContent = STEP_META[stepId].title;
  }

  if (wizardHelp) {
    wizardHelp.textContent = STEP_META[stepId].help || "";
  }

  if (wizardBack) {
    wizardBack.hidden = currentStepIndex === 0;
  }

  syncAllRewardGroupDetails();
  updateDaysBadges();
  updateRewardAmounts();
  updateCombatShares();
  clearWizardError();
  updateContinueButton();
}

function collectAnswersSummary() {
  const items = [];

  const rank = getSelectedValue("rank");
  if (rank) {
    items.push({ label: "Рівень звання", value: RANK_LABELS[rank] || rank });
  }

  const rankTitle = getSelectedRankTitleLabel();
  if (rankTitle) {
    items.push({ label: "Звання", value: rankTitle });
  }

  const tariff = parseTariff();
  if (tariff.ok) {
    items.push({ label: "Тарифний розряд", value: String(tariff.n) });
  }

  const years = getSelectedValue("years");
  if (years) {
    items.push({
      label: "Вислуга років (повні роки, без місяців)",
      value: YEARS_LABELS[years] || years,
    });
  }

  const servicePlace = getSelectedValue("servicePlace");
  if (servicePlace) {
    items.push({
      label: "Місце проходження служби",
      value: SERVICE_PLACE_LABELS[servicePlace] || servicePlace,
    });
  }

  const ssoPosition = getSelectedValue("ssoPosition");
  if (ssoPosition) {
    items.push({
      label: "Посада в ССО",
      value: SSO_POSITION_LABELS[ssoPosition] || ssoPosition,
    });
  }

  const nopsMode = getSelectedValue("nopsMode");
  if (nopsMode === "other") {
    items.push({
      label: "Розмір надбавки за особливості проходження служби (НОПС)",
      value: NOPS_MODE_LABELS.other,
    });
  } else if (nopsMode) {
    items.push({
      label: "Розмір надбавки за особливості проходження служби (НОПС)",
      value:
        NOPS_MODE_LABELS.default + " (" + formatNopsPct(getDefaultNopsPct()) + ")",
    });
  }

  const nopsCategory = getSelectedValue("nopsCategory");
  if (nopsCategory) {
    const category = getNopsCategory(nopsCategory);
    const displayPct = nopsCategoryDisplayPct(category);
    const skipSpec = nopsCategorySkipsSpecialization(category);
    const firstSpec =
      skipSpec && category ? getVisibleNopsSpecs(category)[0] : null;
    items.push({
      label: "Напрям служби (для визначення розміру надбавки)",
      value:
        (category ? category.label : nopsCategory) +
        (firstSpec
          ? " (" + formatNopsSpecRadioTerm(firstSpec) + ")"
          : displayPct != null
            ? " (" + formatNopsPct(displayPct) + ")"
            : ""),
    });
  }

  const nopsSpec = getSelectedNopsSpec();
  const nopsCategoryObj = nopsCategory ? getNopsCategory(nopsCategory) : null;
  if (nopsSpec && !nopsCategorySkipsSpecialization(nopsCategoryObj)) {
    items.push({
      label: "Спеціалізація (для визначення розміру надбавки)",
      value: nopsSpec.label + " (" + formatNopsSpecRadioTerm(nopsSpec) + ")",
    });
  }

  const secrecy = getSecrecyValue();
  if (secrecy) {
    items.push({
      label: "Ступінь секретності",
      value: SECRECY_LABELS[secrecy] || secrecy,
    });
  }

  if (requiresRsoAffiliation()) {
    const rsoAffiliation = getYesNoValue("rsoAffiliation");
    items.push({
      label: "Служу в режимно-секретному органі",
      value: RSO_AFFILIATION_LABELS[rsoAffiliation] || rsoAffiliation,
    });
  }

  const cipherTenure = getCipherTenureValue();
  if (cipherTenure) {
    items.push({
      label: "Безперервний стаж на шифрувальній роботі",
      value: CIPHER_TENURE_LABELS[cipherTenure] || cipherTenure,
    });
  }

  const classQualification = getClassQualificationValue();
  if (classQualification) {
    items.push({
      label: "Присвоєна класна кваліфікація",
      value: CLASS_QUALIFICATION_LABELS[classQualification] || classQualification,
    });
  }

  const medicalQualCategory = getSelectedValue("medicalQualCategory");
  if (medicalQualCategory) {
    items.push({
      label: "Медична кваліфікаційна категорія",
      value: MEDICAL_QUAL_CATEGORY_LABELS[medicalQualCategory] || medicalQualCategory,
    });
  }

  const medicalQualPost = getSelectedValue("medicalQualPost");
  if (medicalQualPost) {
    items.push({
      label: "Посада медичного і фармацевтичного складу",
      value: MEDICAL_QUAL_POST_LABELS[medicalQualPost] || medicalQualPost,
    });
  }

  const extraRanks = getYesNoValue("extraRanks");
  if (extraRanks) {
    items.push({
      label: "Додаткові звання за профілем посади",
      value: EXTRA_RANKS_LABELS[extraRanks] || extraRanks,
    });
  }

  const honoraryTitle = getExtraRankItemValue("hasHonoraryTitle", "honoraryTitle");
  if (requiresExtraRankDetails()) {
    items.push({
      label: "Почесне звання",
      value: HONORARY_TITLE_LABELS[honoraryTitle] || honoraryTitle,
    });
  }

  const sportsTitle = getExtraRankItemValue("hasSportsTitle", "sportsTitle");
  if (requiresExtraRankDetails()) {
    items.push({
      label: "Спортивне звання",
      value: SPORTS_TITLE_LABELS[sportsTitle] || sportsTitle,
    });
  }

  const scienceDegree = getExtraRankItemValue("hasScienceDegree", "scienceDegree");
  if (requiresExtraRankDetails()) {
    items.push({
      label: "Науковий ступінь",
      value: SCIENCE_DEGREE_LABELS[scienceDegree] || scienceDegree,
    });
  }

  const academicTitle = getExtraRankItemValue("hasAcademicTitle", "academicTitle");
  if (requiresExtraRankDetails()) {
    items.push({
      label: "Вчене звання",
      value: ACADEMIC_TITLE_LABELS[academicTitle] || academicTitle,
    });
  }

  const settlementMonth = getSettlementMonth();
  if (settlementMonth) {
    items.push({
      label: "Розрахунковий місяць",
      value: MONTH_LABELS[settlementMonth] || settlementMonth,
    });
  }

  const settlementYear = parseSettlementYear();
  if (settlementYear.ok) {
    items.push({ label: "Рік", value: String(settlementYear.n) });
  }

  function pushRewardSummary(rewardIds) {
    rewardIds.forEach(function (id) {
      const choice = getRewardChoice(id);
      if (!choice) return;
      const label = REWARD_LABELS[id] || id;
      if (choice === "no") {
        items.push({ label: label, value: "Ні" });
        return;
      }
      const days = parseDaysValue(id);
      items.push({
        label: label,
        value: "Так" + (days.ok ? ", " + days.n + " дн." : ""),
      });
    });
  }

  REWARD_GROUPS.forEach(function (group) {
    const choice = getRewardGroupChoice(group.id);
    if (!choice) return;
    items.push({
      label: group.summaryLabel,
      value: REWARD_GROUP_LABELS[choice] || choice,
    });
    if (choice === "yes") {
      pushRewardSummary(group.rewardIds);
    }
  });

  pushRewardSummary([TRAINING_LEAVE_ID]);

  const hasEnemies = getYesNoValue("hasEnemiesDestruction");
  if (hasEnemies) {
    items.push({
      label: "Знищення живої сили противника",
      value: hasEnemies === "yes" ? "Так" : "Ні",
    });
    if (hasEnemies === "yes") {
      const enemiesCount = parseNumberInput("enemies-count", 1, 999);
      if (enemiesCount.ok) {
        items.push({
          label: "Кількість знищених ворогів",
          value: String(enemiesCount.n),
        });
      }
      const enemiesParticipants = parseNumberInput("enemies-participants", 1, 999);
      if (enemiesParticipants.ok) {
        items.push({
          label: "Учасники знищення",
          value: String(enemiesParticipants.n),
        });
      }
    }
  }

  const hasPrisoners = getYesNoValue("hasPrisoners");
  if (hasPrisoners) {
    items.push({
      label: "Взяття противника в полон",
      value: hasPrisoners === "yes" ? "Так" : "Ні",
    });
    if (hasPrisoners === "yes") {
      const prisonersCount = parseNumberInput("prisoners-count", 1, 999);
      if (prisonersCount.ok) {
        items.push({
          label: "Кількість полонених",
          value: String(prisonersCount.n),
        });
      }
      const prisonersParticipants = parseNumberInput("prisoners-participants", 1, 999);
      if (prisonersParticipants.ok) {
        items.push({
          label: "Учасники взяття в полон",
          value: String(prisonersParticipants.n),
        });
      }
    }
  }

  const hasViolations = getYesNoValue("hasViolations");
  if (hasViolations) {
    items.push({
      label:
        "Чи були у вас порушення військової дисципліни або незадовільне виконання службових обов’язків у розрахунковому місяці?",
      value: HAS_VIOLATIONS_LABELS[hasViolations] || hasViolations,
    });
  }
  if (hasViolations === "yes") {
    const violationType = getSelectedValue("violationType");
    if (violationType) {
      items.push({
        label: "Тип порушення",
        value: VIOLATION_TYPE_LABELS[violationType] || violationType,
      });
    }
    VIOLATION_DETAIL_FIELDS.forEach(function (item) {
      const value = getSelectedValue(item.name);
      if (!value) return;
      items.push({
        label: "Порушення",
        value: item.labels[value] || value,
      });
    });
  }

  return items;
}

function resolveNopsPct() {
  if (getSelectedValue("nopsMode") !== "other") return getDefaultNopsPct();
  const spec = getSelectedNopsSpec();
  return spec ? spec.nopsPct : getDefaultNopsPct();
}

function resolvePremiumOverride() {
  return resolveSpecPremiumPct(getSelectedNopsSpec());
}

function resolveSsoAllowancePct() {
  if (!requiresSsoPosition()) return 0;
  return SSO_ALLOWANCE_PCT[getSelectedValue("ssoPosition")] || 0;
}

function collectRewardDays() {
  /** @type {Record<string, number>} */
  const days = {};
  ALL_REWARD_IDS.forEach(function (id) {
    if (getRewardChoice(id) !== "yes") {
      days[id] = 0;
      return;
    }
    const parsed = parseDaysValue(id);
    days[id] = parsed.ok ? parsed.n : 0;
  });
  return days;
}

function buildCalcInput() {
  const rankTitle = getSelectedRankTitleLabel();
  const tariff = parseTariff();
  const yearsKey = getSelectedValue("years");
  const servicePlace = getSelectedValue("servicePlace");
  const settlementMonth = getSettlementMonth();
  const settlementYear = parseSettlementYear();
  const extraRanks = getYesNoValue("extraRanks");
  const classQualification = getClassQualificationValue();
  const spec = getSelectedNopsSpec();

  if (
    !rankTitle ||
    !tariff.ok ||
    !yearsKey ||
    !servicePlace ||
    !settlementMonth ||
    !settlementYear.ok
  ) {
    return null;
  }

  const hasExtra = extraRanks === "yes";

  return {
    rankTitle: rankTitle,
    tariff: tariff.n,
    yearsKey: yearsKey,
    servicePlace: servicePlace,
    nopsPct: resolveNopsPct(),
    premiumPctOverride: resolvePremiumOverride(),
    secrecy: getSecrecyValue() || "none",
    isRso: getYesNoValue("rsoAffiliation") === "yes",
    classQualification: classQualification || "none",
    medicalQualCategory: getSelectedValue("medicalQualCategory") || "",
    medicalQualPost: getSelectedValue("medicalQualPost") || "",
    isPilot: Boolean(
      classQualification === "sniper" || (spec && spec.isPilot)
    ),
    extraRanks: hasExtra,
    honoraryTitle: getExtraRankItemValue("hasHonoraryTitle", "honoraryTitle"),
    sportsTitle: getExtraRankItemValue("hasSportsTitle", "sportsTitle"),
    scienceDegree: getExtraRankItemValue("hasScienceDegree", "scienceDegree"),
    academicTitle: getExtraRankItemValue("hasAcademicTitle", "academicTitle"),
    cipherTenure: getCipherTenureValue() || "lt1",
    month: Number(settlementMonth),
    year: settlementYear.n,
    rewardDays: collectRewardDays(),
    prisonersCount: hasPrisonersCapture()
      ? (function () {
          const parsed = parseNumberInput("prisoners-count", 1, 999);
          return parsed.ok ? parsed.n : 0;
        })()
      : 0,
    prisonersParticipants: hasPrisonersCapture()
      ? (function () {
          const parsed = parseNumberInput("prisoners-participants", 1, 999);
          return parsed.ok ? parsed.n : 1;
        })()
      : 1,
    enemiesCount: hasEnemiesDestruction()
      ? (function () {
          const parsed = parseNumberInput("enemies-count", 1, 999);
          return parsed.ok ? parsed.n : 0;
        })()
      : 0,
    enemiesParticipants: hasEnemiesDestruction()
      ? (function () {
          const parsed = parseNumberInput("enemies-participants", 1, 999);
          return parsed.ok ? parsed.n : 1;
        })()
      : 1,
    hasViolations: getYesNoValue("hasViolations") === "yes",
    disciplinaryViolation: getSelectedValue("disciplinaryViolation") || "",
    ssoAllowancePct: resolveSsoAllowancePct(),
  };
}

function renderInputSummary() {
  if (!wizardResultsInputsList) return;

  wizardResultsInputsList.replaceChildren();
  collectAnswersSummary().forEach(function (item) {
    const wrap = document.createElement("div");
    wrap.className = "input-summary__row";

    const dt = document.createElement("dt");
    dt.className = "input-summary__label";
    dt.textContent = item.label;

    const dd = document.createElement("dd");
    dd.className = "input-summary__value";
    dd.textContent = item.value;

    wrap.appendChild(dt);
    wrap.appendChild(dd);
    wizardResultsInputsList.appendChild(wrap);
  });
}

function renderNetPay(result) {
  if (!wizardResultsTotal) return;
  wizardResultsTotal.textContent = formatMoney(result.netPay) + " грн";
}

function appendResultCell(row, text, className) {
  const cell = document.createElement("td");
  cell.className = className;
  cell.textContent = text || "";
  row.appendChild(cell);
  return cell;
}

const WIZARD_INFO_ICON_SVG =
  '<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7.25" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="5.25" r="0.9" fill="currentColor"/><path d="M8 7.25V11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

function createWizardInfoBox(title, text) {
  const box = document.createElement("div");
  box.className = "wizard-info-box wizard-info-box--with-icon";
  box.setAttribute("role", "note");

  const icon = document.createElement("span");
  icon.className = "wizard-info-box__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = WIZARD_INFO_ICON_SVG;

  const body = document.createElement("div");
  body.className = "wizard-info-box__body";

  if (title) {
    const titleEl = document.createElement("p");
    titleEl.className = "wizard-info-box__title";
    titleEl.textContent = title;
    body.appendChild(titleEl);
  }

  const textEl = document.createElement("p");
  textEl.className = "wizard-info-box__text";
  textEl.textContent = text;
  body.appendChild(textEl);

  box.append(icon, body);
  return box;
}

function renderExplanation(result) {
  if (!wizardResultsExplanation) return;

  wizardResultsExplanation.replaceChildren();

  buildResultLines(result).forEach(function (line) {
    const row = document.createElement("tr");
    row.className = "results-table__row";

    if (line.rowType === "separator" || line.rowType === "subtotal") {
      row.classList.add("results-table__row--total");
    }
    if (line.rowType === "final") {
      row.classList.add("results-table__row--final");
    }
    if (line.negative) {
      row.classList.add("results-table__row--negative");
    }
    if (line.error && line.nonBlocking) {
      row.classList.add("results-table__row--info");
    }
    if (line.error && !line.nonBlocking) {
      row.classList.add("results-table__row--error");
    }

    if (line.error && line.value == null) {
      const cell = document.createElement("td");
      cell.colSpan = 4;
      if (line.nonBlocking) {
        cell.className = "results-table__info";
        cell.appendChild(createWizardInfoBox("", line.error));
      } else {
        cell.className = "results-table__error";
        cell.textContent = line.error;
      }
      row.appendChild(cell);
      wizardResultsExplanation.appendChild(row);
      return;
    }

    const nameCell = appendResultCell(row, line.name, "results-table__name");
    if (line.abbr) {
      const abbrNote = document.createElement("span");
      abbrNote.className = "results-table__name-abbr";
      abbrNote.textContent = " (" + line.abbr + ")";
      nameCell.appendChild(abbrNote);
    }
    appendResultCell(
      row,
      line.value == null ? "" : formatMoney(line.value),
      "results-table__value"
    );
    appendResultCell(row, line.abbr || "", "results-table__abbr");
    const calcCell = appendResultCell(row, line.calc || "", "results-table__calc");
    if (line.calcSuffix) {
      calcCell.appendChild(document.createTextNode(" "));
      const suffix = document.createElement("span");
      suffix.className = "results-table__calc-cut";
      suffix.textContent = line.calcSuffix;
      calcCell.appendChild(suffix);
    }

    wizardResultsExplanation.appendChild(row);
  });
}

function showWizardResultsView() {
  if (wizardPanel) wizardPanel.hidden = true;
  if (wizardResults) wizardResults.hidden = false;
  document.body.classList.add("wizard-results-ready");
}

function showResults(result) {
  renderNetPay(result);
  renderExplanation(result);
  renderInputSummary();
  showWizardResultsView();
}

function showWizardFromResults() {
  document.body.classList.remove("wizard-results-ready");
  if (wizardResults) wizardResults.hidden = true;
  if (wizardPanel) wizardPanel.hidden = false;
  renderWizardStep();
}

function editWizardFromResults() {
  currentStepIndex = 0;
  showWizardFromResults();
  scrollWizardToTop();
}

function scrollWizardToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function goToNextStep() {
  const stepId = getCurrentStepId();
  const errors = validateCurrentStep(stepId);

  if (errors.length) {
    showWizardError(errors[0]);
    return;
  }

  clearWizardError();

  if (currentStepIndex < WIZARD_STEP_COUNT - 1) {
    currentStepIndex += 1;
    renderWizardStep();
    scrollWizardToTop();
    return;
  }

  try {
    const input = buildCalcInput();
    if (!input) {
      showWizardError("Перевірте, що всі обов’язкові поля заповнені.");
      return;
    }
    const result = calculate(input);
    showResults(result);
    scrollWizardToTop();
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Не вдалося виконати розрахунок.";
    showWizardError(message);
  }
}

function goToPreviousStep() {
  if (currentStepIndex === 0) return;
  currentStepIndex -= 1;
  renderWizardStep();
}

function formatCombatShare(count, participants, rate) {
  if (!count.ok || !participants.ok || count.n < 1 || participants.n < 1) {
    return "—";
  }
  return formatMoney((rate * count.n) / participants.n) + " грн";
}

function updateCombatShares() {
  const enemiesShare = document.getElementById("enemies-share");
  const prisonersShare = document.getElementById("prisoners-share");
  const enemiesCount = parseNumberInput("enemies-count", 1, 999);
  const enemiesParticipants = parseNumberInput("enemies-participants", 1, 999);
  const prisonersCount = parseNumberInput("prisoners-count", 1, 999);
  const prisonersParticipants = parseNumberInput("prisoners-participants", 1, 999);

  if (enemiesShare) {
    enemiesShare.textContent =
      "Ваша частка винагороди за знищення: " +
      formatCombatShare(enemiesCount, enemiesParticipants, 15000);
  }
  if (prisonersShare) {
    prisonersShare.textContent =
      "Ваша частка винагороди за взяття в полон: " +
      formatCombatShare(prisonersCount, prisonersParticipants, 100000);
  }
}

function onWizardInputChange() {
  syncNopsFields();
  syncSecrecyFields();
  syncCipherTenureFields();
  syncClassQualificationFields();
  syncExtraRankDetailsFields();
  syncDisciplineDisclaimer();
  syncAllRewardGroupDetails();
  syncCombatResultsFields();
  updateDaysBadges();
  updateRewardAmounts();
  updateCombatShares();
  clearWizardError();
  updateContinueButton();
}

function onRankChange() {
  syncRankTitleField();
  validateTariff();
  onWizardInputChange();
}

function clearChecked(name) {
  document.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
    input.checked = false;
  });
}

function resetWizard() {
  clearChecked("rank");
  clearChecked("years");
  clearChecked("nopsMode");
  clearChecked("servicePlace");
  clearChecked("ssoPosition");
  clearChecked("hasSecrecy");
  clearChecked("secrecy");
  clearChecked("rsoAffiliation");
  clearChecked("hasCipherTenure");
  clearChecked("cipherTenure");
  clearChecked("hasClassQualification");
  clearChecked("classQualification");
  clearChecked("medicalQualCategory");
  clearChecked("medicalQualPost");
  clearChecked("extraRanks");
  clearChecked("hasHonoraryTitle");
  clearChecked("honoraryTitle");
  clearChecked("hasSportsTitle");
  clearChecked("sportsTitle");
  clearChecked("hasScienceDegree");
  clearChecked("scienceDegree");
  clearChecked("hasAcademicTitle");
  clearChecked("academicTitle");
  clearChecked("hasViolations");
  clearChecked("violationType");
  clearChecked("disciplinaryViolation");
  clearChecked("serviceViolation");
  clearChecked("legalViolation");
  clearChecked("qualificationViolation");
  clearChecked("hasEnemiesDestruction");
  clearChecked("hasPrisoners");

  clearChecked("nopsCategory");
  clearChecked("nopsSpecialization");

  REWARD_GROUPS.forEach(function (group) {
    clearChecked("rewardGroup_" + group.id);
  });

  ALL_REWARD_IDS.forEach(function (id) {
    clearChecked("reward_" + id);
    const daysInput = getDaysInput(id);
    if (daysInput) daysInput.value = "0";
  });

  applyDefaultSettlementPeriod();

  const prisonersCount = document.getElementById("prisoners-count");
  const prisonersParticipants = document.getElementById("prisoners-participants");
  const enemiesCount = document.getElementById("enemies-count");
  const enemiesParticipants = document.getElementById("enemies-participants");
  if (prisonersCount) prisonersCount.value = "1";
  if (prisonersParticipants) prisonersParticipants.value = "1";
  if (enemiesCount) enemiesCount.value = "1";
  if (enemiesParticipants) enemiesParticipants.value = "1";

  if (tariffInput) tariffInput.value = "1";
  validateTariff();
  syncRankTitleField();
  syncNopsFields();
  syncSecrecyFields();
  syncCipherTenureFields();
  syncClassQualificationFields();
  syncExtraRankDetailsFields();
  syncDisciplineDisclaimer();
  syncAllRewardGroupDetails();
  syncCombatResultsFields();
  updateDaysBadges();
  updateRewardAmounts();
  updateCombatShares();
  currentStepIndex = 0;
  showWizardFromResults();
}

function bindDaysSteppers() {
  document.querySelectorAll(".days-stepper").forEach(function (stepper) {
    const rewardId = stepper.dataset.daysId;
    const min = Number(stepper.dataset.min || 0);
    const input = getDaysInput(rewardId);
    const dec = stepper.querySelector(".days-dec");
    const inc = stepper.querySelector(".days-inc");
    if (!input || !dec || !inc) return;

    function applyDelta(delta) {
      const monthDays = getDaysInSettlementMonth();
      const parsed = parseDaysValue(rewardId);
      let base = parsed.ok ? parsed.n : min;
      const used = sumPoolDays(getRewardPoolIds(rewardId));
      const others =
        used != null && parsed.ok ? used - base : used != null ? used : 0;
      const max =
        monthDays == null ? 31 : Math.max(min, monthDays - Math.max(0, others));
      let next = base + delta;
      if (next < min) next = min;
      if (next > max) next = max;
      input.value = String(next);
      onWizardInputChange();
    }

    dec.addEventListener("click", function () {
      applyDelta(-1);
    });
    inc.addEventListener("click", function () {
      applyDelta(1);
    });
    input.addEventListener("input", onWizardInputChange);
  });
}

function bindNumberSteppers() {
  document.querySelectorAll("[data-number-input]").forEach(function (stepper) {
    const inputId = stepper.dataset.numberInput;
    const min = Number(stepper.dataset.min || 0);
    const max = Number(stepper.dataset.max || 999);
    const input = document.getElementById(inputId);
    const dec = stepper.querySelector(".number-dec");
    const inc = stepper.querySelector(".number-inc");
    if (!input || !dec || !inc) return;

    function applyDelta(delta) {
      const parsed = parseNumberInput(inputId, min, max);
      let base = parsed.ok ? parsed.n : min;
      let next = base + delta;
      if (next < min) next = min;
      if (next > max) next = max;
      input.value = String(next);
      onWizardInputChange();
    }

    dec.addEventListener("click", function () {
      applyDelta(-1);
    });
    inc.addEventListener("click", function () {
      applyDelta(1);
    });
    input.addEventListener("input", onWizardInputChange);
  });
}

function init() {
  if (!wizardPanel || !wizardContinue) return;

  wizardContinue.addEventListener("click", goToNextStep);
  if (wizardBack) wizardBack.addEventListener("click", goToPreviousStep);
  if (wizardRestart) wizardRestart.addEventListener("click", resetWizard);
  if (wizardEdit) {
    wizardEdit.addEventListener("click", editWizardFromResults);
  }

  document.querySelectorAll('input[name="rank"]').forEach(function (input) {
    input.addEventListener("change", onRankChange);
  });
  document.querySelectorAll('input[name="years"]').forEach(function (input) {
    input.addEventListener("change", onWizardInputChange);
  });
  [
    "nopsMode",
    "servicePlace",
    "ssoPosition",
    "hasSecrecy",
    "secrecy",
    "rsoAffiliation",
    "hasCipherTenure",
    "cipherTenure",
    "hasClassQualification",
    "classQualification",
    "medicalQualCategory",
    "medicalQualPost",
    "extraRanks",
    "hasHonoraryTitle",
    "honoraryTitle",
    "hasSportsTitle",
    "sportsTitle",
    "hasScienceDegree",
    "scienceDegree",
    "hasAcademicTitle",
    "academicTitle",
    "hasViolations",
    "violationType",
    "disciplinaryViolation",
    "serviceViolation",
    "legalViolation",
    "qualificationViolation",
    "hasEnemiesDestruction",
    "hasPrisoners",
    "rewardGroup_onetime",
    "rewardGroup_assault",
    "rewardGroup_combat",
    "rewardGroup_training",
  ].forEach(function (name) {
    document.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
      input.addEventListener("change", onWizardInputChange);
    });
  });

  ALL_REWARD_IDS.forEach(function (id) {
    document
      .querySelectorAll('input[name="reward_' + id + '"]')
      .forEach(function (input) {
        input.addEventListener("change", onWizardInputChange);
      });
  });

  if (settlementPeriodInc) {
    settlementPeriodInc.addEventListener("click", function () {
      applySettlementPeriodDelta(1);
    });
  }
  if (settlementPeriodDec) {
    settlementPeriodDec.addEventListener("click", function () {
      applySettlementPeriodDelta(-1);
    });
  }

  if (tariffInc) {
    tariffInc.addEventListener("click", function () {
      applyTariffDelta(1);
    });
  }
  if (tariffDec) {
    tariffDec.addEventListener("click", function () {
      applyTariffDelta(-1);
    });
  }
  if (tariffInput) {
    tariffInput.addEventListener("input", function () {
      validateTariff();
      onWizardInputChange();
    });
    tariffInput.addEventListener("blur", validateTariff);
  }

  bindDaysSteppers();
  bindNumberSteppers();

  fillNopsCategoryRadios();
  applyDefaultSettlementPeriod();
  syncRankTitleField();
  syncNopsFields();
  syncSecrecyFields();
  syncCipherTenureFields();
  syncClassQualificationFields();
  syncExtraRankDetailsFields();
  syncDisciplineDisclaimer();
  syncAllRewardGroupDetails();
  syncCombatResultsFields();
  updateDaysBadges();
  updateRewardAmounts();
  updateCombatShares();
  validateTariff();
  renderWizardStep();
}

init();
