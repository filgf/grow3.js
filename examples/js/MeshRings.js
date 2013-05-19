name = "Text World";

author = "FilGf";

date = "2013-04-20";

source = function (grow3) {

    with (grow3) {

        var mats = [new THREE.MeshPhongMaterial({color: 0xffeeee}), new THREE.MeshPhongMaterial({color: 0x889988}) ];
        var torus = new THREE.TorusGeometry(1, 0.35, 12, 32);

        background(0x444444);
        maxDepth(5);

        rules({
            recurse: function () {
                camera(move(50).yaw(90));

                mesh(material(rnd(mats)), torus);
                for (var i = 0; i < 360; i += 30) {
                    recurse(yaw(i).scale(0.8).move(8.0).pitch(0.3 * i));
                    recurse(yaw(i).scale(0.8).move(-8.0).pitch(0.3 * i));
                }
            },

            start: function () {
                light(move(270), 0xddffdd);
                recurse();
            }
        });

        start();
    }

};