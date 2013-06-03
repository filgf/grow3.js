name = "Translation Cube";

author = "FilGf";

date = "2013-04-20";

source = function (grow3) {

    with (grow3) {
        var mats = [new THREE.MeshPhongMaterial({color: 0xeebbaa}), new THREE.MeshPhongMaterial({color: 0xbbeeaa}) ];
        maxDepth(50);

        rules({
            line: function () {
                for (var x = -5; x < 5; x++) {
                    cube(scale(0.9).move(x).roll(rnd(15)));
                }
            },

            quad: function () {
                for (var y = -5; y < 5; y++) {
                    line(tH(y));
                }
            },

            start: function () {
                for (var z = -5; z < 5; z++) {
                    quad(tV(z).material(select(mats, z)));
                }
            }
        });
    }

};