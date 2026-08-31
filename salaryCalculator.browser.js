(function (global) {
/**
 * Monetary allowance calculator (official MOD salary logic).
 * Ported from calculator.mod.gov.ua/salary (bundle function p / _).
 */

const LIMIT_CAP = 460000;
const LIVING_WAGE_DEFAULT = 3328;

/** @type {readonly number[]} */
const OVZ_BY_RANK_INDEX = Object.freeze([
  440, 530, 600, 670, 740, 810, 880, 950, 1020, 1040, 1060, 1090, 1130, 1200,
  1270, 1340, 1410, 1480, 1550, 1620, 1690, 1760,
]);

/** Rank title labels in the same order as OVZ_BY_RANK_INDEX. */
const RANK_TITLE_ORDER = Object.freeze([
  "Рекрут",
  "Солдат, матрос",
  "Старший солдат, старший матрос",
  "Молодший сержант, старшина 2 статті",
  "Сержант, старшина 1 статті",
  "Старший сержант, головний старшина",
  "Головний сержант, головний корабельний старшина",
  "Штаб-сержант, штаб-старшина",
  "Майстер-сержант, майстер-старшина",
  "Старший майстер-сержант, старший майстер-старшина",
  "Головний майстер-сержант, головний майстер-старшина",
  "Молодший лейтенант",
  "Лейтенант",
  "Старший лейтенант",
  "Капітан, капітан-лейтенант",
  "Майор, капітан 3 рангу",
  "Підполковник, капітан 2 рангу",
  "Полковник, капітан 1 рангу",
  "Бригадний генерал, коммодор",
  "Генерал-майор, контр-адмірал",
  "Генерал-лейтенант, віце-адмірал",
  "Генерал, адмірал",
]);

/**
 * Tariff rows: [ПО, %ССО, %ДШВ, %загальні(<1р)|%загальні, %загальні(≥1р)?]
 * @type {readonly (readonly number[])[]}
 */
const TARIFF_ROWS = Object.freeze([
  [2470, 620, 650, 633, 590],
  [2550, 590, 646, 603, 567],
  [2640, 590, 641, 578, 544],
  [2730, 590, 631, 556, 535],
  [2820, 560, 624, 534, 523],
  [2910, 560, 613, 513],
  [3000, 560, 600, 505],
  [3080, 560, 589, 492],
  [3170, 560, 580, 489],
  [3260, 530, 573, 486],
  [3350, 530, 563, 483],
  [3440, 530, 553, 480],
  [3520, 520, 541, 467],
  [3660, 520, 526, 455],
  [3810, 490, 518, 443],
  [3950, 490, 504, 429],
  [4090, 470, 496, 420],
  [4230, 470, 487, 412],
  [4370, 470, 481, 405],
  [4510, 470, 471, 395],
  [4650, 470, 464, 390],
  [4790, 450, 454, 390],
  [4930, 450, 445, 390],
  [5070, 450, 440, 390],
  [5220, 430, 428, 390],
  [5360, 430, 420, 390],
  [5500, 430, 410, 390],
  [5640, 430, 405, 390],
  [5780, 430, 395, 390],
  [5920, 420, 390, 390],
  [6060, 420, 390, 390],
  [6200, 420, 390, 390],
  [6340, 420, 390, 390],
  [6480, 420, 390, 390],
  [6630, 420, 390, 390],
  [6770, 400, 390, 390],
  [6910, 400, 390, 390],
  [7050, 400, 390, 390],
  [7190, 400, 390, 390],
  [7330, 400, 390, 390],
  [7470, 400, 390, 390],
  [7610, 400, 390, 390],
  [7750, 400, 390, 390],
  [7890, 390, 390, 390],
  [8030, 390, 390, 390],
  [8180, 390, 390, 390],
  [8320, 390, 390, 390],
  [8460, 390, 390, 390],
  [8600, 390, 390, 390],
  [8740, 390, 390, 390],
  [8880, 390, 390, 390],
  [9020, 390, 390, 390],
  [9160, 390, 390, 390],
  [9300, 390, 390, 390],
  [9440, 390, 390, 390],
  [9590, 390, 390, 390],
  [9730, 390, 390, 390],
  [9870, 390, 390, 390],
  [10010, 390, 390, 390],
  [10150, 390, 390, 390],
]);

const YEARS_PCT = Object.freeze({
  y0: 0,
  y1: 25,
  y2: 30,
  y3: 35,
  y4: 40,
  y5: 45,
  y6: 50,
});

const SECRECY_PCT = Object.freeze({
  none: { normal: 0, rso: 0 },
  secret: { normal: 10, rso: 30 },
  top_secret: { normal: 15, rso: 50 },
  special: { normal: 20, rso: 60 },
});

const CLASS_PCT = Object.freeze({
  none: { normal: 0, pilot: 0 },
  class_2: { normal: 3, pilot: 5 },
  class_1: { normal: 5, pilot: 7 },
  master: { normal: 7, pilot: 7 },
  sniper: { normal: 0, pilot: 9 },
  medical: { normal: 0, pilot: 0 },
});

/** Medical / pharmaceutical class qualification matrix. */
const MEDICAL_CLASS_PCT = Object.freeze({
  second: { surgical: 7, other: 3, junior: 3 },
  first: { surgical: 9, other: 5, junior: 5 },
  higher: { surgical: 11, other: 7, junior: 7 },
});

const SSO_ALLOWANCE_PCT = Object.freeze({
  sso_main: 100,
  sso_command: 80,
  sso_support: 70,
  sso_other: 50,
});

const HONORARY_PCT = Object.freeze({
  none: 0,
  honored: 10,
  peoples: 15,
});

const SPORTS_PCT = Object.freeze({
  none: 0,
  honored_coach: 10,
  honored_master: 10,
  intl_master: 10,
  master: 5,
});

const SCIENCE_PCT = Object.freeze({
  none: 0,
  phd: 5,
  doctor: 10,
});

const ACADEMIC_PCT = Object.freeze({
  none: 0,
  docent: 5,
  professor: 10,
});

const CIPHER_PCT = Object.freeze({
  lt1: 0,
  y1_3: 10,
  y3_5: 15,
  gt5: 20,
});

/** Service place → premium table index (7 = A0952 uses DSHV × 1.7). */
const SERVICE_PLACE_CODE = Object.freeze({
  general: 3,
  sso: 1,
  dshv_vms: 2,
  a0952: 7,
});

/**
 * NOPS % from wizard position cards.
 * @type {Readonly<Record<string, number>>}
 */
const NOPS_BY_POSITION = Object.freeze({
  general_sso: 87.8,
  sniper_sso: 100,
  other_rest: 65,
  marine_dshv: 87.8,
  contract_ranks: 100,
  general_med: 68.3,
  tb_psych: 71.5,
  operating: 78,
  immuno_lab: 78,
  combat_duty: 78,
  special_risk: 100,
  armor_aviation_ground: 78,
  spv_crews: 84.5,
  flight_uav: 100,
  instructor_teaching: 81.3,
  order_underground: 68.3,
  honor_guard: 85,
  vsp_special: 87.8,
  fire_sniper: 100,
  units_listed: 100,
});

/**
 * Monthly reward base amounts (pro-rated by days/month), except assault (per day).
 * @type {Readonly<Record<string, { kind: string, amount: number, label: string, abbr?: string }>>}
 */
const REWARD_DEFS = Object.freeze({
  combat_actions: {
    kind: "shared",
    amount: 100000,
    label: "Дод. винагорода 100 тис. (бойові дії)",
    abbr: "ДВ100",
    limit: true,
  },
  combat_special: {
    kind: "shared",
    amount: 30000,
    label: "Дод. винагорода 30 тис. (бойові завдання)",
    abbr: "",
  },
  command_posts: {
    kind: "shared",
    amount: 50000,
    label: "Дод. винагорода 50 тис. (пункт управління)",
    abbr: "ДВ50",
  },
  train_commander: {
    kind: "shared",
    amount: 25000,
    label: "Інструктор (командир підрозділу)",
    abbr: "",
  },
  train_basic: {
    kind: "shared",
    amount: 15000,
    label: "Інструктор (базовий рівень)",
    abbr: "",
  },
  train_mid: {
    kind: "shared",
    amount: 25000,
    label: "Інструктор (середній рівень)",
    abbr: "",
  },
  train_advanced: {
    kind: "shared",
    amount: 30000,
    label: "Інструктор (підвищений рівень)",
    abbr: "",
  },
  train_ubd: {
    kind: "shared",
    amount: 30000,
    label: "Інструктор зі статусом УБД",
    abbr: "",
  },
  stronghold_platoon: {
    kind: "stronghold",
    amount: 170000,
    label: "Бойові завдання 170 тис. (до взводу)",
    abbr: "ДВ170",
    limit: true,
  },
  stronghold_company: {
    kind: "stronghold",
    amount: 70000,
    label: "Бойові завдання 70 тис. (до роти)",
    abbr: "ДВ70",
    limit: true,
  },
  restore_positions: {
    kind: "storm",
    amount: 20000,
    label: "Штурмові дії (відновлення)",
    abbr: "ШД20",
    limit: true,
  },
  capture_positions: {
    kind: "storm",
    amount: 40000,
    label: "Штурмові дії (захоплення)",
    abbr: "ШД40",
    limit: true,
  },
  training_leave: {
    kind: "absence",
    amount: 0,
    label: "Навчання або відпустка",
    abbr: "",
  },
});

/**
 * @param {number} value
 * @returns {number}
 */
function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * @param {number} value
 * @returns {string}
 */
function formatMoney(value) {
  if (value == null || Number.isNaN(value)) return "0,00";
  const abs = Math.abs(value);
  const [intPart, frac] = abs.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = value < 0 ? "−" : "";
  return `${sign}${grouped},${frac}`;
}

/**
 * @param {string} rankTitle
 * @returns {number}
 */
function ovzForRankTitle(rankTitle) {
  const idx = RANK_TITLE_ORDER.indexOf(rankTitle);
  if (idx < 0) return 0;
  return OVZ_BY_RANK_INDEX[idx] || 0;
}

/**
 * @param {number} tariff 1..60
 * @returns {readonly number[]}
 */
function tariffRow(tariff) {
  const idx = Math.max(1, Math.min(60, Math.floor(tariff))) - 1;
  return TARIFF_ROWS[idx];
}

/**
 * @param {number} year
 * @param {number} month 1..12
 * @returns {number}
 */
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * @param {object} input
 * @returns {number}
 */
function resolvePremiumPct(input) {
  if (input.premiumPctOverride != null && input.premiumPctOverride !== "") {
    return round2(Number(input.premiumPctOverride));
  }
  const row = tariffRow(input.tariff);
  const yearsPct = YEARS_PCT[input.yearsKey] ?? 0;
  const placeCode = SERVICE_PLACE_CODE[input.servicePlace] ?? 3;
  const factor = placeCode === 7 ? 1.7 : 1;
  let idx = placeCode === 7 ? 2 : placeCode;
  if (yearsPct > 0 && idx === 3 && row[4] != null) idx = 4;
  return round2((row[idx] || 0) * factor);
}

function resolveClassPct(input) {
  if (input.classQualification === "medical") {
    const matrix = MEDICAL_CLASS_PCT[input.medicalQualCategory];
    if (!matrix) return 0;
    return matrix[input.medicalQualPost] || 0;
  }
  const isPilot = Boolean(input.isPilot);
  const classRates = CLASS_PCT[input.classQualification] || CLASS_PCT.none;
  return isPilot ? classRates.pilot : classRates.normal;
}

/**
 * @param {object} input
 * @returns {object}
 */
function calculate(input) {
  if (!input) {
    throw new Error("Немає даних для розрахунку.");
  }

  const ovz =
    input.ovz != null ? Number(input.ovz) : ovzForRankTitle(input.rankTitle);
  const row = tariffRow(Number(input.tariff) || 1);
  const po = row[0];
  const yearsPct = YEARS_PCT[input.yearsKey] ?? 0;
  const nvr = round2(((po + ovz) * yearsPct) / 100);

  const secrecy = SECRECY_PCT[input.secrecy] || SECRECY_PCT.none;
  const secrecyPct = input.isRso ? secrecy.rso : secrecy.normal;
  const nzt = round2((po * secrecyPct) / 100);

  const nopsPct = Number(input.nopsPct) || 0;
  const nops = round2(((po + ovz + nvr) * nopsPct) / 100);

  const premiumPct = resolvePremiumPct(input);
  const monthlyBonus = round2((po * premiumPct) / 100);

  const livingWage = Number(input.livingWage) || LIVING_WAGE_DEFAULT;
  const ssoPct = Number(input.ssoAllowancePct) || 0;
  const sso = round2(((livingWage * 5) * ssoPct) / 100);

  const classPct = resolveClassPct(input);
  const classAllow = round2((po * classPct) / 100);

  const honoraryPct =
    input.extraRanks === false
      ? 0
      : HONORARY_PCT[input.honoraryTitle] ?? 0;
  const sportsPct =
    input.extraRanks === false ? 0 : SPORTS_PCT[input.sportsTitle] ?? 0;
  const sciencePct =
    input.extraRanks === false ? 0 : SCIENCE_PCT[input.scienceDegree] ?? 0;
  const academicPct =
    input.extraRanks === false ? 0 : ACADEMIC_PCT[input.academicTitle] ?? 0;
  const cipherPct = CIPHER_PCT[input.cipherTenure] ?? 0;

  const honorary = round2((po * honoraryPct) / 100);
  const sports = round2((po * sportsPct) / 100);
  const science = round2((po * sciencePct) / 100);
  const academic = round2((po * academicPct) / 100);
  const cipher = round2((po * cipherPct) / 100);

  const monthlyTotal = round2(
    po +
      ovz +
      nvr +
      nzt +
      nops +
      monthlyBonus +
      sso +
      classAllow +
      honorary +
      sports +
      science +
      academic +
      cipher
  );

  const month = Number(input.month) || new Date().getMonth() + 1;
  const year = Number(input.year) || new Date().getFullYear();
  const J = daysInMonth(year, month);
  const days = input.rewardDays || {};

  const d = (id) => Math.max(0, Number(days[id]) || 0);

  const dv100Days = d("combat_actions");
  const dv30Days = d("combat_special");
  const cat50Days = d("command_posts");
  const insCommanderDays = d("train_commander");
  const insBasicDays = d("train_basic");
  const insMediumDays = d("train_mid");
  const insAdvancedDays = d("train_advanced");
  const insUbdDays = d("train_ubd");
  const cat170Days = d("stronghold_platoon");
  const cat70Days = d("stronghold_company");
  const stormRestoreDays = d("restore_positions");
  const stormCaptureDays = d("capture_positions");
  const absenceDays = d("training_leave");

  const sharedDays =
    cat50Days +
    dv100Days +
    dv30Days +
    insCommanderDays +
    insBasicDays +
    insMediumDays +
    insAdvancedDays +
    insUbdDays;
  const additionalDaysExceed = sharedDays + absenceDays > J;
  const onetimeExceed = cat170Days + cat70Days > J;
  const stormExceed = stormRestoreDays + stormCaptureDays > J;

  const prorate = (monthly, dayCount) =>
    additionalDaysExceed ? 0 : round2((monthly / J) * dayCount);

  const dv100Amount = dv100Days > 0 ? prorate(100000, dv100Days) : 0;
  const dv30Amount = dv30Days > 0 ? prorate(30000, dv30Days) : 0;
  const cat50Amount = prorate(50000, cat50Days);
  const insCommanderAmount = prorate(25000, insCommanderDays);
  const insBasicAmount = prorate(15000, insBasicDays);
  const insMediumAmount = prorate(25000, insMediumDays);
  const insAdvancedAmount = prorate(30000, insAdvancedDays);
  const insUbdAmount = prorate(30000, insUbdDays);
  const cat170Amount = onetimeExceed ? 0 : round2((170000 / J) * cat170Days);
  const cat70Amount = onetimeExceed ? 0 : round2((70000 / J) * cat70Days);

  const stormRestoreAmount = stormExceed
    ? 0
    : round2(20000 * stormRestoreDays);
  const stormCaptureAmount = stormExceed
    ? 0
    : round2(40000 * stormCaptureDays);

  const stormDaysForTilova = stormExceed
    ? 0
    : stormRestoreDays + stormCaptureDays;
  const tilovaDays = additionalDaysExceed
    ? 0
    : Math.max(0, J - sharedDays - absenceDays - stormDaysForTilova);
  const tilovaAmount = additionalDaysExceed
    ? 0
    : round2((10000 / J) * tilovaDays);

  const prisonerCount = Math.max(0, Number(input.prisonersCount) || 0);
  const prisonerParticipants = Math.max(
    1,
    Number(input.prisonersParticipants) || 1
  );
  const prisonerAmount = round2((100000 * prisonerCount) / prisonerParticipants);

  const destroyedCount = Math.max(0, Number(input.enemiesCount) || 0);
  const destroyedParticipants = Math.max(
    1,
    Number(input.enemiesParticipants) || 1
  );
  const destroyedAmount = round2(
    (15000 * destroyedCount) / destroyedParticipants
  );

  const limitRaw = round2(
    dv100Amount +
      cat170Amount +
      cat70Amount +
      stormRestoreAmount +
      stormCaptureAmount
  );
  const limitCapped = Math.min(limitRaw, LIMIT_CAP);
  const limitApplied = limitRaw > LIMIT_CAP;

  const unlimited = round2(
    cat50Amount +
      dv30Amount +
      tilovaAmount +
      insCommanderAmount +
      insBasicAmount +
      insMediumAmount +
      insAdvancedAmount +
      insUbdAmount +
      prisonerAmount +
      destroyedAmount
  );

  const additionalTotal = round2(limitCapped + unlimited);
  const accrued = round2(monthlyTotal + additionalTotal);
  const militaryTaxFull = round2((accrued * 1.5) / 100);
  const militaryTaxBenefit = 0;
  const netPay = round2(accrued - militaryTaxFull);

  return {
    ovz,
    po,
    yearsPct,
    nvr,
    secrecyPct,
    nzt,
    nopsPct,
    nops,
    premiumPct,
    monthlyBonus,
    livingWage,
    ssoPct,
    sso,
    classPct,
    classAllow,
    honoraryPct,
    honorary,
    sportsPct,
    sports,
    sciencePct,
    science,
    academicPct,
    academic,
    cipherPct,
    cipher,
    monthlyTotal,
    month,
    year,
    daysInMonth: J,
    dv100Days,
    dv100Amount,
    dv30Days,
    dv30Amount,
    cat50Days,
    cat50Amount,
    insCommanderDays,
    insCommanderAmount,
    insBasicDays,
    insBasicAmount,
    insMediumDays,
    insMediumAmount,
    insAdvancedDays,
    insAdvancedAmount,
    insUbdDays,
    insUbdAmount,
    cat170Days,
    cat170Amount,
    cat70Days,
    cat70Amount,
    stormRestoreDays,
    stormRestoreAmount,
    stormCaptureDays,
    stormCaptureAmount,
    absenceDays,
    sharedDays,
    additionalDaysExceed,
    onetimeExceed,
    stormExceed,
    tilovaDays,
    tilovaAmount,
    prisonerCount,
    prisonerParticipants,
    prisonerAmount,
    destroyedCount,
    destroyedParticipants,
    destroyedAmount,
    limitRaw,
    limitCapped,
    limitApplied,
    unlimited,
    additionalTotal,
    accrued,
    militaryTaxFull,
    militaryTaxBenefit,
    militaryTaxNet: round2(militaryTaxFull - militaryTaxBenefit),
    netPay,
    hasViolations: Boolean(input.hasViolations),
    taxDisclaimer: Boolean(
      dv100Amount ||
        dv30Amount ||
        cat50Amount ||
        cat170Amount ||
        cat70Amount ||
        stormRestoreAmount ||
        stormCaptureAmount ||
        prisonerAmount ||
        destroyedAmount
    ),
  };
}

/**
 * Build result table lines (official calculator order).
 * @param {ReturnType<typeof calculate>} result
 * @returns {Array<object>}
 */
function buildResultLines(result) {
  const P = formatMoney;
  /** @type {Array<object>} */
  const lines = [];

  lines.push({
    name: "Оклад за військовим званням",
    value: result.ovz,
    abbr: "ОВЗ",
  });
  lines.push({
    name: "Посадовий оклад",
    value: result.po,
    abbr: "ПО",
  });
  if (result.nvr > 0) {
    lines.push({
      name: "Надбавка за вислугу років",
      value: result.nvr,
      abbr: "НВР",
      calc: `(${P(result.po)} ПО + ${P(result.ovz)} ОВЗ) × ${result.yearsPct}%`,
    });
  }
  if (result.nzt > 0) {
    lines.push({
      name: "Надбавка за таємність",
      value: result.nzt,
      abbr: "НзТ",
      calc: `${P(result.po)} ПО × ${result.secrecyPct}%`,
    });
  }
  if (result.nops > 0) {
    lines.push({
      name: "Надбавка за особливості проходження служби",
      value: result.nops,
      abbr: "НОПС",
      calc: `(${P(result.po)} ПО + ${P(result.ovz)} ОВЗ + ${P(result.nvr)} НВР) × ${result.nopsPct}%`,
    });
  }
  if (result.monthlyBonus > 0) {
    lines.push({
      name: "Щомісячна премія",
      value: result.monthlyBonus,
      abbr: "ЩП",
      calc: `${P(result.po)} ПО × ${result.premiumPct}%`,
    });
  }
  if (result.sso > 0) {
    lines.push({
      name: "Надбавка за службу в ССО",
      value: result.sso,
      abbr: "ССО",
      calc: `3 328 × 5 × ${result.ssoPct}%`,
    });
  }
  if (result.classAllow > 0) {
    lines.push({
      name: "Надбавка за кваліфікацію",
      value: result.classAllow,
      abbr: "НзК",
      calc: `${P(result.po)} ПО × ${result.classPct}%`,
    });
  }
  if (result.honorary > 0) {
    lines.push({
      name: "Надбавка за почесні звання",
      value: result.honorary,
      abbr: "НзПЗ",
      calc: `${P(result.po)} ПО × ${result.honoraryPct}%`,
    });
  }
  if (result.cipher > 0) {
    lines.push({
      name: "Надбавка за стаж на шифрувальній роботі",
      value: result.cipher,
      abbr: "НзШР",
      calc: `${P(result.po)} ПО × ${result.cipherPct}%`,
    });
  }
  if (result.sports > 0) {
    lines.push({
      name: "Надбавка за спортивні звання",
      value: result.sports,
      abbr: "НзСЗ",
      calc: `${P(result.po)} ПО × ${result.sportsPct}%`,
    });
  }
  if (result.science > 0) {
    lines.push({
      name: "Надбавка за науковий ступінь",
      value: result.science,
      abbr: "НзНС",
      calc: `${P(result.po)} ПО × ${result.sciencePct}%`,
    });
  }
  if (result.academic > 0) {
    lines.push({
      name: "Надбавка за вчене звання",
      value: result.academic,
      abbr: "НзВЗ",
      calc: `${P(result.po)} ПО × ${result.academicPct}%`,
    });
  }

  lines.push({
    name: "Разом місячне грошове забезпечення",
    value: result.monthlyTotal,
    abbr: "ГЗ",
    rowType: "separator",
  });

  const J = result.daysInMonth;
  const pushExtra = (cond, line) => {
    if (cond) lines.push(line);
  };

  pushExtra(result.dv100Amount > 0, {
    name: "Дод. винагорода 100 тис. (бойові дії)",
    value: result.dv100Amount,
    abbr: "ДВ100",
    calc: `100 000 / ${J} × ${result.dv100Days} днів`,
    limitItem: result.limitApplied,
  });
  pushExtra(result.dv30Amount > 0, {
    name: "Дод. винагорода 30 тис. (бойові завдання)",
    value: result.dv30Amount,
    abbr: "",
    calc: `30 000 / ${J} × ${result.dv30Days} днів`,
  });

  if (result.additionalDaysExceed) {
    lines.push({
      name: "Додаткові винагороди",
      value: null,
      error: "Кількість днів перевищує можливий ліміт",
      nonBlocking: false,
    });
  }

  if (result.onetimeExceed) {
    lines.push({
      name: "Одноразові винагороди",
      value: null,
      error: "Кількість днів перевищує можливий ліміт",
      nonBlocking: false,
    });
  }

  if (result.additionalTotal > 0) {
    pushExtra(result.cat170Amount > 0, {
      name: "Бойові завдання 170 тис. (до взводу)",
      value: result.cat170Amount,
      abbr: "ДВ170",
      calc: `${P(170000)} / ${J} × ${result.cat170Days} днів`,
      limitItem: result.limitApplied,
    });
    pushExtra(result.cat70Amount > 0, {
      name: "Бойові завдання 70 тис. (до роти)",
      value: result.cat70Amount,
      abbr: "ДВ70",
      calc: `${P(70000)} / ${J} × ${result.cat70Days} днів`,
      limitItem: result.limitApplied,
    });
    pushExtra(result.cat50Amount > 0, {
      name: "Дод. винагорода 50 тис. (пункт управління)",
      value: result.cat50Amount,
      abbr: "ДВ50",
      calc: `${P(50000)} / ${J} × ${result.cat50Days} днів`,
    });
    pushExtra(result.insCommanderAmount > 0, {
      name: "Інструктор (командир підрозділу)",
      value: result.insCommanderAmount,
      calc: `${P(25000)} / ${J} × ${result.insCommanderDays} днів`,
    });
    pushExtra(result.insBasicAmount > 0, {
      name: "Інструктор (базовий рівень)",
      value: result.insBasicAmount,
      calc: `${P(15000)} / ${J} × ${result.insBasicDays} днів`,
    });
    pushExtra(result.insMediumAmount > 0, {
      name: "Інструктор (середній рівень)",
      value: result.insMediumAmount,
      calc: `${P(25000)} / ${J} × ${result.insMediumDays} днів`,
    });
    pushExtra(result.insAdvancedAmount > 0, {
      name: "Інструктор (підвищений рівень)",
      value: result.insAdvancedAmount,
      calc: `${P(30000)} / ${J} × ${result.insAdvancedDays} днів`,
    });
    pushExtra(result.insUbdAmount > 0, {
      name: "Інструктор зі статусом УБД",
      value: result.insUbdAmount,
      calc: `${P(30000)} / ${J} × ${result.insUbdDays} днів`,
    });
    pushExtra(result.tilovaAmount > 0, {
      name: "Тилова надбавка",
      value: result.tilovaAmount,
      abbr: "ТН",
      calc: `${P(10000)} / ${J} × ${result.tilovaDays} днів`,
    });
    pushExtra(result.stormRestoreAmount > 0, {
      name: "Штурмові дії (відновлення)",
      value: result.stormRestoreAmount,
      abbr: "ШД20",
      calc: `20 000 × ${result.stormRestoreDays} днів`,
      limitItem: result.limitApplied,
    });
    pushExtra(result.stormCaptureAmount > 0, {
      name: "Штурмові дії (захоплення)",
      value: result.stormCaptureAmount,
      abbr: "ШД40",
      calc: `40 000 × ${result.stormCaptureDays} днів`,
      limitItem: result.limitApplied,
    });
    pushExtra(result.prisonerAmount > 0, {
      name: "Винагорода за взяття в полон",
      value: result.prisonerAmount,
      abbr: "ПОЛ",
      calc: `100 000 × ${result.prisonerCount} / ${result.prisonerParticipants} учасників`,
    });
    pushExtra(result.destroyedAmount > 0, {
      name: "Винагорода за знищення",
      value: result.destroyedAmount,
      abbr: "ЗН",
      calc: `15 000 × ${result.destroyedCount} / ${result.destroyedParticipants} учасників`,
    });

    if (result.limitApplied) {
      lines.push({
        name: `Перевищено ліміт ${P(LIMIT_CAP)} грн`,
        value: round2(result.limitRaw - LIMIT_CAP),
        error: `Перевищено на ${P(round2(result.limitRaw - LIMIT_CAP))} грн`,
        limitItem: true,
      });
    }

    lines.push({
      name: "Разом додаткові винагороди",
      value: result.additionalTotal,
      abbr: "ДВ",
      rowType: "subtotal",
    });
  }

  if (result.stormExceed) {
    lines.push({
      name: "Штурмові дії",
      value: null,
      error: "Кількість днів перевищує можливий ліміт",
      nonBlocking: false,
    });
  }

  lines.push({
    name: "Разом нараховано",
    value: result.accrued,
    abbr: "РН",
    calc:
      result.additionalTotal > 0
        ? `${P(result.monthlyTotal)} ГЗ + ${P(result.additionalTotal)} ДВ`
        : "",
    rowType: "subtotal",
  });

  if (result.hasViolations) {
    lines.push({
      name: "Порушення військової дисципліни",
      value: null,
      error:
        "Окремі порушення можуть впливати на виплату щомісячної премії та додаткових винагород лише у разі їх письмового оформлення відповідним наказом (розпорядженням) командира (начальника). У таких випадках фактична сума виплат може бути меншою за розраховану калькулятором.",
      calc: "",
      nonBlocking: true,
    });
  }

  if (result.militaryTaxNet > 0) {
    lines.push({
      name: "Військовий збір (1,5%)",
      value: -result.militaryTaxNet,
      calc: `${P(result.accrued)} РН × 1,5%`,
      negative: true,
    });
  }

  if (result.taxDisclaimer) {
    lines.push({
      name: "Військовий збір",
      value: null,
      error:
        "Окремі виплати можуть звільнятися від утримання військового збору, тому фактична сума військового збору може відрізнятись.",
      nonBlocking: true,
    });
  }

  lines.push({
    name: "До видачі на руки",
    value: result.netPay,
    rowType: "final",
  });

  return lines;
}


  global.SalaryCalculator = {
    LIMIT_CAP,
    LIVING_WAGE_DEFAULT,
    OVZ_BY_RANK_INDEX,
    RANK_TITLE_ORDER,
    TARIFF_ROWS,
    YEARS_PCT,
    SECRECY_PCT,
    CLASS_PCT,
    MEDICAL_CLASS_PCT,
    SSO_ALLOWANCE_PCT,
    HONORARY_PCT,
    SPORTS_PCT,
    SCIENCE_PCT,
    ACADEMIC_PCT,
    CIPHER_PCT,
    SERVICE_PLACE_CODE,
    NOPS_BY_POSITION,
    REWARD_DEFS,
    round2,
    formatMoney,
    ovzForRankTitle,
    tariffRow,
    daysInMonth,
    calculate,
    buildResultLines,
  };
})(window);
