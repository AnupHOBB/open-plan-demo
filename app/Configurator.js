import * as THREE from '../node_modules/three/src/Three.js'
import * as ENGINE from '../engine/Engine.js'

/**
 * Minimum width of a column is 40cm and maximum is 76cm.
 * If the cabinet width exceeds 76cm then another column such that the width of each column will be equal to the total width of cabinet divided by number of columns
 * 
 * Cabinet cannot have more than 5 columns
 */
const MIN_WIDTH = 0.4
const MAX_WIDTH = 3.5
const MAX_COLUMN_WIDTH = 0.76
const DEPTH = 0.4

const COMPONENTS = Object.freeze({
    BOTTOM_DRAWER : {type: 'BottomDrawer', height: 0.3, color: 0xFF0000},
    TOP_DRAWER : {type: 'TopDrawer', height: 0.1, color: 0x00FF00},
    BOTTOM_CABINET : {type: 'BottomCabinet', height: 0.8, color: 0x0000FF},
    UPPER_GLASS_CABINET : {type: 'UpperGlassCabinet', height: 2.4, color: 0xFFFFFF}
})

export const LAYOUTS = Object.freeze({
    LAYOUT1: [COMPONENTS.BOTTOM_CABINET, COMPONENTS.BOTTOM_DRAWER, COMPONENTS.UPPER_GLASS_CABINET],
    LAYOUT2: [COMPONENTS.BOTTOM_DRAWER, COMPONENTS.TOP_DRAWER], 
    LAYOUT3: [COMPONENTS.BOTTOM_CABINET, COMPONENTS.UPPER_GLASS_CABINET] 
})

export const FAMILIES = Object.freeze({
    FAMILY1: [LAYOUTS.LAYOUT1, LAYOUTS.LAYOUT2],
    FAMILY2: [LAYOUTS.LAYOUT2, LAYOUTS.LAYOUT3]
})

export class Cabinet
{
    constructor(family, sceneManager) 
    { 
        this.columns = []
        this.position = { x: 0, y: 0, z: 0 }
        this.family = family
        this.activeLayout = family[0]
        this.setWidth(sceneManager, MIN_WIDTH)
    }

    setPosition(x, y, z)
    {
        if (x != undefined && y != undefined && z != undefined)
            this.position = { x: x, y: y, z: z }
    }

    /**
     * Set the width of the cabinet
     * @param {Number} width width of the cabinet in meters 
     */
    setWidth(sceneManager, width)
    {
        if (width >= MIN_WIDTH && width <= MAX_WIDTH)
        {   
            let columnCount = Math.trunc((width/MAX_COLUMN_WIDTH) + 1)
            let columnWidth = width/columnCount
            if (columnCount < this.columns.length)
            {    
                for (let i=columnCount; i<this.columns.length; i++)
                    this.columns[i].removeFromScene(sceneManager)
                this.columns.splice(columnCount, this.columns.length - columnCount)
            }
            else if (columnCount > this.columns.length)
            {
                let extraColumns = columnCount - this.columns.length
                for (let i=0; i<extraColumns; i++)
                    this.columns.push(new Column('Column'+this.columns.length, this.activeLayout, width))
            }
            for (let column of this.columns)
                column.setWidth(columnWidth)
            this.width = width
            this.addToScene(sceneManager)
        } 
    }

    switchLayout(sceneManager, layout)
    {  
        if (this._isLayoutSupported(layout))
        {    
            this.activeLayout = layout
            for (let column of this.columns)    
                column.removeFromScene(sceneManager)
            let columnWidth = this.width/this.columns.length
            for (let i=0; i<this.columns.length; i++)
            {    
                let name = this.columns[i].name
                this.columns.splice(i, 1, new Column(name, this.activeLayout, columnWidth))
            }
            this.addToScene(sceneManager)
        }
        else
            console.log('Layout not supported')
    }

    addToScene(sceneManager)
    {
        this._prepareColumns()
        let i = 0
        for (let column of this.columns)   
            column.addToScene(sceneManager)
    }

    _prepareColumns()
    {
        let columnWidth = this.width/this.columns.length
        let columnPosition = { x: this.position.x, y: this.position.y, z: this.position.z}
        columnPosition.x += (columnWidth/2) * (this.columns.length - 1)
        for (let column of this.columns)
        {    
            column.stack(columnPosition)
            columnPosition.x -= columnWidth
        }
    }

    _isLayoutSupported(inputLayout)
    {
        for (let layout of this.family)
        {
            if (inputLayout == layout)
                return true
        }
        return false
    }
}

class Column
{
    constructor(name, layout, width) 
    {
        this.name = name 
        this.components = []
        this.isAddedToScene = false
        this.layout = layout
        this.width = width
        this._prepareComponents(layout)
    }

    setWidth(width) 
    { 
        if (width <= MAX_COLUMN_WIDTH)
        {    
            this.width = width
            for (let component of this.components)
                component.setWidth(width)
        }
    }

    changeLayout(layout) { this.layout = layout }

    stack(position)
    {
        if (position != undefined && position.x != undefined && position.y != undefined && position.z != undefined)
        {
            let componentPosition = { x: position.x, y: position.y, z: position.z }
            for (let component of this.components)
            {
                componentPosition.y += component.height/2.0
                component.setPosition(componentPosition.x, componentPosition.y, componentPosition.z)
                componentPosition.y += component.height/2.0
            }
        }
    }

    getComponentAt(index) { return this.components.length > index ? this.components[index] : null }

    addToScene(sceneManager) 
    { 
        if (!this.isAddedToScene)
        {
            for (let component of this.components)
                component.registerInScene(sceneManager)
            this.isAddedToScene = true
        }
    }

    removeFromScene(sceneManager)
    {
        if (this.isAddedToScene)
        {
            for (let component of this.components)
                component.unregisterFromScene(sceneManager)
            this.isAddedToScene = false
        }
    }

    _prepareComponents(layout)
    {
        for (let componentType of layout)
            this.components.push(new Component(this.name+componentType.type, componentType.type, this.width, componentType.height, componentType.color))
    }
}

class Component
{
    constructor(name, type, width, height, color)
    {
        this.type = type
        this.height = height
        this.box = new THREE.BoxGeometry(width, height, DEPTH)
        this.model = new ENGINE.StaticModel(name, this.box, new THREE.MeshLambertMaterial({color: color, transparent: true, opacity: 0.5}), false, false)
    }

    setWidth(width) { this.model.mesh.geometry = new THREE.BoxGeometry(width, this.height, DEPTH) }

    setPosition(x, y, z) { this.model.setPosition(x, y, z) }

    getPosition() { return this.model.getPosition() }

    attach(part)
    {
        if (part != undefined && part.scene != undefined)
            this.model.attach(part)
    }

    detach(part)
    {
        if (part != undefined && part.scene != undefined)
            this.model.detach(part)
    }

    registerInScene(sceneManager)
    {
        if (sceneManager != undefined)
            sceneManager.register(this.model)
    }

    unregisterFromScene(sceneManager)
    {
        if (sceneManager != undefined)
            sceneManager.unregister(this.model.name)
    }
}