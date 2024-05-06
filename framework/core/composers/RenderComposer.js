import * as THREE from '../../../node_modules/three/src/Three.js'
import { SceneComposer } from './SceneComposer.js'
import { RenderPass } from '../../../node_modules/three/examples/jsm/postprocessing/RenderPass.js'
import { SSAOPass } from '../../../node_modules/three/examples/jsm/postprocessing/SSAOPass.js'
import { OutlinePass } from '../../../node_modules/three/examples/jsm/postprocessing/OutlinePass.js'

export class RenderComposer extends SceneComposer
{
    constructor(renderer)
    {
        super('RenderComposer', renderer)
        this.ssaoPass = undefined
        this.outlinePass = undefined
        this.outlineObjects = new Map()
        this.enabled = true
    }

    /**
     * 
     * @param {THREE.Camera} camera 
     */
    setup(camera)
    {
        if (this.ssaoPass != undefined)
        {    
            this.composer.removePass(this.ssaoPass)
            this.composer.removePass(this.outlinePass)
        }
        /* this.ssaoPass = new SSAOPass(this.scene, camera, window.innerWidth, window.innerHeight)
        this.ssaoPass.output = SSAOPass.OUTPUT.Default
        this.ssaoPass.kernelRadius = 0.01
        this.ssaoPass.minDistance = 0.00004
        this.ssaoPass.maxDistance = 0.1 */

        this.ssaoPass = new RenderPass(this.scene, camera)
        this.composer.addPass(this.ssaoPass)




        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, camera, [])
        this.composer.addPass(this.outlinePass)
    }

    enable(enabled) { this.ssaoPass.output = enabled ? SSAOPass.OUTPUT.Default : SSAOPass.OUTPUT.Beauty }

    /**
     * Sets the radius upto which ssao will be spread out in every pixel. Higher radius means ssao will be more spread out.
     * @param {Number} kernelRadius radius value for ssao
     */
    setKernelRadius(kernelRadius) { this.ssaoPass.kernelRadius = kernelRadius }

    /**
     * Sets the minimum depth for pixel to eligible for ssao 
     * @param {Number} minDistance minimum depth for pixel
     */
    setMinDistance(minDistance) { this.ssaoPass.minDistance = minDistance }

    /**
     * Sets the maximum depth for pixel to eligible for ssao 
     * @param {Number} maxDistance maximum depth for pixel
     */
    setMaxDistance(maxDistance) { this.ssaoPass.maxDistance = maxDistance }

    /**
     * Enables or disables the ambient occlusion map of scene
     * @param {Boolean} show if true then the ambient occlusion map of entire scene will be visible 
     */
    showAOMap(show) { this.ssaoPass.output = show ? SSAOPass.OUTPUT.SSAO : SSAOPass.OUTPUT.Default }

    /**
     * Enables or disables the normal map of scene
     * @param {Boolean} show if true then the normal map of entire scene will be visible 
     */
    showNormalMap(show) { this.ssaoPass.output = show ? SSAOPass.OUTPUT.Normal : SSAOPass.OUTPUT.Default }

    /**
     * Changes color of the outline with which a mesh is highlighted
     * @param {THREE.Color} visibleEdgeColor 
     * @param {THREE.Color} hiddenEdgeColor 
     */
    changeOutlineColor(visibleEdgeColor, hiddenEdgeColor) 
    { 
        this.outlinePass.visibleEdgeColor = visibleEdgeColor
        this.outlinePass.hiddenEdgeColor = hiddenEdgeColor
    }

    changeOutlineThickness(thickness) { this.outlinePass.edgeThickness = thickness }

    changeOutlineGlow(glow) { this.outlinePass.edgeGlow = glow }

    changeOutlineStrength(strength) { this.outlinePass.edgeStrength = strength }

    outline(object3D) { this.outlineObjects.set(object3D.id, object3D) }

    removeOutline(object3D) { this.outlineObjects.delete(object3D.id) }
    
    /**
     * Renders the scene
     * @param {Number} width width of frame which will be rendered
     * @param {Number} height height of frame which will be rendered
     */
    render(width, height) 
    {
        this.ssaoPass.width = width
        this.ssaoPass.height = height
        this.outlinePass.resolution = new THREE.Vector2(width, height)
        this.outlinePass.selectedObjects = Array.from(this.outlineObjects.values())
        this.composer.setSize(width, height) 
        this.composer.render()
    }
}