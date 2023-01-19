import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/*
    Scene
    |-Mesh
      |-Geometry
      |-Material
    |-Camera

    Renderer.render(scene, camera)
*/

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Cubes
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
const cube = new THREE.Mesh(geometry, material)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 4

// Scene
const scene = new THREE.Scene()

scene.add(cube)
scene.add(camera)

// Axes helper (for visual help)
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Renderer
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)


// Orbit controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


// Cursor (for Manual controls)
const cursor = {x:0, y:0}
window.addEventListener('mousemove', (event) =>
{
    // console.log(event.clientX, event.clientY)
    cursor.x = Math.min(event.clientX, sizes.width) / sizes.width - 0.5
    cursor.y = Math.min(event.clientY, sizes.height) / sizes.height - 0.5
})

// tick
const clock = new THREE.Clock()
const tick = () =>
{
    // Manual controls
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2
    // camera.position.y = -cursor.y * 3
    // camera.lookAt(cube.position)

    // For damping
    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()