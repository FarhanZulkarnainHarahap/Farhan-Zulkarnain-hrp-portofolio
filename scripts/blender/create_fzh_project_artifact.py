"""Asset 04. Blender 4.5. Run from web; reuses Asset 01 materials read-only."""
import importlib.util, json, math, hashlib
from pathlib import Path
import bpy
BASE=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('matrix',Path(__file__).with_name('create_fzh_capability_matrix.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
f=m.fzh;G=f.Geometry;plate=m.plate;pivot=f.pivot
OUT=BASE/'public/models/projects'

def create_artifact():
    root=pivot('PROJECT_ROOT')
    plate(G(),3.32,2.05,.15,.23).build('Artifact_Chassis','Dark_Matte',root,.025)
    frame=G()
    # Four independent rim segments keep the screenshot exposed.
    for z in [-.94,.94]:plate(frame,3.25,.15,.065,.13,(0,-.13,z))
    for x in [-1.55,1.55]:plate(frame,.15,1.76,.045,.13,(x,-.13,0))
    frame.build('Artifact_Frame','Brushed_Gunmetal',root,.012)
    screen=G()
    for z in [-.785,.785]:screen.box((0,-.17,z),(2.87,.045,.045))
    for x in [-1.435,1.435]:screen.box((x,-.17,0),(.045,.045,1.56))
    screen.build('Screen_Frame','Polished_Graphite',root,.006)
    m.uv_plane('Screenshot_Plane',2.8,1.575,-.193,root)
    glass=f.MATS['Dark_Glass'];glass.name='Screen_Glass_Subtle'
    bsdf=glass.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Transmission Weight'].default_value=0;bsdf.inputs['Alpha'].default_value=.035
    glass.diffuse_color=(*glass.diffuse_color[:3],.035);glass.surface_render_method='DITHERED';glass.use_transparency_overlap=False
    f.MATS['Screen_Glass_Subtle']=glass
    m.uv_plane('Screen_Glass',2.8,1.575,-.201,root,'Screen_Glass_Subtle')
    for name,x in [('Left_Rail',-1.68),('Right_Rail',1.68)]:
        rail=pivot(name,root);g=G()
        for i in range(3):plate(g,.12,.49,.04,.19,(x,-.025,(i-1)*.58))
        g.build(name+'_Segments','Brushed_Gunmetal',rail,.012)
    tech=pivot('Tech_Slot_Group',root)
    for i in range(5):plate(G(),.16,.065,.015,.032,((i-2)*.23,-.212,-.944)).build(f'Tech_Slot_{i+1:02}','Cyan_Signal',tech,.004)
    status=pivot('Status_Module',root)
    plate(G(),.36,.115,.03,.055,(1.05,-.195,-.94)).build('Status_Display_Surface','Polished_Graphite',status,.006)
    G().box((1.26,-.23,-.94),(.055,.012,.035)).build('Status_Light','Cyan_Signal',status,.005)
    plate(G(),.62,.11,.025,.055,(-1.03,-.195,-.94)).build('Project_Index_Surface','Polished_Graphite',root,.004)
    accent=G()
    for x in [-1.55,1.55]:
        for z in [-.64,.64]:accent.box((x,-.211,z),(.015,.012,.21))
    accent.build('Accent_Light','Cyan_Signal',root,.003)
    details=G()
    for x in [-1.55,1.55]:
        for i in range(11):details.box((x,-.205,(i-5)*.084),(.055,.018,.019))
    for z in [-.94,.94]:
        for i in range(12):details.box(((i-5.5)*.115,-.205,z),(.036,.02,.018))
    details.build('Detail_Plates','Titanium_Accent',root,.003)
    port=G()
    for i in range(4):port.arc(.075,.022,.045,i*math.tau/4+.04,(i+1)*math.tau/4-.04,.06,steps=16)
    obj=port.build('Connector_Module','Polished_Graphite',root,.004);obj.location.z=-1.08
    back=G()
    for z in [-.7,0,.7]:plate(back,2.78,.08,.02,.065,(0,.145,z))
    for x in [-1.2,1.2]:plate(back,.09,1.53,.025,.045,(x,.18,0))
    back.build('Mechanical_Back','Polished_Graphite',root,.006)
    anchor=pivot('Connection_Anchor',root);anchor.location=(0,.06,-1.08)
    return root

def create_rail():
    root=pivot('Project_Rail');g=G();signal=G()
    for i in range(9):
        plate(g,.69,.12,.025,.10,((i-4)*.73,.25,-1.42))
        signal.box(((i-4)*.73,.187,-1.42),(.47,.009,.012))
    g.build('Rail_Segments','Polished_Graphite',root,.004);signal.build('Rail_Data_Trace','Cyan_Signal',root,.001)
    for i,x in enumerate([-2.4,0,2.4]):plate(G(),.26,.23,.04,.12,(x,.20,-1.29)).build(f'Dock_{i+1:02}','Brushed_Gunmetal',root,.006)
    return root

def export(root,name):
    stats=f.optimize_scene(root);bpy.ops.object.select_all(action='DESELECT')
    for o in [root,*root.children_recursive]:o.select_set(True)
    file=OUT/(name+'.glb');bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False)
    stats['bytes']=file.stat().st_size;return stats

def main():
    reference=BASE/'assets/blender/FZH_Hero_Kinetic_Core.blend';digest=hashlib.sha256(reference.read_bytes()).hexdigest()
    OUT.mkdir(parents=True,exist_ok=True);f.reset_scene();m.load_materials();artifact=create_artifact();rail=create_rail()
    stats={'artifact':export(artifact,'FZH_Project_Artifact'),'rail':export(rail,'FZH_Project_Rail')}
    camera=f.setup_studio();camera.data.ortho_scale=4.1
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'assets/blender/FZH_Project_Artifact.blend'))
    # A genuine existing project screenshot is used only in preview renders.
    path=BASE/'.qa/project-preview.png'
    if path.exists():
        plane=bpy.data.objects['Screenshot_Plane'];mat=bpy.data.materials.new('Preview_Only_Screenshot');mat.use_nodes=True
        nodes=mat.node_tree.nodes;nodes.clear();tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path));em=nodes.new('ShaderNodeEmission');out=nodes.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);mat.node_tree.links.new(em.outputs[0],out.inputs[0]);plane.data.materials.clear();plane.data.materials.append(mat)
    scene=bpy.context.scene;scene.render.resolution_x=1400;scene.render.resolution_y=900
    def render(name,loc,scale):
        camera.location=loc;camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale
        scene.render.filepath=str(BASE/'previews'/f'{name}.png');bpy.ops.render.render(write_still=True)
    render('FZH_Project_Artifact_front',(0,-8,.1),4.2)
    render('FZH_Project_Artifact_angle',(3,-8,2.5),4.7)
    sides=[]
    for sign in [-1,1]:
        obj=m.duplicate_tree(artifact);obj.location=(sign*2.47,.42,.18);obj.scale=(.55,)*3;obj.rotation_euler.z=sign*.1;sides.append(obj)
    render('FZH_Project_Vault_idle',(0,-10,1.3),7.1)
    artifact.location.y=-.12;artifact.scale=(1.045,)*3
    bpy.data.objects['Left_Rail'].location.x=-.022;bpy.data.objects['Right_Rail'].location.x=.022
    render('FZH_Project_Vault_hover',(.4,-10,1.1),7.1)
    artifact.location.y=-.25;artifact.scale=(1.12,)*3
    for obj in sides:obj.location.y=.65
    render('FZH_Project_Vault_selected',(0,-10,.25),7.1)
    assert digest==hashlib.sha256(reference.read_bytes()).hexdigest()
    (BASE/'docs/FZH_Project_Artifact_stats.json').write_text(json.dumps(stats,indent=2)+'\n');print('PROJECT_STATS',json.dumps(stats))
if __name__=='__main__':main()
