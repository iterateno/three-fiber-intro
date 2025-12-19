import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { FC, useState } from "react";
import { SceneProps } from "../Scene";
import { auraMaterial, createAuraForModel } from "./shaders/aura";
import {
  backgroundColor,
  createBackgroundForModel,
} from "./shaders/background";
import {
  createCrystalForModelBackside,
  createCrystalForModelFrontside,
} from "./shaders/crystal";
import { createOutlineForModel } from "./shaders/outline";
import { handleAnimatedModel } from "./shaders/utils/object";

const AdvancedScene: FC<SceneProps> = ({ setSceneIndex }) => {
  const Cat = () => {
    const [selectedAnimation, setSelectedAnimation] = useState("Wait");
    const catModel = useGLTF("/Cat2.glb");

    const useAnimatedModel = handleAnimatedModel(catModel, selectedAnimation);

    const cat = useAnimatedModel(createCrystalForModelFrontside);
    const catBackside = useAnimatedModel(createCrystalForModelBackside);
    const catBackground = useAnimatedModel(createBackgroundForModel);
    const catOutline = useAnimatedModel(createOutlineForModel);
    const catAura = useAnimatedModel(createAuraForModel);

    useFrame(({ clock }) => {
      auraMaterial.uniforms.time.value = clock.getElapsedTime() * 0.01;
    });

    return (
      <>
        <primitive object={cat} scale={0.4} position={[0, -0.75, 0]} />
        <primitive object={catBackside} scale={0.4} position={[0, -0.75, 0]} />
        <primitive
          object={catBackground}
          scale={0.4}
          position={[0, -0.75, 0]}
        />
        <primitive object={catOutline} scale={0.4} position={[0, -0.75, 0]} />
        <primitive object={catAura} scale={0.4} position={[0, -0.75, 0]} />
        <Html position={[0, 1.25, 0]} center>
          <select
            style={{
              color: "white",
              border: "none",
              borderBottom: "solid 1px white",
              fontSize: "1.625rem",
              backgroundColor: "transparent",
            }}
            value={selectedAnimation}
            onChange={(e) => setSelectedAnimation(e.target.value)}
          >
            <option value="Wait">Wait</option>
            <option value="Walk">Walk</option>
            <option value="Run">Run</option>
          </select>
        </Html>
      </>
    );
  };

  return (
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: 100,
        position: [-3.5, 0, 5],
      }}
    >
      <directionalLight position={[1, 1, 2]} intensity={6} />
      <ambientLight />
      <OrbitControls />
      <color args={[backgroundColor]} attach="background" />
      <Cat />
      <Html position={[0, 2.0, 0]} center>
        <button onClick={() => setSceneIndex(0)}>
          <p style={{ width: "150px" }}>← Previous scene</p>
        </button>
      </Html>
    </Canvas>
  );
};

export default AdvancedScene;
