function format(x) {
    if (x.lt(0)){return "-"+format(x.times(-1))}
    if (x.lte(1e3)) { return x.toFixed(4) }
    if (x.lte(1e6)) { return x.toFixed(0) }
    if (x.lte("1e1000000")) { return `${new Decimal.pow(10, x.log10().mod(1)).toFixed(4)}e${x.log10().floor()}` }
    if (x.lte("10^^5")) { return `e${format(x.log10())}` }
    else {return x}
}

function formatTime(x) {
    if (x.lte(60)) { return format(x) + "s" }
    else if (x.lte(3600)) { return x.div(60).floor() + "min " + formatTime(x.mod(60)) }
    else if (x.lte(86400)) { return x.div(3600).floor() + "h " + formatTime(x.mod(3600)) }
    else if (x.lte(86400 * 365)) { return x.div(86400).floor() + "d " + formatTime(x.mod(86400)) }
    else if (x.lte(86400 * 365 * 1000)) { return x.div(86400 * 365).floor() + "y " + formatTime(x.mod(86400 * 365)) }
    else {return format(x.div(86400*365))+"y"}
}