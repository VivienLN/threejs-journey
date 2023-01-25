import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const canvas = document.querySelector('canvas.webgl')

const parameters = {
    useAoMap: true,
    useDisplacementMap: true,
    useMmetalnessMap: true,
    useRoughnessMap: true,
    useNormalMap: true,
    useEnvMap: true,
}

// Load Textures
const textureLoader = new THREE.TextureLoader()

const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/3.png')
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg')

// 1. Basic Material
// const material = new THREE.MeshBasicMaterial({ map: doorColorTexture })
// 2. Normal map
// const material = new THREE.MeshNormalMaterial({ map: doorColorTexture })
// material.flatShading = true
// 3. Matcaps (1 to 8)
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture
// 4. MeshDepthMaterial
// const material = new THREE.MeshDepthMaterial()
// 5. MeshLambertMaterial
// const material = new THREE.MeshLambertMaterial()
// 6. Toon Material
// const material = new THREE.MeshToonMaterial({ color: 0xffaa33 })
// material.gradientMap = gradientTexture
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter
// gradientTexture.generateMipmaps = false
// 7. MeshStandardMaterial
const material = new THREE.MeshStandardMaterial()
material.metalness = 0
material.roughness = 1
// 8. material map
material.map = doorColorTexture

// Tweaks
material.transparent = true
// material.opacity = 0.5
// material.alphaMap = doorAlphaTexture
// material.side = THREE.DoubleSide // show back side
// Create objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(.8, 64, 64), material)
sphere.position.x = -2
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material)
const torus = new THREE.Mesh(new THREE.TorusGeometry(.6, .2, 64, 128), material)
torus.position.x = 2

// Some lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4

// Ambient occlusion
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))
material.aoMapIntensity = 1

// EnvMap
const cubeTextureLoader = new THREE.CubeTextureLoader()
const envMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2
camera.position.y = 2
camera.position.z = 2

// Scene
const scene = new THREE.Scene()
scene.add(camera, sphere, plane, torus)
scene.add(ambientLight)
scene.add(pointLight)

// GUI
const gui = new dat.GUI()
gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
gui.add(material, 'aoMapIntensity').min(0).max(1).step(0.0001)
gui.add(parameters, 'useAoMap')
    .name("Ambiant occlusion")
    .onChange((value) => {
        material.aoMap = value ? doorAmbientOcclusionTexture : null
    })
    .reset()
gui.add(parameters, 'useDisplacementMap')
    .name("Displacement map")
    .onChange((value) => {
        material.displacementMap = value ? doorHeightTexture : null
    })
    .reset()
gui.add(material, 'displacementScale').min(0).max(1).step(0.01).setValue(.05)
gui.add(parameters, 'useMmetalnessMap')
    .name("Metalness map")
    .onChange((value) => {
        material.metalnessMap = value ? doorMetalnessTexture : null
    })
    .reset()

gui.add(parameters, 'useRoughnessMap')
    .name("Metalness map")
    .onChange((value) => {
        material.roughnessMap = value ? doorRoughnessTexture : null
    })
    .reset()
gui.add(parameters, 'useNormalMap')
    .name("Normal map")
    .onChange((value) => {
        material.normalMap = value ? doorNormalTexture : null
        material.normalScale.set(0.5, 0.5)
    })
    .reset()
gui.add(material, 'normalScale')


gui.add(parameters, 'useEnvMap')
    .name("Environment map")
    .onChange((value) => {
        material.envMap = value ? envMapTexture : null
    })
    .reset()

// Do not repeat the needsUpdate in each event, do it here
gui.onChange((event) => { 
    let propertiesNeedingMaterialUpdate = ["useAoMap", "useDisplacementMap", "useMmetalnessMap", "useRoughnessMap", "useNormalMap", "useEnvMap"]
    if(propertiesNeedingMaterialUpdate.indexOf(event.property) != -1) {
        material.needsUpdate = true;
    }
})

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

// Resize
const resizeHandler = () =>
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
}
window.addEventListener('resize', resizeHandler)
resizeHandler()

// Loop
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Rotate objects
    sphere.rotation.x = .2 * elapsedTime
    plane.rotation.x = .2 * elapsedTime
    torus.rotation.x = .2 * elapsedTime
    sphere.rotation.y = .2 * elapsedTime
    plane.rotation.y = .2 * elapsedTime
    torus.rotation.y = .2 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
