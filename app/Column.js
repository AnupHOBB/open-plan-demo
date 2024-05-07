import { Cabinet } from './Component.js'

export class Column
{
    constructor(name, layout, width, assetMap) 
    {
        this.name = name 
        this.bottomComponents = []
        this.topComponents = []
        this.isAddedToScene = false
        this.layout = layout
        this.width = width
        this.height = this._calculateHeight(layout)
        this.bottomHeight = this.layout.getBottomHeight(this.height)
        this.topHeight = this.height - this.bottomHeight
        this.position = {x:0, y:0, z:0}
        this.assetMap = assetMap
        this._prepareComponents(layout)
    }

    setWidth(width) 
    { 
        if (width <= MAX_COLUMN_WIDTH)
        {    
            this.width = width
            for (let component of this.bottomComponents)
                component.setWidth(width)
            for (let component of this.topComponents)
                component.setWidth(width)
        }
    }

    setHeight(height)
    {
        if (this._isHeightValid(height))
        {
            //TODO slight modification to this logic
            let newBottomHeight = this.layout.getBottomHeight(height)
            let deltaBottomHeight = newBottomHeight - this.bottomHeight
            let deltaBottomHeightPerComponent = deltaBottomHeight/this.bottomComponents.length
            this.bottomHeight = newBottomHeight
            for (let component of this.bottomComponents)
                component.setHeight(component.height + deltaBottomHeightPerComponent)
            let newTopHeight = height - newBottomHeight
            let deltaTopHeight = newTopHeight - this.topHeight
            let deltaTopHeightPerComponent = deltaTopHeight/this.topComponents.length
            this.topHeight = newTopHeight
            for (let component of this.topComponents)
                component.setHeight(component.height + deltaTopHeightPerComponent)
            this.height = this.bottomHeight + this.topHeight    
            this.stack(this.position)
        }
    }

    changeLayout(layout) { this.layout = layout }

    stack(position)
    {
        if (position != undefined && position.x != undefined && position.y != undefined && position.z != undefined)
        {
            //TODO slight modification to this logic
            let componentPosition = { x: position.x, y: position.y, z: position.z }
            for (let component of this.bottomComponents)
            {
                componentPosition.y += component.height/2.0
                component.setPosition(componentPosition.x, componentPosition.y, componentPosition.z)
                componentPosition.y += component.height/2.0
            }
            for (let component of this.topComponents)
            {
                componentPosition.y += component.height/2.0
                component.setPosition(componentPosition.x, componentPosition.y, componentPosition.z)
                componentPosition.y += component.height/2.0
            }
            this.position = { x: position.x, y: position.y, z: position.z }
        }
    }

    addToScene(sceneManager) 
    { 
        if (!this.isAddedToScene)
        {
            for (let component of this.bottomComponents)
                component.registerInScene(sceneManager)
            for (let component of this.topComponents)
                component.registerInScene(sceneManager)
            this.isAddedToScene = true
        }
    }

    removeFromScene(sceneManager)
    {
        if (this.isAddedToScene)
        {
            for (let component of this.bottomComponents)
                component.unregisterFromScene(sceneManager)
            for (let component of this.topComponents)
                component.unregisterFromScene(sceneManager)
            this.isAddedToScene = false
        }
    }

    _prepareComponents(layout)
    {
        let bottomComponents = layout.bottom
        for (let componentType of bottomComponents)
            this.bottomComponents.push(new Component(this.name+componentType.type, this.width, componentType, this.assetMap))
        let topComponents = layout.top
        for (let componentType of topComponents)
            this.topComponents.push(new Component(this.name+componentType.type, this.width, componentType, this.assetMap))
    }

    _isHeightValid(height)
    {
        return (this.layout.part == 1 && height >= MIN_ONE_PART_COLUMN_HEIGHT && height <= MAX_ONE_PART_COLUMN_HEIGHT) || 
        (this.layout.part == 2 && height >= MIN_TWO_PART_COLUMN_HEIGHT && height <= MAX_TWO_PART_COLUMN_HEIGHT)
    }

    _calculateHeight(layout)
    {
        let height = 0
        let bottomComponents = layout.bottom
        for (let componentType of bottomComponents)
            height += componentType.height
        let topComponents = layout.top
        for (let componentType of topComponents)
            height += componentType.height
        return height
    }
}