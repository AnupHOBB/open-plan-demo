import * as THREE from '../../../node_modules/three/src/Three.js'
import { SceneComposer } from './SceneComposer.js'
import { MergerPass } from '../pass/MergerPass.js'
import { SaturationPass } from '../pass/SaturationPass.js'
import { BrightnessPass } from '../pass/BrightnessPass.js'
import { ContrastPass } from '../pass/ContrastPass.js'
import { GammaCorrectionPass } from '../pass/GammaCorrectionPass.js'
import { SharpnessPass } from '../pass/SharpnessPass.js'
import { ColorBalancePass } from '../pass/ColorBalancePass.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from '../../../node_modules/three/examples/jsm/shaders/FXAAShader.js'

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
        this.fxaaPass = new ShaderPass(new THREE.ShaderMaterial(FXAAShader))
        this.composer.addPass(this.fxaaPass)
        this.saturationPass = new SaturationPass(1)
        this.composer.addPass(this.saturationPass)
        this.contrastPass = new ContrastPass(0)
        this.composer.addPass(this.contrastPass)
        this.brightnessPass = new BrightnessPass(0)
        this.composer.addPass(this.brightnessPass)
        this.sharpnessPass = new SharpnessPass(0.2)
        this.composer.addPass(this.sharpnessPass)
        this.colorBalancePass = new ColorBalancePass(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3())
        this.composer.addPass(this.colorBalancePass)
        this.gammaPass = new GammaCorrectionPass(2.2)
        this.composer.addPass(this.gammaPass)
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
     * Sets the sharpness amount to be applied to the scene
     * @param {Number} sharpness sharpness amount to be applied on the scene
     */
    setSharpness(sharpness) { this.sharpnessPass.setSharpness(sharpness) }

    /**
     * Sets the gamma value to be applied to the scene
     * @param {Number} gamma gamma value to be applied on the scene
     */
    setGamma(gamma) { this.gammaPass.setGamma(gamma) }

    updateFXAAResolution(width, height)
    {
        this.fxaaPass.material.uniforms['resolution'].value.x = 1/(width * this.composer.renderer.getPixelRatio())
        this.fxaaPass.material.uniforms['resolution'].value.y = 1/(height * this.composer.renderer.getPixelRatio())
    }

    /**
     * Sets the rgb values that affects the darkest set of rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} shadowRgb rgb value that affects the darkest set of rgbs in the scene
     */
    setShadowsColorBalance(shadowsRgb) { this.colorBalancePass.setShadows(shadowsRgb) }

    /**
     * Sets the rgb values that affects the mid set of rgbs i.e. neither too dark nor too bright rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} midtoneRgb rgb value that affects the mid level set of rgbs in the scene 
     */
    setMidtonesColorBalance(midtonesRgb) { this.colorBalancePass.setMidtones(midtonesRgb) }

    /**
     * Sets the rgb values that affects the brightest set of rgbs in the scene
     * @param {THREE.Vector3} highlightRgb rgb value that affects the brightest set of rgbs in the scene as uniform in the fragment shader
     */
    setHighlightsColorBalance(highlightsRgb) { this.colorBalancePass.setHighlights(highlightsRgb) }

    /**
     * Sets the saturation value as uniform in the fragment shader
     * @param {Number} saturation saturation intensity that is passed to the fragment shader as uniform 
     */
    setSaturation(saturation) { this.saturationPass.setSaturation(saturation) }

    /**
     * Sets the provided contrast value to the contrast uniform in fragment shader
     * @param {Number} contrast brightness amount 
     */
    setContrast(contrast) { this.contrastPass.setContrast(contrast) }
    
    /**
     * Sets the provided brightness value to the brightness uniform in fragment shader
     * @param {Number} brightness brightness amount 
     */
    setBrightness(brightness) { this.brightnessPass.setBrightness(brightness) }

    /**
     * Renders the scene
     * @param {Number} width width of frame which will be rendered
     * @param {Number} height height of frame which will be rendered
     * @param {THREE.Texture} renderedTexture the rendered scene from the previous composer
     */
    render(width, height, renderedTexture) 
    {
        this.mergerPass.updateTexture1(renderedTexture)
        this.updateFXAAResolution(width, height)
        this.composer.setSize(width, height) 
        this.composer.render()
    }
}