// @ts-nocheck

import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { mergeModel } from "./utils/material";
import { rainbowGradient, util, voronoi } from "./utils/shader";

export const backgroundColor = 0x2b2b2b;

export const backgroundMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(backgroundColor).convertLinearToSRGB() },
  },
  vertexShader: `
    #include <common>
    #include <skinning_pars_vertex>

    void main() {
      #include <skinbase_vertex>
      #include <beginnormal_vertex>
      #include <skinnormal_vertex>
      #include <begin_vertex>
      #include <skinning_vertex>
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;

    void main() {
      gl_FragColor = vec4(color,1.0);
    }
  `,
  depthTest: false,
  side: THREE.BackSide,
  lights: false,
});
export function createBackgroundForModel(gltf) {
  const model = gltf.scene;
  const backgroundModel = mergeModel(SkeletonUtils.clone(model)); // mergeModel removes gaps during extrusion
  backgroundModel.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      child.material = backgroundMaterial; // clone() + child.geometry.computeVertexNormals() works, but then we can't update uniforms
      child.renderOrder = -1; // Must be added here instead of in the material for some reason
    }
  });
  return backgroundModel;
}
