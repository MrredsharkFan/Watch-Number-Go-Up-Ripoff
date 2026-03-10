color_loop = ["#fcc","#ebd","#dae","#cbf","#bcf","#adf","#9ef","#aee","#bed","#cec","#ddb","#edb","#fdc"]
rarity_loop = ["#aaa","#ccc","#eee","#9f9","#afa","#cfc","#9bf","#bdf","#dff","#a9f","#caf","#ecf","#e95","#fb7","#fd9","#f99","#fbb","#fdd","#f7f","#faf","#fcf","#ff7","#ffa","#ffd","#77f","#aaf","#ddf","#f7a","#fac","#fdf","#4bc","#7de","#9ef"]


function cl(x) {
    return color_loop[new Decimal(x).mod(color_loop.length)]
}

function initPlayer() {
    return {
        points: new Decimal(0),
        upg: new Decimal(0),
        rp: new Decimal(0),
        rup_spent: new Decimal(0),
        rup: {"1_1":new Decimal(0)},
    }
}

player = (typeof (localStorage.getItem("wngu-r")) != null ? JSON.parse(localStorage.getItem("wngu-r")) : initPlayer())
for (i in player) {
    if (i != "rup") { player[i] = new Decimal(player[i]) }
}
for (i in player.rup) {
    player.rup[i] = new Decimal(player.rup[i])
}

function hardReset() {
    player = initPlayer()
    rupButtonGen()
}

function getPPS() {
    var p = new Decimal(1)
    p = p.times(upgEffect(player.upg)[1])
    p = p.times(rpBoost())
    if (typeof(player.rup["1_1"])!="undefined"){p = p.times(player.rup["1_1"].add(1))}
    return p
}

function upgEffect(x) {
    var l = [x]
    var m = [x]
    while (true) {
        l = l.concat(l[l.length - 1].div(5).floor())
        m = m.concat(m[m.length - 1].div(5**m.length).ceil().times(5**m.length))
        if (l[l.length-1].lte(0)){break}
    }
    l = l.map(x => x.mod(5)) //new function unlocked :3
    var r = new Decimal(0)
    for (i in l) {
        r = r.add(Decimal.pow(7,i).times(l[i]))
    }
    return [l,new Decimal.pow(1.1,r),m]
}

function upgCost(x) {
    return new Decimal.pow(1.09,x.pow(6/5)).times(8)
}

function buyMax() {
    return player.points.add(1).div(8).log10().add(1).div(new Decimal(1.09).log10()).pow(5/6).floor()
}

function barText(x) {
    var r = upgEffect(x)[2]
    var x = upgEffect(x)[0]
    var t = ""
    for (i in x) {
        var f = x[i].times(20)
        var g = i
        t = t + `<div style="position: absolute; top: ${i * 3 + 35}%; height: 3%; width: 50%">${x[i]}/5<span style="color: #555; font-size: 9px">(x${format(Decimal.pow(1.1, Decimal.pow(7, i)))} for each, in ${formatTime(timeLeft(r[i]))})</span><div style="z-index: -10000; position: absolute; top: 0%;height: 100%; width: ${f}%; background-color: ${cl(g)}"></div></div>`
    }
    return t
}

