// @ts-nocheck

import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { crystal, util } from "./utils/shader";

export const createCrystalMaterial = (originalMaterial, backside) => {
  const uniforms = {
    map: { value: originalMaterial.map },
    color: {
      value: originalMaterial.color?.clone() ?? new THREE.Color(0xffffff),
    },
    opacity: {
      value: originalMaterial.opacity ?? 1.0,
    },
    hasMap: { value: Boolean(originalMaterial.map) },
    backside: { value: backside },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      #include <common>
      #include <uv_pars_vertex>
      #include <skinning_pars_vertex>

      varying vec2 vUv;
      varying vec3 vOriginalPosition;
      varying vec3 vMovingPosition;

      void main() {  
        // Store original position BEFORE skinning
        vOriginalPosition = position;
        
        #include <skinbase_vertex>
        #include <beginnormal_vertex>
        #include <skinnormal_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>

        vMovingPosition = transformed;
      
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        vUv = uv;
      }
    `,
    fragmentShader: `
      ${util}
      ${crystal}

      uniform vec3 color;
      uniform float opacity;
      uniform sampler2D map;
      uniform bool hasMap;
      uniform bool backside;
      varying vec2 vUv;
      varying vec3 vOriginalPosition;
      varying vec3 vMovingPosition;

      void main() {
        vec4 texColor = (hasMap ? texture2D(map, vUv) : vec4(1.0)) * vec4(color, opacity);


        bool blue = texColor.b > 0.5;
        bool yellow = texColor.g > 0.5;
        bool red = texColor.r > 0.5;
        if (blue || yellow || backside){
          vec4 crystal = crystal(vOriginalPosition, vMovingPosition);
          gl_FragColor = yellow ? crystal.bbra * 1.2 : crystal;  
        } else if (red){
          float yellowGradient = (vOriginalPosition.y - 2.65) * 2.5;
          gl_FragColor = vec4(1.0, 0.5 - yellowGradient, 0.0, 1.0);
        } else {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }        
      }
    `,
    transparent: true,
    depthTest: false,

    side: backside ? THREE.BackSide : THREE.FrontSide,
  });
};

export function createCrystalForModel(gltf, backside) {
  const model = gltf.scene;
  const crystalModel = SkeletonUtils.clone(model);
  crystalModel.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      child.material = createCrystalMaterial(child.material, backside);
    }
  });
  return crystalModel;
}

export function createCrystalForModelFrontside(gltf) {
  return createCrystalForModel(gltf, false);
}

export function createCrystalForModelBackside(gltf) {
  return createCrystalForModel(gltf, true);
}
