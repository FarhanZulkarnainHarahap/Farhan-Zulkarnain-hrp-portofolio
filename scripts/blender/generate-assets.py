"""Original Farhan assets. Run: blender -b --python generate-assets.py -- --output DIR.
Coordinates use Blender Z-up; glTF exporter converts to Y-up. No external models.
"""
import argparse
import math
import pathlib
import sys
import bpy
import bmesh

args = argparse.ArgumentParser()
args.add_argument('--output', required=True)
options = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
out = pathlib.Path(options.output)
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, metal=0.0, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metal
    shader.inputs['Roughness'].default_value = .34 if metal else .5
    shader.inputs['Emission Color'].default_value = (*color, 1)
    shader.inputs['Emission Strength'].default_value = emission
    return mat


# Linear values corresponding to the portfolio's sRGB palette.
def rgb(value):
    def linear(c):
        c = int(c, 16) / 255
        return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
    return tuple(linear(value[i:i+2]) for i in (0, 2, 4))


mats = {name: material(name, rgb(color), metal, glow) for name, color, metal, glow in [
    ('SystemMaterial', '273142', .65, 0), ('PanelMaterial', '151B23', .35, 0),
    ('CoreMaterial', '3B82F6', .55, 0), ('SignalMaterial', '22D3EE', .2, .7),
    ('AccentMaterial', '8B5CF6', .3, .2), ('LabelMaterial', 'F8FAFC', .1, .2)]}


def plate(name, contour, depth=.1, loc=(0, 0, 0), mat='SystemMaterial'):
    # x,z contour; negative y is the front face.
    n = len(contour)
    verts = [(x, y, z) for y in (-depth/2, depth/2) for x, z in contour]
    faces = [tuple(reversed(range(n))), tuple(range(n, n*2))]
    faces += [(i, (i+1) % n, (i+1) % n+n, i+n) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.data.materials.append(mats[mat])
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bevel = obj.modifiers.new('Manufactured edges', 'BEVEL')
    bevel.width = .012
    bevel.segments = 1
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    tri = obj.modifiers.new('Portable triangulation', 'TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=tri.name)
    obj.select_set(False)
    return obj


def contour(w, h, c=.08):
    return [(-w/2+c,-h/2),(w/2-c,-h/2),(w/2,-h/2+c),(w/2,h/2-c),
            (w/2-c,h/2),(-w/2+c,h/2),(-w/2,h/2-c),(-w/2,-h/2+c)]


def bar(name, x, z, w, h, y=0, mat='SystemMaterial'):
    return plate(name, contour(w,h,min(w,h)*.2), .09, (x,y,z), mat)


def frame(name, w, h, y=0, rim=.09):
    outer, inner = contour(w,h), contour(w-2*rim,h-2*rim,.05)
    for i in range(8):
        j = (i+1) % 8
        plate(f'{name}_{i}', [outer[i],outer[j],inner[j],inner[i]], .12, (0,y,0))


def export(name):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    source = out.parent.parent / 'assets' / 'blender'
    source.mkdir(parents=True, exist_ok=True)
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(source / f'{name}.blend'))
    # Batch static surfaces by material, preserving independent shutter pivots.
    for mat in mats.values():
        bpy.ops.object.select_all(action='DESELECT')
        batch=[obj for obj in bpy.context.scene.objects if obj.type == 'MESH'
               and obj.active_material == mat and not obj.name.startswith('Shutter_')]
        if not batch: continue
        for obj in batch: obj.select_set(True)
        bpy.context.view_layer.objects.active = batch[0]
        bpy.ops.object.convert(target='MESH')
        bpy.ops.object.join()
        batch[0].name = f'{name}_{mat.name}'
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=str(out / f'{name}.glb'), export_format='GLB',
        use_selection=True, export_yup=True, export_animations=False, export_cameras=False,
        export_lights=False, export_texcoords=False, export_normals=True, export_materials='EXPORT')
    bpy.ops.object.delete(use_global=False)


plate('Core_spine',[(-.58,-.75),(.35,-.75),(.58,-.48),(.58,.65),(.26,.86),(-.5,.6)],.34,(0,.15,0))
for i in range(3):
    frame(f'Shell_layer_{i}',1.65+i*.08,1.8+i*.04,i*.25)
for side in [-1,1]:
    plate(f'Asymmetric_fin_{side}',[(side*x,z*side) for x,z in [(.72,-.68),(1.13,-.43),(1.13,.32),(.87,.7),(.71,.34)]],.12,(0,.08,0),'CoreMaterial')
