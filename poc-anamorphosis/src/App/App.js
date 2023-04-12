import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

export default class App 
{
    settings = {
        background: 0x000000,
        viewpoint: new THREE.Vector3(0, 0, 2),
        fov: 50,
        enableOrbit: !false,
        enableAxesHelper: false,
        images: [],
        particles: {
            color: 0xffeeaa,
            size: .06 / 10000, // Will be multiplied by screen width
            minZ: -1.5,
            maxZ: 1.5,
        },
        imageRatio: .6,
    }

    scene
    renderer
    sizes
    camera
    orbitControls
    axesHelper
    clock
    loadingManager
    images = []
    raycaster
    particlesGeometry
    gui
    
    constructor(canvas, settings)
    {
        this.canvas = canvas
        this.settings = { ... this.settings, ...settings}

        console.log("initializing app with settings:", this.settings)
 
        // Sizes
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // Debug
        this.setupGui()

        // Scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(this.settings.background);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Camera
        this.camera = new THREE.PerspectiveCamera(this.settings.fov, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera.position.copy(this.settings.viewpoint)
        this.scene.add(this.camera)

        // Orbit Controls
        this.orbitControls = new OrbitControls(this.camera, canvas)
        this.orbitControls.enableDamping = true
        this.orbitControls.enabled = this.settings.enableOrbit

        // Axes
        this.axesHelper = new THREE.AxesHelper(2)
        this.scene.add(this.axesHelper)

        // Particles
        this.particlesGeometry = new THREE.BufferGeometry()
        this.raycaster = new THREE.Raycaster()

        // Load images 
        this.loadingManager = new THREE.LoadingManager()
        this.loadingManager.onStart = () => console.log('starting loading')
        this.loadingManager.onProgress = () => console.log('loading progress')
        this.loadingManager.onError = () => console.log('loading error')
        this.loadingManager.onLoad  = this.onLoadHandler.bind(this)
        
        const imageLoader = new THREE.ImageLoader(this.loadingManager)
        this.settings.images.forEach(imgUrl => imageLoader.load(imgUrl, img => { this.images.push(img) }))

        // Events
        window.addEventListener('resize', this.resizeHandler.bind(this))
        window.addEventListener('mousemove', this.mousemoveHandler.bind(this))

        // Main loop
        this.clock = new THREE.Clock()
        this.refresh()
    }

    onLoadHandler() {
        // TODO: delete (for debugging)
        const image = this.images[0]

        const positions = new Float32Array(image.width * image.height * 3)
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d', {willReadFrequently: true})
        const screenRatio = this.sizes.width / this.sizes.height
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
                // only take one pixel every 2
                if(x%2 == y%2) {
                    continue
                }

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

                screenX *= this.settings.imageRatio
                screenY *= this.settings.imageRatio

                // Set Z from pixel value
                let r = imgData.data[dataComposantIndex] / 255
                let g = imgData.data[dataComposantIndex + 1] / 255
                let b = imgData.data[dataComposantIndex + 2] / 255
                let a = imgData.data[dataComposantIndex + 3]  / 255
                let value = (r + g + b) / 3 * a

                // Project point on plane
                let z = this.settings.particles.minZ + value * (this.settings.particles.maxZ - this.settings.particles.minZ)
                let plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
                    new THREE.Vector3(0, 0, 1),
                    new THREE.Vector3(0, 0, z)
                )
                this.raycaster.setFromCamera(new THREE.Vector2(screenX, screenY), this.camera)
                this.raycaster.ray.intersectPlane(plane, currentPoint)

                // Lastly, add to positions array
                positions[index    ] = currentPoint.x
                positions[index + 1] = currentPoint.y
                positions[index + 2] = currentPoint.z
            }
        }

        // Set particules positions
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        // Create particles object
        const particlesMaterial = new THREE.PointsMaterial({
            color: this.settings.particles.color,
            size: this.sizes.width * this.settings.particles.size,
            map: texture,
            transparent: true,
            sizeAttenuation: true,
        })
        particlesMaterial.depthWrite = false

        // Add to scene
        this.scene.add(new THREE.Points(this.particlesGeometry, particlesMaterial))
    }

    resizeHandler() 
    {
        // Update sizes
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        // Update camera
        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    mousemoveHandler(event)
    {
        let x = event.offsetX / this.sizes.width * 2 - 1
        let y = event.offsetY / this.sizes.height * 2 - 1
        if(!this.settings.enableOrbit) {
            this.camera.position.x = x * .04
            this.camera.position.y = -y * .04
        }
    }

    refresh()
    {
        let t = this.clock.getElapsedTime()

        // Update controls
        if(this.settings.enableOrbit) {
            this.orbitControls.update()
        }

        // Show/hide axes helper
        this.axesHelper.visible = this.settings.enableAxesHelper

        // Render
        this.renderer.render(this.scene, this.camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(this.refresh.bind(this))
    }

    setupGui()
    {
        this.gui = new dat.GUI()
    }
}