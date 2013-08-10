name = "Random Rule";

author = "FilGf";

date = "2013-04-20";

source = function (grow3) {

    with (grow3) {
        background(0x222222);
        var mat1 = new THREE.MeshPhongMaterial({color: 0xddccbb});
        var mat2 = new THREE.MeshPhongMaterial({color: 0xccddbb});

        maxDepth(80);

        rules({
            seg: [
                function () {
                    cube(scale(0.5));
                    seg(move(2.0).pitch(-45));
                },
                function () {
                    cube(scale(0.5).material(mat1));
                    seg(yaw(90).pitch(45).move(1.0));
                },
                function () {
                    cube(scale(0.5).material(mat2));
                    seg(yaw(-90).move(1.0));
                }
            ],

            start: function () {
                for (var i = 0; i < 35; i++) {
                    seg();
                }
            }
        });
    }

};