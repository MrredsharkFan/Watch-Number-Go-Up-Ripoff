function format(x) {
    if (x.lte(1e3)) { return x.toFixed(3) }
    if (x.lte(1e6)) { return x.toFixed(0) }
    if (x.lte("1e1000000")) { return `${new Decimal.pow(10, x.log10().mod(1)).toFixed(3)}e${x.log10().floor()}` }
    if (x.lte("10^^5")) { return `e${format(x.log10())}` }
    else {return x}
}