import * as THREE from '../node_modules/three/src/Three.js'
import { SkeletonUtils } from '../node_modules/three/examples/jsm/Addons.js';
import * as FRAMEWORK from '../framework/Framework.js'
import { ASSET_MAP, MAX_SHELF_OFFSET } from './data.js'

class Piece
{
    constructor(object3D)
    {
        this.object3D = object3D
        this.bonesWidth = []
        this.bonesHeight = []
        this.bonesDepth = []
        this._collectBones()
    }

    setPosition(x, y, z) { this.object3D.position.set(x, y, z) }

    getPosition() { return this.object3D.getPosition() }

    offset(x, y, z)
    {
        let position = this.object3D.position
        position.x += x
        position.y += y
        position.z += z
        this.setPosition(position.x, position.y, position.z)
    }

    setRotation(x, y, z) { this.object3D.rotation.set(x, y, z) }

    moveWidthBones(delta) 
    { 
        for (let bone of this.bonesWidth)
            bone.position.x += delta
    }

    moveHeightBones(delta) 
    {
        for (let bone of this.bonesHeight)
            bone.position.y += delta
    }

    moveDepthBones(delta) 
    {
        for (let bone of this.bonesDepth)
            bone.position.z -= delta
    }

    destroy() { this.object3D.dispose() }

    _collectBones()
    {
        this._traversePieceForBones(this.object3D, this.bonesWidth, 'Width')
        this._traversePieceForBones(this.object3D, this.bonesHeight, 'Height')
        this._traversePieceForBones(this.object3D, this.bonesDepth, 'Depth')
    }

    _traversePieceForBones(object3D, boneArray, name)
    {
        FRAMEWORK.Misc.postOrderTraversal(object3D, mesh => {
            if (mesh != undefined && mesh.isBone && mesh.name.includes(name))
                boneArray.push(mesh)
        })
    }
}

class Component
{
    constructor(json)
    {
        this.width = json.width
        this.height = json.height
        this.depth = json.depth
        this.thickness = json.thickness
        this.standHeight = json.standHeight
        this.component = new FRAMEWORK.SceneObject(json.name) 
    }

    setPosition(x, y, z) { this.component.setPosition(x, y, z) }

    getPosition() { return this.component.getPosition() }

    offset(x, y, z)
    {
        let position = this.getPosition()
        position.x += x
        position.y += y
        position.z += z
        this.setPosition(position.x, position.y, position.z)
    }

    registerInScene(sceneManager)
    {
        if (sceneManager != undefined)
            sceneManager.register(this.component)
    }

    unregisterFromScene(sceneManager)
    {
        if (sceneManager != undefined)
            sceneManager.unregister(this.component.name)
    }

    _attachPiece(piece)
    {
        if (piece != undefined)
            this.component.attachObject3D(piece.object3D)
    }

    _detachPiece(piece)
    {
        if (piece != undefined)
            this.component.detachObject3D(piece.object3D)
    }

    _getPiece(key)
    {
        let asset = ASSET_MAP.get(key)
        if (asset != undefined)
        {
            if (asset.isObject3D == undefined && asset.scene.isObject3D)
                return new Piece(SkeletonUtils.clone(asset.scene))
            return new Piece(SkeletonUtils.clone(asset))
        }
    }
}

export class Cabinet extends Component
{
    constructor(json, useLeftDoor) 
    { 
        super(json)
        useLeftDoor = (useLeftDoor == undefined) ? false : useLeftDoor
        this.body = this._getPiece(json.name + json.assets.body[0])
        this._attachPiece(this.body)
        this.leftWall = this._getPiece(json.name + json.assets.leftWall[0])
        this._attachPiece(this.leftWall)
        this.rightWall = this._getPiece(json.name + json.assets.rightWall[0])
        this._attachPiece(this.rightWall)
        this.shelves = []
        this._maintainShelves()
        if (useLeftDoor)
        {    
            this.leftDoor = this._getPiece(json.name + json.assets.leftDoor[0])
            this._attachPiece(this.leftDoor)
        }
        else
        {    
            this.rightDoor = this._getPiece(json.name + json.assets.rightDoor[0])
            this._attachPiece(this.rightDoor)
        }
        this._repositionPieces()
    }

