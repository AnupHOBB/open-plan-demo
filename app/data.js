export const ASSET_MAP = new Map()

export const MAX_SHELF_OFFSET = 0.5

export const COMPONENTS = {
    BOTTOM_CABINET : {
        name : 'BOTTOM_CABINET',
        width : 0.4,
        height : 0.9,
        depth : 0.4,
        legHeight: 0.1,
        doorOffset : { x: 0.17, y: 0.14, z: 0.2 },
        wallOffset : { x: 0.19, y: 0.14, z: 0 },
        handleOffset : { x: -0.32, y: 0.45, z: 0 },
        standOffset : { x: 0.189, y: 0, z: 0.19 },
        assets : {
            body : ['assets/layout10/Bottom_Cabinet.glb'],
            wall : ['assets/layout10/Bottom_Cabinet_Panel.glb'],
            door : ['assets/layout10/Bottom_Door.glb'],// rotation angles L : 180, R : 0
            shelf : ['assets/layout10/Plank.glb'],
            handle : ['assets/layout10/Handle.glb'],
            sideleg : ['assets/layout10/Leg_Left_Front_01.glb'],// rotation angles FL : 0, FR : 90, BR : 180, BL : 270
            centerLeg : []
        }
    },
    TOP_CABINET : {
        name : 'TOP_CABINET',
        width : 0.4,
        height : 1.1,
        depth : 0.4,
        legHeight: 0,
        doorOffset : { x: 0.17, y: 0.014, z: 0.2 },
        wallOffset : { x: 0.199, y: 0.043, z: 0 },
        handleOffset : { x: -0.32, y: 0.55, z: 0 },
        standOffset : { x: 0, y: 0, z: 0 },
        assets : {
            body : ['assets/layout10/Top_Cabinet.glb'],
            wall : ['assets/layout10/Top_Side_Glass.glb'],
            door : ['assets/layout10/Top_Door.glb'],// rotation angles L : 180, R : 0
            shelf : ['assets/layout10/Plank.glb'],
            handle : ['assets/layout10/Handle.glb'],
            sideleg : [],// rotation angles FL : 0, FR : 90, BR : 180, BL : 270
            centerLeg : []
        }
    }
}