import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Render logic used for merging the rgb values of two textures by multiplication
 */
const MergerShader =
{
    vertexShader: `
        varying vec2 vUv;
        void main()
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D texture1, texture2;
        uniform bool merge;
        uniform bool showTexture2;
        varying vec2 vUv;

        void main() 
        {
            if (showTexture2)
                gl_FragColor = texture2D(texture2, vUv);
            else if (merge)
                gl_FragColor = texture2D(texture1, vUv) * texture2D(texture2, vUv);
            else
                gl_FragColor = texture2D(texture1, vUv);
        }
    `
}

/**
 * Render pass which consists of pixel merging logic
 */
export class MergerPass extends ShaderPass
{
    /**
     * @param {THREE.Texture} texture1 texture that is to be merged with texture2
     * @param {THREE.Texture} texture2 texture that is to be merged with texture1. If this is null then the pass will use its frame buffer color attachment
     * @param {Boolean} showTexture2 if true then only texture2 will be displayed
     */
    constructor(texture1, texture2, showTexture2)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            {
                texture1: { value: texture1 },
                texture2: { value: texture2 },
                merge: { value: (texture2 != undefined) ? true : false },
                showTexture2 : { value: (showTexture2 != undefined && merge) ? showTexture2 : false }
            },
            vertexShader : MergerShader.vertexShader,
            fragmentShader : MergerShader.fragmentShader,
        }), (texture1 != undefined) ? undefined : 'texture1')
    }

    updateTexture1(texture1) 
    { 
        this.material.uniforms.texture1.value = texture1
        this.textureID = (texture1 != undefined) ? undefined : 'texture1'
    }

    updateTexture2(texture2) 
    { 
        this.material.uniforms.texture2.value = texture2
        this.material.uniforms.merge.value = (texture2 != undefined) && !(this.material.uniforms.showTexture2.value)
    }

    showTexture2Only(show) { this.material.uniforms.showTexture2.value = show }
}