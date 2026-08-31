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
  "conditions",
  "qualification",
  "period",
  "rewards",
  "combat_results",
  "discipline",
];

const STEP_META = {
  basics: {
    title: "Основні дані про проходження служби",
    help: "Заповніть дані про службу, звання, тарифний розряд і вислугу років.",
  },
  conditions: {
    title: "Умови військової служби",
    help: "Оберіть місце служби (для премії), особливості служби для НОПС, ступінь секретності та стаж на шифрувальній роботі.",
  },
  qualification: {
    title: "Кваліфікація та звання",
    help: "Цей розділ заповнюється лише за наявності підстав на додаткові види нарахування.",
  },
  discipline: {
    title: "Дисципліна",
    help: "Йдеться про догани, невиходи на службу (навчання) чи інші суттєві порушення. Ознака не змінює розраховану суму автоматично.",
  },
  period: {
    title: "Розрахунковий період",
    help: "Оберіть місяць і рік, за який рахуємо забезпечення.",
  },
  rewards: {
    title: "Одноразові та додаткові винагороди",
    help: "Одноразові, додаткові та штурмові винагороди мають незалежні ліміти днів місяця.",
  },
  combat_results: {
    title: "Винагороди за полонених і знищення",
    help: "15 000 грн за кожного знищеного та 100 000 грн за кожного полоненого. Калькулятор ділить винагороду порівну між усіма учасниками.",
  },
};

const SERVICE_LABELS = {
  contract: "Контрактна військова служба",
  mob: "За призовом (мобілізація)",
};

const RANK_LABELS = {
  r1: "Рядовий",
  r2: "Сержантський / старшинський",
  r3: "Офіцерський",
  r4: "Вищий офіцерський (генерали / адмірали)",
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
    id: "combat",
    rewardIds: REWARD_GROUP_COMBAT_IDS,
    summaryLabel: "Бойові або службові завдання з додатковою винагородою",
  },
  {
    id: "training",
    rewardIds: REWARD_GROUP_TRAINING_IDS,
    summaryLabel: "Обіймали посаду інструкторського складу",
  },
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
];

const ALL_REWARD_IDS = REWARD_GROUP_COMBAT_IDS.concat(
  REWARD_GROUP_TRAINING_IDS,
  [TRAINING_LEAVE_ID],
  REWARD_GROUP_ONETIME_IDS,
  REWARD_GROUP_ASSAULT_IDS
);

const REWARD_LABELS = {
  combat_actions: "Участь у бойових діях (100 000 грн/міс)",
  command_posts: "Виконання завдань на пунктах управління (50 000 грн/міс)",
  combat_special: "Виконання бойових (спеціальних) завдань (30 000 грн/міс)",
  train_commander: "Командир інструкторського підрозділу (25 000 грн/міс)",
  train_basic:
    "Базовий сержантський / інструкторський рівень (15 000 грн/міс)",
  train_mid:
    "Середній сержантський рівень + підвищення кваліфікації інструкторів (25 000 грн/міс)",
  train_advanced:
    "Вищий сержантський рівень + академічний інструктор (30 000 грн/міс)",
  train_ubd:
    "Рівень підготовки не нижче базового + інструктор зі статусом УБД (30 000 грн/міс)",
  training_leave: "Навчання або відпустка протягом обраного місяця",
  stronghold_platoon:
    "Виконання бойових завдань до взводного опорного пункту (170 000 грн/міс)",
  stronghold_company:
    "Виконання бойових завдань до ротного опорного пункту (70 000 грн/міс)",
  restore_positions: "Відновлення позицій (20 000 грн/добу)",
  capture_positions: "Захоплення позицій (40 000 грн/добу)",
};

const REWARD_GROUP_LABELS = {
  yes: "Так",
  no: "Ні",
};

const settlementYearField = document.getElementById("settlement-year-field");
const settlementYearInput = document.getElementById("settlement-year");
const settlementYearError = document.getElementById("settlement-year-error");
const settlementYearInc = document.getElementById("settlement-year-inc");
const settlementYearDec = document.getElementById("settlement-year-dec");
const nopsCategoryOptions = document.getElementById("nops-category-options");
const nopsSpecializationOptions = document.getElementById(
  "nops-specialization-options"
);
let filledNopsSpecCategoryId = null;

