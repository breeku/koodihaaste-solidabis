const reittidata = require("./reittidata.json")

const transformJSON = () => {
    let result = {}

    for (let node of reittidata.pysakit) {
        result = { ...result, [node]: null }
    }

    for (let value of reittidata.tiet) {
        let reitit = {}
        const tiet = reittidata.tiet.filter(
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

    for (const reitti in result) {
        for (const node in result[reitti]) {
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

    const unvisited = Object.keys(tiet)
    let route = { nodes: [], time: 0 }
    let history = {
        [from]: { distance: 0, prevNode: from },
    }
    let currNode = from

    for (const node of unvisited) {
        if (node !== from)
            history = {
                ...history,
                [node]: { distance: Infinity, prevNode: null },
            }
    }

    while (unvisited.length > 0) {
        const neighbors = tiet[currNode]
        let next = null

        for (const neighbor in neighbors) {
            if (neighbor === from) {
                history = {
                    ...history,
                    [neighbor]: {
                        distance: neighbors[neighbor],
                        prevNode: currNode,
                    },
                }
            } else {
                const totalDistance = history[currNode].distance + neighbors[neighbor]
                const neighborDistance = history[neighbor].distance
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

        const index = unvisited.indexOf(currNode)
        if (index !== -1) unvisited.splice(index, 1)

        for (const node in history) {
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

    const reversedRoute = [temp]

    while (temp !== from) {
        temp = history[temp].prevNode
        reversedRoute.push(temp)
    }

    reversedRoute.reverse()
    route = { nodes: reversedRoute, time: history[to].distance }

    return route
}

module.exports = pathfinding
