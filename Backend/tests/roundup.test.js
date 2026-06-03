const { calculateRoundup } = require('../utils/roundup');
const { calculateGrowth } = require('../utils/growth');

describe('calculateRoundup', () => {

    test('standard amounts - rounds up to next whole pound', () => {
        expect(calculateRoundup(4.32).toNumber()).toBe(0.68);
        expect(calculateRoundup(15.67).toNumber()).toBe(0.33);
        expect(calculateRoundup(23.01).toNumber()).toBe(0.99);
    });

    test('whole pound amount - returns 0.00 (no spare change)', () => {
    expect(calculateRoundup(5.00).toNumber()).toBe(0.00);
    expect(calculateRoundup(10.00).toNumber()).toBe(0.00);
    });

    test('edge cases', () => {
        expect(calculateRoundup(0.99).toNumber()).toBe(0.01);
        expect(calculateRoundup(1.01).toNumber()).toBe(0.99);
        expect(calculateRoundup(999.99).toNumber()).toBe(0.01);
    });

});

describe('calculateGrowth', () => {

    test('returns results for all three risk profiles', () => {
        const roundups = [
            { roundup_amount: '10.00', created_at: new Date() }
        ];
        const result = calculateGrowth(roundups);

        expect(result).toHaveProperty('conservative');
        expect(result).toHaveProperty('balanced');
        expect(result).toHaveProperty('aggressive');
    });

    test('total_invested equals sum of all roundup amounts', () => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const roundups = [
            { roundup_amount: '0.68', created_at: oneMonthAgo },
            { roundup_amount: '0.33', created_at: oneMonthAgo },
            { roundup_amount: '0.99', created_at: oneMonthAgo }
        ];
        const result = calculateGrowth(roundups);

        expect(result.conservative.total_invested).toBe(2.00);
        expect(result.balanced.total_invested).toBe(2.00);
        expect(result.aggressive.total_invested).toBe(2.00);
    });

    test('roundup invested for 0 days produces no growth', () => {
        const today = new Date();
        const roundups = [{ roundup_amount: '10.00', created_at: today }];
        const result = calculateGrowth(roundups);

        expect(result.conservative.current_value).toBe(10.00);
        expect(result.balanced.current_value).toBe(10.00);
        expect(result.aggressive.current_value).toBe(10.00);
    });

    test('roundup invested for 365 days produces realistic growth at 5%', () => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const roundups = [{ roundup_amount: '100.00', created_at: oneYearAgo }];
        const result = calculateGrowth(roundups);

        const growth = result.conservative.current_value - result.conservative.total_invested;
        expect(growth).toBeGreaterThan(4.00);
        expect(growth).toBeLessThan(6.00);
    });

    test('aggressive profile always produces more growth than conservative', () => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const roundups = [{ roundup_amount: '100.00', created_at: oneYearAgo }];
        const result = calculateGrowth(roundups);

        expect(result.aggressive.current_value).toBeGreaterThan(result.conservative.current_value);
    });

    test('projections exist for 1, 3, 5 and 10 years', () => {
        const roundups = [{ roundup_amount: '10.00', created_at: new Date() }];
        const result = calculateGrowth(roundups);

        expect(result.balanced.projections).toHaveProperty('1yr');
        expect(result.balanced.projections).toHaveProperty('3yr');
        expect(result.balanced.projections).toHaveProperty('5yr');
        expect(result.balanced.projections).toHaveProperty('10yr');
    });

});