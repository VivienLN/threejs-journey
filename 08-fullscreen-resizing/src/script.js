import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
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

// Renderer
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Orbit controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Full screen on double click
window.addEventListener('dblclick', () => {
    if(!(document.fullscreenElement || document.webkitFullscreenElement)) {
        // webkitRequestFullscreen is for Safari
        canvas.requestFullscreen ? canvas.requestFullscreen() : canvas.webkitRequestFullscreen()
    } else {
        document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen()
    }
})

// tick
const clock = new THREE.Clock()
const tick = () =>
{
    // For damping
    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()