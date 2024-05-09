import * as CONFIGURATOR from './Configurator.js'
import { Column } from "./Column.js"

export class Closet
{
    constructor(family, sceneManager, hasInnerWalls = true) 
    { 
        this.columns = []
        this.position = { x: 0, y: 0, z: 0 }
        this.family = family
        this.activeLayout = family[0]
        this.sceneManager = sceneManager
        this.hasInnerWalls = hasInnerWalls
        this.width = CONFIGURATOR.MIN_WIDTH
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
                    this.columns.push(new Column('Column'+this.columns.length, this.activeLayout))
            }
            for (let column of this.columns)
                column.setWidth(columnWidth)

            if (this.columns.length > 1)
            {
                this.columns[0].setRightEdge(this.hasInnerWalls)
                for (let i=1; i<this.columns.length - 1; i++)
                {
                    this.columns[i].setLeftEdge(this.hasInnerWalls)
                    this.columns[i].setRightEdge(this.hasInnerWalls)
                }
                this.columns[this.columns.length - 1].setLeftEdge(this.hasInnerWalls)
            }
            else
            {
                this.columns[0].setLeftEdge(true)
                this.columns[0].setRightEdge(true)
            }

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
        columnPosition.x -= (columnWidth/2) * (this.columns.length - 1)
        for (let column of this.columns)
        {    
            column.stack(columnPosition)
            columnPosition.x += columnWidth
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