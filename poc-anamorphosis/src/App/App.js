import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

import pictureVertexShader from '../shaders/picture-particles/vertex.glsl'
import pictureFragmentShader from '../shaders/picture-particles/fragment.glsl'

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
            planeSize: 1.5,
            // For now, all images are assumed to be the same size
            // planeHeight: 1.5 * 140 / 200,
            // planeHeight: 1.5,
            // Max size in px for images
            imageSize: 200,
            size: 10,
            minZ: -1.5,
            maxZ: 1.5,
        }
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
    particles
    gui

    picturePlane
    
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
        const particlesGeometry = new THREE.BufferGeometry()
        const particlesMaterial = new THREE.RawShaderMaterial({
            depthWrite: false,
            vertexColors: true,
            transparent: true,
            vertexShader: pictureVertexShader,
            fragmentShader: pictureFragmentShader,
            uniforms: {
                uSize: { value: this.settings.particles.size },
                uColor: { value: new THREE.Color(this.settings.particles.color) }
            }
        })
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial)
        this.scene.add(this.particles)
        
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

    onLoadHandler() 
    {
        const image = this.images[0]

        // In the end, do this once for all images on site loading
        const attributes = this.imageToGeomAttributes(image)
        
        // There should always be the same number of particles 
        // (maybe bigger image size ? With transparent pixels for the others?)
        // this.particles.geometry.setDrawRange(0, image.width * image.height);
        
        this.particles.geometry.setAttribute('position', attributes.positions)
        this.particles.geometry.setAttribute('aVisible', attributes.visible)
        this.particles.geometry.computeBoundingBox();
        this.particles.geometry.computeBoundingSphere();
        this.particles.geometry.attributes.aVisible.needsUpdate = true
        this.particles.geometry.attributes.position.needsUpdate = true
    }

    imageToGeomAttributes(image)
    {
        const imgData = this.getImageData(image)
        const imgSize = this.settings.particles.imageSize
        // Divide by two because we only show half the pixels, to get a "framed" print effect
        const count = imgSize * imgSize
        const positions = new Float32Array(count * 3)
        const visible = new Uint8Array(count) // Sad, no BitArray in JS :'(
        const minZ = this.settings.particles.minZ
        const maxZ = this.settings.particles.maxZ
        const ratio = this.settings.particles.planeSize / imgSize

        // Move particles along z axis
        // TODO: improve: right now half of positions items are particles that will never be shown
        for(var y = 0; y < imgSize; y++) {
            for(var x = 0; x < imgSize; x++) {
                if(x%2 !== y%2) continue
                let i = imgSize * y + x
                let posIndex = i * 3        // x, y, z in positions
                let colorIndex = i * 4      // r, g, b, a in imgData
                let finalPosition = new THREE.Vector3()

                // Discard 1px / 2 (for "frame print" effect, like a checkboard)
                // And discard "out of bound" pixels (for images with w or h smaller than imgSize)
                let isVisible = colorIndex < imgData.data.length
                visible[i] = isVisible
    
                // Cast ray from particle position on the plane (z=0) to viewpoint
                let projectedX = x * ratio - this.settings.particles.planeSize / 2
                let projectedY = -y * ratio + this.settings.particles.planeSize / 2
                let projectedPosition = new THREE.Vector3(projectedX, projectedY, 0)

                if(isVisible) {
                    // Get input image pixel value (luminosity)
                    let r = imgData.data[colorIndex] / 255
                    let g = imgData.data[colorIndex + 1] / 255
                    let b = imgData.data[colorIndex + 2] / 255
                    let a = imgData.data[colorIndex + 3]  / 255
                    let value = (r + g + b) / 3 * a
    
                    // Stolen from raycaster.setFromCamera()
                    let rayDirection = this.settings.viewpoint.clone().sub(projectedPosition).normalize()
                    let ray = new THREE.Ray(projectedPosition, rayDirection)
    
                    // Get point position along the ray
                    ray.at(minZ + value * (maxZ - minZ), finalPosition)

                } else {
                    // Just use position on the z=0 plane because they will be hidden anyway
                    // (but can be transitionned later for other images)
                    // And we dont care about image pixel color because z will be 0
                    finalPosition.x = projectedX
                    finalPosition.y = projectedY
                    finalPosition.z = 0
                }
                
                // Fill the positions array
                positions[posIndex    ] = finalPosition.x
                positions[posIndex + 1] = finalPosition.y
                positions[posIndex + 2] = finalPosition.z
            }
        }

        return {
            positions: new THREE.BufferAttribute(positions, 3),
            visible: new THREE.BufferAttribute(visible, 1)
        }
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

    getImageData(image)
    {
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d', {willReadFrequently: true})

        // Canvas to get image data
        tempCanvas.width = image.width
        tempCanvas.height = image.height
        tempCtx.drawImage(image, 0, 0)
        
        return tempCtx.getImageData(0, 0, image.width, image.height)
    }
}