import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import { Cabinet, FAMILIES, CUBEMAP, WOOD } from './app/Configurator.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from './node_modules/three/examples/jsm/loaders/DRACOLoader.js'

const CABINET = 'assets/openplan_90cm_Test01.glb'
const LAYOUT_INDEX = 6 

window.onload = () => 
{
    /*let loader = new ENGINE.AssetLoader()
    let dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(ENGINE.DRACO_DECODER_PATH)
    let modelLoader = new GLTFLoader()
    modelLoader.setDRACOLoader(dracoLoader)
    loader.addLoader(CABINET, CABINET, modelLoader)
    loader.execute(p=>{}, assetMap=>{
        let canvas = document.querySelector('canvas')
        let sceneManager = new ENGINE.SceneManager(canvas, true)
        let input = new ENGINE.InputManager('Input')
        sceneManager.register(input)
        let cameraManager = new ENGINE.StaticCameraManager('Camera', 15)
        //let cameraManager = new ENGINE.FirstPersonCameraManager('Camera', 15)
        cameraManager.setPosition(0, 1.3, -10)
        cameraManager.setLookAt(0, 1.3, 0)
        cameraManager.registerInput(input)
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        sceneManager.setSizeInPercent(0.68, 1)
        sceneManager.setBackground(new THREE.Color(0, 0, 0))
        let directLight = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), 0.5)
        directLight.setPosition(5, 20, -10)
        sceneManager.register(directLight)

        let cabinetModel = new ENGINE.MeshModel('Cabinet', assetMap.get(CABINET), true)
        sceneManager.register(cabinetModel)
        let offset = 0.1
        let boneLeft = cabinetModel.getBone('BoneLeft')
        boneLeft.position.y += offset
        let boneRight = cabinetModel.getBone('BoneRight')
        boneRight.position.y += offset
        let boneCenter = cabinetModel.getBone('neutral_bone_1')
        boneCenter.position.y += offset
        //input.setCursorSensitivity(0.01)
        //cameraManager.setMovementSensitivity(0.5) 
    })*/

    const ENVMAP_TEXTURES = ['./assets/cubemap/right.jpg','./assets/cubemap/left.jpg','./assets/cubemap/top.jpg','./assets/cubemap/bottom.jpg','./assets/cubemap/front.jpg','./assets/cubemap/back.jpg']
    const WOOD_TEXTURE = ['./assets/wood_03.webp']
    let loader = new ENGINE.AssetLoader()
    loader.addLoader(CUBEMAP, ENVMAP_TEXTURES, new THREE.CubeTextureLoader())
    loader.addLoader(WOOD, WOOD_TEXTURE, new THREE.TextureLoader())
    loader.execute(p=>{}, assets => setupBoxCabinetScene(assets))
}

function setupBoxCabinetScene(assets)
{
    let canvas = document.querySelector('canvas')
    let sceneManager = new ENGINE.SceneManager(canvas, true)
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 15)
    cameraManager.setPosition(5, 1.4, -15)
    cameraManager.setLookAt(0, 1.4, 0)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    sceneManager.setSizeInPercent(0.68, 1)
    sceneManager.setBackground(assets.get(CUBEMAP))
    let directLight = new ENGINE.PointLight('DirectLight', new THREE.Color(1, 1, 1), 1)//, 70)
    directLight.setPosition(5, 20, -10)
    sceneManager.register(directLight)

    let family = FAMILIES.FAMILY1
    let cabinet = new Cabinet(family, sceneManager, assets)
    cabinet.setWidth(2)

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

