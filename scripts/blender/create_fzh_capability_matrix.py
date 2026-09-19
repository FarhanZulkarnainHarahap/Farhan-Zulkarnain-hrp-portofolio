"""FZH Asset 03 modular meshes. Run Blender 4.5 -b --python this_file.
Uses existing Asset 01 geometry helpers and saved materials read-only.
Run node scripts/blender/create_capability_icons.mjs from web before previews.
"""
import importlib.util, json, math, hashlib
from pathlib import Path
import bpy
from mathutils import Vector
BASE=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('fzh',Path(__file__).with_name('create_fzh_kinetic_core.py'))
fzh=importlib.util.module_from_spec(spec);spec.loader.exec_module(fzh)
spec2=importlib.util.spec_from_file_location('identity',Path(__file__).with_name('create_fzh_identity_capsule.py'))
identity=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(identity)
G=fzh.Geometry; pivot=fzh.pivot; plate=identity.plate
OUT=BASE/'public/models/capability'
TAU=math.tau

def load_materials():
    names=['Dark_Matte','Brushed_Gunmetal','Polished_Graphite','Dark_Glass','Cyan_Signal','Titanium_Accent']
    with bpy.data.libraries.load(str(BASE/'assets/blender/FZH_Hero_Kinetic_Core.blend'),link=False) as (src,dst):
        dst.materials=list(names)
    fzh.MATS=dict(zip(names,dst.materials))

def polygon_body(name,radius,depth,material,parent,y=0):
    v=[(radius*math.cos(i*TAU/8+math.pi/8),y+dy,radius*math.sin(i*TAU/8+math.pi/8)) for dy in (-depth/2,depth/2) for i in range(8)]
    faces=[tuple(reversed(range(8))),tuple(range(8,16))]+[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)]
    return fzh.finish(name,v,faces,material,parent,.015)

def uv_plane(name,w,h,y,parent,material='Dark_Matte'):
    obj=fzh.finish(name,[(-w/2,y,-h/2),(w/2,y,-h/2),(w/2,y,h/2),(-w/2,y,h/2)],[(0,1,2,3)],material,parent,0)
    uv=obj.data.uv_layers.new(name='Display_UV')
    for loop in obj.data.loops:uv.data[loop.index].uv=[(0,0),(1,0),(1,1),(0,1)][loop.vertex_index]
    return obj

def create_category_core(root):
    core=pivot('Category_Core',root)
    polygon_body('Category_Core_Body',.58,.18,'Dark_Matte',core)
    frame,channels,fasteners=G(),G(),G()
    for i in range(8):
        a=i*TAU/8+.035;b=(i+1)*TAU/8-.035
        frame.arc(.57,.064,.10,a,b,-.06,steps=16)
        frame.arc(.49,.021,.022,a+.03,b-.03,-.125,steps=14)
        channels.arc(.50,.008,.009,a+.12,a+.36,-.14,steps=8)
        fasteners.radial_box(.59,a+.33,(.027,.019,.026),-.12)
    frame.build('Category_Core_Frame','Brushed_Gunmetal',core,.006)
    channels.build('Core_Signal_Channels','Cyan_Signal',core,.001)
    fasteners.build('Detail_Core_Fasteners','Titanium_Accent',core,.003)
    inner=pivot('Category_Core_Inner',core)
    polygon_body('Processor_Floating_Die',.41,.08,'Polished_Graphite',inner,-.105)
    plate(G(),.52,.19,.035,.01,(0,-.16,0)).build('Category_Label_Surface','Dark_Matte',core,.004)
    # Eight independent ports support arbitrary runtime spokes, without a fixed node count.
    for i in range(8):
        anchor=pivot(f'Core_Connection_Anchor_{i+1:02}',core)
        anchor.location=(.57*math.cos(i*TAU/8),0,.57*math.sin(i*TAU/8))
    fzh.track(inner,'idle',{'rotation_euler':[(f,(0,.06*math.sin(TAU*(f-1)/300),0)) for f in range(1,302,5)]})
    inner.rotation_euler=(0,0,0)
    return core

def create_skill_node_template():
    node=pivot('Skill_Node_Template')
    plate(G(),.72,.57,.095,.15).build('Skill_Node_Frame','Brushed_Gunmetal',node,.012)
    plate(G(),.62,.47,.07,.022,(0,-.091,0)).build('Skill_Node_Face','Dark_Matte',node,.006)
    plate(G(),.49,.39,.04,.008,(0,-.11,.018)).build('Node_Recess','Polished_Graphite',node,.003)
    uv_plane('Skill_Node_LogoPlane',.30,.30,-.118,node)
    G().box((.21,-.12,-.174),(.09,.008,.012)).build('Skill_Node_Indicator','Cyan_Signal',node,.002)
    grooves=G()
    for side in (-1,1):
        for i in range(5):grooves.box((side*.308,-.11,(i-2)*.046),(.016,.016,.025))
    grooves.build('Node_Technical_Grooves','Titanium_Accent',node,.002)
    port=G()
    for i in range(4):port.arc(.048,.017,.026,i*TAU/4+.06,(i+1)*TAU/4-.06,.08,steps=8)
    obj=port.build('Connector_Node','Polished_Graphite',node,.003);obj.location.z=-.28
    anchor=pivot('Connection_Anchor',node);anchor.location=(0,.08,-.28)
    return node

