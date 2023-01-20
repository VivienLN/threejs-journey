import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Cubes
// 1. Sphere geometry
// const geometry = new THREE.SphereGeometry(1, 8, 16)

// 2. Custom (triangle) geometry
// const geometry = new THREE.BufferGeometry()
// const positionsAttribute = new THREE.BufferAttribute(new Float32Array([
//     0, 0, 0, // First vertex
//     0, 1, 0, // Second vertex
//     1, 0, 0  // Third vertex
// ]), 3)
// geometry.setAttribute('position', positionsAttribute)

// 2. Random custom (triangles) geometry
const geometry = new THREE.BufferGeometry()
const number = 5
const positionsArray = []
let side = [1, 1, 1]
// 3 * 3 because we have 3 vertices per triangle
for(let i = 0; i < number * 3 * 3; i++) {
    // positionsArray.push(Math.random() * 4 - 2)
    // Idea: avoid center: change side every 9 iterations (=1 triangle)
    // Note: instead of modulo we could have nested loops (less fun)
    // Note: here it creates 8 groups (see with many triangles), but hey it's kinda working for now
    if(i % 9 === 0) {
        side = []
        // One value (-1 or 1)for each vertex
        for(let i=0; i<3; i++) {
            side.push(Math.round(Math.random())%2*2-1) // Returns -1 or 1
        }
    }
    positionsArray.push((.2 + Math.random() * 2) * side[i%3])

}
const positionsAttribute = new THREE.BufferAttribute(new Float32Array(positionsArray), 3)
geometry.setAttribute('position', positionsAttribute)


const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
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