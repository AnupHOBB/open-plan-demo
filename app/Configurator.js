/////////////TO BE REMOVED/////////////
export {Component} from './Component.js'
export {Column} from './Column.js'
///////////////////////////////////////


export {Closet} from './Closet.js'
/**
 * Minimum width of a column is 40cm and maximum is 76cm.
 * If the cabinet width exceeds 76cm then another column such that the width of each column will be equal to the total width of cabinet divided by number of columns
 * 
 * Cabinet cannot have more than 5 columns
 */
export const MIN_WIDTH = 0.4
export const MAX_WIDTH = 3.5
export const MAX_COLUMN_WIDTH = 0.76
export const MAX_TWO_PART_COLUMN_HEIGHT = 2.5
export const MIN_TWO_PART_COLUMN_HEIGHT = 1.9
export const MAX_ONE_PART_COLUMN_HEIGHT = 2.1
export const MIN_ONE_PART_COLUMN_HEIGHT = 0.7
export const DEPTH = 0.4
export const MAX_SHELF_OFFSET = 0.5
export const ASSET_MAP = new Map()
export const CUBEMAP = 'cubemap'
export const ENVMAP_TEXTURES = ['./assets/cubemap/right.jpg','./assets/cubemap/left.jpg','./assets/cubemap/top.jpg','./assets/cubemap/bottom.jpg','./assets/cubemap/front.jpg','./assets/cubemap/back.jpg']
    
export const COMPONENTS = {
    BOTTOM_CABINET : {
        name : 'BOTTOM_CABINET',
        width : 0.4,
        height : 0.8,
        depth : 0.4,
        shelfCount : 1,
        drawerValues : [
            { position : { x: 0, y: 0.04, z: 0.025 }, handlePosition : { x: 0, y: 0.05, z: 0.17 } },
            { position : { x: 0, y: 0.12, z: 0.025 }, handlePosition : { x: 0, y: 0.05, z: 0.17 } },
            { position : { x: 0, y: 0.2, z: 0.025 }, handlePosition : { x: 0, y: 0.05, z: 0.17 } }
        ],
        doorValue : { position : { x: 0.17, y: 0.04, z: 0.2 }, handlePosition : { x: -0.32, y: 0.45, z: 0.01 } },
        sideValues : [{ position : { x: -0.19, y: 0.04, z: 0 } }, { position : { x: 0.19, y: 0.04, z: 0 } }],    
        assets : {
            body : ['assets/layout10/Bottom_Cabinet.glb'],
            wall : ['assets/layout10/Bottom_Cabinet_Panel.glb'],
            closedSide : ['assets/layout10/Bottom_Cabinet_Panel.glb'],//['assets/layout10/Bottom_Door.glb'],
            glassSide : [],//['assets/layout10/Bottom_Door.glb'],
            door : ['assets/layout10/Bottom_Door.glb'],// rotation angles L : 180, R : 0
            shelf : ['assets/layout10/Plank.glb'],
            handle : ['assets/layout10/Handle.glb'],
            drawer : ['assets/layout8/Drawer_01.glb'],
        }
    },
    TOP_CABINET : {
        name : 'TOP_CABINET',
        width : 0.4,
        height : 1.1,
        depth : 0.4,
        doorValue : { position : { x: 0.17, y: 0.014, z: 0.2 }, handlePosition : { x: -0.32, y: 0.55, z: 0.01 } },
        sideValues : [{ position : { x: -0.199, y: 0.043, z: 0 } }, { position : { x: 0.199, y: 0.043, z: 0 } }],  
        assets : {
            body : ['assets/layout10/Top_Cabinet.glb'],
            wall : ['assets/layout10/Top_Side_Glass.glb'],
            closedSide : ['assets/layout10/Top_Side_Glass.glb'],//['assets/layout10/Bottom_Door.glb'],
            glassSide : [],//['assets/layout10/Bottom_Door.glb'],
            door : ['assets/layout10/Top_Door.glb'],// rotation angles L : 180, R : 0
            shelf : ['assets/layout10/Plank.glb'],
            handle : ['assets/layout10/Handle.glb'],
            drawer : []
        }
    }
}

export const LAYOUTS = Object.freeze({
    LAYOUT8: {bottom : [COMPONENTS.BOTTOM_CABINET], top : [COMPONENTS.TOP_CABINET], bottomHeight : function() { return 0.3 }},
    LAYOUT10: {bottom : [COMPONENTS.BOTTOM_CABINET], top : [COMPONENTS.TOP_CABINET], bottomHeight : function(height) { return (height > 2.2) ? 0.9 : 0.8 }}
})

export const FAMILIES = Object.freeze({
    FAMILY1: [LAYOUTS.LAYOUT10, LAYOUTS.LAYOUT8]
})

const LEGS = {
    sideLeg : ['assets/layout10/Leg_Left_Front_01.glb'],// rotation angles FL : 0, FR : 90, BR : 180, BL : 270
    centerLeg : []//['assets/layout10/Handle.glb']
}