"""FZH device family. Blender 4.5; existing material library and geometry helpers."""
import importlib.util,json,math
from pathlib import Path
import bpy,bmesh
BASE=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('vault',Path(__file__).with_name('create_fzh_project_artifact.py'));v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
f=v.f;G=v.G;plate=v.plate;pivot=v.pivot;m=v.m
OUT=BASE/'public/models/projects/devices'

def panel(name,w,h,depth,parent,loc=(0,0,0),mat='Dark_Matte',bevel=.008):
    return plate(G(),w,h,min(.07,w*.12,h*.12),depth,loc).build(name,mat,parent,bevel)

def display(prefix,parent,w,h,center=0):
    panel(prefix+'_Chassis',w+.24,h+.25,.12,parent,(0,.02,center))
    g=G()
    for z in [-h/2-.048,h/2+.048]:plate(g,w+.20,.076,.023,.065,(0,-.066,center+z))
    for x in [-w/2-.048,w/2+.048]:plate(g,.076,h+.09,.022,.065,(x,-.066,center))
    g.build(prefix+'_Bezel','Brushed_Gunmetal',parent,.009)
    screen=m.uv_plane(prefix+'_Screen',w,h,-.102,parent);screen.location.z=center
    glass=m.uv_plane(prefix+'_Glass',w,h,-.106,parent,'Device_Glass');glass.location.z=center
    for side,sign in [('Left',-1),('Right',1)]:
        root=pivot(prefix+'_'+side+'_Module',parent);g=G()
        for z in [-h*.34,h*.34]:plate(g,.055,h*.20,.015,.065,(sign*(w/2+.135),-.015,center+z))
        g.build(prefix+'_'+side+'_Segments','Polished_Graphite',root,.006)
    signal=G()
    for sign in [-1,1]:
        signal.box((sign*(w/2+.047),-.106,center-h*.33),(.014,.009,h*.12))
    signal.box((w*.34,-.11,center-h/2-.05),(.08,.009,.012))
    signal.build(prefix+'_Status','Cyan_Signal',parent,.002)
    detail=G()
    for sign in [-1,1]:
        for z in [-1,1]:
            for i in range(3):detail.box((sign*(w/2+.046),-.108,center+z*(h*.41-i*.034)),(.025,.012,.014))
    detail.build(prefix+'_Fasteners','Titanium_Accent',parent,.002)
    back=G()
    for z in [-h*.34,h*.34]:plate(back,w*.86,.055,.01,.025,(0,.092,center+z))
    back.build(prefix+'_Back','Polished_Graphite',parent,.004)

def monitor():
    root=pivot('FZH_Monitor_ROOT');display('Monitor',root,2.88,1.62)
    panel('Monitor_System_Rail',2.3,.055,.085,root,(0,-.02,-1.015),'Polished_Graphite',.005)
    return root

def laptop():
    root=pivot('FZH_Laptop_ROOT')
    base=panel('Laptop_Base',3.10,1.52,.10,root,mat='Brushed_Gunmetal',bevel=.012);base.rotation_euler.x=math.pi/2;base.location=(0,-.68,-.70)
    deck=panel('Laptop_KeyboardDeck',2.83,.76,.018,root,mat='Dark_Matte',bevel=.005);deck.rotation_euler.x=math.pi/2;deck.location=(0,-.48,-.641)
    keys=G()
    for row in range(4):
        for col in range(12):keys.box(((col-5.5)*.212,-.205-row*.17,-.624),(.174,.116,.018))
    keys.build('Laptop_Keys','Polished_Graphite',root,.004)
    G().box((0,-1.055,-.64),(.78,.34,.018)).build('Laptop_Trackpad','Polished_Graphite',root,.009)
    for side,x in [('L',-1.13),('R',1.13)]:G().box((x,.012,-.646),(.34,.15,.12)).build('Laptop_Hinge_'+side,'Titanium_Accent',root,.022)
    lid=pivot('Laptop_ScreenFrame',root);lid.location=(0,.035,-.66);lid.rotation_euler.x=math.radians(-15)
    display('Laptop',lid,2.72,1.53,.855)
    g=G();g.box((-1.18,-1.40,-.638),(.18,.015,.012));g.box((1.18,-1.40,-.638),(.18,.015,.012));g.build('Laptop_Accent','Cyan_Signal',root,.002)
    return root