function buyUpg() {
    if (player.points.gte(upgCost(player.upg))) {
        player.points = player.points.sub(upgCost(player.upg))
        if (buyMax().sub(player.upg).gte(15)) { player.upg = buyMax().sub(14) }
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

function respec() {
    player.rup_spent = new Decimal(0)
    player.rup = {"1_1": new Decimal(0)}
    document.getElementById("rUpg").innerHTML = rupButtonGen()
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

function rupp() {
    var i = player.rp.add(1).log2().sub(70).max(0)
    return [i.floor(),new Decimal(2).pow(i.floor().add(71))]
}

function RUpgCost(u) {
    var p = u.split("_")
    return new Decimal((p[0]-p[1])+1).pow(0.95).times(new Decimal(2).pow(p[0])).div(5).max(1).floor()
}

function buyRUpg(u) {
    console.log(player.rup[u])
    if (document.getElementById(u).innerHTML != "") {
        var u = u.split("_")
        var p = u.join("_")
        console.log(u, p)
        if (player.rup_spent.add(RUpgCost(p)).lte(rupp()[0])&&player.rup[p].eq(0)) {
            player.rup_spent = player.rup_spent.add(RUpgCost(p))
            player.rup[p] = new Decimal(1)
            if (u[1] == 1) {
                player.rup[[u[0] / 2 * 2 + 1, 1].join("_")] = new Decimal(0)
            }
            player.rup[[u[0] / 2 * 2 + 1, u[1] / 2 * 2 + 1].join("_")] = new Decimal(0)
            document.getElementById("rUpg").innerHTML = rupButtonGen()
        }
        
    }
}

function rupButtonGen() {
    var t = "<button onclick=\"respec()\">Respec</button>"
    for (k in player.rup) {
        var i = k.split("_")[0]*2/2
        var j = k.split("_")[1] * 2 / 2-1
        console.log(i,j)
        t = t + `<button style="right: ${(i - j - 1) * 10}%; top: ${i * 10}%; background-color: ${cl(j - i + 100)}" id="${i}_${j + 1}" onclick="buyRUpg(${i}+'_'+${j+1})"></button>`
    }
        return t
}

function generateUpgradeText(id) {
    if (typeof (player.rup[id]) == "undefined") {
        var s = new Decimal(0) 
    }
    else {
        var s = player.rup[id]
    }
    if (id.split("_")[1] == 1) {
        var t = id.split("_")[0]==1?`Point gain x${format(s.add(1))}.`:`Generators in this row x${format(s.add(1))}`
    } else {
        var t = `Boost the generator above by ${format(s)}/s.`
    }
    document.getElementById(id).innerHTML = `${t}<br>Cost: ${format(RUpgCost(id))}`
}

function updateUpg() {
    for (i in player.rup) {
        generateUpgradeText(i)
    }
    generateUpgradeText("1_1")
}

function rUpgTick(dt) {
    for (i in player.rup) {
        var k = i.split("_")
        if (typeof (player.rup[k[0] + "_1"]) == "undefined"||i=="1_1") { var mult = new Decimal(1) } else { var mult = player.rup[k[0] + "_1"].add(1) }
        if (k[1] != 1 && k[0] != 1) {
            player.rup[k[0] - 1 + "_" + (k[1]-1)] = player.rup[k[0]-1+"_"+(k[1]-1)].add(player.rup[i].times(dt).times(mult))
        }
    }
}

function rarityBar() {
    threshold = ["10", "100", "1000", "1000000", "1e9", "1e12", "1e25", "1e50", "1e100", "1e150", "1e200", "1e300", "1e500", "1e750", "1e1000", "1e1500", "1e2000", "1e3000", "1e5000", "1e10000", "1e20000", "1e50000", "1e100000","ee6","ee7","ee10","ee12","ee15"]
    var i = 0
    while (true) {
        if (player.points.gte(threshold[i])) {
            i++
        } else {break}
    }
    var i1 = new Decimal(threshold[i]).add(1).slog()
    var i2 = new Decimal(threshold[i - 1]).add(1).slog()
    var i3 = player.points.add(1).slog()
    return [i,(i3-i2)/(i1-i2)]
}

function rarityThing() {
    document.getElementById("rar_text").style.width = rarityBar()[1] * 100 + "%"
    document.getElementById("rar_text").style["background-color"] = rarity_loop[rarityBar()[0]]
    document.getElementById("rar_text").innerHTML = `Tier ${rarityBar()[0]} (${(rarityBar()[1]*100).toFixed(2)}% to next [${threshold[rarityBar()[0]]}])`
}

function timeLeft(j=player.upg) {
    return upgCost(j).sub(player.points).div(getPPS()).max(0)
}

document.getElementById("rUpg").innerHTML = rupButtonGen()
fps = 0
function update(dt) {
    last_updated = Date.now()
    fps = fps+ (1 / dt-fps)/(1/dt**0.5)
    document.getElementById("fps").innerHTML = Math.floor(fps)+" fps"
    document.getElementById("point_display").innerHTML = `<b style="font-size: 25px">${format(player.points)}</b> points (${format(getPPS())}/s)`
    document.getElementById("upg").innerHTML = `<b>Boost your point gain!</b><br>Cost: $${format(upgCost(player.upg))}<br><br>Bought: ${format(player.upg)}<br><i>Time left: ${formatTime(timeLeft())}</i>`
    document.getElementById("bars").innerHTML = barText(player.upg)
    document.getElementById("reb").innerHTML = rpText()
    document.getElementById("reb_text").innerHTML = `${format(player.rp)} Rebirth points<hr>x${format(rpBoost())} Points`
    document.getElementById("rup_text").innerHTML = `${format(rupp()[0].sub(player.rup_spent))} / ${format(rupp()[0])}, next at ${format(rupp()[1])} RP`
    updateUpg()
    rarityThing()
    rUpgTick(dt)
    player.points = player.points.add(getPPS().times(dt))
}

function save() {
    localStorage.setItem("wngu-r",JSON.stringify(player))
}

last_updated = Date.now()
function main() {
    update((Date.now() - last_updated) / 1000)
}

setInterval(main,1)
setInterval(save,1000,0)