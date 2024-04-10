import * as THREE from '../node_modules/three/src/Three.js'
import * as ENGINE from '../engine/Engine.js'
//import { BoxGeometry } from '../node_modules/three/src/geometries/BoxGeometry.js'

/**
 * Minimum width of a column is 40cm and maximum is 76cm.
 * If the cabinet width exceeds 76cm then another column such that the width of each column will be equal to the total width of cabinet divided by number of columns
 * 
 * Cabinet cannot have more than 5 columns
 */
const MIN_WIDTH = 0.4
const MAX_WIDTH = 3.5
const MAX_COLUMN_WIDTH = 0.76
const MAX_TWO_PART_COLUMN_HEIGHT = 2.6
const MIN_TWO_PART_COLUMN_HEIGHT = 2
const MAX_ONE_PART_COLUMN_HEIGHT = 2.2
const MIN_ONE_PART_COLUMN_HEIGHT = 0.8
const DEPTH = 0.4

export const CUBEMAP = 'cubemap'
export const WOOD = 'wood'

const MATERIALS = Object.freeze({
    WOOD : 'wood',
    GLASS : 'glass',
    METAL : 'metal'
})

const COMPONENTS = Object.freeze({
    BOTTOM_DRAWER : {materialType: MATERIALS.WOOD, type: 'BottomDrawer', height: 0.3, color: 0xFF0000},
    TOP_DRAWER : {materialType: MATERIALS.WOOD, type: 'TopDrawer', height: 0.1, color: 0x00FF00},
    BOTTOM_CABINET : {materialType: MATERIALS.METAL, type: 'BottomCabinet', height: 0.8, color: 0x0000FF},
    UPPER_GLASS_CABINET : {materialType: MATERIALS.GLASS, type: 'UpperGlassCabinet', height: 1.8, color: 0xFFFFFF}
})

//part is gonna be either 1 or 2 
export const LAYOUTS = Object.freeze({
    LAYOUT1: {type: '1', part: 2, bottom : [COMPONENTS.BOTTOM_CABINET], top : [COMPONENTS.UPPER_GLASS_CABINET],
        getBottomHeight : function(columnHeight) { return (columnHeight > 2.2) ? 0.9 : 0.8 }
    },
    LAYOUT2: {type: '2', part: 2, bottom : [COMPONENTS.BOTTOM_DRAWER], top : [COMPONENTS.TOP_DRAWER], getBottomHeight : function() { return 0.3 }}, 
    LAYOUT3: {type: '3', part: 1, bottom : [COMPONENTS.BOTTOM_CABINET], top : [COMPONENTS.UPPER_GLASS_CABINET], getBottomHeight : function() { return 0.8 }},
    LAYOUT4: {type: '4', part: 1, bottom : [], top : [COMPONENTS.UPPER_GLASS_CABINET], getBottomHeight : function() { return 0 } } 
})

export const FAMILIES = Object.freeze({
    FAMILY1: [LAYOUTS.LAYOUT1, LAYOUTS.LAYOUT2],
    FAMILY2: [LAYOUTS.LAYOUT2, LAYOUTS.LAYOUT3],
    FAMILY3: [LAYOUTS.LAYOUT1, LAYOUTS.LAYOUT4],
})

export class Cabinet
{
    constructor(family, sceneManager, assetMap) 
    { 
        this.columns = []
        this.position = { x: 0, y: 0, z: 0 }
        this.family = family
        this.activeLayout = family[0]
        this.sceneManager = sceneManager
        this.assetMap = assetMap
        this.setWidth(MIN_WIDTH)
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
    setWidth(width)
    {
        if (width >= MIN_WIDTH && width <= MAX_WIDTH)
        {   
            let columnCount = Math.trunc((width/MAX_COLUMN_WIDTH) + 1)
            let columnWidth = width/columnCount
            if (columnCount < this.columns.length)
            {    
                for (let i=columnCount; i<this.columns.length; i++)
                    this.columns[i].removeFromScene(this.sceneManager)
                this.columns.splice(columnCount, this.columns.length - columnCount)
            }
            else if (columnCount > this.columns.length)
            {
                let extraColumns = columnCount - this.columns.length
                for (let i=0; i<extraColumns; i++)
                    this.columns.push(new Column('Column'+this.columns.length, this.activeLayout, width, this.assetMap))
            }
            for (let column of this.columns)
                column.setWidth(columnWidth)
            this.width = width
            this.addToScene()
        } 
    }

    /**
     * Set the height of the cabinet
     * @param {Number} height height of the cabinet in meters 
     */
    setHeight(height)
    {
        for (let column of this.columns)
            column.setHeight(height)
    }

    switchLayout(layout)
    {  
        if (this._isLayoutSupported(layout))
        {    
            this.activeLayout = layout
            for (let column of this.columns)    
                column.removeFromScene(this.sceneManager)
            let columnWidth = this.width/this.columns.length
            for (let i=0; i<this.columns.length; i++)
            {    
                let name = this.columns[i].name
                this.columns.splice(i, 1, new Column(name, this.activeLayout, columnWidth, this.assetMap))
            }
            this.addToScene()
        }
    }

    addToScene()
    {
        this._prepareColumns()
        for (let column of this.columns)   
            column.addToScene(this.sceneManager)
    }

    removeFromScene()
    {
        for (let column of this.columns)   
            column.removeFromScene(this.sceneManager)
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

class Component
{
    constructor(name, width, componentType, assetMap)
    {
        this.type = componentType.type
        this.width = width
        this.height = componentType.height
        this.assetMap = assetMap
        this.model = new ENGINE.StaticModel(name, new THREE.BoxGeometry(width, this.height, DEPTH), this._createMaterial(componentType), false, false)
    }

    setWidth(width) 
    { 
        this.width = width
        this.model.mesh.geometry = new THREE.BoxGeometry(width, this.height, DEPTH) 
    }

    setHeight(height) 
    {
        this.height = height
        this.model.mesh.geometry = new THREE.BoxGeometry(this.width, height, DEPTH) 
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

    unregisterFromScene(sceneManager)
    {
        if (sceneManager != undefined)
            sceneManager.unregister(this.model.name)
    }

    _createMaterial(componentType)
    {
        switch(componentType.materialType)
        {
            case MATERIALS.GLASS:
                return new THREE.MeshPhysicalMaterial({ 
                    color: 0xffffff, 
                    transparent: false, 
                    opacity: 1,
                    transmission: 1, 
                    roughness: 0.5, 
                    metalness: 0,  
                    envMap: this.assetMap.get(CUBEMAP),
                    envMapIntensity: 0.1,
                    ior: 1.5,
                    reflectivity: 0.05,
                    specularIntensity: 1,
                    iridescence: 1,
                    iridescenceIOR: 1.5,
                    thickness: 5
                });
            case MATERIALS.METAL:
                return new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    roughness: 0.01, 
                    metalness: 0.99, 
                    envMap: this.assetMap.get(CUBEMAP),
                    envMapIntensity: 0.1
                });
            case MATERIALS.WOOD:
                return new THREE.MeshStandardMaterial({ 
                    color: 0xffffff, 
                    roughness: 0.9, 
                    metalness: 0,
                    map: this.assetMap.get(WOOD)  
                });
            default:
                return new THREE.MeshLambertMaterial({color: componentType.color, transparent: true, opacity: 0.5})
        }
    }
}