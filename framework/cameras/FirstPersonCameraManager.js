import * as THREE from '../../node_modules/three/src/Three.js'
import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import { Maths } from '../helpers/maths.js'

/**
 * Extends the PerspectiveCameraManager to provide first person view support
 */
export class FirstPersonCameraManager extends PerspectiveCameraManager
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {Number} fov camera field of view
     */
    constructor(name, fov) 
    { 
        super(name, fov)
        this.moveSensitivity = 0.1 
    }

    /**
     * Registers first person camera manager inputs to the input manager
     * @param {ENGINE.InputManager} inputManager the input manager object
     */
    registerInput(inputManager)
    {
        if (inputManager != null)
        {
            inputManager.registerKeyEvent(map => this.onKeyinput(map, this.moveSensitivity))
            inputManager.registerLMBMoveEvent((dx, dy) => this.onMoveEvent(dx, dy))
            inputManager.setCursorSensitivity(0.05)
        }
    }

    /**
     * Sets the sensitivity value for camera movement
     * @param {Number} sensitivity sensitivity value that affects camera movement
     */
    setMovementSensitivity(sensitivity) { this.moveSensitivity = sensitivity }

    /**
     * Called by InputManager whenever it detects key strokes.
     * This function moves the camera around based on user input.
     * @param {Map} keyMap map consisting of keys that are currently being pressed by user
     * @param {Number} sensitivity sensitivity value that affects camera movement
     */
    onKeyinput(keyMap, sensitivity) 
    {
        let front = new THREE.Vector3()
        this.camera.getWorldDirection(front)
        let right = Maths.cross(front, new THREE.Vector3(0, 1, 0))
        let newPosition = new THREE.Vector3()
        front = new THREE.Vector3(front.x * sensitivity, front.y * sensitivity, front.z * sensitivity)
        right = new THREE.Vector3(right.x * sensitivity, right.y * sensitivity, right.z * sensitivity)
        if (keyMap.get('w') != undefined)
        {
            newPosition = Maths.addVectors(this.camera.position, front)
            this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
        if (keyMap.get('s') != undefined)
        {
            newPosition = Maths.subtractVectors(this.camera.position, front)
            this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
        if (keyMap.get('a') != undefined)
        {
            newPosition = Maths.subtractVectors(this.camera.position, right)
            this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
        if (keyMap.get('d') != undefined)
        {
            newPosition = Maths.addVectors(this.camera.position, right)
            this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
    }

    /**
     * Called by InputManager whenever it detects mouse movement. This function is only called when the user holds LMB or RMB and moves the mouse.
     * This function rotates the the camera around based on mouse movement.
     * @param {Number} deltaX displacement of cursor in x-direction
     * @param {Number} deltaY displacement of cursor in y-direction
     * @param {Number} x position of cursor in x-axis
     * @param {Number} y position of cursor in y-axis
     */
    onMoveEvent(deltaX, deltaY, x, y)
    {
        let pitchDeg = Maths.toDegrees(this.camera.rotation.x - deltaY)
        if (pitchDeg > -85 && pitchDeg < 85)
            this.camera.rotation.x -= deltaY
        this.camera.rotation.y -= deltaX
    }
}