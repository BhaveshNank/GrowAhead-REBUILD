// the compound interest engine
const Decimal = require('decimal.js');

const RISK_PROFILES = {
  conservative: new Decimal('0.05'),
  balanced: new Decimal('0.08'),
  aggressive: new Decimal('0.12'),
};

const PROJECTION_YEARS = [1, 3, 5, 10];

/**
 * Given a list of roundups, calculates:
 * 1. Current portfolio value per risk profile (time-weighted)
 * 2. Future projections at 1, 3, 5, 10 years per risk profile
 */
function calculateGrowth(roundups) {
  const now = new Date();

  const results = {};

  for (const [profileName, annualRate] of Object.entries(RISK_PROFILES)) {
    const dailyRate = annualRate.dividedBy(365);

    // Step 1: Current value — each roundup compounded from its created_at to now
    let currentValue = new Decimal(0);

    for (const roundup of roundups) {
      const investedAt = new Date(roundup.created_at);
      const daysInvested = Math.floor(
        (now - investedAt) / (1000 * 60 * 60 * 24)
      );

      const amount = new Decimal(roundup.roundup_amount);

      // Compound interest: A = P * (1 + r)^t
      const compounded = amount.times(
        dailyRate.plus(1).pow(daysInvested)
      );

      currentValue = currentValue.plus(compounded);
    }

    // Step 2: Total roundups pot (principal)
    const totalPrincipal = roundups.reduce(
      (sum, r) => sum.plus(new Decimal(r.roundup_amount)),
      new Decimal(0)
    );

    // Step 3: Projections — compound the current value forward
    const projections = {};
    for (const years of PROJECTION_YEARS) {
      const days = years * 365;
      const projected = currentValue.times(
        dailyRate.plus(1).pow(days)
      );
      projections[`${years}yr`] = projected.toDecimalPlaces(2).toNumber();
    }

    results[profileName] = {
      annual_rate_pct: annualRate.times(100).toNumber(),
      total_invested: totalPrincipal.toDecimalPlaces(2).toNumber(),
      current_value: currentValue.toDecimalPlaces(2).toNumber(),
      projections,
    };
  }

  return results;
}

module.exports = { calculateGrowth };