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
scene.background = new THREE.Color(0xffeeaa);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// Particles
const particlesGeometry = new THREE.BufferGeometry()
const particleSize = sizes.width * .06 / 10000
const viewpoint = new THREE.Vector3(0, 0, 2)
const imgUrl = 'img/sinking.png'
const raycaster = new THREE.Raycaster()
var image = null

// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.copy(viewpoint)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Axes
// const axesHelper = new THREE.AxesHelper(2)
// scene.add(axesHelper)


// Loading manager 
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => console.log('starting loading')
loadingManager.onProgress = () => console.log('loading progress')
loadingManager.onError = () => console.log('loading error')
loadingManager.onLoad  = () => {
    const positions = new Float32Array(image.width * image.height * 3)
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d', {willReadFrequently: true})
    const screenRatio = sizes.width / sizes.height
    const imageRatio = .6
    const minZ = -1.5
    const maxZ = 1.5
    const currentPoint = new THREE.Vector3()

    // Canvas to get image data
    tempCanvas.width = image.width
    tempCanvas.height = image.height
    tempCtx.drawImage(image, 0, 0)
    const imgData = tempCtx.getImageData(0, 0, image.width, image.height)

    // Canvas to get texture
    tempCanvas.width = 64
    tempCanvas.height = 64
    tempCtx.fillStyle = "white"
    tempCtx.clearRect(0, 0, image.width, image.height)
    tempCtx.beginPath()
    tempCtx.arc(32, 32, 32, 0, 2 * Math.PI)
    tempCtx.fill()
    const texture = new THREE.Texture(tempCanvas);
    texture.needsUpdate = true

    for(let y = 0; y < image.height; y++) {
        for(let x = 0; x < image.width; x++) {
            // x,y,z so 3 items for one particule
            let index = (image.width * y + x) * 3
            // r,g,b,a so 4 items for one pixel
            let dataComposantIndex = (image.width * y + x) * 4

            // Position depends on camera
            // Improvement: no need for condition
            let screenX = 0
            let screenY = 0
            if(image.width > image.height) {
                screenX = x / image.width * 2 - 1
                screenY = -(y / image.width * screenRatio * 2 - screenRatio / 2)
            } else {
                screenX = x / image.height / screenRatio * 2 - (image.width / image.height / screenRatio)
                screenY = -(y / image.height * 2 - 1)
            }

            screenX *= imageRatio
            screenY *= imageRatio

            // Set Z from pixel value
            let r = imgData.data[dataComposantIndex] / 255
            let g = imgData.data[dataComposantIndex + 1] / 255
            let b = imgData.data[dataComposantIndex + 2] / 255
            let a = imgData.data[dataComposantIndex + 3]  / 255
            let value = 1 - (r + g + b) / 3 * a

            // Project point on plane
            let plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(0, 0, minZ + value * (maxZ - minZ))
            )
            raycaster.setFromCamera(new THREE.Vector2(screenX, screenY), camera)
            raycaster.ray.intersectPlane(plane, currentPoint)

            // Lastly, add to positions array
            positions[index    ] = currentPoint.x
            positions[index + 1] = currentPoint.y
            positions[index + 2] = currentPoint.z
        }
    }

    // Set particules positions
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Create particles object
    const particlesMaterial = new THREE.PointsMaterial({
        size: particleSize,
        map: texture,
        transparent: true,
        sizeAttenuation: true,
        color: 0x000000,
    })
    particlesMaterial.depthWrite = false
    scene.add(new THREE.Points(particlesGeometry, particlesMaterial))
}

// Image loader
const imageLoader = new THREE.ImageLoader(loadingManager)
imageLoader.load(imgUrl, img => { image = img })


/**
 * Sizes
 */

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

window.addEventListener('mousemove', event =>
{
    let x = event.offsetX / sizes.width * 2 - 1
    let y = event.offsetY / sizes.height * 2 - 1
    camera.position.x = x * .04
    camera.position.y = -y * .04
})

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