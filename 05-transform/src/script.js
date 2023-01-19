import './style.css'
import * as THREE from 'three'

/*
    Scene
    |-Mesh
      |-Geometry
      |-Material
    |-Camera

    Renderer.render(scene, camera)
*/

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const mesh = new THREE.Mesh(geometry, material)
mesh.position.x = 1
mesh.position.y = .4
mesh.scale.y = .6
mesh.rotation.x = Math.PI * .25
mesh.rotation.y = Math.PI * .25
scene.add(mesh)

// Group
const group = new THREE.Group()
group.rotation.x = Math.PI * .25
group.scale.y = 2

// Cubes
const cube1 = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
cube1.position.x = - 1.5

const cube2 = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
)
cube2.position.x = 0
    
const cube3 = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
)
cube3.position.x = 1.5

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3

scene.add(camera)
group.add(cube1)
group.add(cube2)
group.add(cube3)
scene.add(group)

// Axes helper (for visual help)
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)