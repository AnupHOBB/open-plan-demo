import * as THREE from '../../node_modules/three/src/Three.js'
import { DisplayComposer } from './composers/DisplayComposer.js'
import { BloomComposer } from './composers/BloomComposer.js'
import { SSAOComposer } from './composers/SSAOComposer.js'

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
        this.composers = [new SSAOComposer(this.renderer), new BloomComposer(this.renderer), new DisplayComposer(this.renderer)]
        this.activeCamera = undefined
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
     * Sets the type of tone mapping exposure to be used
     * @param {Number} value tone mapping exposure value
     */
    setToneMappingExposure(value) { this.renderer.toneMappingExposure = value }

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
     * Sets the camera where the whole scene will be rendered from its viewpoint
     * @param {THREE.Camera} camera camera object
     */
    setCamera(camera)
    {
        if (this.activeCamera != camera)
        {
            this.activeCamera = camera
            let ssaoComposer = this._getComposer('SSAOComposer')
            if (ssaoComposer != undefined) 
                ssaoComposer.setup(this.activeCamera)  
            let bloomComposer = this._getComposer('BloomComposer')
            if (bloomComposer != undefined) 
                bloomComposer.setup(this.activeCamera)
        }
    }

    /**
     * Adds the threejs object into the scene
     * @param {THREE.Object3D} object3D name of the object3D that will be added
     */
    addToScene(object3D)
    {
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.addToScene(object3D)
    }

    /**
     * Removes the threejs object from the scene
     * @param {THREE.Object3D} object3D name of the object3D that will be removed
     */
    removeFromScene(object3D)
    {
        let composer = this._getComposer('SSAOComposer')
        if (composer != undefined) 
            composer.removeFromScene(object3D)
    }

        /**
     * Adds the threejs object into the scene as bloom object
     * @param {THREE.Object3D} object3D name of the object3D that will be added
     */
    addToBloomScene(object3D)
    {
        let composer = this._getComposer('BloomComposer')
        if (composer != undefined) 
            composer.addToScene(object3D)
    }

    /**
     * Removes the threejs object from the scene
     * @param {THREE.Object3D} object3D name of the object3D that will be removed
     */
    removeFromBloomScene(object3D)
    {
        let composer = this._getComposer('BloomComposer')
        if (composer != undefined) 
            composer.removeFromScene(object3D)
    }

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
        let composer = this._getComposer('SSAOComposer')
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
                composer.render(this.width, this.height, renderedTexture)
                renderedTexture = composer.getRenderedScene()
            }
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

/**
////////////////////////////////////////BLOOM/////////////////////////////////////////////
 *     setBloomPercentage(percent) { this.sceneRenderer.setBloomPercentage(percent) }

    setBloomIntensity(intensity) { this.sceneRenderer.setBloomIntensity(intensity) }

    setBloomThreshold(threshold) { this.sceneRenderer.setBloomThreshold(threshold) }

    setBloomRadius(radius) { this.sceneRenderer.setBloomRadius(radius) }
////////////////////////////////////////BLOOM/////////////////////////////////////////////
////////////////////////////////////Anti Aliasing////////////////////////////////////////    

    enableFXAA(enable) { this.sceneRenderer.enableFXAA(enable) }

    enableSSAA(enable) { this.sceneRenderer.enableSSAA(enable) }

    setSSAASampleLevel(samplelevel) { this.sceneRenderer.setSSAASampleLevel(samplelevel) }
////////////////////////////////////Anti Aliasing////////////////////////////////////////    
////////////////////////////////////Color Balance////////////////////////////////////////    

    setShadowsColorBalance(shadowsRgb) { this.sceneRenderer.setShadowsColorBalance(shadowsRgb) }

    setMidtonesColorBalance(midtonesRgb) { this.sceneRenderer.setMidtonesColorBalance(midtonesRgb) }

    setHighlightsColorBalance(highlightsRgb) { this.sceneRenderer.setHighlightsColorBalance(highlightsRgb) }
////////////////////////////////////Color Balance////////////////////////////////////////        
////////////////////////////////////OUTLINE//////////////////////////////////////// 
    enableOutlining(enable) { this.sceneRenderer.enableOutlining(enable) }

    changeOutlineColor(visibleEdgeColor, hiddenEdgeColor) { this.sceneRenderer.changeOutlineColor(visibleEdgeColor, hiddenEdgeColor) }

    changeOutlineThickness(thickness) { this.sceneRenderer.changeOutlineThickness(thickness) }

    changeOutlineGlow(glow) { this.sceneRenderer.changeOutlineGlow(glow) }

    changeOutlineStrength(strength) { this.sceneRenderer.changeOutlineStrength(strength) }

    outlineNearestObjectAt(rasterCoord, onOutline)
    {
        if (rasterCoord != undefined && rasterCoord.x >= 0 && rasterCoord.x < this.width && rasterCoord.y >= 0 && rasterCoord.y < this.height)
        {
            let bounds = this.canvas.getBoundingClientRect()
            let ndcX = (rasterCoord.x / bounds.width) *  2 - 1
            let ndcY = -(rasterCoord.y / bounds.height) *  2 + 1
            let hitPointDataArray = this.raycast.raycast({x: ndcX, y: ndcY}, this.activeCameraManager)
            let hitPointDataObject
            let finalOutlineMeshes = []
            if (hitPointDataArray != undefined && hitPointDataArray.length > 0)    
            {    
                hitPointDataObject = hitPointDataArray[0]
                for (let outlineMesh of this.outlineMeshes)
                    finalOutlineMeshes.push(outlineMesh)
                finalOutlineMeshes.push(hitPointDataArray[0].object)
            }
            this.sceneRenderer.addObjectsToOutline(finalOutlineMeshes)
            if (onOutline != undefined) 
                onOutline(hitPointDataObject)
        }
    }

    outlineMeshOf(sceneObjectName, meshName)
    {
        let sceneObject = this.sceneObjectMap.get(sceneObjectName)
        if (sceneObject != undefined)
        {
            try
            {
                let mesh = sceneObject.getMesh(meshName)
                if (mesh != undefined && mesh != null)
                {    
                    this.outlineMeshes.push(mesh)
                    this.sceneRenderer.addObjectsToOutline(this.outlineMeshes)
                }
            }
            catch (e) {}
        }
    }
////////////////////////////////////OUTLINE//////////////////////////////////////// 
    setSharpness(sharpness) { this.sceneRenderer.setSharpness(sharpness) }

    setExposure(exposure) { this.sceneRenderer.setExposure(exposure) }

    setSaturation(saturation) { this.sceneRenderer.setSaturation(saturation) }

    setContrast(contrast) { this.sceneRenderer.setContrast(contrast) }
    
    setBrightness(brightness) { this.sceneRenderer.setBrightness(brightness) }

    setGamma(gamma) { this.sceneRenderer.setGamma(gamma) }

    showStats(htmlElement) { this.sceneRenderer.showStats(htmlElement) }
 */