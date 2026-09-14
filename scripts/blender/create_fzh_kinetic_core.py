"""FZH original procedural product asset. Blender 4.5 LTS; no external assets.
Run: blender -b --python scripts/blender/create_fzh_kinetic_core.py
Optional: -- --skip-previews. All paths resolve against this script, not cwd.
"""
import argparse
import json
import math
from pathlib import Path
import sys
import bpy
import bmesh
from mathutils import Vector

BASE = Path(__file__).resolve().parents[2]
MODEL = BASE / 'public/models/fzh-kinetic-core'
NAME = 'FZH_Hero_Kinetic_Core'
TAU = math.tau
MATS = {}
LOD = False


def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for group in (bpy.data.meshes, bpy.data.materials, bpy.data.actions):
        for item in list(group):
            if item.users == 0:
                group.remove(item)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 40
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.fps = 30
    scene.frame_start, scene.frame_end = 0, 300
    scene.world.color = (.08, .08, .08)
    scene.view_settings.view_transform = 'AgX'


def create_materials():
    # Standard Principled inputs only: identical semantics in glTF metallic/roughness.
    specs = [
        ('Dark_Matte', (.028, .036, .045), .7, .38),
        ('Brushed_Gunmetal', (.13, .17, .21), .82, .29),
        ('Polished_Graphite', (.055, .07, .085), .95, .19),
        ('Dark_Glass', (.30, .45, .50), .05, .12),
        ('Cyan_Signal', (.008, .46, .65), .25, .25),
        ('Titanium_Accent', (.38, .45, .5), .8, .28),
    ]
    for name, color, metal, rough in specs:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        mat.diffuse_color = (*color, 1)
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Metallic'].default_value = metal
        bsdf.inputs['Roughness'].default_value = rough
        if name == 'Cyan_Signal':
            bsdf.inputs['Emission Color'].default_value = (.005, .55, .85, 1)
            bsdf.inputs['Emission Strength'].default_value = 2.4
        if name == 'Dark_Glass':
            bsdf.inputs['Transmission Weight'].default_value = .82
            bsdf.inputs['IOR'].default_value = 1.45
        MATS[name] = mat


