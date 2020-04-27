const reittidata = require("./reittidata")

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

    let unvisited = [...reittidata.pysakit]
    let visited = []
    let route = { nodes: [], time: 0 }
    let history = {
        [from]: { distance: 0, prevNode: from },
    }
    let currNode = from
    let index = -1
    let notVisitedNeighbors = []
    let next = null

    for (let node of unvisited) {
        if (node !== from)
            history = {
                ...history,
                [node]: { distance: Infinity, prevNode: null },
            }
    }

    let i = 0

    while (unvisited.length > 0 || notVisitedNeighbors.length > 0) {
        let neighbors = tiet[currNode]
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
                            history[neighbor].distance === Infinity ||
                            history[neighbor].distance >= totalDistance
                        ) {
                            //console.log(node + ":" + "{ distance: " + totalDistance + ", prevNode: " + currNode + "}")
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

        let smallest = Infinity
        for (let node in neighbors) {
            // go to the neighbor that has the smallest distance
            if (
                neighbors[node] <= smallest &&
                unvisited.find((x) => x === node)
            ) {
                smallest = neighbors[node]
                next = neighbors[node]
            }
        }
        /*
        if (next === currNode) {
            // search from visited list for nodes that have unvisited neighbors
            if (notVisitedNeighbors.length === 0) {
                for (let node of visited) {
                    neighbors = tiet[node]
                    for (let neighbor in neighbors) {
                        if (unvisited.find((x) => x === neighbor)) {
                            notVisitedNeighbors.push(neighbor)
                        }
                    }
                }
            }

            if (
                notVisitedNeighbors.length > 0 || next === currNode
            ) {
                next = notVisitedNeighbors[0]
                notVisitedNeighbors.splice(0, 1)
            }
        }
        */
        if (next === null) {
            // if no more neighbors to be found, go to previous node
            if (history[currNode]) {
                next = history[currNode].prevNode
            } else {
                console.error("cannot go back to " + currNode)
                return
            }
        }

        currNode = next
        i++
    }

    console.log('Looped ' + i + ' times.')
    
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
