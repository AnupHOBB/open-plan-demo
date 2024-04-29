import { SceneComposer } from './SceneComposer.js'
import { MergerPass } from '../pass/MergerPass.js'

/**
 * Displays the rendered scene on screen
 */
export class DisplayComposer extends SceneComposer
{
    /**
     * @param {WebGLRenderer} renderer 
     */
    constructor(renderer) 
    { 
        super('DisplayComposer', renderer)
        this.composer.renderToScreen = true
        this.mergerPass = new MergerPass()
        this.composer.addPass(this.mergerPass)
    }

    /**
     * Adds the object3D to the scene used by this composer
     * @param {THREE.Object3D} object3D 
     */
    addToScene() {}

    /**
     * Removes the object3D from the scene used by this composer
     * @param {THREE.Object3D} object3D
     */
    removeFromScene() {}

    /**
     * Renders the scene
     * @param {Number} width width of frame which will be rendered
     * @param {Number} height height of frame which will be rendered
     * @param {THREE.Texture} renderedTexture the rendered scene from the previous composer
     */
    render(width, height, renderedTexture) 
    {
        this.mergerPass.updateTexture1(renderedTexture)
        this.composer.setSize(width, height) 
        this.composer.render()
    }
}