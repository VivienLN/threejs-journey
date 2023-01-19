import './style.css'
import * as THREE from 'three'
import gsap from "gsap"

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
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })

const cube1 = new THREE.Mesh(geometry, material)
cube1.position.x = - 1.5

const cube2 = new THREE.Mesh(geometry, material)
cube2.position.x = 0
    
const cube3 = new THREE.Mesh(geometry, material)
cube3.position.x = 1.5

// Group
const group = new THREE.Group()
group.scale.y = 2

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 4

// Scene
const scene = new THREE.Scene()

group.add(cube1)
group.add(cube2)
group.add(cube3)
scene.add(group)
scene.add(camera)

// Axes helper (for visual help)
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
})
renderer.setSize(sizes.width, sizes.height)

// Animation with greensock
// gsap.to(group.position, { duration: 1, delay: 1, x: 2 })

// tick
const clock = new THREE.Clock()
const tick = () =>
{
    // Animation without gsap
    let t = clock.getElapsedTime()
    group.rotation.y = .6 * t
    camera.position.y = Math.sin(t * .5) * 2 // Half speed, double distance
    camera.lookAt(group.position)

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()