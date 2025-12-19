import { useAnimations } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { GLTF } from "three-stdlib";
import { ObjectMap } from "@react-three/fiber";

export const handleAnimatedModel =
  (catModel: GLTF & ObjectMap, selectedAnimation: string) =>
  (materialFunc: (catModel: GLTF & ObjectMap) => any) => {
    const cat = useMemo(() => materialFunc(catModel), [catModel]);
    const animations = useAnimations(catModel.animations, cat);
    useEffect(() => {
      const action = animations.actions[selectedAnimation];
      action?.reset().fadeIn(0.5).play();
      return () => {
        action?.fadeOut(0.5);
      };
    }, [selectedAnimation, animations.actions]);
    return cat;
  };
