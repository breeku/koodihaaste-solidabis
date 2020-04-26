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

export const pathfinding = (from, to) => {
    if (from === "" || to === "" || from === to) {
        console.error("No route provided")
        return
    }

    let unvisited = [...reittidata.pysakit]
    let visited = []
    let route = { nodes: [], time: 0 }
    let history = {
        [from]: { distance: 0, prevNode: from },
    }
    let currNode = from
    let index = -1
    let noVisitedNeighbors = []
    let next = null

    for (let node of unvisited) {
        if (node !== from)
            history = {
                ...history,
                [node]: { distance: Infinity, prevNode: null },
            }
    }
    while (unvisited.length > 0 || noVisitedNeighbors.length > 0) {
        let neighbors = tiet[currNode]
        let smallest = Infinity

        for (let node in history) {
            for (let neighbor in neighbors) {
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
                            history[neighbor].distance >= totalDistance
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

        visited.push(currNode)
        index = unvisited.indexOf(currNode)
        if (index !== -1) unvisited.splice(index, 1)

        for (let node in neighbors) {
            // go to the neighbor that has the smallest distance
            if (
                neighbors[node] <= smallest &&
                unvisited.find((x) => x === node)
            ) {
                smallest = neighbors[node]
                next = node
            }
        }

        if (next === null) {
            // if no more neighbors to be found, go to previous node
            if (history[currNode]) {
                next = history[currNode].prevNode
            } else {
                console.error("cannot go back to " + currNode)
                return
            }
        }

        if (currNode === next) {
            // if the previous node is the same as current node, search for nodes that have unvisited neighbors
            if (noVisitedNeighbors.length > 0) {
                next = noVisitedNeighbors[0]
                noVisitedNeighbors.splice(0, 1)
            } else {
                for (let node of visited) {
                    neighbors = tiet[node]
                    for (let neighbor in neighbors) {
                        if (unvisited.find((x) => x === neighbor)) {
                            noVisitedNeighbors.push(neighbor)
                        }
                    }
                }
            }
        }

        currNode = next
    }

    console.log(history)

    let temp = to

    let reversedRoute = [temp]

    while (temp !== from) {
        temp = history[temp].prevNode
        reversedRoute.push(temp)
    }

    reversedRoute.reverse()
    route = { nodes: reversedRoute, time: history[to].distance }

    console.log(route)
    return route
}
