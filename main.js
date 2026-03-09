color_loop = ["#fcc","#ebd","#dae","#cbf","#bcf","#adf","#9ef","#aee","#bed","#cec","#ddb","#edb","#fdc"]
rarity_loop = ["#aaa","#ccc","#eee","#9f9","#afa","#cfc","#9bf","#bdf","#dff","#a9f","#caf","#ecf","#e95","#fb7","#fd9","#f99","#fbb","#fdd"]


function cl(x) {
    return color_loop[new Decimal(x).mod(color_loop.length)]
}

function initPlayer() {
    return {
        points: new Decimal(0),
        upg: new Decimal(0),
        rp: new Decimal(0)
    }
}

player = (typeof (localStorage.getItem("wngu-r")) != null ? JSON.parse(localStorage.getItem("wngu-r")) : initPlayer())
for (i in player) {
    player[i] = new Decimal(player[i])
}

function hardReset() {
    player = initPlayer()
}

function getPPS() {
    var p = new Decimal(1)
    p = p.times(upgEffect(player.upg)[1])
    p = p.times(rpBoost())
    return p
}

function upgEffect(x) {
    var l = [x]
    while (true) {
        l = l.concat(l[l.length-1].div(5).floor())
        if (l[l.length-1].lte(0)){break}
    }
    l = l.map(x => x.mod(5)) //new function unlocked :3
    var r = new Decimal(0)
    for (i in l) {
        r = r.add(Decimal.pow(7,i).times(l[i]))
    }
    return [l,new Decimal.pow(1.1,r)]
}

function upgCost(x) {
    return new Decimal.pow(1.09,x.pow(6/5)).times(8)
}

function buyMax() {
    return player.points.add(1).div(8).log10().add(1).div(new Decimal(1.09).log10()).pow(5/6).floor()
}

function barText(x) {
    var x = upgEffect(x)[0]
    var t = ""
    for (i in x) {
        t = t + `<div style="position: absolute; top: ${i * 3 + 35}%; height: 3%; width: 50%">${x[i]}/5 <span style="color: #555; font-size: 11px">(x${format(Decimal.pow(1.1, Decimal.pow(7, i)))} for each)</span><div style="z-index: -10000; position: absolute; top: 0%;height: 100%; width: ${x[i].times(20)}%; background-color: ${cl(i)}"></div></div>`
    }
    return t
}

function buyUpg() {
    if (player.points.gte(upgCost(player.upg))) {
        player.points = player.points.sub(upgCost(player.upg))
        if (buyMax().sub(player.upg).gte(15)) { player.upg = buyMax().sub(10) }
        else { player.upg = player.upg.add(1) }
    }
}

function rpGain() {
    return new Decimal.pow(10,player.points.div(1e6).add(1).log10().pow(0.76))
}

function rpText() {
    if (player.points.lt(1e6)) {
        return "Reach 1.000e6 points to unlock."
    }
    else {
        return `Rebirth for <b>${format(rpGain())}</b> Rebirth points`
    }
}

function rpBoost() {
    var p = player.rp.add(1).times(10).sub(9).pow(0.65)
    if (p.gte(1e15)) { p = new Decimal(10).pow(p.div(1e15).add(1).log10().pow(0.96)).times(1e15) }
    return p
}

function rebirth() {
    if (player.points.gte(1e6)) {
        player.rp = player.rp.add(rpGain())
        player.points = new Decimal(0)
        player.upg = new Decimal(0)
    }
}

function update(dt) {
    document.getElementById("point_display").innerHTML = `<b style="font-size: 25px">${format(player.points)}</b> points<br>${format(getPPS())}/s`
    document.getElementById("upg").innerHTML = `<b>Boost your point gain!</b><br>Cost: $${format(upgCost(player.upg))}<br><br>Bought: ${format(player.upg)}`
    document.getElementById("bars").innerHTML = barText(player.upg)
    document.getElementById("reb").innerHTML = rpText()
    document.getElementById("reb_text").innerHTML = `${format(player.rp)} Rebirth points<hr>x${format(rpBoost())} Points`
    player.points = player.points.add(getPPS().times(dt))
}

function save() {
    localStorage.setItem("wngu-r",JSON.stringify(player))
}

last_updated = Date.now()
function main() {
    update((Date.now() - last_updated) / 1000)
    last_updated = Date.now()
}

setInterval(main,1)
setInterval(save,1000,0)