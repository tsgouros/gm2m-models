# TO RUN: /Applications/Blender.app/Contents/MacOS/Blender --python /Users/alex/Desktop/import_space_objects.py -- /Users/alex/Desktop/V745_combined.stl .5 .5 .5


import bpy
import sys
import os

if '--' in sys.argv:
    argv = sys.argv[sys.argv.index('--') + 1:]

extension_types = { ".stl":bpy.ops.import_mesh.stl,
                    ".glb":bpy.ops.import_scene.gltf,
                    ".gltf":bpy.ops.import_scene.gltf,
                    ".fbx:":bpy.ops.import_scene.fbx,
                    ".obj":bpy.ops.import_scene.obj
                    }
# remove initial cube from scene.
bpy.data.objects.remove(bpy.data.objects["Cube"], do_unlink=True)

def import_object(path):
    # first split the path and get the extension
    split_path = os.path.splitext(path)
    print(split_path)

    # check if path is acceptable...
    if split_path[1] in extension_types:
        # import the object...
        extension_types[split_path[1]](filepath=path)
        print(bpy.context.selected_objects)

        # return the new object.
        new_obj = bpy.context.selected_objects[0]
        return new_obj
    else:
        print(path)
        print("incorrect extension type")

def create_material(r, g, b):
    # create a material
    new_mat = bpy.data.materials.new(name="space_material")

    new_mat.use_nodes = True
    nodes = new_mat.node_tree.nodes

    # the main material node
    pbdsf = nodes[0]#nodes.get("Principled BSDF")
    print(pbdsf)

    # setting the color and other material aspects.
    pbdsf.inputs[0].default_value = (r, g, b, 1.0) # color value
    # other changes can go here.

    return new_mat


def add_material(obj, mat):
    obj.data.materials.append(mat)

def export_scene(obj):
    fp = "/Users/alex/Desktop/" + obj.name + ".glb"
    print(fp)
    return bpy.ops.export_scene.gltf(export_format='GLB', filepath=fp)



def main():
    # pathtoobject, r, g, b
    print(argv)
    if len(argv) != 4:
        print("not enough arguments: import_space_object.py [path] [r value (0-1.0)] [g value (0-1.0)] [b value (0-1.0)]")
        sys.exit()

    # Get our imported object.
    new_obj = import_object(argv[0])
    print(new_obj)

    # create a new material.
    new_mat = create_material(float(argv[1]),float(argv[2]),float(argv[3]))
    print(new_mat)

    # adding the material to the object.
    add_material(new_obj, new_mat)

    # Export the scene as a glb file.
    export_scene(new_obj)



if __name__ == "__main__":
    main()
