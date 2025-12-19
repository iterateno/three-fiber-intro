import {
  Box,
  Html,
  OrbitControls,
  Plane,
  Sphere,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas, MeshProps } from "@react-three/fiber";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import AdvancedScene from "./advanced/AdvancedScene";

const Cat: FC<MeshProps> = ({ scale, position }) => {
  const [selectedAnimation, setSelectedAnimation] = useState("Wait");
  const cat = useGLTF("/Cat.glb");
  const animations = useAnimations(cat.animations, cat.scene);

  useEffect(() => {
    const action = animations.actions[selectedAnimation];
    action?.reset().fadeIn(0.5).play();
    return () => {
      action?.fadeOut(0.5);
    };
  }, [selectedAnimation]);

  return (
    <>
      <primitive object={cat.scene} scale={scale} position={position} />
      <Html position={[0, 1.6, 0]} center>
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

export type SceneProps = {
  setSceneIndex: Dispatch<SetStateAction<number>>;
};

const Scene: FC<SceneProps> = ({ setSceneIndex }) => (
  <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
    <color args={["#0c1e28"]} attach="background" />
    <directionalLight position={[1, 1, 2]} intensity={6} />
    <ambientLight intensity={0.5} />
    <OrbitControls enableDamping dampingFactor={0.05} />

    <Plane scale={10} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial color="lightGrey" />
    </Plane>

    <Box position={[2, 0.5, -1]}>
      <meshStandardMaterial color="red" />
    </Box>

    <Sphere scale={0.5} position={[-2, 0.5, -1]}>
      <meshStandardMaterial color="blue" />
    </Sphere>

    <Cat scale={0.4} position={[0, 0, 0.5]} />

    <Html position={[0, 3.0, 0]} center>
      <button onClick={() => setSceneIndex(1)}>
        <p style={{ width: "100px" }}>Next scene →</p>
      </button>
    </Html>
  </Canvas>
);

const SelectedScene = () => {
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  if (sceneIndex === 0) {
    return <Scene setSceneIndex={setSceneIndex} />;
  } else {
    return <AdvancedScene setSceneIndex={setSceneIndex} />;
  }
};

export default SelectedScene;
