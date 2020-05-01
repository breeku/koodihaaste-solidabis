const THREE = require("three")
const { GLTFLoader } = require("three/examples/jsm/loaders/GLTFLoader")
const {
    OrbitControls,
} = require("three/examples/jsm/controls/OrbitControls.js")
const dat = require("dat.gui")
const TWEEN = require("es6-tween")

const { updateLoading, removeLoading, updateTravelInfo } = require("./dom")
const reittidata = require("./reittidata.json")
const pathfinding = require("./pathfinding")

let controls, scene, renderer, camera, route, goal, spacecraft
let temp = new THREE.Vector3()

let clock = new THREE.Clock()
let time = 0
let previousFrameBlinked = false

let highlighted = false

const nodeList = reittidata.pysakit
const cameraOptions = { chase: "Chase", orbital: "Orbital" }

let cameraMode = cameraOptions.orbital

const directions = { from: "", to: "" }
let cameraChosen = { mode: cameraOptions.orbital }
const travel = {
    travel: () => {
        unhighlight()
        goRoute(route)
    },
}

const gui = new dat.GUI({ autoPlace: false })
const gc = document.getElementById("gui")
gc.appendChild(gui.domElement)

const routingGUI = gui.addFolder("Routing")
routingGUI.open()
const fromGUI = routingGUI.add(directions, "from", nodeList)
const toGUI = routingGUI.add(directions, "to", nodeList)
routingGUI.add(travel, "travel")

const cameraGUI = gui.addFolder("Camera")
const optionsGUI = cameraGUI.add(cameraChosen, "mode", cameraOptions)

fromGUI.onChange((value) => {
    if (highlighted) {
        unhighlight()
    }
    if (directions.from !== "" && directions.to !== "") {
        route = pathfinding(directions.from, directions.to)
        highlight(route)
    }
})

toGUI.onChange((value) => {
    if (highlighted) {
        unhighlight()
    }
    if (directions.from !== "" && directions.to !== "") {
        route = pathfinding(directions.from, directions.to)
        highlight(route)
    }
})

optionsGUI.onChange((value) => {
    cameraMode = value
    if (value === "Orbital") {
        controls.enabled = true
    } else {
        controls.enabled = false
    }
})

const highlight = (route) => {
    updateTravelInfo(route, reittidata.linjastot)
    const material = new THREE.LineBasicMaterial({ color: 0xffffff })
    for (let i = 0; i < route.nodes.length; i++) {
        let lines = scene.children.filter(
            (x) =>
                x.name === route.nodes[i] + " - " + route.nodes[i + 1] ||
                x.name === route.nodes[i + 1] + " - " + route.nodes[i]
        )
        if (lines.length > 0) {
            for (let line of lines) {
                let temp = line.clone()
                temp.material = material
                temp.name = "temp"
                scene.add(temp)
                highlighted = true
            }
        }
    }
}

const unhighlight = () => {
    let obj = scene.getObjectByName("temp")
    while (obj) {
        scene.remove(obj)
        obj = scene.getObjectByName("temp")
    }
    highlighted = false
}

const blinkLines = () => {
    scene.traverse((child) => {
        if (child.name === "temp") {
            child.visible = !child.visible
        }
    })
}

const goRoute = (route, target = spacecraft) => {
    if (route === null) return
    const map = scene.children.find((x) =>
        x.children.find((o) => o.name === "A")
    )
    const startingPosition = map.children
        .find((x) => x.name === route.nodes[0])
        .position.clone()
    target.position.set(
        startingPosition.x,
        startingPosition.y,
        startingPosition.z
    )

    const tweens = []

    for (const stop of route.nodes) {
        const index = route.nodes.indexOf(stop)
        const coord = map.children.find((x) => x.name === stop).position.clone()
        const tween = new TWEEN.Tween(target.position).to(coord, 1000)

        if (index !== 0 && index !== route.nodes.length - 1) {
            coord.y = 3
        } else {
            coord.y = 1
        }

        tween.on("start", () => {
            target.lookAt(coord)
            target.rotateY(Math.PI)
        })

        tweens.push(tween)
    }

    for (let i = 1; i < tweens.length; i++) {
        if (tweens[i + 1]) tweens[i].chainedTweens(tweens[i + 1])
    }

    tweens[1].start()
}

