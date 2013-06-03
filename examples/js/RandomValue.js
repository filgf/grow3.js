name = "Random Value";

author = "FilGf";

date = "2013-04-20";

source = function (grow3) {

    with (grow3) {
        background(0xcccccc);
        var mats = [new THREE.MeshPhongMaterial({color: 0x444444}), new THREE.MeshPhongMaterial({color: 0x888888}) ];

        maxDepth(50);

        rules({
            seg: function () {
                sphere(scale(1.5).material(mats));
                seg(move(0.9).scale(0.97).roll(rnd(-5, 5)).pitch(rnd(30.0)));
            },

            start: function () {
                for (var i = 0; i < 60; i++) {
                    seg(yaw(rnd(360)).move(0.9).roll(rnd(-5, 5)).pitch(rnd(-30.0, 30.0)));
                }
            }
        });
    }

};