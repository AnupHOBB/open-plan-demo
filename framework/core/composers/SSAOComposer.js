import { SceneComposer } from './SceneComposer.js'
import { SSAOPass } from '../../../node_modules/three/examples/jsm/postprocessing/SSAOPass.js'

export class SSAOComposer extends SceneComposer
{
    constructor(renderer)
    {
        super('SSAOComposer', renderer)
        this.ssaoPass = undefined
    }

    /**
     * 
     * @param {THREE.Camera} camera 
     */
    setup(camera)
    {
        this.ssaoPass = new SSAOPass(this.scene, camera)
        this.ssaoPass.output = SSAOPass.OUTPUT.Default
        this.ssaoPass.kernelRadius = 0.01
        this.ssaoPass.minDistance = 0.00004
        this.ssaoPass.maxDistance = 0.1
        this.composer.addPass(this.ssaoPass)
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
     * Renders the scene
     * @param {Number} width width of frame which will be rendered
     * @param {Number} height height of frame which will be rendered
     */
    render(width, height) 
    {
        this.ssaoPass.width = width
        this.ssaoPass.height = height
        this.composer.setSize(width, height) 
        this.composer.render()
    }
}