    setWidth(width) 
    { 
        let prevWidth = this.width
        this.width = width
        let delta = this.width - prevWidth
        if (this.body != undefined)
            this.body.moveWidthBones(delta)
        if (this.leftDoor != undefined)
            this.leftDoor.moveWidthBones(delta/2)
        if (this.rightDoor != undefined)
        {    
            this.rightDoor.moveWidthBones(-delta/2)
            this.rightDoor.offset(delta, 0, 0)
        }
        if (this.rightWall != undefined)
            this.rightWall.offset(delta, 0, 0)
        for (let shelf of this.shelves)
            shelf.moveWidthBones(delta)
        this.offset(-delta/2, 0, 0)
    }

    setHeight(height) 
    {
        let prevHeight = this.height
        this.height = height
        let delta = this.height - prevHeight
        if (this.body != undefined)
            this.body.moveHeightBones(delta)
        if (this.leftDoor != undefined)
            this.leftDoor.moveHeightBones(delta)
        if (this.rightDoor != undefined)
            this.rightDoor.moveHeightBones(delta)
        if (this.leftWall != undefined)
            this.leftWall.moveHeightBones(delta)
        if (this.rightWall != undefined)
            this.rightWall.moveHeightBones(delta)
        this._maintainShelves()
    }

    setDepth(depth) 
    {
        let prevDepth = this.depth
        this.depth = depth
        let delta = this.depth - prevDepth
        if (this.body != undefined)
            this.body.moveDepthBones(delta)
        if (this.leftWall != undefined)
            this.leftWall.moveDepthBones(delta)
        if (this.rightWall != undefined)
            this.rightWall.moveDepthBones(delta)
        for (let shelf of this.shelves)
            shelf.moveDepthBones(delta)
        this.offset(0, 0, delta/2)
    }

    openDoors() { this._rotateDoors(135) }

    closeDoors() { this._rotateDoors(0) }

    _maintainShelves()
    {
        let shelfCount = Math.trunc((this.height - this.standHeight)/MAX_SHELF_OFFSET)
        if (this.shelves.length < shelfCount)
        {
            let offset = MAX_SHELF_OFFSET * (this.shelves.length + 1)
            let extraShelves = shelfCount - this.shelves.length
            for (let i=0; i<extraShelves; i++)
            {
                let shelf = this._getPiece('BOTTOM_CABINETassets/dummy/Bottom_Shelf_01.glb')
                this._attachPiece(shelf)
                shelf.setPosition(0, offset, 0)
                this.shelves.push(shelf)
                offset += MAX_SHELF_OFFSET
            }
        }
        else if (this.shelves.length > shelfCount)
        {
            for (let i=shelfCount; i<this.shelves.length; i++)
            {
                this._detachPiece(this.shelves[i])
            }
                //this.shelves[i].destroy()
            this.shelves.splice(shelfCount, this.shelves.length - shelfCount)
        }
    }

    _repositionPieces()
    {
        if (this.leftDoor != undefined)
            this.leftDoor.setPosition(-((this.width/2) - this.thickness), this.standHeight + this.thickness, this.depth/2)
        if (this.rightDoor != undefined)
            this.rightDoor.setPosition((this.width/2) - this.thickness, this.standHeight + this.thickness, this.depth/2)
        if (this.leftWall != undefined)
            this.leftWall.setPosition(-this.width/2, this.standHeight + this.thickness, 0)
        if (this.rightWall != undefined)
            this.rightWall.setPosition(this.width/2, this.standHeight + this.thickness, 0)
    }

    _rotateDoors(angleInDeg)
    {
        if (this.leftDoor != undefined)
            this.leftDoor.setRotation(0, FRAMEWORK.Maths.toRadians(-angleInDeg), 0)
        if (this.rightDoor != undefined)
            this.rightDoor.setRotation(0, FRAMEWORK.Maths.toRadians(angleInDeg), 0) 
    }
}