export const ASSET_MAP = new Map()

export const MAX_SHELF_OFFSET = 0.5

export const COMPONENTS = {
    BOTTOM_CABINET : {
        name : 'BOTTOM_CABINET',
        width : 0.4,
        height : 0.9,
        depth : 0.4,
        thickness : 0.02,
        standHeight: 0.1,
        assets : {
            body : ['assets/dummy/Bottom_Cabinet_01.glb'],
            leftWall : ['assets/dummy/Bottom_Cabinet_SideWall_Left_01.glb'],
            rightWall : ['assets/dummy/Bottom_Cabinet_SideWall_Right_01.glb'],
            leftDoor : [],//['assets/dummy/Bottom_Door_Left_01.glb'],
            rightDoor : [],//['assets/dummy/Bottom_Door_Right_01.glb'],
            shelf : ['assets/dummy/Bottom_Shelf_01.glb']
        }
    },
    TOP_CABINET : {
        name : 'TOP_CABINET',
        width : 0.4,
        height : 1.5,
        depth : 0.4,
        thickness : 0.02,
        standHeight: 0,
        assets : {
            body : ['assets/dummy/Top_Cabinet_01.glb'],
            leftWall : ['assets/dummy/Top_Cabinet_SideWall_Left_01.glb'],
            rightWall : ['assets/dummy/Top_Cabinet_SideWall_Right_01.glb'],
            leftDoor : [],//['assets/dummy/Top_Door_Left_01.glb'],
            rightDoor : [],//['assets/dummy/Top_Door_Right_01.glb'],
            shelf : ['assets/dummy/Bottom_Shelf_01.glb']
        }
    }
}