import { SkeletonUtils } from '../node_modules/three/examples/jsm/Addons.js';
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
export const MAX_WIDTH = 9//3.5
export const MAX_COLUMN_WIDTH = 0.76
export const MIN_DEPTH = 0.4
export const MAX_TWO_PART_COLUMN_HEIGHT = 2.5
export const MIN_TWO_PART_COLUMN_HEIGHT = 1.9
export const MAX_ONE_PART_COLUMN_HEIGHT = 2.1
export const MIN_ONE_PART_COLUMN_HEIGHT = 0.7
export const MAX_SHELF_OFFSET = 0.5
export const ASSET_MAP = new Map()
export const CUBEMAP = 'cubemap'
export const ENVMAP_TEXTURES = ['./assets/cubemap/right.jpg','./assets/cubemap/left.jpg','./assets/cubemap/top.jpg','./assets/cubemap/bottom.jpg','./assets/cubemap/front.jpg','./assets/cubemap/back.jpg']
    
export const COMPONENTS = {
    BOTTOM_CLOSED : {
        name : 'BottomClosed',
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
            body : ['f1L10BottomCabinetBody'],
            wall : ['f1L10BottomCabinetWall'],
            closedSide : ['f1L10BottomCabinetWall'],
            glassSide : [],
            door : ['f1L10BottomCabinetDoor'],// rotation angles L : 180, R : 0
            shelf : ['f1L10Plank'],
            handle : ['f1L10DoorHandle'],
            drawer : ['f1L10Drawer'],
        }
    },
    TOP_CLOSED : {
        name : 'TopClosed',
        width : 0.4,
        height : 1.1,
        depth : 0.4,
        doorValue : { position : { x: 0.17, y: 0.014, z: 0.2 }, handlePosition : { x: -0.32, y: 0.55, z: 0.01 } },
        sideValues : [{ position : { x: -0.199, y: 0.043, z: 0 } }, { position : { x: 0.199, y: 0.043, z: 0 } }],  
        assets : {
            body : ['f1L10TopCabinetBody'],
            wall : ['f1L10TopCabinetWall'],
            closedSide : ['f1L10TopCabinetWall'],
            glassSide : [],
            door : ['f1L10TopCabinetDoor'],// rotation angles L : 180, R : 0
            shelf : ['f1L10Plank'],
            handle : ['f1L10DoorHandle'],
            drawer : []
        }
    }
}

export const LAYOUTS = Object.freeze({
    LAYOUT8: {bottom : [COMPONENTS.BOTTOM_CLOSED], top : [COMPONENTS.TOP_CLOSED], bottomHeight : function() { return 0.3 }},
    LAYOUT10: {bottom : [COMPONENTS.BOTTOM_CLOSED], top : [COMPONENTS.TOP_CLOSED], bottomHeight : function(height) { return (height > 2.2) ? 0.9 : 0.8 }}
})

export const FAMILIES = Object.freeze({
    FAMILY1: {
        layouts : [LAYOUTS.LAYOUT10, LAYOUTS.LAYOUT8],
        top : ['f1Top'],
        topOffset : { x: 0, y: 0, z: -0.02 },
        sideLeg : ['f1SideLeg'],// rotation angles FL : 0, FR : 90, BR : 180, BL : 270
        centerLeg : ['f1CenterLeg'],//['assets/layout10/Handle.glb']
        legHeight : 0.1,
        legOffset : { x: 0.0125, y: 0, z: 0.0125 }
    }
})

/**
 * Top : TopDisplay, TopClosed, TopOpen
 * Bottom : BottomDisplay, BottomClosed, BottomOpen, BottomDresser, BottomCabinetDresser
 */
export const ASSETS = {
    f1L10TopCabinetBody : 'assets/f1/l10/Top_Cabinet.glb', 
    f1L10TopCabinetDoor : 'assets/f1/l10/Top_Door.glb', 
    f1L10TopCabinetWall : 'assets/f1/l10/Top_Side_Glass.glb',
    f1L10BottomCabinetBody : 'assets/f1/l10/Bottom_Cabinet.glb', 
    f1L10BottomCabinetDoor : 'assets/f1/l10/Bottom_Door.glb', 
    f1L10BottomCabinetWall: 'assets/f1/l10/Bottom_Cabinet_Panel.glb',
    f1L10DoorHandle : 'assets/f1/l10/Handle.glb', 
    f1L10Plank : 'assets/f1/l10/Plank.glb',
    f1SideLeg : 'assets/f1/Leg_Left_Front_01.glb', 
    f1CenterLeg : 'assets/f1/Leg_Center.glb',
    f1L10Drawer : 'assets/f1/l8/Drawer_01.glb',
    f1Top : 'assets/f1/Cornecing_01.glb' 
}

export function getAsset(key)
{
    let asset = ASSET_MAP.get(key)
    if (asset != undefined)
    {
        if (asset.isObject3D == undefined && asset.scene.isObject3D)
            return SkeletonUtils.clone(asset.scene)
        return SkeletonUtils.clone(asset)
    } 
}