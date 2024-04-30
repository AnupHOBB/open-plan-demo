import * as THREE from '../../node_modules/three/src/Three.js'
import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import { OrbitControl } from '../OrbitControl.js'
import { Maths } from '../helpers/maths.js'

/**
 * Extends the PerspectiveCameraManager to provide orbital movement support
 */
export class OrbitalCameraManager extends PerspectiveCameraManager
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {Number} fov camera field of view
     * @param {THREE.Vector3} axis orbit axis
     */
    constructor(name, fov) 
    { 
        super(name, fov)
        this.lookAt = new THREE.Vector3()
        this.cameraOrbiterYaw = new OrbitControl(this.camera)
        this.cameraOrbiterYaw.setCenter(this.lookAt)
        this.cameraOrbiterPitch = new OrbitControl(this.camera)
        this.cameraOrbiterPitch.setCenter(this.lookAt)
        this.cameraOrbiterPitch.addRestriction((d, p) => this.pitchRestriction(d))
        this.panSensitivity = 0.01
        this.zoomSensitivity = 0.01
        this.isGradualResetActive = false
        this.gradualResetTargetPosition = this.camera.position
        this.gradualResetLookAt = this.lookAt
        this.gradualResetSpeed = 1
    }

    /**
     * Registers orbital camera manager inputs to the input manager
     * @param {ENGINE.InputManager} inputManager the input manager object
     */
    registerInput(inputManager)
    {
        if (inputManager != null)
        {
            inputManager.registerLMBMoveEvent((dx, dy) => this.orbit(dx, dy))
            inputManager.registerRMBMoveEvent((dx, dy) => this.pan(dx, dy))
            inputManager.registerMouseWheelEvent(s => this.zoom(s))
            inputManager.setCursorSensitivity(0.5)
        }
    }

    /**
     * Sets the position where the camera should look
     * @param {Number} x x-coordinate in world space
     * @param {Number} y y-coordinate in world space
     * @param {Number} z z-coordinate in world space 
     */
    setLookAt(x, y, z) 
    { 
        this.lookAt = new THREE.Vector3(x, y, z)
        this.cameraOrbiterYaw.setCenter(this.lookAt)
        this.cameraOrbiterPitch.setCenter(this.lookAt)
        this.camera.lookAt(x, y, z)
    }

    /**
     * Gets the position where the camera is looking at
     * @returns {THREE.Vector3} world space position of camera 
     */
    getLookAt() { return this.lookAt }

    /**
     * Sets the sensitivity of the camera pan movement
     * @param {Number} sensitivity the sensitivity value for camera pan
     */
    setPanSensitivity(sensitivity) 
    {
        if (sensitivity > 0)
            this.panSensitivity = sensitivity 
    }

    /**
     * Sets the sensitivity of the camera zoom
     * @param {Number} sensitivity the sensitivity value for camera zoom
     */
    setZoomSensitivity(sensitivity) 
    { 
        if (sensitivity > 0)
            this.zoomSensitivity = sensitivity 
    }

    /**
     * Adds a restriction to the orbit movement in yaw direction
     * @param {Function} restriction callback function that decides if the object position should be updated
     */
    addYawRestriction(restriction) { this.cameraOrbiterYaw.addRestriction(restriction) }

    /**
     * Adds a restriction to the orbit movement in pitch direction
     * @param {Function} restriction callback function that decides if the object position should be updated
     */
    addPitchRestriction(restriction) { this.cameraOrbiterPitch.addRestriction(restriction) }

    /**
     * Called by InputManager whenever it detects cursor movement. This function is only called when the user holds LMB and moves the mouse.
     * This function rotates the the camera around based on mouse movement.
     * @param {Number} deltaX displacement of cursor in x-direction
     * @param {Number} deltaY displacement of cursor in y-direction
     */
    orbit(deltaX, deltaY) 
    { 
        this.cameraOrbiterYaw.orbit(new THREE.Vector3(0, 1, 0), -deltaX) 
        this.cameraOrbiterPitch.orbit(this.right, -deltaY)
        this.updateMatrices()
    }

    /**
     * Called by InputManager whenever it detects mouse wheel movement.
     * This function zooms in and out the camera by changing its field of view.
     * @param {Number} scale this value will be 1 if wheel is moving forwar, -1 if backward and 0 if wheel is staionary
     */
    zoom(scale) 
    { 
        let position = Maths.addVectors(this.camera.position, Maths.scaleVector(this.front, -scale * this.zoomSensitivity))
        let lookAt2Position = Maths.subtractVectors(position, this.lookAt)
        let dot = Maths.dot(lookAt2Position, this.front)
        if (dot < 0)
            this.camera.position.set(position.x, position.y, position.z)
    }

    /**
     * Called by InputManager whenever it detects cursor movement. This function is only called when the user holds RMB and moves the mouse.
     * This function pans the camera
     * @param {Number} deltaX displacement of cursor in x-direction
     * @param {Number} deltaY displacement of cursor in y-direction
     */
    pan(deltaX, deltaY)
    {
        let position = Maths.addVectors(this.camera.position, Maths.scaleVector(this.right, deltaX * this.panSensitivity))
        position = Maths.addVectors(position, Maths.scaleVector(this.up, -deltaY * this.panSensitivity))
        this.camera.position.set(position.x, position.y, position.z)
        this.lookAt = Maths.addVectors(this.lookAt, Maths.scaleVector(this.right, deltaX * this.panSensitivity))
        this.lookAt = Maths.addVectors(this.lookAt, Maths.scaleVector(this.up, -deltaY * this.panSensitivity))
        this.cameraOrbiterYaw.setCenter(this.lookAt)
        this.cameraOrbiterPitch.setCenter(this.lookAt)
    }

    /**
     * Restricts camera pitc rotation in between -89 to 89 degrees
     */
    pitchRestriction(target)
    {
        let vLookAt2target = Maths.subtractVectors(target, this.lookAt)
        let dot = Maths.dot(vLookAt2target, Maths.scaleVector(new THREE.Vector3(this.front.x, 0, this.front.z), -1))
        return [dot > 0.017, target]
    }

    gradualReset(targetPosition, targetLookAt, speed)
    {
        let direction = Maths.subtractVectors(targetPosition, this.camera.position)
        let distance = direction.length()
        if (distance > 0)
        {
            let directionNormal = Maths.normalize(direction)
            let delta = distance > speed ? speed : distance
            let newPosition = Maths.addVectors(this.camera.position, Maths.scaleVector(directionNormal, delta))
            this.setPosition(newPosition.x, newPosition.y, newPosition.z)
            this.setLookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z)
            return true
        }
        return false
    }

    /**
     * Return camera front vector
     * @returns {THREE.Vector3} front vector of camera
     */
    getFrontVector() { return this.front }

    /**
     * Return camera right vector
     * @returns {THREE.Vector3} right vector of camera
     */
    getRightVector() { return this.right }

    /**
     * Return camera up vector
     * @returns {THREE.Vector3} up vector of camera
     */
    getUpVector() { return this.up }

    startGradualReset(targetPosition, targetLookAt, speed)
    {
        this.gradualResetTargetPosition = targetPosition
        this.gradualResetLookAt = targetLookAt
        this.gradualResetSpeed = speed
        this.isGradualResetActive = true
    }

    onSceneRender()
    {
        if (this.isGradualResetActive)
            this.isGradualResetActive = this.gradualReset(this.gradualResetTargetPosition, this.gradualResetLookAt, this.gradualResetSpeed)
    }
}