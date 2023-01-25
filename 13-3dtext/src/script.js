import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/5.png')


// FONT
var text = null
const donuts = []
const fontLoader = new FontLoader()
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
    const textGeometry = new TextGeometry(
        'Hello Three.js',
        {
            font: font,
            size: 0.5,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        }
    )
    text = new THREE.Mesh(textGeometry, material)
    scene.add(text)

    // hitbox
    textGeometry.computeBoundingBox()
    // let box = textGeometry.boundingBox
    // textGeometry.translate(
    //     - box.max.x / 2,
    //     - box.max.y / 2,
    //     - box.max.z / 2,
    // )
    // easier
    textGeometry.center()

    // Donuts
    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
    for(let i = 0; i < 100; i++)
    {
        let donut = new THREE.Mesh(donutGeometry, material)
        donut.position.x = (Math.random() - 0.5) * 10
        donut.position.y = (Math.random() - 0.5) * 10
        donut.position.z = (Math.random() - 0.5) * 10
        let s = .3 + Math.random() * .7
        donut.scale.set(s, s, s)
        scene.add(donut)
        donuts.push({
            mesh: donut,
            startingRotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0),
            startingY: donut.position.y,
            startingFloatSin: Math.random(),
            rotationSpeed: new THREE.Vector3(Math.random() * .6, Math.random() * .6, 0),
            floatAmp: Math.random() * .6,
            floatSpeed: .04 + Math.random() * .5
        })
    }
})
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // animation
    donuts.forEach(donut => {
        donut.mesh.rotation.set(
            donut.startingRotation.x + elapsedTime * donut.rotationSpeed.x,
            donut.startingRotation.y + elapsedTime * donut.rotationSpeed.y,
            0
        )
        donut.mesh.position.y = donut.startingY + Math.sin(donut.startingFloatSin + elapsedTime * donut.floatSpeed) * donut.floatAmp
        
    })
    // animate text to
    if(text !== null) {
        text.position.y = Math.sin(elapsedTime * .1) * .2
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()