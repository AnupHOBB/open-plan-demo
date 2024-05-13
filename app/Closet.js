import * as CONFIGURATOR from './Configurator.js'
import { Column } from "./Column.js"

export class Closet
{
    constructor(family, sceneManager, hasSides = true) 
    { 
        this.columns = []
        this.position = { x: 0, y: 0, z: 0 }
        this.family = family
        this.activeLayout = family[0]
        this.sceneManager = sceneManager
        this.hasSides = hasSides
        this.width = CONFIGURATOR.MIN_WIDTH
        this.setWidth(CONFIGURATOR.MIN_WIDTH)
        this.areTopDoorsOpen = false
        this.areBottomDoorsOpen = false
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

    getWidth() { return this.width }

    getHeight() { return this.columns[0].height }

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
    
    _prepareColumns()
    {
        let columnWidth = this.width/this.columns.length
        let columnPosition = { x: this.position.x, y: this.position.y, z: this.position.z}
        columnPosition.x -= (columnWidth/2) * (this.columns.length - 1)
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
            this.columns[0].setAsLeftColumn(this.hasSides)
            this.columns[0].switchTopDoorToLeft(false)
            this.columns[0].switchBottomDoorToLeft(false)
            for (let i=1; i<this.columns.length - 1; i++)
            {    
                this.columns[i].setAsMiddleColumn(this.hasSides)
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
        for (let layout of this.family)
        {
            if (inputLayout == layout)
                return true
        }
        return false
    }
}