def pivot(name, parent=None, rotation=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.rotation_euler = rotation
    obj.empty_display_size = .12
    return obj


def finish(name, verts, faces, material, parent=None, bevel=.008):
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
    obj.parent = parent
    obj.data.materials.append(MATS[material])
    bpy.context.view_layer.objects.active = obj
    if bevel:
        mod = obj.modifiers.new('Precision edge chamfer', 'BEVEL')
        mod.width = bevel
        mod.segments = 1 if LOD else 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        # Keep manufactured planes flat; averaging across narrow rail chamfers
        # produces rippled reflections. Arc sampling supplies the round silhouette.
        for face in obj.data.polygons:
            face.use_smooth = False
    return obj


class Geometry:
    """Batch repeated pieces into one mesh per material / moving assembly."""
    def __init__(self):
        self.v, self.f = [], []

    def arc(self, r, width, depth, start, end, y=0, steps=None):
        steps = steps or max(2, int((end-start) / TAU * (96 if LOD else 160)))
        offset = len(self.v)
        for i in range(steps+1):
            angle = start + (end-start)*i/steps
            for radius, dy in ((r-width/2, -depth/2), (r+width/2, -depth/2),
                               (r+width/2, depth/2), (r-width/2, depth/2)):
                self.v.append((radius*math.cos(angle), y+dy, radius*math.sin(angle)))
        self.f.append(tuple(offset+j for j in (3, 2, 1, 0)))
        self.f.append(tuple(offset+4*steps+j for j in range(4)))
        for i in range(steps):
            for j in range(4):
                a = offset+4*i+j
                b = offset+4*i+(j+1)%4
                self.f.append((a, b, b+4, a+4))
        return self

    def box(self, loc, size, angle=0):
        off = len(self.v)
        for x, y, z in ((-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),
                        (-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)):
            x, y, z = x*size[0]/2, y*size[1]/2, z*size[2]/2
            self.v.append((loc[0]+x*math.cos(angle)-z*math.sin(angle),
                           loc[1]+y, loc[2]+x*math.sin(angle)+z*math.cos(angle)))
        self.f.extend(tuple(off+i for i in face) for face in
                      ((0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)))
        return self

    def radial_box(self, r, a, size, y=0):
        return self.box((r*math.cos(a), y, r*math.sin(a)), size, a)

    def build(self, name, material, parent, bevel=.008):
        return finish(name, self.v, self.f, material, parent, bevel)


def create_outer_ring(root):
    parent = pivot('Ring_Outer', root)
    shell, inset, rail, signals, fasteners = [Geometry() for _ in range(5)]
    for i in range(12):
        a, b = i*TAU/12+.025, (i+1)*TAU/12-.025
        shell.arc(1.69, .19, .19, a, b)
        inset.arc(1.688, .105, .013, a+.035, b-.035, -.106)
        rail.arc(1.59, .025, .07, a+.06, b-.06)
        signals.arc(1.69, .012, .008, a+.055, a+.14, -.116)
        for t in (a+.035, b-.035):
            fasteners.radial_box(1.745, t, (.021,.016,.033), -.108)
    shell.build('Outer_Segmented_Housing', 'Brushed_Gunmetal', parent)
    inset.build('Outer_Recessed_Panels', 'Dark_Matte', parent, .003)
    rail.build('Outer_Inboard_Rail', 'Polished_Graphite', parent, .004)
    signals.build('Emit_Ring_01', 'Cyan_Signal', parent, .001)
    fasteners.build('Detail_Outer_Fasteners', 'Titanium_Accent', parent, .003)
    bridges = Geometry()
    for i in range(12):
        bridges.radial_box(1.67, i*TAU/12, (.095,.085,.07), .04)
    bridges.build('Outer_Segment_Couplers', 'Polished_Graphite', parent)
    return parent


def create_structure_ring(root):
    parent = pivot('Ring_Structure', root, (math.radians(18), 0, math.radians(-12)))
    rails, arms, pads = Geometry(), Geometry(), Geometry()
    for i in range(6):
        a, b = i*TAU/6+.08, (i+1)*TAU/6-.08
        for y in (-.075, .075):
            rails.arc(1.39, .065, .037, a, b, y)
        for angle in (a+.05, b-.05):
            arms.radial_box(1.405, angle, (.15,.22,.052))
        pads.arc(1.395, .12, .06, a+.28, a+.43)
    rails.build('Structure_Twin_Rails', 'Brushed_Gunmetal', parent, .004)
    arms.build('Structure_Cross_Braces', 'Polished_Graphite', parent, .006)
    pads.build('Structure_Bearing_Blocks', 'Dark_Matte', parent)
    return parent


def create_data_ring(root):
    parent = pivot('Ring_Data', root, (math.radians(-13), 0, math.radians(9)))
    rail, teeth, indicators = Geometry(), Geometry(), Geometry()
    for i in range(24):
        a = i*TAU/24
        rail.arc(1.14, .064, .062, a+.025, a+TAU/24-.025)
        teeth.radial_box(1.195, a+.08, (.07,.038,.045), -.022)
        indicators.arc(1.14, .012, .006, a+.065, a+.12, -.036)
    rail.build('Data_Interrupted_Rail', 'Polished_Graphite', parent, .004)
    teeth.build('Detail_Data_Registers', 'Titanium_Accent', parent, .003)
    indicators.build('Emit_Data_Indicators', 'Cyan_Signal', parent, .001)
    return parent


def create_gyro_ring(root):
    tilt = pivot('Gyro_Mount', root, (math.radians(42), 0, math.radians(-25)))
    parent = pivot('Ring_Gyro', tilt)
    hoop, collars, signal = Geometry(), Geometry(), Geometry()
    for i in range(4):
        a = i*TAU/4
        hoop.arc(.89, .07, .07, a+.085, a+TAU/4-.085)
        collars.radial_box(.89, a, (.14,.15,.13))
        signal.arc(.89,.012,.006,a+.2,a+.50,-.039)
    hoop.build('Gyro_Partial_Hoop', 'Brushed_Gunmetal', parent, .005)
    collars.build('Gyro_Axis_Bearings', 'Polished_Graphite', parent)
    signal.build('Emit_Gyro', 'Cyan_Signal', parent, .001)
    # Orthogonal internal fork gives a mechanical gimbal, not another flat ring.
    fork = pivot('Gimbal_Internal', parent, (0, 0, math.pi/2))
    Geometry().arc(.69,.038,.045,.28,math.pi-.28).arc(.69,.038,.045,math.pi+.28,TAU-.28).build(
        'Gimbal_Fork', 'Titanium_Accent', fork, .003)
    return parent


def ico(name, radius, material, parent, subdivisions=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius)
    obj = bpy.context.object
    obj.name = name
    obj.parent = parent
    obj.data.materials.append(MATS[material])
    return obj


def create_energy_core(root):
    assembly = pivot('Core_Assembly', root)
    # Eight separated chamfered triangular shell tiles from octahedron faces.
    verts = [(0,0,.54),(0,0,-.54),(.54,0,0),(0,.54,0),(-.54,0,0),(0,-.54,0)]
    geom = Geometry()
    for top in (0,1):
        for i in range(4):
            points = [Vector(verts[j]) for j in (top,2+i,2+(i+1)%4)]
            center = sum(points, Vector())/3
            pts = [center+(p-center)*.79 for p in points]
            off = len(geom.v)
            geom.v.extend(tuple(p*s) for s in (1.06, .94) for p in pts)
            geom.f.extend(tuple(off+j for j in f) for f in ((0,1,2),(5,4,3),(0,3,4,1),(1,4,5,2),(2,5,3,0)))
    geom.build('Core_Shell','Dark_Matte',assembly,.013)
    ico('Glass_Core',.32,'Dark_Glass',assembly,2)
    pulse = pivot('Core_Energy', assembly)
    ico('Emit_Core',.235,'Cyan_Signal',pulse,1)
    circuitry = Geometry()
    for i in range(4):
        circuitry.arc(.31,.014,.018,i*TAU/4+.08,(i+1)*TAU/4-.08)
    circuitry.build('Emit_Internal_Bus','Cyan_Signal',pulse,.002)
    return pulse


def create_modules(root):
    modules = []
    for i in range(3):
        a = math.radians(35+i*120)
        obj = pivot(f'Module_{i+1:02}', root, (0,-a,0))
        obj.location = (.72*math.cos(a),-.10,.72*math.sin(a))
        Geometry().box((0,0,0),(.15,.13,.23)).build(f'Module_{i+1:02}_Shell','Dark_Matte',obj)
        Geometry().box((0,-.071,0),(.09,.013,.13)).build(f'Module_{i+1:02}_Panel','Brushed_Gunmetal',obj,.003)
        Geometry().box((0,-.081,.04),(.065,.006,.008)).build(f'Emit_Module_{i+1:02}','Cyan_Signal',obj,.001)
        modules.append(obj)
    return modules


def create_brand_plate(outer):
    Geometry().box((0,-.135,-1.66),(.43,.045,.13)).build('FZH_Brand_Plate','Polished_Graphite',outer,.009)
    # Small real geometry inscription; no font or texture dependencies at runtime.
    curve = bpy.data.curves.new('FZH inscription', 'FONT')
    curve.body = 'FZH / CORE-01'
    curve.align_x = 'CENTER'
    curve.size = .041
    curve.extrude = .0004
    curve.resolution_u = 2
    obj = bpy.data.objects.new('Detail_FZH_Inscription', curve)
    bpy.context.collection.objects.link(obj)
    obj.location = (0,-.161,-1.675)
    obj.rotation_euler = (math.pi/2,0,0)
    obj.parent = outer
    obj.data.materials.append(MATS['Titanium_Accent'])
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')


def track(obj, clip, samples):
    """One NLA track per object, matching track names merge to one glTF clip."""
    obj.animation_data_create()
    action = bpy.data.actions.new(f'{clip}_{obj.name}')
    obj.animation_data.action = action
    for path, keys in samples.items():
        for frame, value in keys:
            setattr(obj,path,value)
            obj.keyframe_insert(data_path=path,frame=frame-1,group=obj.name)
    # Sampled sine curves avoid Bezier overshoot; cyclic endpoints and derivatives match.
    for slot in action.slots:
        for layer in action.layers:
            for strip in layer.strips:
                bag = strip.channelbag(slot)
                if bag:
                    for fc in bag.fcurves:
                        for key in fc.keyframe_points:
                            key.interpolation = 'LINEAR'
    obj.animation_data.action = None
    nla = obj.animation_data.nla_tracks.new()
    nla.name = clip
    nla.strips.new(clip,0,action)
    nla.mute = clip != 'idle'


def create_animations(outer, structure, data, gyro, pulse, modules):
    # Ten-second closed, calm angular excursions (not a fast 360-degree revolution).
    for obj, axis, amplitude in ((outer,1,-.16),(structure,1,.21),(data,1,-.12),(gyro,0,.23)):
        rest = tuple(obj.rotation_euler)
        samples=[]
        for f in range(1,302,5):
            value=list(rest)
            value[axis] += amplitude*math.sin(TAU*(f-1)/300)
            samples.append((f,value))
        track(obj,'idle',{'rotation_euler':samples})
        obj.rotation_euler = rest
        track(obj,'boot',{'scale':[(1,(.88,)*3),(91,(1,)*3)]})
        obj.scale=(1,)*3
    track(pulse,'idle',{'scale':[(f,(1+.035*(1-math.cos(2*TAU*(f-1)/300)),)*3) for f in range(1,302,5)]})
    track(pulse,'core_pulse',{'scale':[(f,(1+.065*(1-math.cos(TAU*(f-1)/90)),)*3) for f in range(1,92,3)]})
    track(pulse,'boot',{'scale':[(1,(.12,)*3),(61,(.85,)*3),(91,(1,)*3)]})
    pulse.scale=(1,)*3
    for obj in modules:
        rest=tuple(obj.location)
        track(obj,'idle',{'location':[(f,(rest[0],rest[1]+.018*math.sin(TAU*(f-1)/300),rest[2])) for f in range(1,302,5)]})
        obj.location=rest
    bpy.context.scene.frame_set(0)


def optimize_scene(root):
    meshes = [o for o in root.children_recursive if o.type=='MESH']
    for obj in meshes:
        bpy.context.view_layer.objects.active=obj
        tri=obj.modifiers.new('Export triangulation','TRIANGULATE')
        bpy.ops.object.modifier_apply(modifier=tri.name)
    return {'triangles':sum(len(o.data.polygons) for o in meshes),
            'mesh_objects':len(meshes),'nodes':len(root.children_recursive)+1,
            'materials':len({m.name for o in meshes for m in o.data.materials})}


def export_glb(root, suffix=''):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [root,*root.children_recursive]:
        obj.select_set(True)
    path=MODEL/f'{NAME}{suffix}.glb'
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
        export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips_merged_animation_name='idle',
        export_force_sampling=True,export_frame_range=False,export_cameras=False,export_lights=False,
        export_yup=True,export_extras=True)
    return path


