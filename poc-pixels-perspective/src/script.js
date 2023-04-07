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
scene.background = new THREE.Color(0x222222);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/5.png')

/**
 * Camera
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// Particles
const imgWidth = 96
const imgHeight = 96
const geometryWidth = 2
const geometryHeight = 2
const maxZ = .5
const particleSize = .01
const viewpointFirst = new THREE.Vector3(0, 0, 2)
const viewpointSecond = new THREE.Vector3(-2, 0, 0)

// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.copy(viewpointFirst)
scene.add(camera)

// Camera for viewpoint of image 2, only for calculations 
// (need to add it to scene for raycasting to take rotation into account)
const cameraViewpointSecond = camera.clone()
cameraViewpointSecond.position.copy(viewpointSecond)
cameraViewpointSecond.rotation.y = -Math.PI/2
scene.add(cameraViewpointSecond)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Axes
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Load image and analyze data
const positions = new Float32Array(imgWidth * imgHeight * 3)
const colors = new Float32Array(imgWidth * imgHeight * 4)
const particlesGeometry = new THREE.BufferGeometry()
const raycaster1 = new THREE.Raycaster();
const raycaster2 = new THREE.Raycaster();
const ray = new THREE.Ray();
var particles = null
var imageFirst = null
var imageSecond = null

// Loading manager 
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => console.log('starting loading')
loadingManager.onProgress = () => console.log('loading progress')
loadingManager.onError = () => console.log('loading error')
loadingManager.onLoad  = () => {
    let tempCanvas = document.createElement('canvas')
    tempCanvas.width = imgWidth
    tempCanvas.height = imgHeight
    let tempCtx = tempCanvas.getContext('2d', {willReadFrequently: true})
    tempCtx.drawImage(imageFirst, 0, 0)
    const imageFirstData = tempCtx.getImageData(0, 0, imgWidth, imgHeight)
    tempCtx.clearRect(0, 0, imgWidth, imgHeight)
    tempCtx.drawImage(imageSecond, 0, 0)
    const imageSecondData = tempCtx.getImageData(0, 0, imgWidth, imgHeight)

    console.log(new THREE.Vector3(0, 0, 0).project(camera))
    console.log(new THREE.Vector3(1, 0, 0).project(camera))

    for(let y = 0; y < imgHeight; y++) {

        let xImg1 = []
        let xImg2 = []
        for(let x = 0; x < imgWidth; x++) {
            let i = (imgWidth * y + x) * 4
            if(imageFirstData.data[i+3] > .5) {
                xImg1.push(x)
            }
            if(imageSecondData.data[i+3] > .5) {
                xImg2.push(x)
            }
        }

        // For this y, we only have pixels in one image => skip it (for now)
        // if(xImg1.length == 0 || xImg2.length == 0) {
        //     continue
        // }

        // Randomize xImg2
        xImg2 = arrayShuffle(xImg2)
        // xImg1 = arrayShuffle(xImg1)
        // xImg2 = xImg2.reverse()

        // Fill smaller array with random values from the other one (so they are the same size)
        // if(xImg1.length < xImg2.length) {
        //     []
        // } else if(xImg1.length > xImg2.length) {

        // }

        // Loop through all
        let n = Math.max(xImg1.length, xImg2.length)
        for(let j = 0; j < n; j++) {
            let x = Math.floor((Math.random() * imgWidth))
            let z = Math.floor((Math.random() * imgWidth))

            if(xImg1.length > 0) {
                x = j < xImg1.length ? xImg1[j] : xImg1[Math.floor((Math.random() * xImg1.length))]
            }
            if(xImg2.length > 0) {
                z = j < xImg2.length ? xImg2[j] : xImg2[Math.floor((Math.random() * xImg2.length))]
            }

            // if(j < xImg1.length) {
            //     let x = xImg1[j]
            // } else if(xImg1.length > 0) {
            //     let x = xImg1[Math.floor((Math.random() * xImg1.length))]
            // } else {
            //     let x = Math.floor((Math.random() * imgWidth))
            // }


            // let x = j < xImg1.length ? xImg1[j] : xImg1[Math.floor((Math.random() * xImg1.length))]
            // let z = j < xImg2.length ? xImg2[j] : xImg2[Math.floor((Math.random() * xImg2.length))]
            let index = (imgWidth * y + j) * 3

            // Calculate screen position
            let widthRatio = sizes.height / sizes.width
            let sizeRatio = .8
            let img1X = (x / imgWidth * 2 - 1) * widthRatio * sizeRatio
            let img1Y = - (y / imgHeight * 2 - 1) * sizeRatio
            let img2X = (z / imgWidth * 2 - 1) * widthRatio * sizeRatio
            let img2Y = img1Y

            let position = new THREE.Vector3()
            let position1 = new THREE.Vector3()
            let position2 = new THREE.Vector3()
            
            // Make a raycaster for each camera
            raycaster1.setFromCamera(new THREE.Vector2(img1X, img1Y), camera)
            raycaster2.setFromCamera(new THREE.Vector2(img2X, img2Y), cameraViewpointSecond)
            
            // Transform one of them to vertical plane to calculate intersection
            let raycaster1Point = new THREE.Vector3()
            raycaster1.ray.at(1, raycaster1Point) // Any point on the ray
            let plane1 = new THREE.Plane().setFromCoplanarPoints(
                raycaster1Point,
                viewpointFirst,
                viewpointFirst.clone().setY(viewpointFirst.y + 1)
            )
            let raycaster2Point = new THREE.Vector3()
            raycaster2.ray.at(1, raycaster2Point) // Any point on the ray
            let plane2 = new THREE.Plane().setFromCoplanarPoints(
                raycaster2Point,
                viewpointSecond,
                viewpointSecond.clone().setY(viewpointSecond.y + 1)
            )

            // Intersect of the two is the position of the point in 3D space
            raycaster1.ray.intersectPlane(plane2, position1)
            raycaster2.ray.intersectPlane(plane1, position2)

            // Y messed up :( => 0 image1 is good, 1 image2 is good, .5 is in the middle T_T
            position = position1.clone().lerp(position2, .5)

            // Lastly, add to positions array
            positions[index    ] = position.x
            positions[index + 1] = position.y
            positions[index + 2] = position.z
        }
    }

    // Create particles object
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    // particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
    // particlesGeometry.computeBoundingBox()
    // particlesGeometry.center()

    const particlesMaterial = new THREE.PointsMaterial({
        size: particleSize * 600,
        sizeAttenuation: !true,
        color: 0xffffff,
    })
    // particlesMaterial.vertexColors = true
    // particlesMaterial.transparent = true
    particlesMaterial.depthWrite = false
    particles = new THREE.Points(particlesGeometry, particlesMaterial)

    scene.add(particles)
}

// Image loader
const imageLoader = new THREE.ImageLoader(loadingManager)
imageLoader.load('img/hello.png', image => { imageFirst = image })
imageLoader.load('img/world.png', image => { imageSecond = image })


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

    // Object size
    // if(particles) {
    //     particles.scale.z = Math.max(particles.scale.z - elapsedTime * 0.0001, .1)
    // }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


function arrayShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}