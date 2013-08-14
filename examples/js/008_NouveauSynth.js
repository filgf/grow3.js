name = "Nouveau Synth (inspired by Noveau from Structure Synth)";

author = "FilGf / Mikael Hvidtfeldt Christensen";

date = "2013-08-13";

source = function (grow3) {

    with (grow3) {
        var shrink = 0.996;
        var mat = new THREE.MeshPhongMaterial({color: 0xdddddd, specular: 0xffffff});
        background(0xffffff);

        maxDepth(1000);

        rules({
            start: function() {
                camera(move(15).yaw(-45).pitch(-70));
                for (var x=0; x<10; x++) {
                    material(mat).r(rZ(x*36));
                }
            },

            r: [
                function () { forward(); },
                function () { turn(); },
                function () { turn2(); },
                function () { turn3(); },
                function () { turn4(); }
            ],

            forward: function() {
                if (depth%90 == 0) {
                    r();
                } else {
                    dbox();
                    rZ(2).move(0.1).scale(shrink).forward();
                }
            },

            turn: function() {
                if (depth%90 == 0) {
                    r();
                } else {
                    dbox();
                    rZ(2).move(0.1).scale(shrink).turn();
                }
            },

            turn2: function() {
                if (depth%90 == 0) {
                    r();
                } else {
                    dbox();
                    rZ(-2).move(0.1).scale(shrink).turn2();
                }
            },

            turn3: function() {
                if (depth%90 == 0) {
                    r();
                } else {
                    dbox();
                    rY(-2).move(0.1).scale(shrink).turn3();
                }
            },

            turn4: function() {
                if (depth%90 == 0) {
                    r();
                } else {
                    dbox();
                    rY(-2).move(0.1).scale(shrink).turn4();
                }
            },

            dbox: function() {
                cube(scale(0.2, 1, 1));
            }

        });
    }

};