export const updateTravelInfo = (route, lines) => {
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
            travelInfo.innerHTML += index === route.nodes.length - 1 ? "" : node + " -> " + route.nodes[index + 1] + " using " + color + ". "
        }
    }
}
