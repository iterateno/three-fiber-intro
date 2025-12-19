// @ts-nocheck

import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { mergeModel } from "./utils/material";

export const outlineMaterial = new THREE.ShaderMaterial({
  uniforms: {
    extrusionAmount: { value: 0.02 },
  },
  vertexShader: `
    #include <common>
    #include <skinning_pars_vertex>
  
    uniform float extrusionAmount;

    void main() {
      #include <skinbase_vertex>
      #include <beginnormal_vertex>
      #include <skinnormal_vertex>
      #include <begin_vertex>
      #include <skinning_vertex>
      
      // Extrude along the skinned normal
      vec3 extrudedPosition = transformed + objectNormal * extrusionAmount;
      vec4 mvPosition = modelViewMatrix * vec4(extrudedPosition, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(0,0,0,1);
    }
  `,
  depthTest: false,
  side: THREE.BackSide,
});
export function createOutlineForModel(gltf) {
  const model = gltf.scene;
  const outlineModel = mergeModel(SkeletonUtils.clone(model)); // mergeModel removes gaps during extrusion
  outlineModel.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      child.material = outlineMaterial; // clone() + child.geometry.computeVertexNormals() works, but then we can't update uniforms
      child.renderOrder = -2; // Must be added here instead of in the material for some reason
    }
  });
  return outlineModel;
}
