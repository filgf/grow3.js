name = "Spikey";

author = "FilGf";

date = "2013-04-20";

source = function (grow3) {

    with (grow3) {
        background(0x443333);

        var materials = [new THREE.MeshPhongMaterial({color: 0xbbbbbb}),
            new THREE.MeshPhongMaterial({color: 0xddbbbb})];

        maxDepth(100);

        rules({
            spiral: function () {
                cube(material(materials).scale(1.2));
                spiral(pitch(10).roll(13).move(0.6).scale(0.98));
            },

            start: function () {
                camera(move(30).yaw(90));

                for (var i = 0; i < 720; i += 15) {
                    spiral(scale(0.9).yaw(i / 3).pitch(i));
                }
            }
        });
    }

};