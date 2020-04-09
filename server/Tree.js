Tree = function (sizeBranch, sizeTrunk, radius, scene, sd) {

    var tree = new BABYLON.Mesh("tree" + uuidv4(), scene);
    tree.isVisible = false;

    var leaves = new BABYLON.Mesh("leaves" + uuidv4(), scene);

    var vertexData = BABYLON.VertexData.CreateSphere({segments: 2, diameter: sizeBranch});
    vertexData.applyToMesh(leaves, false);

    var positions = leaves.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    var indices = leaves.getIndices();
    var numberOfPoints = positions.length / 3;

    var map = [];

    // The higher point in the sphere
    var v3 = BABYLON.Vector3;
    var max = [];

    for (var i = 0; i < numberOfPoints; i++) {
        var p = new v3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

        if (p.y >= sizeBranch / 2) {
            max.push(p);
        }

        var found = false;
        for (var index = 0; index < map.length && !found; index++) {
            var array = map[index];
            var p0 = array[0];
            if (p0.equals(p) || (p0.subtract(p)).lengthSquared() < 0.01) {
                array.push(i * 3);
                found = true;
            }
        }
        if (!found) {
            var array = [];
            array.push(p, i * 3);
            map.push(array);
        }

    }
    var randomNumber = function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    map.forEach(function (array) {
        var index, min = -sizeBranch / 10, max = sizeBranch / 10;
        var rx = randomNumber(min, max);
        var ry = randomNumber(min, max);
        var rz = randomNumber(min, max);

        for (index = 1; index < array.length; index++) {
            var i = array[index];
            positions[i] += rx;
            positions[i + 1] += ry;
            positions[i + 2] += rz;
        }
    });

    leaves.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    var normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    leaves.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    leaves.convertToFlatShadedMesh();

    leaves.material = new BABYLON.StandardMaterial("leavesmat" + uuidv4(), scene);
    leaves.material.diffuseColor =  BABYLON.Color3.Random();
    leaves.material.specularColor = BABYLON.Color3.Black();
    leaves.position.y = sizeTrunk + sizeBranch / 2 - 2;

    var trunk = BABYLON.Mesh.CreateCylinder("trunk" + uuidv4(), sizeTrunk, radius - 2 < 1 ? 1 : radius - 2, radius, 7, 2, scene);

    trunk.position.y = sizeTrunk - sizeTrunk / 2;
    trunk.material = new BABYLON.StandardMaterial("trunkmat" + uuidv4(), scene);
    trunk.material.diffuseColor = BABYLON.Color3.Random();
    trunk.material.specularColor = BABYLON.Color3.Black();
    trunk.convertToFlatShadedMesh();
    leaves.parent = tree;
    trunk.parent = tree;

    return tree;
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = Tree;