def create_background_structure(root):
    support=pivot('Capability_Support',root)
    for name,r,width,y in [('Orbit_Rail_Main',1.03,.023,.24),('Orbit_Rail_Secondary',1.18,.014,.30),('Background_Data_Ring',.73,.014,.22)]:
        g=G()
        for i in range(4):g.arc(r,width,.024,i*TAU/4+.17,(i+1)*TAU/4-.17,y,steps=22)
        obj=g.build(name,'Polished_Graphite',support,.003)
        # Baked ellipse suggests a bus rail rather than a planetary orbit.
        for v in obj.data.vertices:v.co.x*=1.45;v.co.z*=.9
    micro=G()
    for i in range(6):micro.radial_box(1.12,i*TAU/6,(.04,.032,.055),.26)
    micro.build('Micro_Data_Node','Brushed_Gunmetal',support,.004)
    # Reusable straight connection component, separate from the background export.
    rail=pivot('Energy_Rail_Template')
    G().box((0,.04,.5),(.024,.026,1)).build('Energy_Rail','Dark_Matte',rail,.003)
    G().box((0,.022,.5),(.006,.006,1)).build('Energy_Rail_Signal','Cyan_Signal',rail,.001)
    return support,rail

def export_component(obj,name):
    stats=fzh.optimize_scene(obj)
    bpy.ops.object.select_all(action='DESELECT')
    for child in [obj,*obj.children_recursive]:child.select_set(True)
    path=OUT/f'{name}.glb'
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_cameras=False,export_lights=False,export_yup=True)
    stats['bytes']=path.stat().st_size;stats['file']=str(path.relative_to(BASE))
    return stats

def duplicate_tree(obj,parent=None):
    copy=obj.copy();bpy.context.collection.objects.link(copy);copy.parent=parent
    for child in obj.children:duplicate_tree(child,copy)
    return copy

def preview_logo(node,key):
    path=BASE/f'.qa/capability-icons/{key}.png'
    if not path.exists():raise RuntimeError('Run create_capability_icons.mjs first')
    plane=next(o for o in node.children_recursive if o.name.startswith('Skill_Node_LogoPlane'))
    mat=bpy.data.materials.new(f'Preview_Logo_{key}');mat.use_nodes=True
    nodes=mat.node_tree.nodes;bsdf=nodes.get('Principled BSDF');tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path))
    mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
    mat.node_tree.links.new(tex.outputs['Alpha'],bsdf.inputs['Alpha'])
    bsdf.inputs['Roughness'].default_value=.8;mat.surface_render_method='DITHERED'
    plane.data=plane.data.copy();plane.data.materials.clear();plane.data.materials.append(mat)

def preview_scene(core,support,node,rail,camera):
    node.hide_render=True;rail.hide_render=True
    for o in [*node.children_recursive,*rail.children_recursive]:o.hide_render=True
    nodes=[];positions=[(-1.65,0,.65),(0,-.12,1.28),(1.65,.10,.65),(-1.04,-.13,-1.0),(1.04,.04,-1.0)]
    for key,pos in zip(['react','nextjs','redux','css','tailwindcss'],positions):
        clone=duplicate_tree(node)
        for o in [clone,*clone.children_recursive]:o.hide_render=False
        clone.location=pos;preview_logo(clone,key);nodes.append(clone)
        end=Vector(pos);start=end.normalized()*.6
        g=G().box((0,0,0),(.018,.018,(end-start).length))
        connection=g.build('Preview_Connection','Polished_Graphite',None,.002)
        connection.location=(start+end)/2;connection.rotation_euler=(end-start).to_track_quat('Z','Y').to_euler()
    scene=bpy.context.scene;scene.render.resolution_x=1400;scene.render.resolution_y=1000
    camera.data.ortho_scale=4.9
    for label,loc in [('frontend',(0,-7,.15)),('hover',(0,-7,.15)),('selected',(0,-7,.15)),('angle',(2.6,-7,2.5))]:
        nodes[0].location.y=-.12 if label=='hover' else -.20 if label=='selected' else 0
        nodes[0].scale=(1.06,)*3 if label in ('hover','selected') else (1,)*3
        camera.location=loc;camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(BASE/f'previews/FZH_Capability_Matrix_{label}.png')
        bpy.ops.render.render(write_still=True)

def main():
    reference=BASE/'assets/blender/FZH_Hero_Kinetic_Core.blend'
    digest=hashlib.sha256(reference.read_bytes()).hexdigest()
    for p in (OUT,BASE/'docs',BASE/'previews'):p.mkdir(parents=True,exist_ok=True)
    fzh.reset_scene();load_materials()
    root=pivot('FZH_Capability_ROOT');core=create_category_core(root);support,rail=create_background_structure(root);node=create_skill_node_template()
    bpy.context.scene.frame_set(0)
    report={'core':export_component(core,'FZH_Capability_Core'),'node':export_component(node,'FZH_Skill_Node'),'support':export_component(support,'FZH_Capability_Support'),'rail':export_component(rail,'FZH_Energy_Rail')}
    camera=fzh.setup_studio();camera.location=(0,-7,.15);camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=4.9
    # Save modular source before creating the logo-bearing preview-only layout.
    node.location=(1.5,0,0);rail.location=(-1.6,0,-.5)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'assets/blender/FZH_Capability_Matrix.blend'))
    node.location=(0,0,0);rail.location=(0,0,0)
    preview_scene(core,support,node,rail,camera)
    assert digest==hashlib.sha256(reference.read_bytes()).hexdigest()
    report['asset01_sha256']=digest
    (BASE/'docs/FZH_Capability_Matrix_stats.json').write_text(json.dumps(report,indent=2)+'\n')
    print('CAPABILITY_STATS',json.dumps(report))
if __name__=='__main__':main()