const addLines = () => {
    const colors = {
        keltainen: new THREE.LineBasicMaterial({ color: 0xffff00 }),
        punainen: new THREE.LineBasicMaterial({ color: 0xff0000 }),
        vihreä: new THREE.LineBasicMaterial({ color: 0x328332 }),
        sininen: new THREE.LineBasicMaterial({ color: 0x0000ff }),
    }

    const map = scene.children.find((x) =>
        x.children.find((o) => o.name === "A")
    )

    for (const tie of reittidata.tiet) {
        const coord1 = map.children.find((x) => x.name === tie.mista).position
        const coord2 = map.children.find((x) => x.name === tie.mihin).position
        const points = []
        points.push(coord1)
        points.push(coord2)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        for (const color in reittidata.linjastot) {
            const colored = reittidata.linjastot[color].filter(
                (x) => x === tie.mista || x === tie.mihin
            )
            if (colored.length > 1) {
                const line = new THREE.Line(geometry, colors[color])
                line.position.y = 0.5
                line.name = tie.mista + " - " + tie.mihin
                if (color === "keltainen") {
                    line.position.x += 0.3
                    line.position.z += 0.3
                } else if (color === "punainen") {
                    line.position.x += 0.1
                    line.position.z += 0.1
                } else if (color === "vihreä") {
                    line.position.x += -0.1
                    line.position.z += -0.1
                } else if (color === "sininen") {
                    line.position.x += -0.3
                    line.position.z += -0.3
                }
                scene.add(line)
            }
        }
    }
}

const init = () => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xefd1b5)
    scene.fog = new THREE.FogExp2(0xefd1b5, 0.02)

    const hemilight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.75)
    hemilight.castShadow = true
    scene.add(hemilight)

    const spotlight = new THREE.SpotLight(0xffa95c, 0.1)
    spotlight.position.y = 20
    spotlight.castShadow = true
    scene.add(spotlight)

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    )

    camera.position.y = 35

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const manager = new THREE.LoadingManager()
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
        updateLoading({ url, itemsLoaded, itemsTotal })
    }

    manager.onLoad = function () {
        removeLoading()
        addLines()
    }

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        updateLoading({ url, itemsLoaded, itemsTotal })
    }

    manager.onError = function (url) {
        console.log("There was an error loading " + url)
    }

    const loader = new GLTFLoader(manager)
    loader.load(
        "../../static/models/map.glb",
        function (gltf) {
            scene.add(gltf.scene)
        },
        undefined,
        function (error) {
            console.error(error)
        }
    )

    loader.load(
        "../../static/models/spacecraft.glb",
        function (gltf) {
            spacecraft = gltf.scene
            spacecraft.scale.set(0.1, 0.1, 0.1)
            spacecraft.position.set(0.25, 5, 0.7)
            spacecraft.name = "spacecraft"
            goal = new THREE.Object3D()
            goal.position.set(0, 150, -2)
            spacecraft.add(goal)
            scene.add(spacecraft)
        },
        undefined,
        function (error) {
            console.error(error)
        }
    )

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.1
}

let onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener("resize", onWindowResize)

let animate = function (t) {
    requestAnimationFrame(animate)

    if (highlighted) {
        const deltaTime = clock.getDelta()
        const blink = Math.floor(time / 0.5) & 1

        if (previousFrameBlinked !== blink) {
            blinkLines()
        }

        previousFrameBlinked = blink

        time += deltaTime
    }

    if (cameraMode === "Orbital") {
        controls.update()
    } else if (cameraMode === "Chase" && goal) {
        temp.setFromMatrixPosition(goal.matrixWorld)
        camera.position.lerp(temp, 0.2)
        camera.lookAt(spacecraft.position)
    }

    TWEEN.update(t)

    renderer.render(scene, camera)
}

init()
animate()
