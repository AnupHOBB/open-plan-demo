import * as FRAMEWORK from '../framework/Framework.js'
import * as CONFIGURATOR from './Configurator.js'
import { Column } from "./Column.js"
import { Socket } from "./Socket.js"

export class Closet
{
    constructor(family, sceneManager, hasClosedSides = true) 
    { 
        this.columns = []
        this.top = this._getTop(family)
        this.base = new FRAMEWORK.SceneObject('ClosetBase') 
        this.position = { x: 0, y: 0, z: 0 }
        this.family = family
        this.activeLayout = family.layouts[0]
        this.sceneManager = sceneManager
        this.hasClosedSides = hasClosedSides
        this.width = CONFIGURATOR.MIN_WIDTH
        this.depth = CONFIGURATOR.MIN_DEPTH
        this.areTopDoorsOpen = false
        this.areBottomDoorsOpen = false
        this.sideLegs = []
        this.centerLegs = []
        this.initialTopWidth = 0.4
        this._setupBase()
        this.setWidth(CONFIGURATOR.MIN_WIDTH)
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
        if (width >= CONFIGURATOR.MIN_WIDTH && width <= CONFIGURATOR.MAX_WIDTH)
        {   
            let columnCount = Math.trunc((width/CONFIGURATOR.MAX_COLUMN_WIDTH) + 1)
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
                {    
                    let column = new Column('Column'+this.columns.length, this.activeLayout)
                    column.openTop(this.areTopDoorsOpen)
                    column.openBottom(this.areBottomDoorsOpen)
                    this.columns.push(column)
                }
            }
            for (let column of this.columns)
                column.setWidth(columnWidth)
            this._assignColumnTypes()
            if (this.top != undefined)   
            {
                this.top.setPosition((-columnWidth * (this.columns.length/2)) + (this.initialTopWidth/2) + this.family.topOffset.x, this.getHeight(), this.family.topOffset.z)  
                this.top.moveWidthBones(width - this.width)
            }
            this.width = width
            this._positionLegs(true)
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
        if (this.top != undefined)
            this.top.setPosition((-this.columns[0].width * (this.columns.length/2)) + (this.initialTopWidth/2) + this.family.topOffset.x, this.getHeight(), this.family.topOffset.z)
    }

    setDepth(depth)
    {
        this.depth = depth
        for (let column of this.columns)
            column.setDepth(depth)
        this._positionLegs(false)
    }

    getWidth() { return this.width }

    getHeight() { return this.columns[0].height + this.family.legHeight }

    getDepth() { return this.depth }

    switchLayout(layout)
    {  
        if (this._isLayoutSupported(layout))
        {    
            this.activeLayout = layout
            for (let column of this.columns)    
                column.removeFromScene(this.sceneManager)
            for (let i=0; i<this.columns.length; i++)
            {    
                let name = this.columns[i].name
                this.columns.splice(i, 1, new Column(name, this.activeLayout))
            }
            this._assignColumnTypes()
            this.addToScene()
        }
    }

    openTopAt(index, open = false)
    {
        for (let i=0; i<this.columns.length; i++)
        {
            if (i == index)
            {
                this.columns[i].openTop(open)
                break
            }
        }
    }

    openBottomAt(index, open = false)
    {
        for (let i=0; i<this.columns.length; i++)
        {
            if (i == index)
            {
                this.columns[i].openBottom(open)
                break
            }
        }
    }

    openAllTop(open = false)
    {
        this.areTopDoorsOpen = open
        for (let i=0; i<this.columns.length; i++)
            this.columns[i].openTop(open)
    }

    openAllBottom(open = false)
    {
        this.areBottomDoorsOpen = open
        for (let i=0; i<this.columns.length; i++)
            this.columns[i].openBottom(open)
    }

    switchTopDoorToLeftAt(index, useLeftDoor = true)
    {
        for (let i=0; i<this.columns.length; i++)
        {
            if (i == index)
            {
                this.columns[i].switchTopDoorToLeft(useLeftDoor)
                break
            }
        }
    }

    switchBottomDoorToLeftAt(index, useLeftDoor = true)
    {
        for (let i=0; i<this.columns.length; i++)
        {
            if (i == index)
            {
                this.columns[i].switchBottomDoorToLeft(useLeftDoor)
                break
            }
        }
    }

    getColumnCount() { this.columns.length }

    addToScene()
    {
        this._prepareColumns()
        for (let column of this.columns)   
            column.addToScene(this.sceneManager)
        this.sceneManager.register(this.base)
    }

    removeFromScene()
    {
        for (let column of this.columns)   
            column.removeFromScene(this.sceneManager)
        this.sceneManager.unregister(this.base.name)
    }

    _getTop(family)
    {
        if (family.top[0] != undefined)
            return new Socket(CONFIGURATOR.getAsset(family.top[0]))
    }

