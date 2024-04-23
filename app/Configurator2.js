import * as THREE from '../node_modules/three/src/Three.js'
import * as ENGINE from '../engine/Engine.js'
import { Cabinet } from './Configurator.js'

const MATERIALS = {
    WOOD : 'wood',
    GLASS : 'glass',
    METAL : 'metal'
}

export const ASSET_MAP = new Map()

/* export const LAYOUTS = {
    LAYOUT1: {type: '1', bottom : COMPONENTS.BOTTOM_CABINET, top : COMPONENTS.UPPER_GLASS_CABINET,
        getBottomHeight : function(columnHeight) { return (columnHeight > 2.2) ? 0.9 : 0.8 }
    },
    LAYOUT2: {type: '2', bottom : COMPONENTS.BOTTOM_DRAWER, top : COMPONENTS.TOP_DRAWER, getBottomHeight : function() { return 0.3 }}, 
    LAYOUT3: {type: '3', bottom : COMPONENTS.BOTTOM_CABINET, top : COMPONENTS.UPPER_GLASS_CABINET, getBottomHeight : function() { return 0.8 }},
    LAYOUT4: {type: '4', bottom : COMPONENTS.UPPER_GLASS_CABINET, getBottomHeight : function() { return 0 } } 
}

export const FAMILIES = {
    FAMILY1: [LAYOUTS.LAYOUT1, LAYOUTS.LAYOUT2],
    FAMILY2: [LAYOUTS.LAYOUT2, LAYOUTS.LAYOUT3],
    FAMILY3: [LAYOUTS.LAYOUT1, LAYOUTS.LAYOUT4],
} */

export const PIECES = {
    LEFT_DOOR : 'leftDoor',
    RIGHT_DOOR : 'rightDoor',
    SHELF : 'shelf',
    LEFT_WALL : 'leftWall',
    RIGHT_WALL : 'rightWall',
    TOP : 'top',
    BODY : 'body'
}


/* const COMPONENTS = Object.freeze({
    BOTTOM_DRAWER : {materialType: MATERIALS.WOOD, type: 'BottomDrawer', height: 0.3, color: 0xFF0000},
    TOP_DRAWER : {materialType: MATERIALS.WOOD, type: 'TopDrawer', height: 0.1, color: 0x00FF00},
    BOTTOM_CABINET : {materialType: MATERIALS.METAL, type: 'BottomCabinet', height: 0.8, color: 0x0000FF},
    UPPER_GLASS_CABINET : {materialType: MATERIALS.GLASS, type: 'UpperGlassCabinet', height: 1.8, color: 0xFFFFFF}
}) */

export const COMPONENTS = {
    BOTTOM_CABINET : {
        name : 'BOTTOM_CABINET',
        width : 0.9,
        height : 0.9,
        depth : 0.4,
        thickness : 0.025,
        standHeight: 0.1,
        assets : {
            body : ['assets/dummy/Bottom_Cabinet_01.glb'],
            leftWall : ['assets/dummy/Bottom_Cabinet_SideWall_Left_01.glb'],
            rightWall : ['assets/dummy/Bottom_Cabinet_SideWall_Right_01.glb'],
            leftDoor : ['assets/dummy/Bottom_Door_Left_01.glb'],
            rightDoor : ['assets/dummy/Bottom_Door_Right_01.glb'],
            shelf : ['assets/dummy/Bottom_Shelf_01.glb']
        }
    },
    TOP_CABINET : {
        name : 'TOP_CABINET',
        width : 0.9,
        height : 1.5,
        depth : 0.4,
        thickness : 0.025,
        standHeight: 0,
        assets : {
            body : ['assets/dummy/Top_Cabinet_01.glb'],
            leftWall : ['assets/dummy/Top_Cabinet_SideWall_Left_01.glb'],
            rightWall : ['assets/dummy/Top_Cabinet_SideWall_Right_01.glb'],
            leftDoor : ['assets/dummy/Top_Door_Left_01.glb'],
            rightDoor : ['assets/dummy/Top_Door_Right_01.glb'],
            shelf : ['assets/dummy/Bottom_Shelf_01.glb']
        }
    }
}

class Component
{
    constructor(json)
    {
        this.width = json.width
        this.height = json.height
        this.depth = json.depth
        this.thickness = json.thickness
        this.standHeight = json.standHeight
        this.bonesWidth = []
        this.bonesHeight = []
        this.bonesDepth = []
        this.component = new ENGINE.SceneObject(json.name) 
    }

    setWidth(width) 
    { 
        let prevWidth = this.width
        this.width = width
        let delta = this.width - prevWidth
        for (let bone of this.bonesWidth)
            bone.position.x += delta
    }

    setHeight(height) 
    {
        let prevHeight = this.height
        this.height = height
        let delta = this.height - prevHeight
        for (let bone of this.bonesHeight)
            bone.position.y += delta
    }

