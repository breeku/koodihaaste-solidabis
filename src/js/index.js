import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"
import { pathfinding } from "./pathfinding"
import { reittidata } from "./reittidata"
import * as TWEEN from "es6-tween"
import { updateTravelInfo } from "./dom"

let controls, scene, renderer, camera, route, goal, spacecraft
let temp = new THREE.Vector3()
let SCREEN_WIDTH = window.innerWidth
let SCREEN_HEIGHT = window.innerHeight
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT

let clock = new THREE.Clock()
let time = 0
let previousFrameBlinked = false

let highlighted = false

let nodeList = reittidata.pysakit
let cameraOptions = { chase: "Chase", orbital: "Orbital", free: "Free" }

let cameraMode = cameraOptions.orbital

let directions = { from: "", to: "" }
let cameraChosen = { mode: cameraOptions.orbital }
let travel = {
    travel: () => {
        unhighlight()
        goRoute(route)
    },
}

const gui = new dat.GUI()

let routingGUI = gui.addFolder("Routing")
routingGUI.open()
let fromGUI = routingGUI.add(directions, "from", nodeList)
let toGUI = routingGUI.add(directions, "to", nodeList)
routingGUI.add(travel, "travel")

let cameraGUI = gui.addFolder("Camera")
let optionsGUI = cameraGUI.add(cameraChosen, "mode", cameraOptions)

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
    let material = new THREE.LineBasicMaterial({ color: 0xffffff })
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
    let map = scene.children.find((x) => x.children.find((o) => o.name === "A"))
    let startingPosition = map.children.find((x) => x.name === route.nodes[0])
        .position.clone()
    target.position.set(
        startingPosition.x,
        startingPosition.y,
        startingPosition.z
    )

    let tweens = []

    for (let stop of route.nodes) {
        let index = route.nodes.indexOf(stop)
        let coord = map.children.find((x) => x.name === stop).position.clone()
        let tween = new TWEEN.Tween(target.position).to(coord, 1000)

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
    let keltainen = new THREE.LineBasicMaterial({ color: 0xffff00 })
    let punainen = new THREE.LineBasicMaterial({ color: 0xff0000 })
    let vihreä = new THREE.LineBasicMaterial({ color: 0x328332 })
    let sininen = new THREE.LineBasicMaterial({ color: 0x0000ff })

    let colors = {
        keltainen,
        punainen,
        vihreä,
        sininen,
    }

    let map = scene.children.find((x) => x.children.find((o) => o.name === "A"))

    for (let tie of reittidata.tiet) {
        let coord1 = map.children.find((x) => x.name === tie.mista).position
        let coord2 = map.children.find((x) => x.name === tie.mihin).position
        let points = []
        points.push(coord1)
        points.push(coord2)
        let geometry = new THREE.BufferGeometry().setFromPoints(points)

        for (let color in reittidata.linjastot) {
            let colored = reittidata.linjastot[color].filter(
                (x) => x === tie.mista || x === tie.mihin
            )
            if (colored.length > 1) {
                let line = new THREE.Line(geometry, colors[color])
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

    let directionalLight = new THREE.DirectionalLight(0xefd1b5, 1)
    directionalLight.position.y = 30
    scene.add(directionalLight)

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

    let manager = new THREE.LoadingManager()
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log(
            "Started loading file: " +
                url +
                ".\nLoaded " +
                itemsLoaded +
                " of " +
                itemsTotal +
                " files."
        )
    }

    manager.onLoad = function () {
        console.log("Loading complete!")
        addLines()
    }

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log(
            "Loading file: " +
                url +
                ".\nLoaded " +
                itemsLoaded +
                " of " +
                itemsTotal +
                " files."
        )
    }

    manager.onError = function (url) {
        console.log("There was an error loading " + url)
    }

    let loader = new GLTFLoader(manager)
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
            goal = new THREE.Object3D()
            goal.position.set(0, 100, 0)
            spacecraft.add(goal)
            spacecraft.scale.set(0.1, 0.1, 0.1)
            spacecraft.position.y = 5
            spacecraft.name = "spacecraft"
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
    SCREEN_WIDTH = window.innerWidth
    SCREEN_HEIGHT = window.innerHeight
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)

    camera.updateProjectionMatrix()
}

window.addEventListener("resize", onWindowResize)

let animate = function (t) {
    requestAnimationFrame(animate)
    let deltaTime = clock.getDelta()

    if (highlighted) {
        let blink = Math.floor(time / 0.5) & 1

        if (previousFrameBlinked !== blink) {
            blinkLines()
        }

        previousFrameBlinked = blink
    }

    time += deltaTime

    if (controls.enabled) {
        controls.update()
    }

    TWEEN.update(t)

    if (cameraMode === "Chase" && goal) {
        temp.setFromMatrixPosition(goal.matrixWorld)
        camera.position.lerp(temp, 0.2)
        camera.lookAt(spacecraft.position)
    }

    renderer.render(scene, camera)
}

init()
animate()
