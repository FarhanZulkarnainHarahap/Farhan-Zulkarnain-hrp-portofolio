"""Asset 02: FZH About Identity Capsule. Blender 4.5 LTS.
Run from web: blender -b --python scripts/blender/create_fzh_identity_capsule.py
Uses Asset 01's mesh helpers and appends its actual saved materials, read-only.
"""
import argparse
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector

BASE = Path(__file__).resolve().parents[2]
NAME = 'FZH_About_Identity_Capsule'
MODEL = BASE / 'public/models/fzh-identity-capsule'
REFERENCE = BASE / 'assets/blender/FZH_Hero_Kinetic_Core.blend'
spec = importlib.util.spec_from_file_location('fzh_core_geometry', Path(__file__).with_name('create_fzh_kinetic_core.py'))
core = importlib.util.module_from_spec(spec)
spec.loader.exec_module(core)
G, pivot = core.Geometry, core.pivot
TAU = math.tau


def create_materials_or_reuse():
    """Append source settings, not a newly interpreted palette."""
    names = ['Dark_Matte','Brushed_Gunmetal','Polished_Graphite','Dark_Glass','Cyan_Signal','Titanium_Accent']
    with bpy.data.libraries.load(str(REFERENCE), link=False) as (source, target):
        assert all(name in source.materials for name in names)
        target.materials = list(names)
    core.MATS = {name: mat for name, mat in zip(names, target.materials)}
    # A portrait-facing sheet must not refract/tint away the subject. A dedicated
    # alpha-glass derivative retains source tint and roughness without transmission.
    glass = core.MATS['Dark_Glass']
    glass.name = 'Dark_Glass_Display'
    shader = glass.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Transmission Weight'].default_value = 0
    shader.inputs['Alpha'].default_value = .12
    glass.diffuse_color = (*glass.diffuse_color[:3], .12)
    glass.surface_render_method = 'DITHERED'
    glass.use_transparency_overlap = False
    core.MATS['Dark_Glass_Display'] = glass
    neutral = bpy.data.materials.new('Portrait_Placeholder')
    neutral.use_nodes = True
    shader = neutral.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (.045,.057,.07,1)
    shader.inputs['Roughness'].default_value = .85
    neutral.diffuse_color = (.045,.057,.07,1)
    core.MATS['Portrait_Placeholder'] = neutral


def plate(geometry, width, height, chamfer, depth, loc=(0,0,0)):
    x, y, z = loc
    contour=[(-width/2+chamfer,-height/2),(width/2-chamfer,-height/2),
             (width/2,-height/2+chamfer),(width/2,height/2-chamfer),
             (width/2-chamfer,height/2),(-width/2+chamfer,height/2),
             (-width/2,height/2-chamfer),(-width/2,-height/2+chamfer)]
    off=len(geometry.v)
    geometry.v.extend((x+px,y+dy,z+pz) for dy in (-depth/2,depth/2) for px,pz in contour)
    geometry.f.extend([tuple(off+i for i in reversed(range(8))),tuple(off+8+i for i in range(8))])
    geometry.f.extend((off+i,off+(i+1)%8,off+(i+1)%8+8,off+i+8) for i in range(8))
    return geometry


def offset_arc(geom, center, radius, width, depth, start, end, steps=24):
    part=G().arc(radius,width,depth,start,end,steps=steps)
    off=len(geom.v)
    geom.v.extend((x+center[0],y+center[1],z+center[2]) for x,y,z in part.v)
    geom.f.extend(tuple(off+i for i in face) for face in part.f)


