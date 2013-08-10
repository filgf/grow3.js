name = "Text World";

author = "FilGf";

date = "2013-04-20";

source = function (grow3) {

    with (grow3) {
        background(0x555544);
        var mats = [new THREE.MeshPhongMaterial({color: 0xaabbee}), new THREE.MeshPhongMaterial({color: 0xeeaabb}) ];

        var whitman = "Keep your face always toward the sunshine - and shadows will fall behind you. ".split("");

        maxDepth(100);

        rules({
            step: function () {
                glyphs(scale(1.3), whitman);
                step(move(1.0).pitch(3.0).roll(3.0).yaw(5.0));
            },

            msg: function () {
                step(move(1.7));
            },

            start: function () {
                //          camera(pitch(20).yaw(45).move(14));

                for (var i = 0; i < 30; i++) {
                    cube();
                    msg(pitch(rnd(180)).yaw(rnd(180)).material(rnd(mats)));
                }
            }
        });
    }

};