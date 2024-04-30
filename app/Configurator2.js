import * as ENGINE from '../framework/Framework.js'

export const ASSET_MAP = new Map()

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
        width : 0.4,
        height : 1.5,
        depth : 0.4,
        thickness : 0.02,//0.025,
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

class Piece
{
    constructor(mesh)
    {
        this.mesh = mesh
        this.bonesWidth = []
        this.bonesHeight = []
        this.bonesDepth = []
        this._collectBones(mesh)
    }

    setPosition(x, y, z) { this.mesh.position.set(x, y, z) }

    getPosition() { return this.mesh.getPosition() }

    offset(x, y, z)
    {
        let position = this.mesh.position
        position.x += x
        position.y += y
        position.z += z
        this.setPosition(position.x, position.y, position.z)
    }

    setRotation(x, y, z) { this.mesh.rotation.set(x, y, z) }

    moveWidthBones(delta) 
    { 
        for (let bone of this.bonesWidth)
            bone.position.x += delta
    }

    moveHeightBones(delta) 
    {
        for (let bone of this.bonesHeight)
            bone.position.y += delta
    }

    moveDepthBones(delta) 
    {
        for (let bone of this.bonesDepth)
            bone.position.z -= delta
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
        this.component = new ENGINE.SceneObject(json.name) 
    }

    setPosition(x, y, z) { this.component.setPosition(x, y, z) }

    getPosition() { return this.component.getPosition() }

    offset(x, y, z)
    {
        let position = this.getPosition()
        position.x += x
        position.y += y
        position.z += z
        this.setPosition(position.x, position.y, position.z)
    }

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
            return new Piece(object3D)
        }
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

    setWidth(width) 
    { 
        let prevWidth = this.width
        this.width = width
        let delta = this.width - prevWidth
        if (this.body != undefined)
            this.body.moveWidthBones(delta)
        if (this.leftDoor != undefined)
            this.leftDoor.moveWidthBones(delta/2)
        if (this.rightDoor != undefined)
        {    
            this.rightDoor.moveWidthBones(-delta/2)
            this.rightDoor.offset(delta, 0, 0)
        }
        if (this.rightWall != undefined)
            this.rightWall.offset(delta, 0, 0)
        if (this.shelf != undefined)
            this.shelf.moveWidthBones(delta)
        this.offset(-delta/2, 0, 0)
    }

    setHeight(height) 
    {
        let prevHeight = this.height
        this.height = height
        let delta = this.height - prevHeight
        if (this.body != undefined)
            this.body.moveHeightBones(delta)
        if (this.leftDoor != undefined)
            this.leftDoor.moveHeightBones(delta)
        if (this.rightDoor != undefined)
            this.rightDoor.moveHeightBones(delta)
        if (this.leftWall != undefined)
            this.leftWall.moveHeightBones(delta)
        if (this.rightWall != undefined)
            this.rightWall.moveHeightBones(delta)
    }

    setDepth(depth) 
    {
        let prevDepth = this.depth
        this.depth = depth
        let delta = this.depth - prevDepth
        if (this.body != undefined)
            this.body.moveDepthBones(delta)
        if (this.leftWall != undefined)
            this.leftWall.moveDepthBones(delta)
        if (this.rightWall != undefined)
            this.rightWall.moveDepthBones(delta)
        if (this.shelf != undefined)
            this.shelf.moveDepthBones(delta)
        this.offset(0, 0, delta/2)
    }

    openDoors() { this._rotateDoors(135) }

    closeDoors() { this._rotateDoors(0) }

    _repositionPieces()
    {
        if (this.leftDoor != undefined)
            this.leftDoor.setPosition(-((this.width/2) - this.thickness), this.standHeight + this.thickness, this.depth/2)
        if (this.rightDoor != undefined)
            this.rightDoor.setPosition((this.width/2) - this.thickness, this.standHeight + this.thickness, this.depth/2)
        if (this.leftWall != undefined)
            this.leftWall.setPosition(-this.width/2, this.standHeight + this.thickness, 0)
        if (this.rightWall != undefined)
            this.rightWall.setPosition(this.width/2, this.standHeight + this.thickness, 0)
        if (this.shelf != undefined)
            this.shelf.setPosition(0, ((this.height - this.standHeight)/2) + this.standHeight, 0)
    }

    _rotateDoors(angleInDeg)
    {
        if (this.leftDoor != undefined)
            this.leftDoor.setRotation(0, ENGINE.Maths.toRadians(-angleInDeg), 0)
        if (this.rightDoor != undefined)
            this.rightDoor.setRotation(0, ENGINE.Maths.toRadians(angleInDeg), 0) 
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

    setWidth(width) 
    { 
        let prevWidth = this.width
        this.width = width
        let delta = this.width - prevWidth
        if (this.body != undefined)
            this.body.moveWidthBones(delta)
        if (this.leftDoor != undefined)
            this.leftDoor.moveWidthBones(delta/2)
        if (this.rightDoor != undefined)
        {    
            this.rightDoor.moveWidthBones(-delta/2)
            this.rightDoor.offset(delta, 0, 0)
        }
        if (this.rightWall != undefined)
            this.rightWall.offset(delta, 0, 0)
        if (this.shelf != undefined)
            this.shelf.moveWidthBones(delta)
        this.offset(-delta/2, 0, 0)
    }

    setHeight(height) 
    {
        let prevHeight = this.height
        this.height = height
        let delta = this.height - prevHeight
        if (this.body != undefined)
            this.body.moveHeightBones(delta)
        if (this.leftDoor != undefined)
            this.leftDoor.moveHeightBones(delta)
        if (this.rightDoor != undefined)
            this.rightDoor.moveHeightBones(delta)
        if (this.leftWall != undefined)
            this.leftWall.moveHeightBones(delta)
        if (this.rightWall != undefined)
            this.rightWall.moveHeightBones(delta)
    }

    setDepth(depth) 
    {
        let prevDepth = this.depth
        this.depth = depth
        let delta = this.depth - prevDepth
        if (this.body != undefined)
            this.body.moveDepthBones(delta)
        if (this.leftWall != undefined)
            this.leftWall.moveDepthBones(delta)
        if (this.rightWall != undefined)
            this.rightWall.moveDepthBones(delta)
        if (this.shelf != undefined)
            this.shelf.moveDepthBones(delta)
        this.offset( 0, 0, delta/2)
    }

    _repositionPieces()
    {
        if (this.leftDoor != undefined)
            this.leftDoor.setPosition(-((this.width/2) - this.thickness), this.standHeight + this.thickness, this.depth/2)
        if (this.rightDoor != undefined)
            this.rightDoor.setPosition((this.width/2) - this.thickness, this.standHeight + this.thickness, this.depth/2)
        if (this.leftWall != undefined)
            this.leftWall.setPosition(-this.width/2, this.standHeight + this.thickness, 0)
        if (this.rightWall != undefined)
            this.rightWall.setPosition(this.width/2, this.standHeight + this.thickness, 0)
        if (this.shelf != undefined)
            this.shelf.setPosition(0, ((this.height - this.standHeight)/2) + this.standHeight, 0)
    }
}