def mobile():
    root=pivot('FZH_Mobile_ROOT');display('Mobile',root,.96,2.08)
    for side,z in [('Top',1.15),('Bottom',-1.15)]:panel('Mobile_'+side+'_Module',.62,.06,.09,root,(0,-.01,z),'Polished_Graphite',.005)
    return root

def export(root,name):
    stats=f.optimize_scene(root)
    # Standalone planar faces have no enclosed volume; enforce front (-Y) winding.
    for obj in root.children_recursive:
        if obj.type=='MESH' and obj.name.endswith(('_Screen','_Glass')):
            bm=bmesh.new();bm.from_mesh(obj.data)
            if sum(face.normal.y for face in bm.faces)>0:bmesh.ops.reverse_faces(bm,faces=list(bm.faces))
            bm.to_mesh(obj.data);bm.free();obj.data.update()
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [root,*root.children_recursive]:obj.select_set(True)
    file=OUT/(name+'.glb');bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False)
    stats['bytes']=file.stat().st_size;return stats

def main():
    OUT.mkdir(parents=True,exist_ok=True);f.reset_scene();m.load_materials()
    glass=f.MATS['Dark_Glass'];glass.name='Device_Glass';shader=glass.node_tree.nodes.get('Principled BSDF');shader.inputs['Alpha'].default_value=.018;shader.inputs['Transmission Weight'].default_value=0;glass.diffuse_color=(*glass.diffuse_color[:3],.018);glass.surface_render_method='DITHERED';glass.use_transparency_overlap=False;f.MATS['Device_Glass']=glass
    devices=[monitor(),laptop(),mobile()];names=['FZH_Kinetic_Monitor','FZH_Kinetic_Laptop','FZH_Kinetic_Mobile'];stats={}
    for obj,name in zip(devices,names):stats[name]=export(obj,name)
    camera=f.setup_studio();camera.location=(2,-8,2);camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=4
    bpy.context.preferences.filepaths.save_version=0
    for i,obj in enumerate(devices):obj.location.x=(i-1)*3.6
    bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'assets/blender/FZH_Kinetic_Devices.blend'))
    for obj in devices:obj.location.x=0
    preview=BASE/'.qa/project-preview.png'
    # Real project image, preview-only. Exported screens remain replaceable and neutral.
    if preview.exists():
        mat=bpy.data.materials.new('Preview_Only_Real_Project');mat.use_nodes=True;nodes=mat.node_tree.nodes;nodes.clear();tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(preview));em=nodes.new('ShaderNodeEmission');out=nodes.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(tex.outputs['Color'],em.inputs[0]);mat.node_tree.links.new(em.outputs[0],out.inputs[0])
        for prefix in ['Monitor','Laptop']:
            mesh=bpy.data.objects[prefix+'_Screen'];mesh.data.materials.clear();mesh.data.materials.append(mat)
    scene=bpy.context.scene;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.threads_mode='FIXED';scene.render.threads=4
    for obj,name in zip(devices,names):
        for other in devices:
            for o in [other,*other.children_recursive]:o.hide_render=other!=obj
        camera.location=(1.6,-8,2.6) if 'Laptop' in name else (1.5,-8,1.0);camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=3.8
        scene.render.filepath=str(BASE/'previews'/f'{name}.png');bpy.ops.render.render(write_still=True)
    (BASE/'docs/FZH_Kinetic_Devices_stats.json').write_text(json.dumps(stats,indent=2)+'\n');print('DEVICE_STATS',json.dumps(stats))
if __name__=='__main__':main()
