name = "Spikey";

author = "FilGf";

date = "2013-04-20";

source = function (grow3) {

    with (grow3) {
        background(0x443333);

        var mat1 = new THREE.MeshPhongMaterial({color: 0xbbbbbb});
        var mat2 = new THREE.MeshPhongMaterial({color: 0xddbbbb});

        maxDepth(100);

        grow3.spiral = rule(function () {
            cube(material(mat1).scale(1.2));
            spiral(pitch(-10).roll(13).move(0.6).scale(0.98));
        });

        grow3.start = rule(function () {
            for (var i = 0; i < 720; i += 15) {
                spiral(scale(0.9).yaw(i / 3).pitch(i));
            }
        });
    }

};