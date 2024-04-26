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