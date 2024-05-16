import * as THREE from './node_modules/three/src/Three.js'
import * as FRAMEWORK from './framework/Framework.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from './node_modules/three/examples/jsm/loaders/DRACOLoader.js'
import * as CONFIGURATOR from './app/Configurator.js'

const LAYOUT_INDEX = 6
const TANGENT_ANGLE_OF_ELEVATION = 0.17333333333333334

window.onload = () => 
{
    let loader = new FRAMEWORK.AssetLoader()
    loader.addLoader(CONFIGURATOR.CUBEMAP, CONFIGURATOR.ENVMAP_TEXTURES, new THREE.CubeTextureLoader())

    for (let assetKey in CONFIGURATOR.ASSETS)
    {
        let dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath(FRAMEWORK.DRACO_DECODER_PATH)
        let modelLoader = new GLTFLoader()
        modelLoader.setDRACOLoader(dracoLoader)
        loader.addLoader(assetKey, CONFIGURATOR.ASSETS[assetKey], modelLoader)
    }

    loader.execute(CONFIGURATOR.ASSET_MAP, assets => {
        let canvas = document.querySelector('canvas')
        let sceneManager = new FRAMEWORK.SceneManager(canvas, true)
        let cameraManager = new FRAMEWORK.OrbitalCameraManager('Camera', 15)
        cameraManager.addYawRestriction(newPos => {
            let originalFront = new THREE.Vector3(0, 0, -1)
            let lookAt = cameraManager.getLookAt()
            let newFront = FRAMEWORK.Maths.normalize(FRAMEWORK.Maths.subtractVectors(lookAt, newPos))
            return [FRAMEWORK.Maths.dot(originalFront, newFront) > 0.1, newPos]
        })
        cameraManager.addPitchRestriction(newPos => { 
            let originalUp = new THREE.Vector3(0, 1, 0)
            let lookAt = cameraManager.getLookAt()
            let newFront = FRAMEWORK.Maths.normalize(FRAMEWORK.Maths.subtractVectors(lookAt, newPos))
            let newRight = FRAMEWORK.Maths.cross(newFront, new THREE.Vector3(0, 1, 0))
            let newUp = FRAMEWORK.Maths.cross(newRight, newFront)
            return [FRAMEWORK.Maths.dot(originalUp, newUp) > 0.2, newPos]
        })
        cameraManager.setZoomSensitivity(1)
        cameraManager.setPosition(0, 1, 8)
        cameraManager.setLookAt(0, 1, 0) 
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        sceneManager.setSizeInPercent(0.68, 1)
        sceneManager.setBackground(assets.get(CONFIGURATOR.CUBEMAP))
        let directLight = new FRAMEWORK.DirectLight('DirectLight', new THREE.Color(1, 1, 1), 10)
        directLight.setPosition(0, 5, 3)
        directLight.setLookAt(0, 100, 0)
        sceneManager.register(directLight)
        let input = new FRAMEWORK.InputManager('Input')
        sceneManager.register(input)
        cameraManager.registerInput(input)
        let closet = new CONFIGURATOR.Closet(CONFIGURATOR.FAMILIES.FAMILY1, sceneManager, true)
        closet.addToScene()
        closet.openAllTop(true)
        closet.openAllBottom(true)

        setTimeout(()=>{
            closet.setWidth(2)
        }, 2000)

        setTimeout(()=>{
            closet.setHeight(2.5)
        }, 5000)

        setTimeout(()=>{
            closet.setHeight(1.9)
        }, 8000)

        setTimeout(()=>{
            closet.setWidth(0.4)
        }, 12000)
    })
}