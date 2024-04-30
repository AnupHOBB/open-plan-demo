import * as THREE from '../../node_modules/three/src/Three.js'
import { DisplayComposer } from './composers/DisplayComposer.js'
import { BloomComposer } from './composers/BloomComposer.js'
import { SSAOComposer } from './composers/SSAOComposer.js'
import { RenderComposer } from './composers/RenderComposer.js'
import { Stats } from './Stats.js'

/**
 * Renders the overall scene
 */
export class SceneRenderer
{
    constructor(canvas, width, height)
    {
        this.width = width
        this.height = height
        this.background = new THREE.Color(1, 1, 1)
        this.renderer = new THREE.WebGLRenderer({canvas, alpha: true})
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.composers = [new RenderComposer(this.renderer), new SSAOComposer(this.renderer), new BloomComposer(this.renderer), new DisplayComposer(this.renderer)]
        this.activeCamera = undefined
        this.sceneObjects = new Map()
        this.stats = undefined
    }

    /**
     * Enables or disables the shadows
     * @param {Boolean} enable if true then shadows are enabled
     */
    enableShadows(enable) { this.renderer.shadowMap.enabled = enable }

    /**
     * Sets the type of shadow map to be used
     * @param {Number} type type of shadow map 
     */
    setShadowType(type) { this.renderer.shadowMap.type = type }

    /**
     * Sets the type of tone mapping to be used
     * @param {Number} type type of tone mapping 
     */
    setToneMapping(type) { this.renderer.toneMapping = type }

    /**
     * Sets the camera exposure for the scene.
     * @param {Number} exposure exposure value for the scene 
     */
    setExposure(exposure) { this.renderer.toneMappingExposure = exposure }

    /**
     * Sets the type of tone mapping exposure to be used
     * @param {Number} value tone mapping exposure value
     */
    setToneMappingExposure(value) { this.renderer.toneMappingExposure = value }

    setBloomStrength(strength) 
    { 
        let composer = this._getComposer('BloomComposer')
        if (composer != undefined)
            composer.setBloomStrength(strength) 
    }

    setBloomThreshold(threshold) 
    { 
        let composer = this._getComposer('BloomComposer')
        if (composer != undefined)
            composer.setBloomThreshold(threshold) 
    }

    setBloomRadius(radius) 
    { 
        let composer = this._getComposer('BloomComposer')
        if (composer != undefined)
            composer.setBloomRadius(radius) 
    }

    enableSSAO(enable) 
    {
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.enable(enable) 
    }

    setSSAORadius(radius) 
    {
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.setKernelRadius(radius) 
    }

    setSSAOMinDistance(minDist) 
    { 
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.setMinDistance(minDist) 
    }

    setSSAOMaxDistance(maxDist) 
    { 
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.setMaxDistance(maxDist) 
    }

    setSSAOShowAOMap(show) 
    {  
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.showAOMap(show)
    }

    setSSAOShowNormalMap(show) 
    { 
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.showNormalMap(show) 
    }

