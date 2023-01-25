import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import imageSource from '/textures/door/color.jpg' // relative to static/
console.log(imageSource)

// 1. Manually add texture
// -------------------------
// const image = new Image()
// const colorTexture = new THREE.Texture(image)
// // Update texture when image is loaded
// image.addEventListener('load', () => {
//     colorTexture.needsUpdate = true
// })
// image.src = '/textures/door/color.jpg'

// 2. Use TextureLoader
// -------------------------
// const textureLoader = new THREE.TextureLoader()
// const colorTexture = textureLoader.load(
//     '/textures/door/color.jpg', 
//     ()=>console.log('loaded!'),
//     ()=>console.log('loading progress...'),
//     ()=>console.log('error!')
// )

// 3. Use Loading Manager
// -------------------------
const loadingManager = new THREE.LoadingManager()

// Callbacks 
loadingManager.onStart = () => console.log('starting loading')
loadingManager.onLoad  = () => console.log('loading finished')
loadingManager.onProgress = () => console.log('loading progress')
loadingManager.onError = () => console.log('loading error')

// Load the textures
const textureLoader = new THREE.TextureLoader()
const colorTexture = textureLoader.load('/textures/door/color.jpg')
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const heightTexture = textureLoader.load('/textures/door/height.jpg')
const normalTexture = textureLoader.load('/textures/door/normal.jpg')
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

// Texte repeat
colorTexture.repeat.x = 2
colorTexture.repeat.y = 3
// Repeat
colorTexture.wrapS = THREE.RepeatWrapping
// Repeat and alternate symmetry
colorTexture.wrapT = THREE.MirroredRepeatWrapping
// Offset
colorTexture.offset.x = 0.5
colorTexture.offset.y = 0.5
// Rotation
colorTexture.rotation = Math.PI * 0.25
// Mip Mapping
// Reducing
colorTexture.minFilter = THREE.NearestFilter
// colorTexture.minFilter = THREE.LinearFilter
// colorTexture.minFilter = THREE.NearestMipmapNearestFilter
// colorTexture.minFilter = THREE.NearestMipmapLinearFilter
// colorTexture.minFilter = THREE.LinearMipmapNearestFilter
// colorTexture.minFilter = THREE.LinearMipmapLinearFilter
// Magnifying
colorTexture.magFilter = THREE.NearestFilter



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
// const geometry = new THREE.TorusGeometry(1, 0.35, 32, 100)
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ map: colorTexture })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
console.log(geometry.attributes.uv)

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
camera.position.z = 1
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()