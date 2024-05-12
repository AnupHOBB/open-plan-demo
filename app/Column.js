import * as CONFIGURATOR from './Configurator.js'
import { Cabinet } from './Component.js'

export class Column
{
    constructor(name, layout)
    {
        this.name = name 
        this.bottomComponents = []
        this.topComponents = []
        this.isAddedToScene = false
        this.layout = layout
        this.width = CONFIGURATOR.MIN_WIDTH
        this.height = this._calculateHeight(layout)
        this.bottomHeight = this.layout.bottomHeight(this.height)
        this.topHeight = this.height - this.bottomHeight
        this.position = {x:0, y:0, z:0}
        this._prepareComponents(layout)
        this.setHeight(this.height)
    }

    setWidth(width) 
    { 
        if (width <= CONFIGURATOR.MAX_COLUMN_WIDTH)
        {    
            this.width = width
            for (let component of this.bottomComponents)
                component.setWidth(width)
            for (let component of this.topComponents)
                component.setWidth(width)
        }
    }

    setAsSingleColumn()
    {
        for (let component of this.bottomComponents)
        {
            if (component instanceof Cabinet)   
            {    
                component.showLeftWall(true)
                component.showLeftLegs(true)
                component.showRightWall(true)
                component.showRightLegs(true)
                component.swapRightLegsWithCenter(false)
            }
        }
        for (let component of this.topComponents)
        {
            if (component instanceof Cabinet)  
            {
                component.showLeftWall(true)
                component.showRightWall(true)
            }
        }
    }

    setAsLeftColumn(hasWall = true, hasRightLegs = true)
    {
        for (let component of this.bottomComponents)
        {
            if (component instanceof Cabinet)   
            {    
                component.showLeftWall(true)
                component.showLeftLegs(true)
                component.showRightWall(hasWall)
                component.showRightLegs(hasRightLegs)
                component.swapRightLegsWithCenter(true)
            }
        }
        for (let component of this.topComponents)
        {
            if (component instanceof Cabinet)  
            {
                component.showLeftWall(true)
                component.showRightWall(hasWall)
            }
        }
    }

    setAsMiddleColumn(hasWall = true, hasLegs = true)
    {
        for (let component of this.bottomComponents)
        {
            if (component instanceof Cabinet)   
            {    
                component.showLeftWall(false)
                component.showLeftLegs(false)
                component.showRightWall(hasWall)
                component.showRightLegs(hasLegs)
                component.swapRightLegsWithCenter(true)
            }
        }
        for (let component of this.topComponents)
        {
            if (component instanceof Cabinet)  
            {    
                component.showLeftWall(false)
                component.showRightWall(hasWall)
            }
        }
    }

    setAsRightColumn()
    {
        for (let component of this.bottomComponents)
        {
            if (component instanceof Cabinet)   
            {    
                component.showLeftWall(false)
                component.showLeftLegs(false)
                component.showRightWall(true)
            }
        }
        for (let component of this.topComponents)
        {
            if (component instanceof Cabinet)  
            {    
                component.showLeftWall(false)
                component.showRightWall(true)
            }
        }
    }

    setHeight(height)
    {
        if (this._isHeightValid(height))
        {
            let newBottomHeight = this.layout.bottomHeight(height)
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
            let componentPosition = { x: position.x, y: position.y, z: position.z }
            for (let component of this.bottomComponents)
            {
                component.setPosition(componentPosition.x, componentPosition.y, componentPosition.z)
                componentPosition.y += component.height
            }
            for (let component of this.topComponents)
            {
                component.setPosition(componentPosition.x, componentPosition.y, componentPosition.z)
                componentPosition.y += component.height
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

    openTop(open = false)
    {
        for (let component of this.topComponents)
        {
            if (open)    
                component.open()
            else
                component.close()
        } 
    }

    openBottom(open = false)
    {
        for (let component of this.bottomComponents)
        {
            if (open)    
                component.open()
            else
                component.close()
        } 
    }

    _prepareComponents(layout)
    {
        let doorLeft = true
        for (let i=0; i<layout.bottom.length; i++)
        {    
            this.bottomComponents.push(this._getComponent(layout.bottom[i], doorLeft))
            doorLeft = !doorLeft
        }
        doorLeft = true
        for (let i=0; i<layout.top.length; i++)
        {    
            this.topComponents.push(this._getComponent(layout.top[i], doorLeft))
            doorLeft = !doorLeft
        }
    }

    _getComponent(json, isLeftDoor)
    {
        if (json.name.includes('CABINET'))
            return new Cabinet(this.name, json, isLeftDoor)
    }

    _isHeightValid(height)
    {
        return true
    }

    _calculateHeight(layout)
    {
        let height = 0
        for (let json of layout.bottom)
            height += json.height
        for (let json of layout.top)
            height += json.height
        return height
    }
}