def setup_studio():
    world=bpy.context.scene.world
    world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.075,.10,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.35
    for name, loc, power, size, color in [
        ('Studio_Key',(1,-4,5),1000,5,(.80,.9,1)),
        ('Studio_Fill',(-4,-2,1),800,4,(.47,.7,1)),
        ('Studio_Rim',(2,2,3),1300,3,(.30,.70,1)),
        ('Studio_Softbox',(-1,-3,-4),550,3,(1,1,1))]:
        light=bpy.data.lights.new(name,'AREA')
        light.energy,light.shape,light.size,light.color=power,'DISK',size,color
        obj=bpy.data.objects.new(name,light)
        bpy.context.collection.objects.link(obj)
        obj.location=loc
        obj.rotation_euler=(Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
    camera=bpy.data.objects.new('Preview_Camera',bpy.data.cameras.new('Preview_Camera'))
    bpy.context.collection.objects.link(camera)
    camera.data.type='ORTHO'
    camera.data.ortho_scale=4.5
    bpy.context.scene.camera=camera
    return camera


def render_previews(camera):
    for name,loc in [('front',(.2,-7,.3)),('angle',(3.6,-6,2.1))]:
        camera.location=loc
        camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
        bpy.context.scene.render.filepath=str(BASE/'previews'/f'{NAME}_{name}.png')
        bpy.ops.render.render(write_still=True)
        if name == 'front':
            scene = bpy.context.scene
            scene.render.image_settings.file_format = 'WEBP'
            scene.render.image_settings.quality = 85
            bpy.data.images['Render Result'].save_render(str(MODEL/f'{NAME}_poster.webp'), scene=scene)
            scene.render.image_settings.file_format = 'PNG'


def build(lod=False):
    global LOD
    LOD=lod
    reset_scene()
    create_materials()
    root=pivot('FZH_Core_ROOT')
    root['asset']='FZH Kinetic System / Core 01'
    root['forward']='-Y in Blender / +Z in glTF'
    outer=create_outer_ring(root)
    structure=create_structure_ring(root)
    data=create_data_ring(root)
    gyro=create_gyro_ring(root)
    energy=create_energy_core(root)
    modules=create_modules(root)
    create_brand_plate(outer)
    create_animations(outer,structure,data,gyro,energy,modules)
    stats=optimize_scene(root)
    path=export_glb(root,'_LOD' if lod else '')
    stats['bytes']=path.stat().st_size
    stats['file']=str(path.relative_to(BASE))
    return stats


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--skip-previews',action='store_true')
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
    for path in (MODEL,BASE/'assets/blender',BASE/'previews',BASE/'docs'):
        path.mkdir(parents=True,exist_ok=True)
    mobile=build(True)
    desktop=build(False)
    camera=setup_studio()
    camera.location=(.2,-7,.3)
    camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'assets/blender'/f'{NAME}.blend'))
    if not args.skip_previews:
        render_previews(camera)
    report={'blender':bpy.app.version_string,'desktop':desktop,'mobile':mobile,
            'animations':{'idle':10,'core_pulse':3,'boot':3}}
    (BASE/'docs/FZH_Hero_Kinetic_Core_stats.json').write_text(json.dumps(report,indent=2)+'\n')
    print('FZH_REPORT',json.dumps(report))


if __name__=='__main__':
    main()
