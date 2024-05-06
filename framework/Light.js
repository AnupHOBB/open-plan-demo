import * as THREE from '../node_modules/three/src/Three.js'
import { SceneObject } from './core/SceneManager.js'
import { Lensflare } from '../node_modules/three/examples/jsm/objects/Lensflare.js'
import { LensflareElement } from '../node_modules/three/examples/jsm/objects/Lensflare.js'

/**
 * Wraps the threejs ambient light object
 */
export class AmbientLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of the light
     */
    constructor(name, color, intensity) { super(name, new THREE.AmbientLight(color, intensity)) }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.object3D.intensity = intensity }

    /**
     * Used for notifying the SceneManager if this object is drawable in screen.
     * @returns {Boolean} drawable status of camera
     */
    isDrawable() { return true }

    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     */
    onSceneEnd() { this.object3D.dispose() }
}

/**
 * Wraps the threejs direct light object
 */
export class DirectLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of light
     */
    constructor(name, color, intensity) 
    { 
        super(name, new THREE.DirectionalLight(color, intensity))
        this.target = new THREE.Object3D()
        this.object3D.target = this.target
        this.lensFlare = new Lensflare()
    }

    /**
     * Enables shadows
     * @param {Boolean} enable enables shadow if true
     * @param {Boolean} shouldUpdateEveryFrame if true then shadow map will be updated every frame
     */
    enableShadows(enable, shouldUpdateEveryFrame)
    {
        this.object3D.castShadow = enable
        if (enable)
        {
            this.object3D.shadow.mapSize.width = 8192
            this.object3D.shadow.mapSize.height = 4096
            this.object3D.shadow.camera.near = 0.1
            this.object3D.shadow.camera.far = 200
            this.object3D.shadow.camera.left = -20
            this.object3D.shadow.camera.right = 20
            this.object3D.shadow.camera.bottom = -20
            this.object3D.shadow.camera.top = 20
            this.object3D.shadow.bias = -0.0005
            this.object3D.shadow.autoUpdate = shouldUpdateEveryFrame
            this.object3D.shadow.needsUpdate = true
        }
    }

    /**
     * Adds the camera helper threejs object in drawables array to have it rendered on screen
     */
    enableCameraHelper() { this.attachObject3D(new THREE.CameraHelper(this.object3D.shadow.camera)) }

    /**
     * Adds the lens flare threejs object in threejs light object to have it rendered on screen
     * @param {THREE.Texture} texture lens flare texture object
     */
    addLensFlare(texture)
    {
        this.lensFlare.addElement(new LensflareElement(texture, 512, 0.4))
        this.object3D.add(this.lensFlare)
    }

    /**
     * Sets the position where the light is supposed to look at
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setLookAt(x, y, z) { this.object3D.target.position.set(x, y, z) }

    getLookAt(x, y, z) { return this.object3D.target.position }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.object3D.intensity = intensity }

    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     */
    onSceneEnd() 
    { 
        this.object3D.dispose()
        if (this.lensFlare != null)
            this.lensFlare.dispose()
    }
}

/**
 * Wraps the threejs point light object
 */
export class PointLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of the light
     * @param {Number} distance maximum range of the light
     */
    constructor(name, color, intensity, distance) { super(name, new THREE.PointLight(color, intensity, distance)) }

    /**
     * Enables shadows
     * @param {Boolean} enable enables shadow if true
     * @param {Boolean} shouldUpdateEveryFrame if true then shadow map will be updated every frame
     */
    enableShadows(enable, shouldUpdateEveryFrame)
    {
        this.object3D.castShadow = enable
        if (enable)
        {
            this.object3D.shadow.mapSize.width = 1024
            this.object3D.shadow.mapSize.height = 1024
            this.object3D.shadow.camera.near = 0.1
            this.object3D.shadow.camera.far = 100
            this.object3D.shadow.camera.left = -5
            this.object3D.shadow.camera.right = 5
            this.object3D.shadow.camera.bottom = -5
            this.object3D.shadow.camera.top = 5
            this.object3D.shadow.bias = -0.0005
            this.object3D.shadow.autoUpdate = shouldUpdateEveryFrame
            this.object3D.shadow.needsUpdate = true
        }
    }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.object3D.intensity = intensity }
    
    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     */
    onSceneEnd() { this.object3D.dispose() }
}

/**
 * Wraps the threejs point light object
 */
export class SpotLight extends SceneObject
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {THREE.Color} color color of the light
     * @param {Number} intensity intensity of the light
     * @param {Number} distance maximum range of the light
     * @param {Number} angle angle of the light dispersion
     * @param {Number} penumbra amount of darkness that should appear at the edges of the circular region illuminated by the spot light
     */
    constructor(name, color, intensity, distance, angle, penumbra)
    {
        super(name, new THREE.SpotLight(color, intensity, distance, angle, penumbra))
        this.target = new THREE.Object3D()
        this.object3D.target = this.target
    }

    /**
     * Enables shadows
     * @param {Boolean} enable enables shadow if true
     * @param {Boolean} shouldUpdateEveryFrame if true then shadow map will be updated every frame
     */
    enableShadows(enable, shouldUpdateEveryFrame)
    {
        this.object3D.castShadow = enable
        if (enable)
        {
            this.object3D.shadow.mapSize.width = 1024
            this.object3D.shadow.mapSize.height = 1024
            this.object3D.shadow.camera.near = 0.1
            this.object3D.shadow.camera.far = 100
            this.object3D.shadow.camera.left = -5
            this.object3D.shadow.camera.right = 5
            this.object3D.shadow.camera.bottom = -5
            this.object3D.shadow.camera.top = 5
            this.object3D.shadow.bias = -0.0005
            this.object3D.shadow.autoUpdate = shouldUpdateEveryFrame
            this.object3D.shadow.needsUpdate = true
        }
    }

    /**
     * Sets the position where the light is supposed to look at
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setLookAt(x, y, z) { this.object3D.target.position.set(x, y, z) }

    /**
     * Sets the light intensity
     * @param {Number} intensity the intensity to be applied 
     */
    setIntensity(intensity) { this.object3D.intensity = intensity }
    
    /**
     * Called by SceneManager as soon as the object gets unregistered in SceneManager.
     */
    onSceneEnd() { this.object3D.dispose() }
}