    /**
     * Sets the sharpness amount to be applied to the scene
     * @param {Number} sharpness sharpness amount to be applied on the scene
     */
    setSharpness(sharpness) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setSharpness(sharpness) 
    }

    /**
     * Sets the gamma value to be applied to the scene
     * @param {Number} gamma gamma value to be applied on the scene
     */
    setGamma(gamma) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setGamma(gamma) 
    }

    /**
     * Sets the rgb values that affects the darkest set of rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} shadowRgb rgb value that affects the darkest set of rgbs in the scene
     */
    setShadowsColorBalance(shadowsRgb) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setShadows(shadowsRgb) 
    }

    /**
     * Sets the rgb values that affects the mid set of rgbs i.e. neither too dark nor too bright rgbs in the scene as uniform in the fragment shader
     * @param {THREE.Vector3} midtoneRgb rgb value that affects the mid level set of rgbs in the scene 
     */
    setMidtonesColorBalance(midtonesRgb) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setMidtones(midtonesRgb) 
    }

    /**
     * Sets the rgb values that affects the brightest set of rgbs in the scene
     * @param {THREE.Vector3} highlightRgb rgb value that affects the brightest set of rgbs in the scene as uniform in the fragment shader
     */
    setHighlightsColorBalance(highlightsRgb) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setHighlights(highlightsRgb) 
    }

    /**
     * Sets the saturation value as uniform in the fragment shader
     * @param {Number} saturation saturation intensity that is passed to the fragment shader as uniform 
     */
    setSaturation(saturation) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setSaturation(saturation) 
    }

    /**
     * Sets the provided contrast value to the contrast uniform in fragment shader
     * @param {Number} contrast brightness amount 
     */
    setContrast(contrast) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setContrast(contrast) 
    }
    
    /**
     * Sets the provided brightness value to the brightness uniform in fragment shader
     * @param {Number} brightness brightness amount 
     */
    setBrightness(brightness) 
    { 
        let composer = this._getComposer('DisplayComposer')
        if (composer != undefined) 
            composer.setBrightness(brightness) 
    }

    /**
     * Returns the maximum anisotropy value supported by the hardware
     * @returns {Number} the maximum anisotropy value supported by the hardware
     */
    getMaxAnistropy() { this.renderer.capabilities.getMaxAnisotropy() }


    changeOutlineColor(visibleEdgeColor, hiddenEdgeColor) 
    { 
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
            composer.changeOutlineColor(visibleEdgeColor, hiddenEdgeColor) 
    }

    changeOutlineThickness(thickness) 
    { 
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
            composer.changeOutlineThickness(thickness) 
    }

    changeOutlineGlow(glow) 
    { 
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
            composer.changeOutlineGlow(glow) 
    }

    changeOutlineStrength(strength) 
    { 
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
            composer.changeOutlineStrength(strength) 
    }

    outlineSceneObject(name)
    {
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
        {    
            let sceneObject = this.sceneObjects.get(name)
            if (sceneObject != undefined)
                composer.outline(sceneObject.getObject3D())
        } 
    }

    outlineObject3D(object3D)
    {
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
            composer.outline(object3D) 
    }

    removeSceneObjectOutline(name)
    {
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
        {    
            let sceneObject = this.sceneObjects.get(name)
            if (sceneObject != undefined)
                composer.removeOutline(sceneObject.getObject3D())
        } 
    }

    removeObject3DOutline(object3D)
    {
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined) 
            composer.removeOutline(object3D) 
    }

    /**
     * Shows the stats for the scene
     * @param {HTMLPreElement} htmlElement html pre element where the stats will be displayed
     */
    showStats(htmlElement) { this.stats = new Stats(this.renderer, htmlElement) }

    /**
     * Sets the camera where the whole scene will be rendered from its viewpoint
     * @param {THREE.Camera} camera camera object
     */
    setCamera(camera)
    {
        if (this.activeCamera != camera)
        {
            this.activeCamera = camera
            let renderComposer = this._getComposer('RenderComposer')
            if (renderComposer != undefined) 
                renderComposer.setup(this.activeCamera)  
            let ssaoComposer = this._getComposer('SSAOComposer')
            if (ssaoComposer != undefined) 
                ssaoComposer.setup(this.activeCamera)  
            let bloomComposer = this._getComposer('BloomComposer')
            if (bloomComposer != undefined) 
                bloomComposer.setup(this.activeCamera)
        }
    }

    /**
     * Adds the sceneObject into the scene object map
     * @param {SceneObject} sceneObject sceneObject that needs to be added to the scene object map
     */
    addToScene(sceneObject) { this.sceneObjects.set(sceneObject.name, sceneObject) }

    /**
     * Removes the sceneObject from the scene
     * @param {String} name name of the sceneObject that is to be removed
     */
    removeFromScene(name) { this.sceneObjects.delete(name) }

    /**
     * Sets the width and height of canvas
     * @param {Number} width width of canvas
     * @param {Number} height height of canvas
     */
    setSize(width, height)
    {
        this.width = width
        this.height = height
    }

    /**
     * Sets the background to the scene. Valid values should either of type color, texture or cubetexture
     * @param {THREE.Texture, THREE.Color, THREE.CubeTexture} background environment map to be applied on the scene 
     */
    setBackground(background)
    {
        let composer = this._getComposer('RenderComposer')
        if (composer != undefined)
            composer.setBackground(background)
    }

    /**
     * Returns the maximum anisotropy value supported by the hardware
     * @returns {Number} the maximum anisotropy value supported by the hardware
     */
    getMaxAnistropy() { this.renderer.capabilities.getMaxAnisotropy() }

    /**
     * Renders the scene. This function should be called on every iteration of the render loop.
     * In case of this project, the render loop has been setup in SceneManagerCore class
     */
    render()
    {
        if (this.activeCamera != undefined)
        {
            this.renderer.setSize(this.width, this.height)
            let renderedTexture
            for (let composer of this.composers)
            {    
                composer.clearScene()
                let names = this.sceneObjects.keys()
                for (let name of names)
                {
                    let sceneObject = this.sceneObjects.get(name)
                    if ((composer.name != 'BloomComposer') || ((composer.name == 'BloomComposer') && sceneObject.isLuminant()))
                        composer.addToScene(sceneObject.getObject3D())
                }
                composer.render(this.width, this.height, renderedTexture)
                renderedTexture = composer.getRenderedScene()
            }
            if (this.stats != undefined)
                this.stats.update()
        }
    }

    _getComposer(name)
    {
        for (let composer of this.composers)
        {
            if (composer.name == name)
                return composer
        }
    }
    
    _removeComposer(name)
    {
        let index = 0
        let found = false
        for (let composer of this.composers)
        {
            if (composer.name == name)
            {
                found = true    
                break
            }
            else
                index++
        }
        if (found)
            this.composers.splice(index, 1)
    }
}