    _setupBase()
    {
        if (this.top != undefined)    
            this.base.attachObject3D(this.top.object3D)
        //rotation angles FL : 0, FR : 90, BR : 180, BL : 270
        let flLeg = CONFIGURATOR.getAsset(this.family.sideLeg[0])
        this.base.attachObject3D(flLeg)
        this.sideLegs.push(flLeg)
        let frLeg = CONFIGURATOR.getAsset(this.family.sideLeg[0])
        this.base.attachObject3D(frLeg)
        this.sideLegs.push(frLeg)
        let brLeg = CONFIGURATOR.getAsset(this.family.sideLeg[0])
        this.base.attachObject3D(brLeg)
        this.sideLegs.push(brLeg)
        let blLeg = CONFIGURATOR.getAsset(this.family.sideLeg[0])
        this.base.attachObject3D(blLeg)
        this.sideLegs.push(blLeg)
        this._positionLegs(true)
    }

    _positionLegs(hasWidthChanged)
    {
        let offset = this.family.legOffset
        this.sideLegs[0].position.set(-(this.width/2 - offset.x), 0, this.depth/2 - offset.z)
        this.sideLegs[1].rotation.set(0, FRAMEWORK.Maths.toRadians(90), 0)
        this.sideLegs[1].position.set(this.width/2 - offset.x, 0, this.depth/2 - offset.z)
        this.sideLegs[2].rotation.set(0, FRAMEWORK.Maths.toRadians(180), 0)
        this.sideLegs[2].position.set(this.width/2 - offset.x, 0, -(this.depth/2 - offset.z))
        this.sideLegs[3].rotation.set(0, FRAMEWORK.Maths.toRadians(270), 0)
        this.sideLegs[3].position.set(-(this.width/2 - offset.x), 0, -(this.depth/2 - offset.z))

        if (hasWidthChanged)
        {
            let columnCount = this.columns.length
            let centerLegsCount = Math.trunc(columnCount/2) * 2
            if (centerLegsCount > this.centerLegs.length)
            {
                for (let i=this.centerLegs.length; i<centerLegsCount; i+=2)
                {
                    let cfLeg = CONFIGURATOR.getAsset(this.family.centerLeg[0])
                    this.base.attachObject3D(cfLeg)
                    this.centerLegs.push(cfLeg)
                    let cbLeg = CONFIGURATOR.getAsset(this.family.centerLeg[0])
                    this.base.attachObject3D(cbLeg)
                    this.centerLegs.push(cbLeg)
                }
            } 
            else if (centerLegsCount < this.centerLegs.length)
            {
                for (let i=centerLegsCount; i<this.centerLegs.length; i++)
                    this.base.detachObject3D(this.centerLegs[i])
                this.centerLegs.splice(centerLegsCount, this.centerLegs.length - centerLegsCount)
            }  
            let gaps = (centerLegsCount/2) + 1
            let gapXValue = (this.width/gaps) - (this.width/2)
            for (let i=0; i<this.centerLegs.length; i+=2)
            {
                this.centerLegs[i].position.set(((gapXValue * this.width)/gaps) - offset.x, 0, this.depth/2 - offset.z)
                this.centerLegs[i+1].position.set(((gapXValue * this.width)/gaps) - offset.x, 0, -(this.depth/2 - offset.z))
                gapXValue+=(this.width/gaps)
            }
        }
        else
        {
            let divisor = (centerLegCount/2) + 1
            let scalar = 1
            for (let i=0; i<this.centerLegs.length; i+=2)
            {
                this.centerLegs[i].position.set(((scalar * this.width)/divisor) - offset.x, 0, this.depth/2 - offset.z)
                this.centerLegs[i+1].position.set(((scalar * this.width)/divisor) - offset.x, 0, -(this.depth/2 - offset.z))
                scalar++
            }  
        }    
    }
    
    _prepareColumns()
    {
        let columnWidth = this.width/this.columns.length
        let columnPosition = { x: this.position.x, y: this.position.y, z: this.position.z }
        columnPosition.x -= (columnWidth/2) * (this.columns.length - 1)
        columnPosition.y += this.family.legHeight
        for (let column of this.columns)
        {    
            column.stack(columnPosition)
            columnPosition.x += columnWidth
        }
    }

    _assignColumnTypes()
    {
        if (this.columns.length > 1)
        {
            this.columns[0].setAsLeftColumn(this.hasClosedSides)
            this.columns[0].switchTopDoorToLeft(false)
            this.columns[0].switchBottomDoorToLeft(false)
            for (let i=1; i<this.columns.length - 1; i++)
            {    
                this.columns[i].setAsMiddleColumn(this.hasClosedSides)
                this.columns[i].switchTopDoorToLeft(i % 2 != 0)
                this.columns[i].switchBottomDoorToLeft(i % 2 != 0)
            }
            this.columns[this.columns.length - 1].setAsRightColumn()
            this.columns[this.columns.length - 1].switchTopDoorToLeft(true)
            this.columns[this.columns.length - 1].switchBottomDoorToLeft(true)
        }
        else
        {    
            this.columns[0].setAsSingleColumn()
            this.columns[0].switchTopDoorToLeft(true)
            this.columns[0].switchBottomDoorToLeft(true)
        }
    }

    _isLayoutSupported(inputLayout)
    {
        for (let layout of this.family.layouts)
        {
            if (inputLayout == layout)
                return true
        }
        return false
    }
}