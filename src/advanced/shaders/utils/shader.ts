export const util = `
  float lerp(float a, float b, float t) {
    return a + t * (b - a);
  }
  vec3 lerp(vec3 a, vec3 b, float t) {
    return a + t * (b - a);
  }
  vec4 lerp(vec4 a, vec4 b, float t) {
    return a + t * (b - a);
  }
  vec4 quadLerp(vec4 a, vec4 b, vec4 c, float t) {
    vec4 ab = lerp(a, b, t);
    vec4 bc = lerp(b, c, t);
    return lerp(ab, bc, t);
  }  
  float hash11(float p) {
    p = fract(p * 0.1031);
    p += dot(p, p + 33.33);
    return fract(p * p);
  }
  vec3 hash31(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xxy + p3.yzz) * p3.zyx);
  }
  vec4 hash41(float p) {
    vec4 p4 = fract(vec4(p) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
  }
  vec4 greyscale(vec4 color) {
    float c = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    return vec4(c,c,c, color.a);
  }
  float bias0(float x, float power) {
    return pow(x, power);
  }
  float biasCenter(float x, float amount) {
    x = x * 2.0 - 1.0;  // remap to -1..1
    x = sign(x) * pow(abs(x), amount);
    return x * 0.5 + 0.5;  // remap back to 0..1
  }
  float bias1(float x, float power) {
      return 1.0 - pow(1.0 - x, power);
  }
`;

export const voronoi = `
  vec2 voronoiHash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  
  // Returns a greyscale value unique to each Voronoi cell
  float voronoi(vec2 uv, float scale, float time) {
    vec2 i = floor(uv * scale);
    vec2 f = fract(uv * scale);

    float minDist = 1.0;
    vec2 cellID = vec2(0.0);
    vec2 cellOffset = vec2(0.0);

    for(int y = -1; y <= 1; y++) {
      for(int x = -1; x <= 1; x++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = voronoiHash(i + neighbor);
        
        // Only move the positions of the cell centers over time (animation),
        // do not change their color "id"
        point += 0.5 * sin(time * 0.5 + point * 6.2831);
        
        vec2 diff = neighbor + point - f;
        float dist = length(diff);

        // Save the nearest cell if closer
        if(dist < minDist) {
          minDist = dist;
          cellID = i + neighbor;
          cellOffset = voronoiHash(i + neighbor); // Use un-moved point for color/id!
        }
      }
    }

    // Use the static (un-moved) cell center for color/id, so color does not animate
    float cellValue = fract(sin(dot(cellID + cellOffset, vec2(41.0, 289.0))) * 83758.5453);
    return cellValue;
  }
    
  float voronoi(vec2 uv, float scale) {
    return voronoi(uv, scale, 0.0);
  }
`;

export const voronoi3D = `
  vec3 voronoi3DHash(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return fract(sin(p) * 43758.5453);
  }
  
  // Returns a greyscale value unique to each Voronoi3D cell in 3D
  float voronoi3D(vec3 uvw, float scale, float time) {
    vec3 i = floor(uvw * scale);
    vec3 f = fract(uvw * scale);

    float minDist = 1.0;
    vec3 cellID = vec3(0.0);
    vec3 cellOffset = vec3(0.0);

    for(int z = -1; z <= 1; z++) {
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec3 neighbor = vec3(float(x), float(y), float(z));
          vec3 point = voronoi3DHash(i + neighbor);
          
          point += 0.5 * sin(time * 0.5 + point * 6.2831);
          
          vec3 diff = neighbor + point - f;
          float dist = length(diff);

          if(dist < minDist) {
            minDist = dist;
            cellID = i + neighbor;
            cellOffset = voronoi3DHash(i + neighbor);
          }
        }
      }
    }

    float cellValue = fract(sin(dot(cellID + cellOffset, vec3(41.0, 289.0, 197.0))) * 83758.5453);
    return cellValue;
  }
  
  // Returns vec2(cellValue, edgeDistance) for outlining
  vec2 voronoi3DWithEdges(vec3 uvw, float scale, float time) {
    vec3 i = floor(uvw * scale);
    vec3 f = fract(uvw * scale);

    float minDist = 1.0;
    float secondMinDist = 1.0;
    vec3 cellID = vec3(0.0);
    vec3 cellOffset = vec3(0.0);

    for(int z = -1; z <= 1; z++) {
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec3 neighbor = vec3(float(x), float(y), float(z));
          vec3 point = voronoi3DHash(i + neighbor);
          
          point += 0.5 * sin(time * 0.5 + point * 6.2831);
          
          vec3 diff = neighbor + point - f;
          float dist = length(diff);

          if(dist < minDist) {
            secondMinDist = minDist;
            minDist = dist;
            cellID = i + neighbor;
            cellOffset = voronoi3DHash(i + neighbor);
          } else if(dist < secondMinDist) {
            secondMinDist = dist;
          }
        }
      }
    }

    float cellValue = fract(sin(dot(cellID + cellOffset, vec3(41.0, 289.0, 197.0))) * 83758.5453);
    float edgeDistance = secondMinDist - minDist;
    
    return vec2(cellValue, edgeDistance);
  }
    
  float voronoi3D(vec3 uvw, float scale) {
    return voronoi3D(uvw, scale, 0.0);
  }
  
  vec2 voronoi3DWithEdges(vec3 uvw, float scale) {
    return voronoi3DWithEdges(uvw, scale, 0.0);
  }
`;

export const rainbowGradient = `
vec4 rainbowGradient(vec2 uv) {
  float angle = (uv.x - uv.y) * 0.75;
  float r = 0.5 + 0.5 * sin(6.2831 * angle + 0.0);
  float g = 0.5 + 0.5 * sin(6.2831 * angle + 2.0944);
  float b = 0.5 + 0.5 * sin(6.2831 * angle + 4.1888);
  return vec4(r, g, b, 1.0);
}
`;

export const crystal = `
${voronoi3D}
  vec4 crystal(vec3 pos, vec3 movingPos) {
    vec2 vor = voronoi3DWithEdges(pos * 0.13, 30.0);
    if (vor.y < 0.02){
      return vec4(0.0, 0.0, 0.0, 0.1);
    }


    float v = lerp(0.75, 1.0, vor.x);
    float diff = length(pos - movingPos) * 5.0;
    float rng = (hash11((v + 1.0) * 1000.0) - 0.5);
    float bias = pow(10.0, rng * diff);
    vec3 v3 = hash31(v * 1000.0);
    float greenness = biasCenter(v3.x, bias);
    float redness = biasCenter(v3.y, bias);
    float saturation = biasCenter(v3.z, bias);

    vec4 x = vec4(0.0, 0.8 * greenness, 1.0, 1.0);

    vec4 red = vec4(1.0, 0.0, 0.0, 1.0);
    vec4 y = lerp(red, x, bias1(redness, 30.0));

    vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 z1 = lerp(black, y, bias0(saturation, 1.2));
    vec4 z = lerp(z1, white, bias0(saturation, 30.0));

    return vec4(z.rgb, 0.5);
  }
`;
