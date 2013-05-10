// (C) Philipp Graf 2013

var grow3 = grow3 || {};

grow3.State = (function() {
    var standardMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

    var state = function(parent) {
        this.objectProto = new THREE.Object3D();
        this.objectProto.matrixAutoUpdate = false;
        
        this.txt = "";
        this.textParamId = undefined;
        if (parent === undefined) {
            this.mat = standardMaterial;
            this.textParam = {size: 1.0, height: 0.3, curveSegments: 2, font: "helvetiker"};
        } else {
            this.mat = parent.mat;
            this.textParam = parent.textParam;
        }
    };
    state.prototype.constructor = state;

    state.prototype.clone = function() {
        var o = new grow3.State(this, this.sys);
        this.objectProto.clone(o.objectProto);
        return o;
    };

    return state;
})();

grow3.System = (function() {

    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);

    var system = function(scene, script /* optional */, camera /* optional */) {
        this.scene = scene;
        this.script = script;

        this.backlog = [];
        this.backlogBuild = [];

        this.mDepth = 20;
        this.depth = 0;

        this.state = this.rollback = new grow3.State(undefined);
        this.state.objectProto.matrixAutoUpdate = true;

        this.parent = new grow3.State(undefined);
        this.parent.objectProto = scene;

        this.scene.add(this.state.objectProto);

        this.cameraObj = camera;

        this.backgroundColor = 0xcccccc;



    };

    system.prototype.constructor = system;

    system.prototype.toString = function() {
        return "[grow3.System]";
    };

    system.prototype.maxDepth = function(md) {
        this.mDepth = md;
    };

    system.prototype.rule = function(func) {

        var fnew = function(isRoot) {

            if (isRoot === true) {
                this.parent = this.state;                                  // aktueller state -> parent f. folgende 
                this.rollback = new grow3.State(this.state);               // Vorlage für Rollbacks
                this.state = this.rollback.clone();                        // Nächster State (f. Unterfunkt)!

                if (typeof(func) === "function") {
                    func.call(this);
                } else {        // TODO: Check if array
                    var index = Math.floor(Math.random() * func.length);
                    func[index].call(this);
                }
            } else if (this.depth < this.mDepth) {
                this.backlogBuild.push([fnew, this.state]);                 // inkl. Trafo ausgewertet
                this.parent.objectProto.add(this.state.objectProto);

                this.state = this.rollback.clone();                         // Wieder Vorlage (rollback)
            }
            return this;
        };

        return fnew;
    };



    system.prototype.rules = function(map) {
        for (var e in map) {
            this[e] = this.rule(map[e]);
        }
    };

    /*
     * Start evaluation
     */
    system.prototype.trigger = function(start) {

        if (this.script !== undefined) {
            this.script.call(this, this);
        }

        start = start || "start";
        this.scene.add(this.state.objectProto);

        this.depth = 0;

        this.backlogBuild.push([this[start], this.state]);
  //      this[start].call(this, this, false);

        do {
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];

            while (this.backlog.length > 0) {
//                console.log("[RULE] " + this.backlog[0] + ":" + this.depth + ":" + this.backlog.length);
                var entry = this.backlog.shift();
                this.state = entry[1];
                entry[0].call(this, true);
            }

        } while (this.backlogBuild.length > 0);
    };

    system.prototype.rnd = function(p1, p2) {
        var r = Math.random();
        if (Array.isArray(p1)) {
            return p1[Math.floor(r * p1.length)];
        }

        if (!(p1 === undefined)) {
            if (!(p2 === undefined)) {
                r = r * (p2 - p1) + p1;
            } else {
                r = r * 2 * p1 - p1;
            }
        }
        return r;
    };

    system.prototype.select = function(arr, index) {
        var size = arr.length;
        var i = index % size;
        i =  i<0 ? i+size : i;
        return arr[i];
    };

    system.prototype.background = function(col) {
        this.backgroundColor = col;
    };

    var rule = system.prototype.rule;

    system.prototype.cube = rule(function() {
        var cube = new THREE.Mesh(cubeGeometry, this.state.mat);
        this.parent.objectProto.clone(cube);
        this.parent.objectProto.parent.add(cube);
    });


    var centerX = function(geometry) {
        geometry.computeBoundingBox();
        var bb = geometry.boundingBox;
        var offsetX = -0.5 * (bb.min.x + bb.max.x);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(offsetX, 0, 0));
        geometry.computeBoundingBox();

        return offsetX;
    };

    var glyphsCache = {};

    system.prototype.glyphs = rule(function() {
        var p = this.parent.textParam;
        if (this.parent.textParamId === undefined) {                                         // Font change -> check if cache exists & build
            this.parent.textParamId = p.font + ":" + p.size + ":" + p.height + ":" + p.curveSegments;
            glyphsCache[this.parent.textParamId] = glyphsCache[this.parent.textParamId] || {};
        }

        if (this.parent.txt !== " ") {
            if (!glyphsCache[this.parent.textParamId].hasOwnProperty(this.parent.txt)) {     // Build (cached) text geometry
                var geo = new THREE.TextGeometry(this.parent.txt, this.parent.textParam);
                centerX(geo);
                glyphsCache[this.parent.textParamId][this.parent.txt] = geo;
            }

            var glyph = new THREE.Mesh(glyphsCache[this.parent.textParamId][this.parent.txt], this.parent.mat);
            this.parent.objectProto.clone(glyph);
            this.parent.objectProto.parent.add(glyph);
        }
    });

    system.prototype.camera = rule(function() {
        if (this.cameraObj !== undefined) {
            if (this.cameraObj.parent !== undefined) {
                this.cameraObj.parent.remove(this.cameraObj);
            }
            this.parent.objectProto.clone(this.cameraObj);  // update cam with trafo
            this.cameraObj.lookAt(0);
            this.cameraObj.matrixAutoUpdate = true;
//            this.parent.objectProto.parent.add(this.cameraObj);
            this.scene.add(this.cameraObj);
        }
    });

