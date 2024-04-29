import * as THREE from '../../../node_modules/three/src/Three.js'
import { OutlinePass } from '../../../node_modules/three/examples/jsm/postprocessing/OutlinePass.js'
import { SceneComposer } from './SceneComposer.js'
import { RenderPass } from '../../../node_modules/three/examples/jsm/postprocessing/RenderPass.js'

export class RenderComposer extends SceneComposer
{
    constructor(renderer)
    {
        super('RenderComposer', renderer)
        this.renderPass = undefined
        this.outlinePass = undefined
        this.outlineObjects = new Map()
    }

    /**
     * Sets up the passes using the selected camera
     * @param {THREE.Camera} camera 
     */
    setup(camera)
    {
        if (this.outlinePass != undefined)
        {    
            this.composer.removePass(this.renderPass)
            this.composer.removePass(this.outlinePass)
        }
        this.renderPass = new RenderPass(this.scene, camera)
        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, camera, [])
        this.composer.addPass(this.renderPass)
        this.composer.addPass(this.outlinePass)
    }

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

    render(width, height)
    {
        this.outlinePass.resolution = new THREE.Vector2(width, height)
        this.outlinePass.selectedObjects = Array.from(this.outlineObjects.values())
        this.composer.setSize(width, height)
        this.composer.render() 
    }
}