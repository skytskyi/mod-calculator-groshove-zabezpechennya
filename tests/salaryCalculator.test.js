import { describe, expect, it } from "vitest";
import { calculate, formatMoney, round2 } from "../src/salaryCalculator.js";

describe("calculate — screenshot monthly GZ", () => {
  it("matches official component amounts", () => {
    const result = calculate({
      ovz: 740,
      tariff: 6,
      yearsKey: "y5",
      servicePlace: "general",
      nopsPct: 65,
      secrecy: "secret",
      isRso: true,
      classQualification: "master",
      honoraryTitle: "honored",
      sportsTitle: "intl_master",
      scienceDegree: "phd",
      academicTitle: "professor",
      cipherTenure: "y1_3",
      extraRanks: true,
      month: 4,
      year: 2026,
      rewardDays: {},
      hasViolations: false,
    });

    expect(result.po).toBe(2910);
    expect(result.ovz).toBe(740);
    expect(result.nvr).toBe(1642.5);
    expect(result.nzt).toBe(873);
    expect(result.nops).toBe(3440.13);
    expect(result.monthlyBonus).toBe(14928.3);
    expect(result.classAllow).toBe(203.7);
    expect(result.honorary).toBe(291);
    expect(result.cipher).toBe(291);
    expect(result.sports).toBe(291);
    expect(result.science).toBe(145.5);
    expect(result.academic).toBe(291);
    expect(result.monthlyTotal).toBe(26047.13);
  });

  it("matches full additional rewards + net from screenshot", () => {
    // Shared days in screenshot include instructor UBD (3). Emulate with
    // train_advanced bump is wrong; inject via a side path: absence 0 and
    // treat UBD as extra shared by temporarily using train_advanced days.
    // Official shared = cat50+dv100+dv30+ins* including UBD.
    // Our calculator has no UBD — add those 3 days as a fictional shared via
    // increasing absence? No — absence reduces tilova but doesn't pay.
    // For tilova 7 with storms 2+2: tilova = 30 - shared - absence - 4.
    // Need shared+absence = 19. Shared without UBD = 14 → need absence=5 or UBD=3+absence=2.
    // Screenshot: insUbd 3 days. Our form lacks UBD. Verify with exact shared set
    // by using command_posts etc + manually checking formula pieces.

    const result = calculate({
      ovz: 740,
      tariff: 6,
      yearsKey: "y5",
      servicePlace: "general",
      nopsPct: 65,
      secrecy: "secret",
      isRso: true,
      classQualification: "master",
      honoraryTitle: "honored",
      sportsTitle: "intl_master",
      scienceDegree: "phd",
      academicTitle: "professor",
      cipherTenure: "y1_3",
      extraRanks: true,
      month: 4,
      year: 2026,
      rewardDays: {
        combat_actions: 2,
        combat_special: 1,
        command_posts: 2,
        train_commander: 2,
        train_basic: 3,
        train_mid: 2,
        train_advanced: 2,
        train_ubd: 3,
        stronghold_platoon: 2,
        stronghold_company: 2,
        restore_positions: 2,
        capture_positions: 2,
        training_leave: 2,
      },
      prisonersCount: 1,
      prisonersParticipants: 1,
      enemiesCount: 1,
      enemiesParticipants: 1,
      hasViolations: true,
    });

    // shared = 2+2+1+2+3+2+2+3 = 17; tilova = 30-17-2-2-2 = 7
    expect(result.tilovaDays).toBe(7);
    expect(result.tilovaAmount).toBe(2333.33);
    expect(result.dv100Amount).toBe(6666.67);
    expect(result.cat170Amount).toBe(11333.33);
    expect(result.cat70Amount).toBe(4666.67);
    expect(result.stormRestoreAmount).toBe(40000);
    expect(result.stormCaptureAmount).toBe(80000);
    expect(result.prisonerAmount).toBe(100000);
    expect(result.destroyedAmount).toBe(15000);
    expect(result.additionalTotal).toBe(274166.67);
    expect(result.accrued).toBe(300213.8);
    expect(result.militaryTaxFull).toBe(4503.21);
    expect(result.militaryTaxBenefit).toBe(0);
    expect(result.militaryTaxNet).toBe(4503.21);
    expect(result.netPay).toBe(295710.59);
  });
});

describe("formatMoney", () => {
  it("formats with grouping spaces and comma decimals", () => {
    expect(formatMoney(2910)).toBe("2 910,00");
    expect(formatMoney(26047.13)).toBe("26 047,13");
    expect(round2(3440.125)).toBe(3440.13);
  });
});

describe("independent day pools", () => {
  it("allows full additional days and full storm days in the same month", () => {
    const result = calculate({
      ovz: 740,
      tariff: 6,
      yearsKey: "y5",
      servicePlace: "general",
      nopsPct: 65,
      month: 4,
      year: 2026,
      rewardDays: {
        combat_actions: 30,
        capture_positions: 30,
      },
    });

    expect(result.additionalDaysExceed).toBe(false);
    expect(result.stormExceed).toBe(false);
    expect(result.dv100Amount).toBe(100000);
    expect(result.stormCaptureAmount).toBe(1200000);
    expect(result.tilovaDays).toBe(0);
    expect(result.limitApplied).toBe(true);
    expect(result.limitCapped).toBe(460000);
  });

  it("blocks only the additional pool when its days exceed the month", () => {
    const result = calculate({
      ovz: 740,
      tariff: 6,
      yearsKey: "y5",
      servicePlace: "general",
      nopsPct: 65,
      month: 4,
      year: 2026,
      rewardDays: {
        combat_actions: 31,
        capture_positions: 2,
      },
    });

    expect(result.additionalDaysExceed).toBe(true);
    expect(result.dv100Amount).toBe(0);
    expect(result.stormExceed).toBe(false);
    expect(result.stormCaptureAmount).toBe(80000);
  });
});

describe("medical class and SSO allowance", () => {
  it("uses the medical qualification matrix", () => {
    const result = calculate({
      rankTitle: "Солдат, матрос",
      tariff: 1,
      yearsKey: "y0",
      servicePlace: "general",
      nopsPct: 65,
      classQualification: "medical",
      medicalQualCategory: "higher",
      medicalQualPost: "surgical",
      month: 4,
      year: 2026,
      rewardDays: {},
    });
    expect(result.classPct).toBe(11);
    expect(result.classAllow).toBe(round2((2470 * 11) / 100));
  });

  it("calculates SSO allowance from 3328 × 5", () => {
    const result = calculate({
      rankTitle: "Солдат, матрос",
      tariff: 1,
      yearsKey: "y0",
      servicePlace: "sso",
      nopsPct: 87.8,
      ssoAllowancePct: 100,
      month: 4,
      year: 2026,
      rewardDays: {},
    });
    expect(result.livingWage).toBe(3328);
    expect(result.sso).toBe(16640);
  });
});
