import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
const folder = new URL("../../public/models/", import.meta.url);
const files = readdirSync(folder).filter((name) => name.endsWith(".glb"));
const required = [
  "portrait-card.glb",
  "project-module.glb",
  "scroll-runner.glb",
  "system-core.glb",
  "symbol-api.glb",
  "symbol-architecture.glb",
  "symbol-backend.glb",
  "symbol-cloud.glb",
  "symbol-code.glb",
  "symbol-creative.glb",
  "symbol-database.glb",
  "symbol-deployment.glb",
  "symbol-frontend.glb",
  "symbol-infrastructure.glb",
  "symbol-performance.glb",
  "symbol-ui.glb",
  "tech-aws.glb",
  "tech-bun.glb",
  "tech-css.glb",
  "tech-docker.glb",
  "tech-express.glb",
  "tech-figma.glb",
  "tech-github.glb",
  "tech-javascript.glb",
  "tech-mongodb.glb",
  "tech-nestjs.glb",
  "tech-nextjs.glb",
  "tech-nodejs.glb",
  "tech-postgresql.glb",
  "tech-prisma.glb",
  "tech-react.glb",
  "tech-redux.glb",
  "tech-supabase.glb",
  "tech-tailwindcss.glb",
  "tech-typescript.glb",
  "tech-vercel.glb",
  "tech-visualstudio.glb",
];
assert.deepEqual(files.toSorted(), required.toSorted());
const signatures = new Set();
let total = 0;
for (const name of files) {
  const data = readFileSync(new URL(name, folder));
  total += data.length;
  assert.equal(data.readUInt32LE(0), 0x46546c67);
  assert.equal(data.readUInt32LE(4), 2);
  assert.equal(data.readUInt32LE(8), data.length);
  const length = data.readUInt32LE(12),
    json = JSON.parse(data.subarray(20, 20 + length).toString());
  assert.ok(json.meshes.length > 0);
  assert.ok(json.materials.length <= 6);
  assert.ok(
    !json.images?.length,
    "Textures belong to live projects, not baked into the assets",
  );
  assert.ok(data.length < 130000, `${name} exceeds asset budget`);
  const binaryOffset = 28 + length;
  for (const mesh of json.meshes)
    for (const primitive of mesh.primitives) {
      const accessor = json.accessors[primitive.attributes.POSITION];
      assert.equal(accessor.componentType, 5126);
      assert.ok(accessor.count > 0);
      const view = json.bufferViews[accessor.bufferView],
        stride = view.byteStride || 12;
      for (let i = 0; i < accessor.count; i++)
        for (let j = 0; j < 3; j++) {
          const value = data.readFloatLE(
            binaryOffset +
              (view.byteOffset || 0) +
              (accessor.byteOffset || 0) +
              i * stride +
              j * 4,
          );
          assert.ok(
            Number.isFinite(value) && Math.abs(value) < 10,
            `${name}: invalid vertex`,
          );
        }
    }
  if (name === "project-module.glb")
    for (const side of ["left", "right"])
      assert.ok(json.nodes.some((n) => n.name === `Shutter_${side}`));
  if (name === "portrait-card.glb")
    for (const mat of ["PanelMaterial", "SignalMaterial", "LabelMaterial"])
      assert.ok(json.nodes.some((n) => n.name === `portrait-card_${mat}`));
  if (name === "scroll-runner.glb")
    for (const mat of ["CoreMaterial", "SignalMaterial", "AccentMaterial"])
      assert.ok(json.nodes.some((n) => n.name === `scroll-runner_${mat}`));
  signatures.add(createHash("sha256").update(data).digest("hex"));
  console.log(`${name}: ${json.meshes.length} meshes, ${data.length} bytes`);
}
assert.equal(signatures.size, required.length);
assert.ok(total < 2300000);
console.log(`PASS: ${files.length} original assets, ${total} bytes`);
