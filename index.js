import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import { Closet, LAYOUTS } from './app/Closet.js'


//For now, for all layouts, use total height of 200cm i.e 2 units

window.onload = () => 
{
    let canvas = document.querySelector('canvas')
    let sceneManager = new ENGINE.SceneManager(canvas, true)
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 15)
    //cameraManager.setPosition(5, 1.5, -20)
    cameraManager.setPosition(0, 1.5, -20)
    cameraManager.setLookAt(0, 1.5, 0)
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

    let closet = new Closet({ x: 0, y: 0, z: 0})
    closet.addColumn('Column1', LAYOUTS.LAYOUT1)
    closet.addColumn('Column1', LAYOUTS.LAYOUT2)
    closet.addColumn('Column1', LAYOUTS.LAYOUT3)
    closet.addToScene(sceneManager)
}