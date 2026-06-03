const Decimal = require('decimal.js');

function calculateRoundup(amount) {
    const value = new Decimal(amount);
    const ceiling = value.ceil();

    // If amount is already a whole number, roundup is 0
    if (value.equals(ceiling)) {
        return new Decimal(0);
    }

    return ceiling.minus(value);
}

module.exports = { calculateRoundup };