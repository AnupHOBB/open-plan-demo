import * as THREE from '../../../node_modules/three/src/Three.js'
import { ShaderPass } from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * Shader that adds the pixel values between two textures
 */
const AdderShader = 
{
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() 
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: /* glsl */`
        uniform sampler2D texture1, texture2;
        uniform float scalar1, scalar2;
        varying vec2 vUv;
        void main() 
        {
            gl_FragColor = texture2D(texture1, vUv) * scalar1 + texture2D(texture2, vUv) * scalar2;
        }
    `
}

/**
 * Pass that encapsulates the PixelAdderShader
 */
export class AdderPass extends ShaderPass
{
    /**
     * @param {THREE.Texture} targetTexture texture whose pixel value is to be added with the texture of this pass
     */
    constructor(scalar1, scalar2, texture1, texture2)
    {
        super(new THREE.ShaderMaterial({
            uniforms: 
            {
                texture1: { value: texture1 },
                texture2: { value: texture2 },
                scalar1: { value: (texture2 == undefined) ? 1 : scalar1 },
                scalar2: { value: (texture2 != undefined && scalar2 == undefined) ? (1 - this.uniforms.scalar1.value) : scalar2 }
            },
            vertexShader : AdderShader.vertexShader,
            fragmentShader : AdderShader.fragmentShader,
        }), (texture1 != undefined) ? undefined : 'texture1')
    }

    updateTexture1(texture1) 
    { 
        this.material.uniforms.texture1.value = texture1
        this.textureID = (texture1 != undefined) ? undefined : 'texture1'
    }

    updateTexture2(texture2) { this.material.uniforms.texture2.value = texture2 }

    updateScalar1(value) { this.material.uniforms.scalar1.value = value }

    updateScalar2(value) { this.material.uniforms.scalar2.value = value }
}