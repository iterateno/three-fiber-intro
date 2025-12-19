// @ts-nocheck

import * as THREE from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function mergeModel(model) {
  const geometries = [];
  let skeleton = null;
  let boneInverses = null;

  // Collect all geometries and get skeleton from first mesh
  model.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      if (!skeleton) {
        skeleton = child.skeleton;
        boneInverses = child.skeleton.boneInverses;
      }

      const clonedGeo = child.geometry.clone();
      // Don't apply world matrix yet
      geometries.push(clonedGeo);
    }
  });

  if (geometries.length === 0) {
    throw new Error("No skinned meshes found in model");
  }

  if (!skeleton) {
    throw new Error("No skeleton found in model");
  }

  // Merge all geometries into one
  const mergedGeometry = mergeGeometries(geometries);

  // Weld vertices to remove gaps
  const weldedGeometry = mergeVertices(mergedGeometry, 0.05);
  weldedGeometry.computeVertexNormals();

  // Create container first
  const auraModel = new THREE.Group();

  // Clone the bones and add them to the aura model
  const originalBones = [];
  const clonedBones = [];
  const boneMap = new Map();

  // First pass: collect and clone all bones
  model.traverse((child) => {
    if (child.isBone) {
      originalBones.push(child);
      const clonedBone = child.clone(false); // Don't clone children yet
      clonedBones.push(clonedBone);
      boneMap.set(child.uuid, clonedBone);
    }
  });

  // Second pass: rebuild bone hierarchy
  originalBones.forEach((originalBone, index) => {
    const clonedBone = clonedBones[index];
    if (originalBone.parent && originalBone.parent.isBone) {
      const clonedParent = boneMap.get(originalBone.parent.uuid);
      if (clonedParent) {
        clonedParent.add(clonedBone);
      }
    } else {
      // Root bone
      auraModel.add(clonedBone);
    }
  });

  // Create a new skeleton with the cloned bones
  const newSkeleton = new THREE.Skeleton(clonedBones, boneInverses);

  // Create a single skinned mesh with merged geometry
  const auraMesh = new THREE.SkinnedMesh(weldedGeometry);

  // Bind to the new skeleton
  auraMesh.bind(newSkeleton);

  auraModel.add(auraMesh);

  // Copy the entire transform from the original model
  auraModel.position.copy(model.position);
  auraModel.rotation.copy(model.rotation);
  auraModel.scale.copy(model.scale);
  auraModel.updateMatrixWorld(true);

  return auraModel;
}
