import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './framework/Framework.js'
import { Cabinet, FAMILIES, CUBEMAP, WOOD } from './app/Configurator.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from './node_modules/three/examples/jsm/loaders/DRACOLoader.js'
import * as CONFIGURATOR2 from './app/Configurator2.js'

const LAYOUT_INDEX = 6
const TANGENT_ANGLE_OF_ELEVATION = 0.17333333333333334

window.onload = () => 
{
    const ENVMAP_TEXTURES = ['./assets/cubemap/right.jpg','./assets/cubemap/left.jpg','./assets/cubemap/top.jpg','./assets/cubemap/bottom.jpg','./assets/cubemap/front.jpg','./assets/cubemap/back.jpg']
    let loader = new ENGINE.AssetLoader()
    loader.addLoader(CUBEMAP, ENVMAP_TEXTURES, new THREE.CubeTextureLoader())
    for (let componentKey in CONFIGURATOR2.COMPONENTS)
    {
        let componentJson = CONFIGURATOR2.COMPONENTS[componentKey]
        let assetJson = componentJson['assets']
        for (let key in assetJson)
        {
            let array = assetJson[key]
            for (let path of array)
            {    
                let dracoLoader = new DRACOLoader()
                dracoLoader.setDecoderPath(ENGINE.DRACO_DECODER_PATH)
                let modelLoader = new GLTFLoader()
                modelLoader.setDRACOLoader(dracoLoader)
                loader.addLoader(componentJson.name+path, path, modelLoader)
                //loader.addLoader(componentJson.name+path, path, new FBXLoader())
            }
        }
    }
    loader.execute(CONFIGURATOR2.ASSET_MAP, assets => {
        //console.log(assets)
        let canvas = document.querySelector('canvas')
        let sceneManager = new ENGINE.SceneManager(canvas, true)
        let cameraManager = new ENGINE.OrbitalCameraManager('Camera', 15)
        cameraManager.addYawRestriction(newPos => {
            let originalFront = new THREE.Vector3(0, 0, -1)
            let lookAt = cameraManager.getLookAt()
            let newFront = ENGINE.Maths.normalize(ENGINE.Maths.subtractVectors(lookAt, newPos))
            return [ENGINE.Maths.dot(originalFront, newFront) > 0.1, newPos]
        })
        cameraManager.addPitchRestriction(newPos => { 
            let originalUp = new THREE.Vector3(0, 1, 0)
            let lookAt = cameraManager.getLookAt()
            let newFront = ENGINE.Maths.normalize(ENGINE.Maths.subtractVectors(lookAt, newPos))
            let newRight = ENGINE.Maths.cross(newFront, new THREE.Vector3(0, 1, 0))
            let newUp = ENGINE.Maths.cross(newRight, newFront)
            return [ENGINE.Maths.dot(originalUp, newUp) > 0.2, newPos]
        })
        cameraManager.setZoomSensitivity(1)
        cameraManager.setPosition(0, 1, 8)
        cameraManager.setLookAt(0, 1, 0) 
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        sceneManager.setSizeInPercent(0.68, 1)
        sceneManager.setBackground(assets.get(CUBEMAP))
        let directLight = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), 10)
        directLight.setPosition(0, 5, 3)
        directLight.setLookAt(0, 100, 0)
        sceneManager.register(directLight)
        let input = new ENGINE.InputManager('Input')
        sceneManager.register(input)
        cameraManager.registerInput(input)
        let comp = new CONFIGURATOR2.TopCabinet()
        //let comp = new CONFIGURATOR2.BottomCabinet()
        comp.registerInScene(sceneManager)
    })
}

function runBoxBasedConfigurator()
{
    const ENVMAP_TEXTURES = ['./assets/cubemap/right.jpg','./assets/cubemap/left.jpg','./assets/cubemap/top.jpg','./assets/cubemap/bottom.jpg','./assets/cubemap/front.jpg','./assets/cubemap/back.jpg']
    const WOOD_TEXTURE = ['./assets/wood_03.webp']
    let loader = new ENGINE.AssetLoader()
    loader.addLoader(CUBEMAP, ENVMAP_TEXTURES, new THREE.CubeTextureLoader())
    loader.addLoader(WOOD, WOOD_TEXTURE, new THREE.TextureLoader())
    loader.execute(new Map(), assets => setupBoxCabinetScene(assets))
}