const SETTLEMENT_YEAR_MIN = Number(
  (settlementYearField && settlementYearField.dataset.min) || 2022
);
const SETTLEMENT_YEAR_MAX = Number(
  (settlementYearField && settlementYearField.dataset.max) || 2035
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
  if (!getSelectedValue("service")) return false;
  if (!getSelectedValue("rank")) return false;
  if (!getSelectedValue("rankTitle")) return false;
  if (!parseTariff().ok) return false;
  if (!getSelectedValue("years")) return false;
  return true;
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
  const current = getSelectedValue("nopsCategory");
  nopsCategoryOptions.replaceChildren();
  NOPS_CATEGORIES.forEach(function (category) {
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
  const nextId = categoryId || "";
  if (nextId === filledNopsSpecCategoryId) return;

  const current = getSelectedValue("nopsSpecialization");
  nopsSpecializationOptions.replaceChildren();
  filledNopsSpecCategoryId = nextId;
  const category = getNopsCategory(nextId);
  if (!category) return;

  category.items.forEach(function (spec) {
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
    percent.className = "radio-card__percent";
    percent.textContent = formatNopsPct(spec.nopsPct);

    label.appendChild(input);
    label.appendChild(ui);
    label.appendChild(content);
    label.appendChild(percent);
    nopsSpecializationOptions.appendChild(label);
  });

  nopsSpecializationOptions
    .querySelectorAll('input[name="nopsSpecialization"]')
    .forEach(function (input) {
      input.addEventListener("change", onWizardInputChange);
    });
}

function syncNopsFields() {
  const show = requiresNopsDetails();
  const categoryId = getSelectedValue("nopsCategory");
  const categoryField = document.getElementById("field-nops-category");
  const specField = document.getElementById("field-nops-specialization");
  if (categoryField) categoryField.hidden = !show;
  if (specField) specField.hidden = !(show && categoryId);
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
  const secrecy = getSecrecyValue();
  return secrecy === "secret" || secrecy === "top_secret" || secrecy === "special";
}

function syncSecrecyFields() {
  const details = document.getElementById("secrecy-level-details");
  const show = hasSecrecyLevel();
  if (details) details.hidden = !show;
  if (!show) {
    clearChecked("secrecy");
  }
  syncRsoField();
}

function syncRsoField() {
  const field = document.getElementById("field-rso");
  if (!field) return;

  const show = requiresRsoAffiliation();
  field.hidden = !show;
  if (!show) {
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

function syncDisciplineDisclaimer() {
  const box = document.getElementById("discipline-disclaimer");
  if (!box) return;
  box.hidden = !requiresViolationType();
}

function isDisciplineFilled() {
  return getYesNoValue("hasViolations") != null;
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
  if (settlementYearInput) settlementYearInput.value = String(def.year);
  document.querySelectorAll('input[name="settlementMonth"]').forEach(function (input) {
    input.checked = Number(input.value) === def.month;
  });
  validateSettlementYear();
}

function parseSettlementYear() {
  if (!settlementYearInput) return { ok: false };
  const raw = settlementYearInput.value.trim();
  if (!raw || !/^\d+$/.test(raw)) return { ok: false };
  const n = Number.parseInt(raw, 10);
  if (n < SETTLEMENT_YEAR_MIN || n > SETTLEMENT_YEAR_MAX) return { ok: false, n };
  return { ok: true, n };
}

function setSettlementYearValidity(valid) {
  if (!settlementYearField || !settlementYearError || !settlementYearInput) return;
  settlementYearField.classList.toggle("is-invalid", !valid);
  settlementYearError.hidden = valid;
  settlementYearInput.setAttribute("aria-invalid", valid ? "false" : "true");
}

function validateSettlementYear() {
  const result = parseSettlementYear();
  setSettlementYearValidity(result.ok);
  return result;
}

function applySettlementYearDelta(delta) {
  if (!settlementYearInput) return;
  const result = parseSettlementYear();
  let base = result.ok ? result.n : SETTLEMENT_YEAR_MIN;
  let next = base + delta;
  if (next < SETTLEMENT_YEAR_MIN) next = SETTLEMENT_YEAR_MIN;
  if (next > SETTLEMENT_YEAR_MAX) next = SETTLEMENT_YEAR_MAX;
  settlementYearInput.value = String(next);
  validateSettlementYear();
  onWizardInputChange();
}

function getSettlementMonth() {
  return getSelectedValue("settlementMonth");
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
}

function syncRewardGroupDetails(group) {
  const details = document.getElementById("reward-group-" + group.id + "-details");
  if (!details) return;

  const show = getRewardGroupChoice(group.id) === "yes";
  details.hidden = !show;

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
  const additionalUsed = sumPoolDays(ADDITIONAL_POOL_IDS);
  setDaysBadges("additional", additionalUsed, monthDays);
  setDaysBadges("onetime", sumPoolDays(ONETIME_POOL_IDS), monthDays);
  setDaysBadges("assault", sumPoolDays(ASSAULT_POOL_IDS), monthDays);
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

function isRewardsFilled() {
  const monthDays = getDaysInSettlementMonth();
  if (monthDays == null) return false;

  for (let i = 0; i < REWARD_GROUPS.length; i += 1) {
    const group = REWARD_GROUPS[i];
    const choice = getRewardGroupChoice(group.id);
    if (!choice) return false;
    if (choice === "yes" && !areRewardItemsFilled(group.rewardIds)) return false;
  }

  if (!areRewardItemsFilled([TRAINING_LEAVE_ID])) return false;

  if (poolExceeds(ADDITIONAL_POOL_IDS, monthDays)) return false;
  if (poolExceeds(ONETIME_POOL_IDS, monthDays)) return false;
  if (poolExceeds(ASSAULT_POOL_IDS, monthDays)) return false;
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
    case "conditions":
      return isConditionsFilled();
    case "qualification":
      return isQualificationFilled();
    case "discipline":
      return isDisciplineFilled();
    case "period":
      return isPeriodFilled();
    case "rewards":
      return isRewardsFilled();
    case "combat_results":
      return isCombatResultsFilled();
    default:
      return false;
  }
}

function validateCurrentStep(stepId) {
  if (!isStepFilled(stepId)) {
    if (stepId === "rewards") {
      const monthDays = getDaysInSettlementMonth();
      if (monthDays != null) {
        const monthName =
          MONTH_LABELS[getSettlementMonth()] || "вибраному місяці";
        if (poolExceeds(ADDITIONAL_POOL_IDS, monthDays)) {
          return [
            "Загальна кількість днів додаткових винагород не може перевищувати кількість календарних днів у " +
              monthName +
              " (" +
              monthDays +
              "). Якщо за один день ви мали право на кілька винагород, врахуйте його лише для винагороди більшого розміру.",
          ];
        }
        if (poolExceeds(ONETIME_POOL_IDS, monthDays)) {
          return [
            "Загальна кількість днів одноразових винагород не може перевищувати кількість календарних днів у " +
              monthName +
              " (" +
              monthDays +
              "). Якщо за один день ви мали право на обидві винагороди, врахуйте його лише для винагороди більшого розміру.",
          ];
        }
        if (poolExceeds(ASSAULT_POOL_IDS, monthDays)) {
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
  updateCombatShares();
  clearWizardError();
  updateContinueButton();
}

function collectAnswersSummary() {
  const items = [];

  const service = getSelectedValue("service");
  if (service) {
    items.push({
      label: "Вид проходження військової служби",
      value: SERVICE_LABELS[service] || service,
    });
  }

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
  if (nopsMode) {
    items.push({
      label: "Розмір надбавки за особливості проходження служби (НОПС)",
      value: NOPS_MODE_LABELS[nopsMode] || nopsMode,
    });
  }

  const nopsCategory = getSelectedValue("nopsCategory");
  if (nopsCategory) {
    const category = getNopsCategory(nopsCategory);
    items.push({
      label: "Напрям служби",
      value: category ? category.label : nopsCategory,
    });
  }

  const nopsSpec = getSelectedNopsSpec();
  if (nopsSpec) {
    items.push({
      label: "Спеціалізація НОПС",
      value: nopsSpec.label + " (" + formatNopsPct(nopsSpec.nopsPct) + ")",
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
        "У розрахунковому місяці чи були у вас порушення військової дисципліни або незадовільне виконання службових обов’язків?",
      value: HAS_VIOLATIONS_LABELS[hasViolations] || hasViolations,
    });
  }

  return items;
}

function resolveNopsPct() {
  if (getSelectedValue("nopsMode") !== "other") return 65;
  const spec = getSelectedNopsSpec();
  return spec ? spec.nopsPct : 65;
}

function resolvePremiumOverride() {
  const spec = getSelectedNopsSpec();
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
  const settlementMonth = getSelectedValue("settlementMonth");
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

function renderTotalPay(result) {
  if (!wizardResultsTotal) return;

  wizardResultsTotal.replaceChildren();

  const totalRow = document.createElement("div");
  totalRow.className = "results-total";

  const label = document.createElement("p");
  label.className = "results-total__label";
  label.textContent = "До видачі на руки:";

  const value = document.createElement("p");
  value.className = "results-total__value results-total__value--pay";
  value.textContent = formatMoney(result.netPay) + " грн";

  totalRow.appendChild(label);
  totalRow.appendChild(value);
  wizardResultsTotal.appendChild(totalRow);
}

function renderExplanation(result) {
  if (!wizardResultsExplanation) return;

  wizardResultsExplanation.replaceChildren();

  buildResultLines(result).forEach(function (line) {
    if (line.rowType === "final") return;

    const row = document.createElement("div");
    row.className = "explanation-line explanation-line--summary-row";

    if (line.rowType === "separator" || line.rowType === "subtotal") {
      row.classList.add("explanation-line--total");
    }
    if (line.negative) {
      row.classList.add("explanation-line--negative");
    }
    if (line.error && line.nonBlocking) {
      row.classList.add("explanation-line--warning");
    }
    if (line.error && !line.nonBlocking) {
      row.classList.add("explanation-line--error");
    }

    const head = document.createElement("div");
    head.className = "explanation-line__head";

    const main = document.createElement("p");
    main.className = "explanation-line__main";
    main.textContent = line.name;

    const value = document.createElement("p");
    value.className = "explanation-line__value";
    if (line.error && line.value == null) {
      value.textContent = line.error;
    } else if (line.value == null) {
      value.textContent = "";
    } else {
      value.textContent = formatMoney(line.value);
    }

    head.appendChild(main);
    head.appendChild(value);
    row.appendChild(head);

    if (line.calc) {
      const cite = document.createElement("p");
      cite.className = "explanation-line__cite";
      cite.textContent = line.calc;
      row.appendChild(cite);
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
  renderExplanation(result);
  renderTotalPay(result);
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
  clearChecked("service");
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

  clearChecked("settlementMonth");
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
      const max = monthDays == null ? 31 : monthDays;
      const parsed = parseDaysValue(rewardId);
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

  document.querySelectorAll('input[name="service"]').forEach(function (input) {
    input.addEventListener("change", onWizardInputChange);
  });
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
    "hasEnemiesDestruction",
    "hasPrisoners",
    "settlementMonth",
    "rewardGroup_combat",
    "rewardGroup_training",
    "rewardGroup_onetime",
    "rewardGroup_assault",
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

  if (settlementYearInc) {
    settlementYearInc.addEventListener("click", function () {
      applySettlementYearDelta(1);
    });
  }
  if (settlementYearDec) {
    settlementYearDec.addEventListener("click", function () {
      applySettlementYearDelta(-1);
    });
  }
  if (settlementYearInput) {
    settlementYearInput.addEventListener("input", function () {
      validateSettlementYear();
      onWizardInputChange();
    });
    settlementYearInput.addEventListener("blur", validateSettlementYear);
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
  updateCombatShares();
  validateTariff();
  validateSettlementYear();
  renderWizardStep();
}

init();
