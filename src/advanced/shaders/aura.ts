// @ts-nocheck

import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { mergeModel } from "./utils/material";
import { rainbowGradient, util, voronoi } from "./utils/shader";

export const auraMaterial = new THREE.ShaderMaterial({
  uniforms: {
    extrusionAmount: { value: 0.075 },
    color: { value: new THREE.Color(0xff8888) },
    opacity: { value: 0.5 },
    time: { value: 0.0 },
  },
  vertexShader: `
    #include <common>
    #include <skinning_pars_vertex>
  
    uniform float extrusionAmount;
    varying vec2 screen;

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

      // Pass normalized screen coordinates (-1 to 1) to fragment shader
      float factor = 5.0; // gl_Position.w if you want it to be affected by the camera distance
      screen = vec2(gl_Position.x / factor, gl_Position.y / factor);
    }
  `,
  fragmentShader: `
    ${util}
    ${voronoi}
    ${rainbowGradient}

    uniform vec3 color;
    uniform float opacity;
    uniform float time;
    varying vec2 screen;

    void main() {
      vec4 rainbow = rainbowGradient(screen);
      float v = lerp(0.75, 1.0, voronoi(screen, 30.0, time * 100.0));
      gl_FragColor = rainbow * v;
    }
  `,
  depthTest: false,
  side: THREE.BackSide,
});
export function createAuraForModel(gltf) {
  const model = gltf.scene;
  const auraModel = mergeModel(SkeletonUtils.clone(model)); // mergeModel removes gaps during extrusion
  auraModel.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      child.material = auraMaterial; // clone() + child.geometry.computeVertexNormals() works, but then we can't update uniforms
      child.renderOrder = -3; // Must be added here instead of in the material for some reason
    }
  });
  return auraModel;
}
