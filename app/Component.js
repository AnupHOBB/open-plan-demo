import * as FRAMEWORK from '../framework/Framework.js'
import * as CONFIGURATOR from './Configurator.js'
import { Socket } from "./Socket.js"

export class Component
{
    constructor(columnName, json, useLeftDoor)
    {
        this.json = json
        this.name = columnName+json.name
        this.width = json.width
        this.height = json.height
        this.depth = json.depth
        this.widthDelta = 0
        this.heightDelta = 0
        this.depthDelta = 0
        this.useLeftDoor = useLeftDoor
        this.component = new FRAMEWORK.SceneObject(this.name) 
        this.selectedShelfPath = json.assets.shelf[0]
        this.body = this._getSocket(json.assets.body[0])
        this._attachSocket(this.body)
        this.leftSide = this._getSocket(json.assets.wall[0])
        this._attachSocket(this.leftSide)
        this.rightSide = this._getSocket(json.assets.wall[0])
        this._attachSocket(this.rightSide)
        this.handle = this._getSocket(json.assets.handle[0])
        this.door = this._getSocket(json.assets.door[0])
        if (this.door != undefined) 
        {    
            this.door.attach(this.handle)
            this._attachSocket(this.door)
        }
        this._setupDrawers()
        this.shelves = []
        this._maintainShelves()
        this._reorientPieces(json)
        this.isDoorOpen = false
    }

    setPosition(x, y, z) { this.component.setPosition(x - (this.widthDelta/2), y, z - (this.depthDelta/2)) }

    getPosition() { return this.component.getPosition() }

    offset(x, y, z)
    {
        let position = this.getPosition()
        position.x += x
        position.y += y
        position.z += z
        this.setPosition(position.x, position.y, position.z)
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
        if (this.rightSide != undefined)
            this.rightSide.offset(delta, 0, 0)
        for (let shelf of this.shelves)
            shelf.moveWidthBones(delta)
        if (this.frLeg != undefined)
            this.frLeg.offset(delta, 0, 0)
        if (this.brLeg != undefined)
            this.brLeg.offset(delta, 0, 0)

        for (let drawer of this.drawers)
            drawer.moveWidthBones(delta)
        for (let handle of this.drawerHandles)
            handle.offset(delta/2, 0, 0)

        this.offset(-delta/2, 0, 0)
        this.widthDelta += delta
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
        if (this.leftSide != undefined)
            this.leftSide.moveHeightBones(delta)
        if (this.rightSide != undefined)
            this.rightSide.moveHeightBones(delta)
        if (this.handle != undefined)
            this.handle.offset(0, delta, 0)

        let drawerOffset = 0
        for (let drawer of this.drawers)
        {    
            drawer.moveHeightBones(delta)
            drawer.offset(0, drawerOffset, 0)
            drawerOffset += delta
        }
        for (let handle of this.drawerHandles)
            handle.offset(0, delta/2, 0)

        this._maintainShelves()
        this.heightDelta += delta
    }

    setDepth(depth) 
    {
        let prevDepth = this.depth
        this.depth = depth
        let delta = this.depth - prevDepth
        if (this.body != undefined)
            this.body.moveDepthBones(delta)
        if (this.leftSide != undefined)
            this.leftSide.moveDepthBones(delta)
        if (this.rightSide != undefined)
            this.rightSide.moveDepthBones(delta)
        for (let shelf of this.shelves)
            shelf.moveDepthBones(delta)
        if (this.blLeg != undefined)
            this.blLeg.offset(0, 0, delta)
        if (this.brLeg != undefined)
            this.brLeg.offset(0, 0, delta)
        this.offset(0, 0, delta/2)
        this.depthDelta += delta
    }

    open() 
    {
        this.isDoorOpen = true 
        if (this.door != undefined)
            this.door.setRotation(0, this.useLeftDoor ? -225 : 45, 0) 
    }

    close() 
    {
        this.isDoorOpen = false 
        if (this.door != undefined)
            this.door.setRotation(0, this.useLeftDoor ? 180 : 0, 0)
    }

    showLeftSide(show)
    {
        if (this.leftSide != undefined)
            this.leftSide.setVisibility(show)
    }

    showRightSide(show)
    {
        if (this.rightSide != undefined)
            this.rightSide.setVisibility(show)
    }

    switchToLeftSide(isClosed)
    {
        if (isClosed)
            this.leftSide.swap(CONFIGURATOR.getAsset(this.json.assets.closedSide[0]))
        else
            this.leftSide.swap(CONFIGURATOR.getAsset(this.json.assets.glassSide[0]))    
    }

