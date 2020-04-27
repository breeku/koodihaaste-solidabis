const updateTravelInfo = (route, lines) => {
    let travelInfo = document.getElementById('travelInfo');
    travelInfo.innerHTML = ""
    for (let node of route.nodes) {
        let index = route.nodes.indexOf(node)
        let color = ""
        for (let c in lines) {
            if (lines[c].find(x => x === node) && lines[c].find(x => x === route.nodes[index + 1])) {
                color = c
            }
        }
        if (color !== "") {
            travelInfo.innerHTML += node + " -> " + route.nodes[index + 1] + " = " + color + ". "
        } else {
            travelInfo.innerHTML += "Kesto " + route.time + "."
        }
    }
}

const updateLoading = data => {
    let loadingDOM = document.getElementById('loading')
    loadingDOM.innerHTML = "Loading..." + "<br>" + data.itemsLoaded + "/" + data.itemsTotal 
}

const removeLoading = () => {
    let loadingDOM = document.getElementById('loading')
    loadingDOM.style.opacity = 0
}

module.exports = {updateTravelInfo, updateLoading, removeLoading}