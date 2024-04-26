import * as THREE from '../../../node_modules/three/src/Three.js'
import { SceneComposer } from './SceneComposer.js'
import { RenderPass } from '../../../node_modules/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '../../../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { AdderPass } from '../pass/AdderPass.js'

/**
 * Includes the default render pass. Additional render passes can be added separately
 */
export class BloomComposer extends SceneComposer
{
    /**
     * @param {THREE.WebGLRenderer} renderer 
     */
    constructor(renderer)
    {
        super('BloomComposer', renderer)
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 1))
        this.bloomPass = new UnrealBloomPass()
        this.composer.addPass(this.bloomPass)
        this.adderPass = new AdderPass(1, 1)
        this.composer.addPass(this.adderPass)
    }

    /**
     * 
     * @param {THREE.Camera} camera 
     */
    setup(camera) { this.composer.insertPass(new RenderPass(this.scene, camera), 0) }

    /**
     * Sets the strength for overall bloom
     * @param {Number} strength bloom strength value 
     */
    setBloomStrength(strength) { this.bloomPass.strength = strength }

    /**
     * Sets the minimum rgb value that the pixel should have before it can be affected by bloom
     * @param {Number} threshold threshold value for overall bloom 
     */
    setBloomThreshold(threshold) { this.bloomPass.threshold = threshold }

    /**
     * Sets the radius upto which bloom will be spread out in every pixel. Higher radius means bloom will be more spread out.
     * @param {Number} radius radius value for overall bloom 
     */
    setBloomRadius(radius) { this.bloomPass.radius = radius }

    /**
     * Renders the scene
     * @param {Number} width width of frame which will be rendered
     * @param {Number} height height of frame which will be rendered
     * @param {THREE.Texture} renderedTexture the rendered scene from the previous composer
     */
    render(width, height, renderedTexture) 
    {
        this.bloomPass.resolution = new THREE.Vector2(width, height)
        this.bloomPass.width = width
        this.bloomPass.height = height
        this.adderPass.updateTexture2(renderedTexture)
        this.composer.setSize(width, height) 
        this.composer.render() 
    }
}