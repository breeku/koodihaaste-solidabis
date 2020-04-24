import { reittidata } from "./reittidata"

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
    return result
}

const tiet = transformJSON()

export const pathfinding = (from, to) => {
    if (from === "" || to === "" || from === to) {
        console.error("No route provided")
        return
    }
    let unvisited = []
    let visited = [from]
    let route = { nodes: [], time: 0 }
    let history = {}
    let currNode = from
    let index = -1

    for (let tie in tiet) {
        if (!unvisited.find((x) => x === tie)) unvisited.push(tie)
    }

    index = unvisited.indexOf(from)
    if (index !== -1) unvisited.splice(index, 1)

    for (let node of unvisited) {
        history = { ...history, [node]: { distance: null, prevNode: null } }
    }

    while (unvisited.length > 0) {
        let neighbors = tiet[currNode]
        let smallest = 999
        let next = null

        for (let node in history) {
            for (let neighbor in neighbors) {
                if (
                    unvisited.find((x) => x === neighbor) &&
                    !visited.find((x) => x === neighbor)
                ) {
                    if (neighbors[neighbor] < smallest) {
                        smallest = neighbors[neighbor]
                        next = neighbor
                    }
                    if (node === neighbor) {
                        if (currNode === from) {
                            history = {
                                ...history,
                                [node]: {
                                    distance: neighbors[node],
                                    prevNode: currNode,
                                },
                            }
                        } else {
                            let totalDistance =
                                history[currNode].distance + neighbors[node]
                            if (
                                history[neighbor].distance === null ||
                                history[neighbor].distance > totalDistance
                            ) {
                                history = {
                                    ...history,
                                    [node]: {
                                        distance: totalDistance,
                                        prevNode: currNode,
                                    },
                                }
                            }
                        }
                    }
                }
            }
        }

        if (next === null) {
            next = history[currNode].prevNode
        }

        currNode = next

        index = unvisited.indexOf(currNode)
        if (index !== -1) unvisited.splice(index, 1)

        visited.push(next)
    }

    let muuttuja = to

    let reversedRoute = [muuttuja]

    while (muuttuja !== from) {
        muuttuja = history[muuttuja].prevNode
        reversedRoute.push(muuttuja)
    }

    reversedRoute.reverse()
    route = { nodes: reversedRoute, time: history[to].distance }

    return route
}
