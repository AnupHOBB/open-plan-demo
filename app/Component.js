import * as FRAMEWORK from '../framework/Framework.js'
import { SkeletonUtils } from '../node_modules/three/examples/jsm/Addons.js';
import { Piece } from "./Piece.js"
import { ASSET_MAP, MAX_SHELF_OFFSET } from './Configurator.js'

class Component
{
    constructor(columnName, json)
    {
        this.json = json
        this.name = columnName+json.name
        this.width = json.width
        this.height = json.height
        this.depth = json.depth
        this.legHeight = json.legHeight
        this.component = new FRAMEWORK.SceneObject(this.name) 
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
            sceneManager.unregister(this.name)
    }

    open() {}

    close() {}

    showLeftWall(show) {}

    showRightWall(show) {}

    swapLeftLegsWithCenter(swap) {}

    swapRightLegsWithCenter(swap) {}

    showLeftLegs(show) {}

    showRightLegs(show) {}

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

    _getAsset(key)
    {
        let asset = ASSET_MAP.get(key)
        if (asset != undefined)
        {
            if (asset.isObject3D == undefined && asset.scene.isObject3D)
                return SkeletonUtils.clone(asset.scene)
            return SkeletonUtils.clone(asset)
        } 
    }
}

export class Cabinet extends Component
{
    constructor(columnName, json, useLeftDoor = false)
    { 
        super(columnName, json)
        this.useLeftDoor = useLeftDoor
        this.selectedShelfPath = json.name + json.assets.shelf[0]
        this.body = this._getPiece(json.name + json.assets.body[0])
        this._attachPiece(this.body)
        this.leftWall = this._getPiece(json.name + json.assets.wall[0])
        this._attachPiece(this.leftWall)
        this.rightWall = this._getPiece(json.name + json.assets.wall[0])
        this._attachPiece(this.rightWall)
        this.handle = this._getPiece(json.name + json.assets.handle[0])
        this.door = this._getPiece(json.name + json.assets.door[0])
        if (this.door != undefined) 
            this.door.attach(this.handle)
        this._attachPiece(this.door)
        this.shelves = []
        this._maintainShelves()
        this.flLeg = this._getPiece(json.name + json.assets.sideleg[0])
        this._attachPiece(this.flLeg)
        this.frLeg = this._getPiece(json.name + json.assets.sideleg[0])
        this._attachPiece(this.frLeg)
        this.brLeg = this._getPiece(json.name + json.assets.sideleg[0])
        this._attachPiece(this.brLeg)
        this.blLeg = this._getPiece(json.name + json.assets.sideleg[0])
        this._attachPiece(this.blLeg)
        this._reorientPieces(json)
    }

    setWidth(width) 
    { 
        let prevWidth = this.width
        this.width = width
        let delta = this.width - prevWidth
        if (this.body != undefined)
            this.body.moveWidthBones(delta)
        if (this.door != undefined)
        {    
            this.door.moveWidthBones(-delta)
            if (!this.useLeftDoor)
                this.door.offset(delta, 0, 0)
            if (this.handle != undefined)
                this.handle.offset(-delta, 0, 0)
        }
        if (this.rightWall != undefined)
            this.rightWall.offset(delta, 0, 0)
        for (let shelf of this.shelves)
            shelf.moveWidthBones(delta)
        if (this.frLeg != undefined)
            this.frLeg.offset(delta, 0, 0)
        if (this.brLeg != undefined)
            this.brLeg.offset(delta, 0, 0)
        this.offset(-delta/2, 0, 0)
    }

    setHeight(height) 
    {
        let prevHeight = this.height
        this.height = height
        let delta = this.height - prevHeight
        if (this.body != undefined)
            this.body.moveHeightBones(delta)
        if (this.door != undefined)
            this.door.moveHeightBones(delta)
        if (this.leftWall != undefined)
            this.leftWall.moveHeightBones(delta)
        if (this.rightWall != undefined)
            this.rightWall.moveHeightBones(delta)
        if (this.handle != undefined)
            this.handle.offset(0, delta, 0)
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
        if (this.blLeg != undefined)
            this.blLeg.offset(0, 0, delta)
        if (this.brLeg != undefined)
            this.brLeg.offset(0, 0, delta)
        this.offset(0, 0, delta/2)
    }

    open() 
    { 
        if (this.door != undefined)
            this.door.setRotation(0, this.useLeftDoor ? -315 : 135, 0) 
    }

    close() 
    { 
        if (this.door != undefined)
            this.door.setRotation(0, this.useLeftDoor ? 180 : 0, 0)
    }