//    this.rule("glyphs", glyphsFun);

  //  this.rule("camera", cameraFun);

    /*
     *********** Modifiers
     */
    var buildTransform = function(fun) {
        return function(param) {
            if (Array.isArray(param)) {
                if (param.startDepth === undefined) {
                    param.startDepth = this.depth;
                }
                fun.call(this, param[(this.depth - param.startDepth) % param.length]);
            } else {
                fun.call(this, param);
            }
            return this;
        };
    };

    /*
     * Move forward (scale sensitive)
     */
    var trafo4 = new THREE.Matrix4();

    system.prototype.move = buildTransform(function(amount) {
        trafo4.makeTranslation(amount, 0, 0);
        this.state.objectProto.matrix.multiplyMatrices(trafo4, this.state.objectProto.matrix);
//        this.state.objectProto.position.x += amount;
    });

    system.prototype.m = system.prototype.move;

    system.prototype.transHoriz = buildTransform(function(amount) {
        trafo4.makeTranslation(0, amount, 0);
        this.state.objectProto.matrix.multiplyMatrices(trafo4, this.state.objectProto.matrix);
//        this.state.objectProto.position.y += amount;
    });

    system.prototype.tH = system.prototype.transHoriz;

    system.prototype.transVert = buildTransform(function(amount) {
        trafo4.makeTranslation(0, 0, amount);
        this.state.objectProto.matrix.multiplyMatrices(trafo4, this.state.objectProto.matrix);
//        this.state.objectProto.position.z += amount;
    });

    system.prototype.tV = system.prototype.transVert;

    /*
     * Change scale by factor amount
     */
    system.prototype.scale = buildTransform(function(amount) {
        trafo4.makeScale(amount, amount, amount);
        this.state.objectProto.matrix.multiplyMatrices(trafo4, this.state.objectProto.matrix);
//        this.state.objectProto.scale.multiplyScalar(amount);
    });

    system.prototype.s = system.prototype.scale;

    // pitch roll yaw
    system.prototype.roll = buildTransform(function(angle) {
        angle = angle * Math.PI / 180.0;
        trafo4.makeRotationX(angle);
        this.state.objectProto.matrix.multiplyMatrices(trafo4, this.state.objectProto.matrix);
//        this.state.objectProto.rotation.x += angle;
    });

    system.prototype.rX = system.prototype.roll;

    system.prototype.yaw = buildTransform(function(angle) {
        angle = angle * Math.PI / 180.0;
        trafo4.makeRotationY(angle);
        this.state.objectProto.matrix.multiplyMatrices(trafo4, this.state.objectProto.matrix);
//        this.state.objectProto.rotation.y += angle;
    });

    system.prototype.rY = system.prototype.yaw;

    system.prototype.pitch = buildTransform(function(angle) {
        angle = angle * Math.PI / 180.0;
        trafo4.makeRotationZ(angle);
        this.state.objectProto.matrix.multiplyMatrices(trafo4, this.state.objectProto.matrix);
//        this.state.objectProto.rotation.z += angle;
    });

    system.prototype.rZ = system.prototype.pitch;

    system.prototype.material = buildTransform(function(mat) {
        this.state.mat = mat;
    });

    system.prototype.text = buildTransform(function(s) {
        this.state.txt = s;
    });

    system.prototype.textParam = buildTransform(function(o) {
        if (this.state.textParam !== o) {
            this.state.textParamId = undefined;
        }
        this.state.textParam = o;
    });

    return system;
})();

