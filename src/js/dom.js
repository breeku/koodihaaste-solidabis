const colors = {
    keltainen: '<span style="color: yellow">keltainen</span>',
    punainen: '<span style="color: darkred">punainen</span>',
    vihreä: '<span style="color: lightgreen">vihreä</span>',
    sininen: '<span style="color: blue">sininen</span>',
}
const travelInfo = document.getElementById('travelInfo');
const loadingDOM = document.getElementById('loading')

const updateTravelInfo = (route, lines) => {
    let string = ""
    travelInfo.style.opacity = 0
    for (let node of route.nodes) {
        let index = route.nodes.indexOf(node)
        let color = ""
        for (let c in lines) {
            if (lines[c].find(x => x === node) && lines[c].find(x => x === route.nodes[index + 1])) {
                color = c
            }
        }
        if (color !== "") {
            string += node + " -> " + route.nodes[index + 1] + " = " + colors[color] + ". "
        } else {
            string += "Kesto " + route.time + "."
        }
    }
    setTimeout(() => {
        travelInfo.style.opacity = 1
        travelInfo.innerHTML = string
    }, 500)

}

const updateLoading = data => {
    loadingDOM.innerHTML = "Loading..." + "<br>" + data.itemsLoaded + "/" + data.itemsTotal 
}

const removeLoading = () => {
    loadingDOM.style.opacity = 0
}

module.exports = {updateTravelInfo, updateLoading, removeLoading}