def create_outer_frame(root):
    frame=pivot('Identity_Frame',root)
    rails, panels, hardware=G(),G(),G()
    # Open corner brackets: empty top center, side gaps and no box enclosing portrait.
    for sx in (-1,1):
        for sz in (-1,1):
            center=(sx*.49,.015,sz*.92)
            start={(1,1):0,(-1,1):math.pi/2,(-1,-1):math.pi,(1,-1):3*math.pi/2}[(sx,sz)]
            offset_arc(rails,center,.19,.075,.11,start,start+math.pi/2,18 if core.LOD else 32)
            rails.box((sx*.68,.015,sz*.70),(.075,.11,.44))
            rails.box((sx*.39,.015,sz*1.11),(.20,.11,.075))
            panels.box((sx*.68,-.049,sz*.74),(.042,.014,.25))
            hardware.box((sx*.68,-.059,sz*.59),(.035,.017,.025))
    rails.build('Frame_Open_Brackets','Brushed_Gunmetal',frame,.009)
    panels.build('Frame_Recessed_Panels','Dark_Matte',frame,.004)
    hardware.build('Detail_Frame_Fasteners','Titanium_Accent',frame,.003)
    # Small laminated rear rail, visible in three-quarter view only.
    rear=G()
    for sx in (-1,1):
        rear.box((sx*.62,.12,0),(.032,.035,1.68))
    rear.build('Frame_Rear_Rails','Polished_Graphite',frame,.005)
    return frame


def create_glass_panel(root):
    display=pivot('Identity_Display',root)
    plate(G(),1.25,1.76,.10,.018,(0,-.105,.03)).build(
        'Identity_Display_Glass','Dark_Glass_Display',display,.003)
    borders=G()
    for sx in (-1,1):
        borders.box((sx*.614,-.104,.03),(.016,.025,1.52))
    for sz in (-1,1):
        borders.box((0,-.104,.03+sz*.872),(1.04,.025,.016))
    borders.build('Display_Edge_Trim','Polished_Graphite',display,.003)
    guides=G()
    for sx in (-1,1):
        for sz in (-1,1):
            guides.box((sx*.578,-.121,.03+sz*.735),(.046,.005,.009))
    guides.build('Emit_Display_Registration','Cyan_Signal',display,.001)
    return display


def create_portrait_plane(display):
    # X left->right, Blender Z bottom->top. glTF becomes XY, normal +Z.
    w,h=1.12,1.40
    verts=[(-w/2,-.078,.04-h/2),(w/2,-.078,.04-h/2),
           (w/2,-.078,.04+h/2),(-w/2,-.078,.04+h/2)]
    portrait=core.finish('Portrait_Plane',verts,[(0,1,2,3)],'Portrait_Placeholder',display,0)
    uv=portrait.data.uv_layers.new(name='Portrait_UV')
    coords=[(0,0),(1,0),(1,1),(0,1)]
    for loop in portrait.data.loops:
        uv.data[loop.index].uv=coords[loop.vertex_index]
    portrait['portrait_aspect']='4:5'
    portrait['recommended_pixels']='1024 x 1280, optimized WebP / AVIF'
    portrait['frontend']='Texture.flipY=false; SRGBColorSpace; MeshBasicMaterial; map by name'
    return portrait


def create_orbit(root):
    mount=pivot('Identity_Orbit_Mount',root,(math.radians(13),0,math.radians(-8)))
    mount.location.y=.17
    orbit=pivot('Identity_Orbit',mount)
    rail,segments,markers=G(),G(),G()
    for i in range(8):
        a=i*TAU/8+.065
        b=(i+1)*TAU/8-.065
        for y in (-.025,.025):
            rail.arc(1,.021,.017,a,b,y,steps=12 if core.LOD else 22)
        segments.arc(1,.044,.066,a+.04,a+.12)
        if i in (0,2,4,6):
            markers.arc(1,.009,.006,a+.16,a+.26,-.037)
    # Elliptical orbit is baked in vertices, preserving neutral object scale/pivots.
    for geom in (rail,segments,markers):
        geom.v=[(x*.77,y,z*1.23) for x,y,z in geom.v]
    rail.build('Orbit_Twin_Split_Rails','Brushed_Gunmetal',orbit,.003)
    segments.build('Orbit_Segment_Couplers','Polished_Graphite',orbit,.003)
    markers.build('Emit_Orbit_Ticks','Cyan_Signal',orbit,.001)
    return orbit


