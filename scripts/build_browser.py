#!/usr/bin/env python3
"""Regenerate browser bundles from src/ ES modules."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent


def strip_exports(src: str) -> str:
    """Turn `export const/function` into plain declarations for an IIFE."""
    src = re.sub(r"^export\s+", "", src, flags=re.MULTILINE)
    return src


def build_salary_calculator_browser() -> str:
    calc_src = strip_exports((ROOT / "src/salaryCalculator.js").read_text())
    return f"""(function (global) {{
{calc_src}

  global.SalaryCalculator = {{
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
    PREMIUM_DEPRIVATION_PCT,
    round2,
    formatMoney,
    ovzForRankTitle,
    tariffRow,
    daysInMonth,
    calculate,
    buildResultLines,
  }};
}})(window);
"""


def build_nops_catalog_browser() -> str:
    src = strip_exports((ROOT / "src/nopsCatalog.js").read_text())
    return f"""(function (global) {{
{src}

  global.NopsCatalog = {{
    NOPS_CATEGORIES,
    getNopsCategory,
    getNopsSpecialization,
    formatNopsPct,
  }};
}})(window);
"""


def build_form_browser() -> None:
    calc_browser = build_salary_calculator_browser()
    nops_browser = build_nops_catalog_browser()
    form_src = (ROOT / "src/allowance-form.js").read_text()
    # Drop ESM import if present; browser uses window.SalaryCalculator.
    form_src = re.sub(
        r'^import\s+\{[^}]+\}\s+from\s+["\']\.\/salaryCalculator\.js["\'];\s*\n?',
        "",
        form_src,
        flags=re.MULTILINE,
    )
    browser_form = f"""{calc_browser}
{nops_browser}
(function () {{
  const {{
    calculate,
    formatMoney,
    round2,
    REWARD_DEFS,
    buildResultLines,
    SSO_ALLOWANCE_PCT,
  }} = window.SalaryCalculator;
  const {{
    NOPS_CATEGORIES,
    getNopsCategory,
    getNopsSpecialization,
    formatNopsPct,
  }} = window.NopsCatalog;

{form_src}
}})();
"""
    (ROOT / "allowance-form.browser.js").write_text(browser_form)
    (ROOT / "salaryCalculator.browser.js").write_text(calc_browser)


if __name__ == "__main__":
    build_form_browser()
    print("Browser bundles updated.")