plate('Farhan_F',[(-.5,-.52),(-.29,-.52),(-.29,-.07),(.04,-.07),(.04,.12),(-.29,.12),(-.29,.34),(.13,.34),(.13,.55),(-.5,.55)],.07,(0,-.24,0),'LabelMaterial')
plate('Zulkarnain_Z',[(.15,.55),(.64,.55),(.64,.36),(.32,-.3),(.65,-.3),(.65,-.51),(.04,-.51),(.04,-.31),(.38,.34),(.15,.34)],.07,(0,-.26,0),'SignalMaterial')
bar('Channel_left',-.65,0,.025,.85,-.19,'SignalMaterial')
bar('Channel_base',0,-.67,.6,.025,-.19,'SignalMaterial')
export('system-core')

# Separable carrier/shutters provide named animation targets in the frontend.
frame('Carrier',2.25,1.65,.08)
plate('Thumbnail_backing',contour(1.94,1.12),.06,(0,.03,.1),'PanelMaterial')
for side in [-1,1]:
    plate(f'Shutter_{"left" if side < 0 else "right"}',contour(.3,1.3),.08,(side*1.01,-.08,.05),'CoreMaterial')
    for z in [-.44,0,.44]:
        bar(f'Port_{side}_{z}',side*1.18,z,.13,.1,.04,'SignalMaterial')
for i in range(4):
    bar(f'Tech_marker_{i}',-.66+i*.2,-.65,.11,.04,-.08,'AccentMaterial')
bar('Status_indicator',.81,-.65,.18,.04,-.08,'SignalMaterial')
export('project-module')

# Twelve related symbols: the requested ten plus infrastructure and creative.
for kind in ['frontend','backend','database','infrastructure','creative','api','cloud','deployment','architecture','ui','code','performance']:
    if kind in ('frontend','ui'):
        frame('Interface_front',1,.7,-.08)
        if kind == 'frontend': frame('Interface_back',.86,.6,.18)
        bar('Interface_header',-.15,.16,.48,.04,-.17,'SignalMaterial')
        bar('Interface_content',-.22,-.07,.32,.12,-.17)
    elif kind == 'backend':
        for i in range(3):
            bar(f'Compute_layer_{i}',0,(i-1)*.27,.84,.16,i*.12)
            bar(f'Compute_port_{i}',-.46,(i-1)*.27,.08,.07,i*.12,'SignalMaterial')
    elif kind == 'database':
        for layer in range(3):
            for i in range(11):
                a,b = i*math.tau/12,(i+1)*math.tau/12-.035
                points=[(r*math.cos(t),r*math.sin(t)) for r,t in [(.46,a),(.46,b),(.29,b),(.29,a)]]
                obj=plate(f'Data_sector_{layer}_{i}',points,.1,(0,0,(layer-1)*.25))
                obj.rotation_euler.x=math.pi/2
    elif kind in ('infrastructure','architecture'):
        for x in [-.34,.34]: bar(f'Tower_{x}',x,0,.09,1)
        for z in [-.4,0,.4]: bar(f'Bridge_{z}',0,z,.76,.06)
        if kind == 'architecture': bar('Architecture_bus',0,0,.09,.72,-.15,'SignalMaterial')
    elif kind == 'creative':
        verts=[]
        for i in range(41):
            t=i/40
            for r in [.3,.48]: verts.append((math.cos(t*math.tau*1.2)*r,math.sin(t*math.tau*1.2)*r,t- .5))
        mesh=bpy.data.meshes.new('Creative_ribbon'); mesh.from_pydata(verts,[],[(i*2,i*2+1,i*2+3,i*2+2) for i in range(40)])
        obj=bpy.data.objects.new('Creative_ribbon',mesh); bpy.context.collection.objects.link(obj); obj.data.materials.append(mats['AccentMaterial'])
        solid=obj.modifiers.new('Ribbon wall','SOLIDIFY'); solid.thickness=.025
    elif kind in ('code','api'):
        for side in [-1,1]:
            plate(f'Socket_{side}',[(side*x,z) for x,z in [(.13,.34),(.43,0),(.13,-.34),(.23,-.42),(.62,0),(.23,.42)]],.13)
        bar('Link',0,0,.06,.62 if kind=='code' else .12,-.03,'SignalMaterial')
    elif kind == 'cloud':
        frame('Cloud_base',.85,.42)
        bar('Cloud_left',-.18,.22,.3,.25)
        bar('Cloud_crown',.15,.3,.32,.41)
    elif kind == 'deployment':
        bar('Deploy_dock',0,-.4,.85,.13)
        plate('Deploy_arrow',[(-.1,-.22),(.1,-.22),(.1,.12),(.34,.12),(0,.51),(-.34,.12),(-.1,.12)],.12,mat='CoreMaterial')
    else:
        for i in range(3): bar(f'Throughput_{i}',(i-1)*.28,-.2+i*.12,.16,.3+i*.24)
        bar('Throughput_bus',0,-.4,.88,.04,mat='SignalMaterial')
    export(f'symbol-{kind}')
print('FARHAN_ASSETS_READY', str(out))
