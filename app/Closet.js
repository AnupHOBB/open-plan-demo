import * as THREE from '../node_modules/three/src/Three.js'
import * as ENGINE from '../engine/Engine.js'

const WIDTH = 0.76
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

export class Closet
{
    constructor(family) 
    { 
        this.columns = []
        this.position = { x: 0, y: 0, z: 0 }
        this.family = family
    }

    setPosition(x, y, z)
    {
        if (x != undefined && y != undefined && z != undefined)
            this.position = { x: x, y: y, z: z }
    }

    addColumn(name, layout) 
    { 
        if (this._isLayoutSupported(layout))
            this.columns.push(new Column(name, layout))
        else
            console.log('Layout not supported for '+name)
    }

    addToScene(sceneManager)
    {
        this._prepareColumns()
        for (let column of this.columns)
            column.addToScene(sceneManager)
    }

    _prepareColumns()
    {
        let columnPosition = this.position
        columnPosition.x += (WIDTH/2) * (this.columns.length - 1)
        for (let column of this.columns)
        {    
            column.stack(columnPosition)
            columnPosition.x -= WIDTH
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
    constructor(name, layout) 
    {
        this.name = name 
        this.components = []
        this.isAddedToScene = false
        this.layout = layout
    }

    changeLayout(layout) { this.layout = layout }

    stack(position)
    {
        let componentPosition
        if (position == undefined || position.x == undefined || position.y == undefined || position.z == undefined)
            componentPosition = { x: 0, y: 0, z: 0 }
        else
            componentPosition = { x: position.x, y: position.y, z: position.z }
        for (let componentType of this.layout)
        {
            let component = new Component(this.name+componentType.type, componentType.type, componentType.height, componentType.color)
            componentPosition.y += component.height/2.0
            component.setPosition(componentPosition.x, componentPosition.y, componentPosition.z)
            this.components.push(component)
            componentPosition.y += component.height/2.0
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
}

class Component
{
    constructor(name, type, height, color)
    {
        this.type = type
        this.height = height
        this.model = new ENGINE.StaticModel(name, new THREE.BoxGeometry(WIDTH, height, DEPTH), new THREE.MeshLambertMaterial({color: color, transparent: true, opacity: 0.5}), false, false)
    }

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
}