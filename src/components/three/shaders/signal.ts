export const signalVertex = /* glsl */ `
varying vec2 vPath;
void main(){ vPath=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
`;
export const signalFragment = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uActive;
uniform vec3 uColor;
varying vec2 vPath;
void main(){
 float travel=fract(vPath.x-uTime*uSpeed);
 float pulse=smoothstep(.76,.95,travel)*(1.-smoothstep(.95,1.,travel));
 float edge=.55+.45*sin(vPath.y*3.14159265);
 vec3 light=uColor*(.35+pulse*(1.+uActive));
 gl_FragColor=vec4(light,(.17+pulse*.75+uActive*.13)*edge);
}
`;
