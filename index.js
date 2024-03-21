import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import { Cabinet, LAYOUTS, FAMILIES } from './app/Configurator.js'


//For now, for all layouts, use total height of 200cm i.e 2 units

window.onload = () => 
{
    let canvas = document.querySelector('canvas')
    let sceneManager = new ENGINE.SceneManager(canvas, true)
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 15)
    cameraManager.setPosition(5, 1.7, -15)
    //cameraManager.setPosition(0, 1.5, -20)
    cameraManager.setLookAt(0, 1.7, 0)
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

    let cabinet = new Cabinet(FAMILIES.FAMILY1, sceneManager)
    cabinet.setWidth(sceneManager, 3)
    setTimeout(()=>{cabinet.setWidth(sceneManager, 0.8)}, 5000)
    setTimeout(()=>{cabinet.switchLayout(sceneManager, LAYOUTS.LAYOUT2)}, 10000)
}