def create_support_arms(root):
    for sx,name in ((-1,'Arm_L'),(1,'Arm_R')):
        arm=pivot(name,root)
        struts,hinges=G(),G()
        for sz in (-1,1):
            struts.box((sx*.635,.045,sz*.38),(.26,.09,.047),sx*sz*.25)
            plate(hinges,.085,.115,.02,.13,(sx*.71,.005,sz*.40))
        struts.build(f'{name}_Suspension','Polished_Graphite',arm,.007)
        hinges.build(f'{name}_Bearings','Brushed_Gunmetal',arm,.008)


def create_base(root):
    base=pivot('Base_Module',root)
    plate(G(),1.15,.16,.055,.29,(0,.035,-1.22)).build('Base_Dock_Housing','Brushed_Gunmetal',base,.015)
    plate(G(),.91,.10,.035,.21,(0,.05,-1.335)).build('Base_Lower_Insert','Dark_Matte',base,.009)
    plate(G(),.98,.086,.026,.012,(0,-.118,-1.22)).build('Base_Interface_Panel','Polished_Graphite',base,.003)
    G().box((0,-.127,-1.25),(.64,.006,.008)).build('Emit_Line_01','Cyan_Signal',base,.001)
    docking=G()
    for sx in (-1,1):
        docking.box((sx*.42,.018,-1.073),(.075,.10,.09))
    docking.build('Base_Docking_Pins','Polished_Graphite',base,.006)
    upper=pivot('Upper_Stabilizer',root)
    plate(G(),.72,.09,.032,.17,(0,.04,1.28)).build('Upper_Stabilizer_Bridge','Dark_Matte',upper,.010)
    G().box((0,-.052,1.28),(.26,.006,.008)).build('Emit_Upper_Status','Cyan_Signal',upper,.001)
    return base


def create_data_nodes(root):
    nodes=[]
    positions=[(-.81,-.02,.83),(.84,.05,.62),(-.82,.10,-.15),(.83,-.02,-.69)]
    for i,loc in enumerate(positions):
        obj=pivot(f'DataNode_{i+1:02}',root,(0,0,math.radians((-1)**i*9)))
        obj.location=loc
        plate(G(),.085,.14,.022,.068).build(f'DataNode_{i+1:02}_Housing','Dark_Matte',obj,.006)
        G().box((0,-.041,.016),(.047,.008,.009)).build(f'Emit_Node_{i+1:02}','Cyan_Signal',obj,.001)
        nodes.append(obj)
    return nodes


def create_brand_elements(root):
    plate(G(),.70,.13,.025,.025,(0,-.083,-.97)).build('Brand_Plate','Polished_Graphite',root,.004)
    # Only short identity text; role/name surfaces remain available for HTML overlays.
    curve=bpy.data.curves.new('FZH identity engraving','FONT')
    curve.body='FZH / IDENTITY-02'
    curve.align_x='CENTER'
    curve.size=.036
    curve.extrude=.0003
    curve.resolution_u=2
    obj=bpy.data.objects.new('Detail_Brand_Inscription',curve)
    bpy.context.collection.objects.link(obj)
    obj.parent=root
    obj.location=(0,-.099,-.979)
    obj.rotation_euler=(math.pi/2,0,0)
    obj.data.materials.append(core.MATS['Titanium_Accent'])
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    anchor=pivot('Profile_Label_Anchor',root)
    anchor.location=(0,-.14,-1.02)
    anchor['usage']='Optional HTML label: Full-Stack Developer'