function setupBoxCabinetScene(assets)
{
    let canvas = document.querySelector('canvas')
    let sceneManager = new ENGINE.SceneManager(canvas, true)
    let cameraManager = new ENGINE.OrbitalCameraManager('Camera', 15)
    cameraManager.addYawRestriction(newPos => {
        let originalFront = new THREE.Vector3(0, 0, 1)
        let lookAt = cameraManager.getLookAt()
        let newFront = ENGINE.Maths.normalize(ENGINE.Maths.subtractVectors(lookAt, newPos))
        return [ENGINE.Maths.dot(originalFront, newFront) > 0.1, newPos]
    })
    cameraManager.addPitchRestriction(newPos => { 
        let originalUp = new THREE.Vector3(0, 1, 0)
        let lookAt = cameraManager.getLookAt()
        let newFront = ENGINE.Maths.normalize(ENGINE.Maths.subtractVectors(lookAt, newPos))
        let newRight = ENGINE.Maths.cross(newFront, new THREE.Vector3(0, 1, 0))
        let newUp = ENGINE.Maths.cross(newRight, newFront)
        return [ENGINE.Maths.dot(originalUp, newUp) > 0.2, newPos]
    })
    cameraManager.setZoomSensitivity(1)

    cameraManager.setPosition(0, 1.4, -15)
    cameraManager.setLookAt(0, 1.4, 0)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    sceneManager.setSizeInPercent(0.68, 1)
    sceneManager.setBackground(assets.get(CUBEMAP))
    let directLight = new ENGINE.PointLight('DirectLight', new THREE.Color(1, 1, 1), 1)//, 70)
    directLight.setPosition(0, 20, -10)
    sceneManager.register(directLight)

    let input = new ENGINE.InputManager('Input')
    sceneManager.register(input)
    cameraManager.registerInput(input)

    let family = FAMILIES.FAMILY1
    let cabinet = new Cabinet(family, sceneManager, assets)
    cabinet.setWidth(2)

    setCameraDistance(cabinet.getWidth(), cabinet.getHeight())

    function setCameraDistance(width, height, shouldReset)
    {
        let highest = width > height ? width : height 
        let distance = highest/TANGENT_ANGLE_OF_ELEVATION
        let elevation = height/2
        cameraManager.startGradualReset(new THREE.Vector3(0, elevation, -distance), new THREE.Vector3(0, elevation, 0), 1)
    }

    function initializeFamilyRadioButtons()
    {   
        let sideBar = document.getElementById('side-bar')
        let radioButtonFamily1 = document.getElementById('radio-family1')
        radioButtonFamily1.addEventListener('change', e=>{
            let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
            let newLayoutButtons = createLayoutRadioButtons(FAMILIES.FAMILY1)
            sideBar.replaceChild(newLayoutButtons, oldLayoutButtons)
            cabinet.removeFromScene()
            cabinet = new Cabinet(FAMILIES.FAMILY1, sceneManager, assets)
            cabinet.setWidth(2)
            radioButtonFamily1.checked = true
            radioButtonFamily2.checked = false
            radioButtonFamily3.checked = false
            emptyTextFields()

            setCameraDistance(cabinet.getWidth(), cabinet.getHeight(), true)
        })

        let radioButtonFamily2 = document.getElementById('radio-family2')
        radioButtonFamily2.addEventListener('change', e=>{
            let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
            let newLayoutButtons = createLayoutRadioButtons(FAMILIES.FAMILY2)
            sideBar.replaceChild(newLayoutButtons, oldLayoutButtons)
            cabinet.removeFromScene()
            cabinet = new Cabinet(FAMILIES.FAMILY2, sceneManager, assets)
            cabinet.setWidth(2)
            radioButtonFamily1.checked = false
            radioButtonFamily2.checked = true
            radioButtonFamily3.checked = false
            emptyTextFields()

            setCameraDistance(cabinet.getWidth(), cabinet.getHeight(), true)
        })

        let radioButtonFamily3 = document.getElementById('radio-family3')
        radioButtonFamily3.addEventListener('change', e=>{
            let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
            let newLayoutButtons = createLayoutRadioButtons(FAMILIES.FAMILY3)
            sideBar.replaceChild(newLayoutButtons, oldLayoutButtons)
            cabinet.removeFromScene()
            cabinet = new Cabinet(FAMILIES.FAMILY3, sceneManager, assets)
            cabinet.setWidth(2)
            radioButtonFamily1.checked = false
            radioButtonFamily2.checked = false
            radioButtonFamily3.checked = true
            emptyTextFields()

            setCameraDistance(cabinet.getWidth(), cabinet.getHeight(), true)
        })
        let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
        let newLayoutButtons = createLayoutRadioButtons(FAMILIES.FAMILY1)
        sideBar.replaceChild(newLayoutButtons, oldLayoutButtons)
    }

    function initializeSubmit()
    {
        let submit = document.getElementById('submit')
        submit.addEventListener('click', e=>{
            let widthField = document.getElementById('width')
            let heightField = document.getElementById('height')
            let width = parseInt(widthField.value)
            let height = parseInt(heightField.value)
            if (width != NaN && height != NaN)
            {
                cabinet.setWidth(width/100)
                cabinet.setHeight(height/100)
            }
        })
    }

    function createLayoutRadioButtons(family)
    {
        let radioContainer = document.createElement('div')
        radioContainer.className = 'radio-container'
        for (let i=0; i<family.length; i++)
        {
            let radioItemContainer = document.createElement('div')
            radioItemContainer.className = 'radio-item-container'
            let label = document.createElement('label')
            label.for = 'radio-layout'+i
            label.className = 'radio-text'
            label.innerHTML = 'Layout'+(family[i].type)
            radioItemContainer.appendChild(label)
            let input = document.createElement('input')
            input.id = 'radio-layout'+i
            input.type = 'radio'
            input.className = 'radio-button'
            input.checked = (i == 0)
            input.addEventListener('change', e => {
                let radioButtonItems = radioContainer.children
                for (let j=0; j<radioButtonItems.length; j++)
                {
                    let input = radioButtonItems[j].querySelector('input')
                    input.checked = (j == i)
                }
                cabinet.switchLayout(family[i])
                setCameraDistance(cabinet.getWidth(), cabinet.getHeight(), false)
            })
            radioItemContainer.appendChild(input)
            radioContainer.appendChild(radioItemContainer)
        }
        return radioContainer
    }

    function emptyTextFields()
    {
        let widthField = document.getElementById('width')
        widthField.value = ''
        let heightField = document.getElementById('height')
        heightField.value = ''
    }

    initializeFamilyRadioButtons()
    initializeSubmit()
}

