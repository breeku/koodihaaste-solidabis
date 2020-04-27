const reittidata = require("./reittidata.json")

const transformJSON = () => {
    let result = {}

    for (let node of reittidata.pysakit) {
        result = { ...result, [node]: null }
    }

    for (let value of reittidata.tiet) {
        let reitit = {}
        let tiet = reittidata.tiet.filter(
            (x) => value.mista === x.mista || value.mista === x.mihin
        )
        for (let tie of tiet) {
            let mista = tie.mista
            let mihin = tie.mihin
            if (mihin === value.mista) {
                let temp = mihin
                mihin = mista
                mista = temp
            }
            reitit = { ...reitit, [mihin]: tie.kesto }
        }

        result = { ...result, [value.mista]: reitit }
    }

    for (let reitti in result) {
        for (let node in result[reitti]) {
            if (!result[node]) {
                result[node] = {
                    ...result[node],
                    [reitti]: result[reitti][node],
                }
            }
        }
    }

    return result
}

const tiet = transformJSON()

const pathfinding = (from, to) => {
    if (from === "" || to === "" || from === to) {
        console.error("No route provided")
        return
    }

    let unvisited = Object.keys(tiet)
    let route = { nodes: [], time: 0 }
    let history = {
        [from]: { distance: 0, prevNode: from },
    }
    let currNode = from

    for (let node of unvisited) {
        if (node !== from)
            history = {
                ...history,
                [node]: { distance: Infinity, prevNode: null },
            }
    }

    while (unvisited.length > 0) {
        let neighbors = tiet[currNode]
        let next = null

        for (let neighbor in neighbors) {
            if (neighbor === from) {
                history = {
                    ...history,
                    [neighbor]: {
                        distance: neighbors[neighbor],
                        prevNode: currNode,
                    },
                }
            } else {
                let totalDistance = history[currNode].distance + neighbors[neighbor]
                let neighborDistance = history[neighbor].distance
                if (
                    neighborDistance === Infinity ||
                    neighborDistance >= totalDistance
                ) {
                    history = {
                        ...history,
                        [neighbor]: {
                            distance: totalDistance,
                            prevNode: currNode,
                        },
                    }
                }
            }
        }

        let index = unvisited.indexOf(currNode)
        if (index !== -1) unvisited.splice(index, 1)

        for (let node in history) {
            if (
                (next === null ||
                    history[node].distance < history[next].distance) &&
                unvisited.find((x) => x === node)
            ) {
                next = node
            }
        }

        currNode = next
    }

    let temp = to

    let reversedRoute = [temp]

    while (temp !== from) {
        temp = history[temp].prevNode
        reversedRoute.push(temp)
    }

    reversedRoute.reverse()
    route = { nodes: reversedRoute, time: history[to].distance }

    return route
}

module.exports = pathfinding