    showLeftWall(show)
    {
        if (this.leftWall != undefined)
            this.leftWall.setVisibility(show)
    }

    showRightWall(show)
    {
        if (this.rightWall != undefined)
            this.rightWall.setVisibility(show)
    }

    swapLeftLegsWithCenter(swap)
    {
        if (swap)
        {
            this.flLeg.swap(this._getAsset(this.json.name + this.json.assets.centerleg[0]))
            this.blLeg.swap(this._getAsset(this.json.name + this.json.assets.centerleg[0]))
        }
        else
        {
            this.flLeg.swap(this._getAsset(this.json.name + this.json.assets.sideleg[0]))
            this.blLeg.swap(this._getAsset(this.json.name + this.json.assets.sideleg[0]))
        }
    }

    swapRightLegsWithCenter(swap)
    {
        if (swap)
        {
            this.frLeg.swap(this._getAsset(this.json.name + this.json.assets.centerleg[0]))
            this.brLeg.swap(this._getAsset(this.json.name + this.json.assets.centerleg[0]))
        }
        else
        {
            this.frLeg.swap(this._getAsset(this.json.name + this.json.assets.sideleg[0]))
            this.brLeg.swap(this._getAsset(this.json.name + this.json.assets.sideleg[0]))
        }
    }

    showLeftLegs(show)
    {
        if (this.flLeg != undefined)
            this.flLeg.setVisibility(show)
        if (this.blLeg != undefined)
            this.blLeg.setVisibility(show)
    }

    showRightLegs(show)
    {
        if (this.frLeg != undefined)
            this.frLeg.setVisibility(show)
        if (this.brLeg != undefined)
            this.brLeg.setVisibility(show)
    }

    _maintainShelves()
    {
        let shelfCount = Math.ceil((this.height - this.legHeight)/MAX_SHELF_OFFSET)
        let delta = (this.height - this.legHeight)/(shelfCount + 1)
        let offset = delta + this.legHeight
        if (this.shelves.length < shelfCount)
        {
            let extraShelves = shelfCount - this.shelves.length
            for (let i=0; i<extraShelves; i++)
            {
                let shelf = this._getPiece(this.selectedShelfPath)
                this._attachPiece(shelf)
                this.shelves.push(shelf)
            }
            for (let shelf of this.shelves)
            {    
                shelf.setPosition(0, offset, 0)
                offset += delta
            }
        }
        else if (this.shelves.length > shelfCount)
        {
            for (let i=shelfCount; i<this.shelves.length; i++)    
                this._detachPiece(this.shelves[i])
            this.shelves.splice(shelfCount, this.shelves.length - shelfCount)
            for (let shelf of this.shelves)
            {    
                shelf.setPosition(0, offset, 0)
                offset += delta
            }
        }
    }

    _reorientPieces(json)
    {
        if (this.flLeg != undefined)
            this.flLeg.setPosition(-json.standOffset.x, json.standOffset.y, json.standOffset.z)
        if (this.frLeg != undefined)
        {    
            this.frLeg.setRotation(0, 90, 0) 
            this.frLeg.setPosition(json.standOffset.x, json.standOffset.y, json.standOffset.z)
        }
        if (this.brLeg != undefined)
        {    
            this.brLeg.setRotation(0, 180, 0)
            this.brLeg.setPosition(json.standOffset.x, json.standOffset.y, -json.standOffset.z)
        }
        if (this.blLeg != undefined)
        {    
            this.blLeg.setRotation(0, 270, 0)
            this.blLeg.setPosition(-json.standOffset.x, json.standOffset.y, -json.standOffset.z)
        }
        if (this.body != undefined)
            this.body.setPosition(0, this.legHeight, 0)
        if (this.door != undefined)
        {
            this.door.setRotation(0, this.useLeftDoor ? 180 : 0, 0)
            this.door.setPosition(this.useLeftDoor ? -json.doorOffset.x : json.doorOffset.x, json.doorOffset.y, json.doorOffset.z)
            if (this.handle != undefined)
            {
                this.handle.setPosition(json.handleOffset.x, this.height/2, json.handleOffset.z)
                if (this.useLeftDoor)
                    this.handle.setRotation(0, 180, 0)
            }
        }
        if (this.leftWall != undefined)
            this.leftWall.setPosition(-json.wallOffset.x, json.wallOffset.y, json.wallOffset.z)
        if (this.rightWall != undefined)
            this.rightWall.setPosition(json.wallOffset.x, json.wallOffset.y, json.wallOffset.z)
    }
}