def create_animation(root,orbit,nodes):
    # Exporter helpers take 1-based keys and convert them to zero-based clip time.
    core.track(root,'idle',{'location':[(f,(0,0,.018*math.sin(TAU*(f-1)/300))) for f in range(1,302,5)]})
    root.location=(0,0,0)
    core.track(orbit,'idle',{'rotation_euler':[(f,(0,.055*math.sin(TAU*(f-1)/300),0)) for f in range(1,302,5)]})
    orbit.rotation_euler=(0,0,0)
    for i,obj in enumerate(nodes):
        rest=tuple(obj.location)
        core.track(obj,'idle',{'location':[(f,(rest[0],rest[1]+.008*math.sin(TAU*(f-1)/300),rest[2]+.012*(-1)**i*math.sin(TAU*(f-1)/300))) for f in range(1,302,5)]})
        obj.location=rest
    scanner=pivot('Identity_Scan',root)
    G().box((0,-.124,0),(1.08,.004,.006)).build('Emit_Scan_Bar','Cyan_Signal',scanner,.001)
    # Rest outside portrait. Smooth pass up and back, zero endpoint speed.
    scanner.location=(0,0,-.73)
    core.track(scanner,'identity_scan',{'location':[(f,(0,0,-.73+1.52*(.5-.5*math.cos(TAU*(f-1)/90)))) for f in range(1,92,3)]})
    scanner.location=(0,0,-.73)
    bpy.context.scene.frame_set(0)


def export_glb(root,lod):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [root,*root.children_recursive]:
        obj.select_set(True)
    path=MODEL/f'{NAME}{"_LOD" if lod else ""}.glb'
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
        export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,
        export_frame_range=False,export_cameras=False,export_lights=False,export_yup=True,export_extras=True)
    return path


def build(lod):
    core.LOD=lod
    core.reset_scene()
    # Converted text leaves orphan FONT data holding materials; remove it before
    # the next LOD build so appended materials keep clean, stable names.
    for datablocks in (bpy.data.curves, bpy.data.materials):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)
    create_materials_or_reuse()
    root=pivot('FZH_Identity_ROOT')
    root['asset']='FZH Kinetic System / Identity 02'
    root['front']='Blender -Y / glTF +Z'
    create_outer_frame(root)
    display=create_glass_panel(root)
    create_portrait_plane(display)
    orbit=create_orbit(root)
    create_support_arms(root)
    create_base(root)
    nodes=create_data_nodes(root)
    create_brand_elements(root)
    create_animation(root,orbit,nodes)
    stats=core.optimize_scene(root)
    bpy.data.orphans_purge(do_recursive=True)
    path=export_glb(root,lod)
    stats.update(file=str(path.relative_to(BASE)),bytes=path.stat().st_size)
    return stats


def render_previews(camera):
    scene=bpy.context.scene
    scene.render.resolution_x=1000
    scene.render.resolution_y=1300
    camera.data.ortho_scale=3.45
    for label,loc in [('front',(.15,-6,.13)),('angle',(2.8,-6,1.5))]:
        camera.location=loc
        camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(BASE/'previews'/f'FZH_Identity_Capsule_{label}.png')
        bpy.ops.render.render(write_still=True)
        if label=='front':
            scene.render.image_settings.file_format='WEBP'
            scene.render.image_settings.quality=85
            bpy.data.images['Render Result'].save_render(str(MODEL/f'{NAME}_poster.webp'),scene=scene)
            scene.render.image_settings.file_format='PNG'


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--skip-previews',action='store_true')
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
    source_hash=hashlib.sha256(REFERENCE.read_bytes()).hexdigest()
    for path in (MODEL,BASE/'assets/blender',BASE/'previews',BASE/'docs'):
        path.mkdir(parents=True,exist_ok=True)
    mobile=build(True)
    desktop=build(False)
    camera=core.setup_studio()
    camera.location=(.15,-6,.13)
    camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=3.45
    bpy.context.scene.render.resolution_x=1000
    bpy.context.scene.render.resolution_y=1300
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'assets/blender'/f'{NAME}.blend'))
    if not args.skip_previews:
        render_previews(camera)
    assert source_hash==hashlib.sha256(REFERENCE.read_bytes()).hexdigest()
    report={'blender':bpy.app.version_string,'desktop':desktop,'mobile':mobile,
            'animations':{'idle':10,'identity_scan':3},'portrait':{'mesh':'Portrait_Plane','ratio':'4:5','pixels':[1024,1280]},
            'asset01_blend_sha256':source_hash}
    (BASE/'docs/FZH_Identity_Capsule_stats.json').write_text(json.dumps(report,indent=2)+'\n')
    print('FZH_IDENTITY_REPORT',json.dumps(report))


if __name__=='__main__':
    main()
