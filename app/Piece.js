import * as FRAMEWORK from '../framework/Framework.js'

export class Piece
{
    constructor(object3D)
    {
        this.object3D = object3D
        this.bonesWidth = []
        this.bonesHeight = []
        this.bonesDepth = []
        this._collectBones()
    }

    setPosition(x, y, z) { this.object3D.position.set(x, y, z) }

    getPosition() { return this.object3D.getPosition() }

    offset(x, y, z)
    {
        let position = this.object3D.position
        position.x += x
        position.y += y
        position.z += z
        this.setPosition(position.x, position.y, position.z)
    }

    setRotation(x, y, z) { this.object3D.rotation.set(FRAMEWORK.Maths.toRadians(x), FRAMEWORK.Maths.toRadians(y), FRAMEWORK.Maths.toRadians(z)) }

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

    attach(piece)
    {
        if (piece != undefined)
        {
            piece.object3D.parent = this.object3D
            this.object3D.children.push(piece.object3D)
        }
    }

    detach(piece)
    {
        if (piece != undefined)
        {
            let i = this.object3D.children.indexOf(piece.object3D)
            if (i > -1)    
            {    
                this.object3D.children.splice(i, 1)
                piece.object3D.parent = null
            }
        }
    }

    _collectBones()
    {
        this._traversePieceForBones(this.object3D, this.bonesWidth, 'Width')
        this._traversePieceForBones(this.object3D, this.bonesHeight, 'Height')
        this._traversePieceForBones(this.object3D, this.bonesDepth, 'Depth')
    }

    _traversePieceForBones(object3D, boneArray, name)
    {
        FRAMEWORK.Misc.postOrderTraversal(object3D, mesh => {
            if (mesh != undefined && mesh.isBone && mesh.name.includes(name))
                boneArray.push(mesh)
        })
    }
}