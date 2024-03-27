import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import { Cabinet, LAYOUTS, FAMILIES } from './app/Configurator.js'

const FAMILY_LAYOUTS = []
const LAYOUT_INDEX = 6 

window.onload = () => 
{
    let canvas = document.querySelector('canvas')
    let sceneManager = new ENGINE.SceneManager(canvas, true)
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 15)
    cameraManager.setPosition(5, 1.4, -15)
    cameraManager.setLookAt(0, 1.4, 0)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    sceneManager.setSizeInPercent(0.68, 1)
    sceneManager.setBackground(new THREE.Color(0, 0, 0))
    let directLight = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), 0.5)
    directLight.setPosition(5, 20, -10)
    sceneManager.register(directLight)
    let input = new ENGINE.InputManager('Input')
    sceneManager.register(input)
    cameraManager.registerInput(input)

    let family = FAMILIES.FAMILY1
    let cabinet = new Cabinet(family, sceneManager)
    cabinet.setWidth(2)

    function initializeFamilyRadioButtons()
    {   
        for (let FAMILY in FAMILIES)
            FAMILY_LAYOUTS.push(createLayoutRadioButtons(FAMILIES[FAMILY]))

        let sideBar = document.getElementById('side-bar')
        let radioButtonFamily1 = document.getElementById('radio-family1')
        radioButtonFamily1.addEventListener('change', e=>{
            let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
            sideBar.replaceChild(FAMILY_LAYOUTS[0], oldLayoutButtons)

            cabinet.removeFromScene()
            cabinet = new Cabinet(FAMILIES.FAMILY1, sceneManager)
            cabinet.setWidth(2)

            radioButtonFamily1.checked = true
            radioButtonFamily2.checked = false
            radioButtonFamily3.checked = false
        })
        let radioButtonFamily2 = document.getElementById('radio-family2')
        radioButtonFamily2.addEventListener('change', e=>{
            let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
            sideBar.replaceChild(FAMILY_LAYOUTS[1], oldLayoutButtons)
            
            cabinet.removeFromScene()
            cabinet = new Cabinet(FAMILIES.FAMILY2, sceneManager)
            cabinet.setWidth(2)

            radioButtonFamily1.checked = false
            radioButtonFamily2.checked = true
            radioButtonFamily3.checked = false
        })
        let radioButtonFamily3 = document.getElementById('radio-family3')
        radioButtonFamily3.addEventListener('change', e=>{
            let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
            sideBar.replaceChild(FAMILY_LAYOUTS[2], oldLayoutButtons)
            
            cabinet.removeFromScene()
            cabinet = new Cabinet(FAMILIES.FAMILY3, sceneManager)
            cabinet.setWidth(2)

            radioButtonFamily1.checked = false
            radioButtonFamily2.checked = false
            radioButtonFamily3.checked = true
        })

        let oldLayoutButtons = sideBar.children[LAYOUT_INDEX]
        sideBar.replaceChild(FAMILY_LAYOUTS[0], oldLayoutButtons)
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

    initializeFamilyRadioButtons()
    initializeSubmit()
}

