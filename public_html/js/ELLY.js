// (C) Philipp Graf

var ELLY = ELLY || {};

ELLY.System = (function() {
    var standardMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

    State = function(parent) {
        this.objectProto = new THREE.Object3D();
        this.text = "";
        this.textParamId = undefined;
        if (parent === undefined) {
            this.material = standardMaterial;
            this.textParam = { size : 1.0, height : 0.3, curveSegments : 2, font : "helvetiker" };
        } else {
            this.material = parent.material;
            this.textParam = parent.textParam;
        }
    };

    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);

    var system = function(scene, script) {
        this.scene = scene;
        this.script = script;

        this.prefixCode = "";

        this.backlog = [];
        this.backlogBuild = [];

        this.mDepth = 20;
        this.depth = 0;

        this.state = new State();
        this.scene.add(this.state.objectProto);
                
        this.buildRules = true;
        this.rule("cube", cubeFun);
        this.rule("glyphs", glyphsFun);
        
    };
    
    system.prototype.constructor = system;
    
    system.prototype.toString = function() {
        return "[ELLY.System]";
    };
    
    system.prototype.maxDepth = function(md) {
        this.mDepth = md;
    }
    
    system.prototype.rule = function (name, func) {

        this[name] = function(transforms, isRoot) {
            if (this.buildRules === true) {
                return this;
            }
            
            if (isRoot === true) {
                saveState = this.state;
                this.state = new State(saveState);
                saveState.objectProto.add(this.state.objectProto);
                this.evalTransforms(transforms);

                if (typeof(func) === "function") {
                    func.call(this);
                } else {        // TODO: Check type
                    var index = Math.floor(Math.random() * func.length);
                    func[index].call(this);
                }
                this.state = saveState;
            } else if (this.depth < this.mDepth) {
                this.backlogBuild.push([name, transforms, this.state]);
            }
            return this;            // method chain
        };
    };
    
    system.prototype.rules = function(map) {
        for (var e in map) {
            this.rule(e, map[e]);
        }
    };
    
    system.prototype.evalTransforms = function(transforms) {
        for(t in transforms) {
            if (t in this) {
                var trans = transforms[t];
                if( Array.isArray(trans) ) {
                    if (trans.startDepth === undefined) {
                        trans.startDepth = this.depth;
                    }
                    this[t].call(this, trans[(this.depth - trans.startDepth) % trans.length]);
                } else {
                    this[t].call(this, trans);
                }
            } else {
                console.warn("Skipping unknown transform \"" + t +"\".");
            }
        }
    };
    
    system.prototype.buildPrefixCode = function() {
        this.prefixCode = "var that = this;\n";
        for (var id in this) {
            try {
               if (typeof(this[id]) === "function") {
                    this.prefixCode += "var " + id + " = function() { return that." + id + ".apply(that, arguments); }\n";
               }
            } catch (err) { }    // ignore inaccessible
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
        console.log(code);
        new Function(code).call(this);
        
        this.depth = 0;
        
        do {
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];   

            while (this.backlog.length > 0) {
//                console.log("[RULE] " + this.backlog[0] + ":" + this.depth + ":" + this.backlog.length);
                var entry = this.backlog.shift();
                this.state = entry[2];
                this[entry[0]].call(this, entry[1], true);
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
                r = r * (p2-p1) + p1;
            } else {
                r = r * 2 * p1 - p1;
            }
        }
        return r;
    }
    
    
    
    /*
     * Move forward (scale sensitive)
     */
     system.prototype.move = function(amount) {
        this.state.objectProto.position.x += amount;
    };

    system.prototype.m = system.prototype.move; 
    
    system.prototype.transHoriz = function(amount) {
        this.state.objectProto.position.y += amount;
    };

    system.prototype.tH = system.prototype.transHoriz; 
    
    system.prototype.transVert = function(amount) {
        this.state.objectProto.position.z += amount;
    };

    system.prototype.tV = system.prototype.transVert; 
    

    
    /*
     * Change scale by factor amount
     */
     system.prototype.scale = function(amount) {
        this.state.objectProto.scale.multiplyScalar(amount);
    };
    
    system.prototype.s = system.prototype.scale;
    
    // pitch roll yaw
     system.prototype.roll = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.x += angle;
    };
    
    system.prototype.rX = system.prototype.roll;
    
     system.prototype.yaw = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.y += angle;
    };

    system.prototype.rY = system.prototype.yaw;

     system.prototype.pitch = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.z += angle;
    };
    
    system.prototype.rZ = system.prototype.pitch;

    system.prototype.material = function(mat) {
        this.state.material = mat;
    };

    system.prototype.text = function(s) {
        this.state.text = s;
    }
    
    system.prototype.textParam = function(o) {
        if (this.textParam !== o) {
            this.textParamId = undefined;
        }
        this.textParam = o;
    }

     var cubeFun = function() {
        var cube = new THREE.Mesh(cubeGeometry, this.state.material);
        this.state.objectProto.clone(cube);
        this.state.objectProto.parent.add(cube);
    };

    var glyphsCache = {};
    
    var centerX = function ( geometry ) {
        geometry.computeBoundingBox();
        var bb = geometry.boundingBox;
        var offsetX = -0.5 * (bb.min.x + bb.max.x);
        geometry.applyMatrix( new THREE.Matrix4().makeTranslation( offsetX, 0, 0 ) );
        geometry.computeBoundingBox();

        return offsetX;
    };
    
    var glyphsFun = function() {
        var p = this.state.textParam;
        if (this.state.textParamId === undefined) {
            this.state.textParamId = p.font + ":" + p.size + ":" + p.height + ":" + p.curveSegments;
            glyphsCache[this.state.textParamId] = glyphsCache[this.state.textParamId] || {};
        }
        
        if (this.state.text !== " ") {
            if (!glyphsCache[this.state.textParamId].hasOwnProperty(this.state.text)) {
                var geo = new THREE.TextGeometry(this.state.text, this.state.textParam);  
                centerX( geo );  // TODO: Center X (-> Monospace, preserve baselines)
                glyphsCache[this.state.textParamId][this.state.text] = geo;
            }
            
            var glyph = new THREE.Mesh(glyphsCache[this.state.textParamId][this.state.text], this.state.material);
            this.state.objectProto.clone(glyph);
            this.state.objectProto.parent.add(glyph);
        }
    };
    
    return system;
    
})();