    setDepth(depth) 
    {
        let prevDepth = this.depth
        this.depth = depth
        let delta = this.depth - prevDepth
        for (let bone of this.bonesDepth)
            bone.position.z -= delta
    }

    setPosition(x, y, z) { this.component.setPosition(x, y, z) }

    getPosition() { return this.component.getPosition() }

    registerInScene(sceneManager)
    {
        if (sceneManager != undefined)
            sceneManager.register(this.component)
    }

    unregisterFromScene(sceneManager)
    {
        if (sceneManager != undefined)
            sceneManager.unregister(this.component.name)
    }

    _attachToComponent(key)
    {
        let object3D = this._extractModel(key)
        if (object3D != undefined)
        {    
            this.component.attachObject3D(object3D)
            this._collectBones(object3D)
        }
        return object3D
    }

    _collectBones(object3D)
    {
        this._traversePieceForBones(object3D, this.bonesWidth, 'Width')
        this._traversePieceForBones(object3D, this.bonesHeight, 'Height')
        this._traversePieceForBones(object3D, this.bonesDepth, 'Depth')
    }

    _traversePieceForBones(object3D, boneArray, name)
    {
        ENGINE.Misc.postOrderTraversal(object3D, mesh => {
            if (mesh != undefined && mesh.isBone && mesh.name.includes(name))
                boneArray.push(mesh)
        })
    }

    _extractModel(key)
    {
        let asset = ASSET_MAP.get(key)
        if (asset != undefined && asset.isObject3D == undefined && asset.scene.isObject3D)
            return asset.scene
        return asset
    }
}

export class BottomCabinet extends Component
{
    constructor() 
    { 
        super(COMPONENTS.BOTTOM_CABINET)
        let json = COMPONENTS.BOTTOM_CABINET
        this.body = this._attachToComponent(json.name + json.assets.body[0])
        this.leftWall = this._attachToComponent(json.name + json.assets.leftWall[0])
        this.rightWall = this._attachToComponent(json.name + json.assets.rightWall[0])
        this.leftDoor = this._attachToComponent(json.name + json.assets.leftDoor[0])
        this.rightDoor = this._attachToComponent(json.name + json.assets.rightDoor[0])
        this.shelf = this._attachToComponent(json.name + json.assets.shelf[0])
        this._repositionPieces()
    }

    openDoors() { this._rotateDoors(135) }

    closeDoors() { this._rotateDoors(0) }

    _repositionPieces()
    {
        if (this.leftDoor != undefined)
            this.leftDoor.position.set(-((this.width/2) - this.thickness), this.standHeight + this.thickness, this.depth/2)
        if (this.rightDoor != undefined)
            this.rightDoor.position.set((this.width/2) - this.thickness, this.standHeight + this.thickness, this.depth/2)
        if (this.leftWall != undefined)
            this.leftWall.position.set(-this.width/2, this.standHeight + this.thickness, 0)
        if (this.rightWall != undefined)
            this.rightWall.position.set(this.width/2, this.standHeight + this.thickness, 0)
        if (this.shelf != undefined)
            this.shelf.position.set(0, ((this.height - this.standHeight)/2) + this.standHeight, 0)
    }

    _rotateDoors(angleInDeg)
    {
        if (this.leftDoor != undefined)
            this.leftDoor.rotation.set(0, ENGINE.Maths.toRadians(-angleInDeg), 0)
        if (this.rightDoor != undefined)
            this.rightDoor.rotation.set(0, ENGINE.Maths.toRadians(angleInDeg), 0) 
    }
}

export class TopCabinet extends Component
{
    constructor() 
    { 
        super(COMPONENTS.TOP_CABINET)
        let json = COMPONENTS.TOP_CABINET
        this.body = this._attachToComponent(json.name + json.assets.body[0])
        this.leftWall = this._attachToComponent(json.name + json.assets.leftWall[0])
        this.rightWall = this._attachToComponent(json.name + json.assets.rightWall[0])
        this.leftDoor = this._attachToComponent(json.name + json.assets.leftDoor[0])
        this.rightDoor = this._attachToComponent(json.name + json.assets.rightDoor[0])
        this.shelf = this._attachToComponent(json.name + json.assets.shelf[0])
        this._repositionPieces()
    }

    _repositionPieces()
    {
        if (this.leftDoor != undefined)
            this.leftDoor.position.set(-(this.width/2) + this.thickness, this.standHeight + this.thickness, this.depth/2)
        if (this.rightDoor != undefined)
            this.rightDoor.position.set((this.width/2) - this.thickness, this.standHeight + this.thickness, this.depth/2)
        if (this.leftWall != undefined)
            this.leftWall.position.set(-this.width/2, this.standHeight + this.thickness, 0)
        if (this.rightWall != undefined)
            this.rightWall.position.set(this.width/2, this.standHeight + this.thickness, 0)
        if (this.shelf != undefined)
            this.shelf.position.set(0, ((this.height - this.standHeight)/2) + this.standHeight, 0)
    }
}