    switchToRightSide(isClosed)
    {
        if (isClosed)
            this.rightSide.swap(CONFIGURATOR.getAsset(this.json.assets.closedSide[0]))
        else
            this.rightSide.swap(CONFIGURATOR.getAsset(this.json.assets.glassSide[0]))
    }

    switchToLeftWall() { this.leftSide.swap(CONFIGURATOR.getAsset(this.json.assets.wall[0])) }

    switchToRightWall() { this.rightSide.swap(CONFIGURATOR.getAsset(this.json.assets.wall[0])) }

    switchToLeftDoor(useLeftDoor)
    {
        this.useLeftDoor = useLeftDoor
        this._reorientDoor()
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

    _setupDrawers()
    {
        this.drawers = []
        this.drawerHandles = []
        let drawerValues = this.json.drawerValues
        if (drawerValues != undefined)
        {
            for (let value of drawerValues)
            {
                let drawer = this._getSocket(this.json.assets.drawer[0])
                if (drawer != undefined)
                {
                    drawer.setPosition(value.position.x , value.position.y, value.position.z)
                    this._attachSocket(drawer)
                    this.drawers.push(drawer)
                    if (drawer != undefined) 
                    {    
                        let handle = this._getSocket(this.json.assets.handle[0])
                        if (handle != undefined)
                        {
                            handle.setPosition(value.handlePosition.x, value.handlePosition.y, value.handlePosition.z)
                            drawer.attach(handle)
                            this.drawerHandles.push(handle)
                        }
                    }
                }
                else
                    break
            }
        }
    }

    _maintainShelves()
    {
        let shelfCount
        if (this.json.shelfCount != undefined)
            shelfCount = this.json.shelfCount
        else
            shelfCount = Math.ceil(this.height/CONFIGURATOR.MAX_SHELF_OFFSET)
        if (this.shelves.length < shelfCount)
        {
            let extraShelves = shelfCount - this.shelves.length
            for (let i=0; i<extraShelves; i++)
            {
                let shelf = this._getSocket(this.selectedShelfPath)
                shelf.moveWidthBones(this.widthDelta)
                this._attachSocket(shelf)
                this.shelves.push(shelf)
            }
        }
        else if (this.shelves.length > shelfCount)
        {
            for (let i=shelfCount; i<this.shelves.length; i++)    
                this._detachSocket(this.shelves[i])
            this.shelves.splice(shelfCount, this.shelves.length - shelfCount)
        }
        let delta = this.height/(shelfCount + 1)
        let offset = delta
        for (let shelf of this.shelves)
        {    
            shelf.setPosition(0, offset, 0)
            offset += delta
        }
    }

    _reorientPieces(json)
    {
        this._reorientDoor()
        if (this.leftSide != undefined)
        {    
            let position = json.sideValues[0].position
            this.leftSide.setPosition(position.x, position.y, position.z)
        }
        if (this.rightSide != undefined)
        {    
            let position = json.sideValues[1].position
            this.rightSide.setPosition(position.x, position.y, position.z)
        }
    }

    _reorientDoor()
    {
        if (this.door != undefined)
        {
            this.door.setRotation(0, this.useLeftDoor ? 180 : 0, 0)
            let doorPosition = this.json.doorValue.position
            let xOffset = doorPosition.x + (this.useLeftDoor ? 0 : this.widthDelta)
            this.door.setPosition(this.useLeftDoor ? -xOffset : xOffset, doorPosition.y, doorPosition.z)
            if (this.handle != undefined)
            {
                let handlePosition = this.json.doorValue.handlePosition
                this.handle.setPosition(handlePosition.x - this.widthDelta, this.height/2, this.useLeftDoor ? -handlePosition.z : handlePosition.z)
                this.handle.setRotation(0, this.useLeftDoor ? 180 : 0, 0)
            }
            if (this.isDoorOpen)
                this.open()
            else
                this.close()
        }
    }

    _attachSocket(piece)
    {
        if (piece != undefined)
            this.component.attachObject3D(piece.object3D)
    }

    _detachSocket(piece)
    {
        if (piece != undefined)
            this.component.detachObject3D(piece.object3D)
    }

    _getSocket(key)
    {
        let asset = CONFIGURATOR.getAsset(key)
        if (asset != undefined)
            return new Socket(asset)
    }
}