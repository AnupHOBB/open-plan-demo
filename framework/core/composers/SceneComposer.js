import * as THREE from '../../../node_modules/three/src/Three.js'
import { EffectComposer } from '../../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js'

/**
 * Includes the default render pass. Additional render passes can be added separately
 */
export class SceneComposer
{
    /**
     * @param {String} name 
     * @param {WebGLRenderer} renderer 
     */
    constructor(name, renderer) 
    { 
        this.name = name
        this.scene = new THREE.Scene()
        this.composer = new EffectComposer(renderer)
        this.composer.renderToScreen = false 
    }

    /**
     * Adds the object3D to the scene used by this composer
     * @param {THREE.Object3D} object3D 
     */
    addToScene(object3D) { this.scene.add(object3D) }

    /**
     * Removes the object3D from the scene used by this composer
     * @param {THREE.Object3D} object3D
     */
    removeFromScene(object3D) { this.scene.remove(object3D) }

    /**
     * Removes all object3D from the scene
     */
    clearScene() { this.scene.clear() }

    /**
     * Returns the render target as texture
     * @returns {THREE.Texture} the texture that has the rendered scene
     */
    getRenderedScene() { return this.composer.readBuffer.texture }

    /**
     * Sets the background to the scene. Valid values should either of type color, texture or cubetexture
     * @param {THREE.Texture, THREE.Color, THREE.CubeTexture} background environment map to be applied on the scene 
     */
    setBackground(background) { this.scene.background = background }
}