const pathfinding = require("./pathfinding")

const AtoP = {
    nodes: ["A", "D", "R", "N", "Q", "P"],
    time: 13,
}

const PtoA = {
    nodes: [...AtoP.nodes].reverse(),
    time: 13,
}

const JtoP = {
    nodes: ["J", "I", "G", "K", "L", "M", "N", "Q", "P"],
    time: 17,
}

const PtoJ = {
    nodes: [...JtoP.nodes].reverse(),
    time: 17,
}

const HtoQ = {
    nodes: ["H", "G", "K", "L", "M", "N", "Q"],
    time: 15,
}

const QtoH = {
    nodes: [...HtoQ.nodes].reverse(),
    time: 15,
}

describe("Djikstra tests", () => {
    test("A -> P", () => {
        expect(pathfinding("A", "P")).toStrictEqual(AtoP)
    })
    test("P -> A", () => {
        expect(pathfinding("P", "A")).toStrictEqual(PtoA)
    })

    test("J -> P", () => {
        expect(pathfinding("J", "P")).toStrictEqual(JtoP)
    })
    test("P -> J", () => {
        expect(pathfinding("P", "J")).toStrictEqual(PtoJ)
    })

    test("H -> Q", () => {
        expect(pathfinding("H", "Q")).toStrictEqual(HtoQ)
    })
    test("Q -> H", () => {
        expect(pathfinding("Q", "H")).toStrictEqual(QtoH)
    })
})
