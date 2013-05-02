// (C) Philipp Graf 2013

var grow3 = grow3 || {};


grow3.State = (function() {    
    var standardMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});
    
    var state = function(parent, sys) {
        this.objectProto = new THREE.Object3D();
        this.txt = "O";
        this.textParamId = undefined;
        this.sys = sys;
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

    var buildTransform = function(fun) {
        return function(param) {
            if (Array.isArray(param)) {
                if (param.startDepth === undefined) {
                    param.startDepth = this.sys.depth;
                }
                fun.call(this, param[(this.sys.depth - param.startDepth) % param.length]);
            } else {
                fun.call(this, param);
            }
            return this;
        };
    };

   /*
     * Move forward (scale sensitive)
     */
    state.prototype.move = buildTransform(function(amount) {
        this.objectProto.position.x += amount;
    });

    state.prototype.m = state.prototype.move;

    state.prototype.transHoriz = buildTransform(function(amount) {
        this.objectProto.position.y += amount;
    });

    state.prototype.tH = state.prototype.transHoriz;

    state.prototype.transVert = buildTransform(function(amount) {
        this.objectProto.position.z += amount;
    });

    state.prototype.tV = state.prototype.transVert;

    /*
     * Change scale by factor amount
     */
    state.prototype.scale = buildTransform(function(amount) {
        this.objectProto.scale.multiplyScalar(amount);
    });

    state.prototype.s = state.prototype.scale;

    // pitch roll yaw
    state.prototype.roll = buildTransform(function(angle) {
        angle = angle * Math.PI / 180.0;
        this.objectProto.rotation.x += angle;
    });

    state.prototype.rX = state.prototype.roll;

    state.prototype.yaw = buildTransform(function(angle) {
        angle = angle * Math.PI / 180.0;
        this.objectProto.rotation.y += angle;
    });

    state.prototype.rY = state.prototype.yaw;

    state.prototype.pitch = buildTransform(function(angle) {
        angle = angle * Math.PI / 180.0;
        this.objectProto.rotation.z += angle;
    });

    state.prototype.rZ = state.prototype.pitch;

    state.prototype.material = buildTransform(function(mat) {
        this.mat = mat;
    });

    state.prototype.text = buildTransform(function(s) {
        this.txt = s;
    });

    state.prototype.textParam = buildTransform(function(o) {
        if (this.textParam !== o) {
            this.textParamId = undefined;
        }
        this.textParam = o;
    });


    return state;


})();

grow3.System = (function() {
 
    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);

    var system = function(scene, script, camera /* optional */) {
        this.scene = scene;
        this.script = script;

        this.prefixCode = "";

        this.backlog = [];
        this.backlogBuild = [];

        this.mDepth = 20;
        this.depth = 0;

        this.state = this.rollback = new grow3.State(undefined, this);
        this.parent = new grow3.State(undefined, this);
        this.parent.objectProto = scene;
        
        this.scene.add(this.state.objectProto);

        this.cameraObj = camera;

        this.backgroundColor = 0xcccccc;

        this.buildRules = true;
        this.rule("cube", cubeFun);
        this.rule("glyphs", glyphsFun);

        this.rule("camera", cameraFun);

    };

    system.prototype.constructor = system;

    system.prototype.toString = function() {
        return "[grow3.System]";
    };

    system.prototype.maxDepth = function(md) {
        this.mDepth = md;
    };

    system.prototype.rule = function(name, func) {

        this[name] = function(theThis /* unused */, isRoot) {
            if (this.buildRules === true) {
                return this;
            }

            if (isRoot === true) {
                // jetziger State zum Parent hinzu
                this.parent = this.state;
                this.rollback = new grow3.State(this.state, this);         // Vorlage für Rollbacks
                this.state = this.rollback.clone() ;  // Nächster State (f. Unterfunkt)!
                
                
                // rollbackpoint + neue ebene

                if (typeof(func) === "function") {
                    func.call(this);
                } else {        // TODO: Check if array
                    var index = Math.floor(Math.random() * func.length);
                    func[index].call(this);
                }
            } else if (this.depth < this.mDepth) {
                this.backlogBuild.push([name, this.state]);  // inkl. Trafo ausgewertet
                this.parent.objectProto.add(this.state.objectProto);
                
                this.state = this.rollback.clone();               // Wieder Vorlage (rollback)
            }
            return this;            // method chain
        };
    };

    system.prototype.rules = function(map) {
        for (var e in map) {
            this.rule(e, map[e]);
        }
    };


    system.prototype.buildPrefixCode = function() {
        this.prefixCode = "var that = this;\n";
        for (var id in this) {
            try {
                if (typeof(this[id]) === "function") {
                    this.prefixCode += "var " + id + " = function() { return that." + id + ".apply(that, arguments); }\n";
                }
            } catch (err) {
            }    // ignore inaccessible
        }
        
        for (var id in grow3.State.prototype) {
            try {
                if (typeof(grow3.State.prototype[id]) === "function") {
                    this.prefixCode += "var " + id + " = function() { return that.state." + id + ".apply(that.state, arguments); }\n";
                }
            } catch (err) {
            }    // ignore inaccessible
        }
  
    };

    /*
     * Start evaluation
     */
    system.prototype.trigger = function(start) {

        start = start || "start";
        this.scene.add(this.state.objectProto);

        this.buildRules = true;
        this.buildPrefixCode();
        var code = this.prefixCode + this.script;
        var f = new Function(code);
        f.call(this);

        this.buildRules = false;
        this.buildPrefixCode();
        code = this.prefixCode + this.script + "; start();\n";
//        console.log(code);
        new Function(code).call(this);

        this.depth = 0;

        do {
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];

            while (this.backlog.length > 0) {
//                console.log("[RULE] " + this.backlog[0] + ":" + this.depth + ":" + this.backlog.length);
                var entry = this.backlog.shift();
                this.state = entry[1];
                this[entry[0]].call(this, this, true);
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


 


    system.prototype.background = function(col) {
        this.backgroundColor = col;
    };

    var cubeFun = function() {
        var cube = new THREE.Mesh(cubeGeometry, this.state.mat);
        this.parent.objectProto.clone(cube);
        this.parent.objectProto.parent.add(cube);
    };


    var centerX = function(geometry) {
        geometry.computeBoundingBox();
        var bb = geometry.boundingBox;
        var offsetX = -0.5 * (bb.min.x + bb.max.x);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(offsetX, 0, 0));
        geometry.computeBoundingBox();

        return offsetX;
    };

    var glyphsCache = {};

    var glyphsFun = function() {
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
    };

    var cameraFun = function() {
        if (this.cameraObj !== undefined) {
            if (this.cameraObj.parent !== undefined) {
                this.cameraObj.parent.remove(this.cameraObj);
            }
            this.parent.objectProto.clone(this.cameraObj);  // update cam with trafo
            this.cameraObj.lookAt(0);
            this.parent.objectProto.parent.add(this.cameraObj);
        }
    };


    return system;

})();

