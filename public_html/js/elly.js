// (C) Philipp Graf

var ELLY = ELLY || {};

ELLY.System = (function() {
    var standardMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

    State = function() {
        this.objectProto = new THREE.Object3D();
        this.material = standardMaterial;
    };

    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);

    var system = function(scene, script, maxDepth) {
        this.scene = scene;
        this.script = script;

        this.prefixCode = "";

        this.backlog = [];
        this.backlogBuild = [];

        this.maxDepth = maxDepth || 20;
        this.depth = 0;

        this.state = new State();
        this.scene.add(this.state.objectProto);
                
        this.buildRules = true;
        this.rule("cube", cubeFun);
        
        
    };
    
    system.prototype.constructor = system;
    
    system.prototype.toString = function() {
        return "[ELLY.System]";
    };
    
    
    system.prototype.rule = function (name, code) {
//        console.debug("4: " + this + " - " + name + " - " + code);
        this[name] = function(transforms, isRoot) {
//            console.debug("1: " + this + " - " + name + " - " + this.buildRules + " - " + this.depth + " - " + isRoot);
            if (this.buildRules === true) {
                return this;
            }
            
            if (isRoot === true) {
                saveState = this.state;
                this.state = new State();
                saveState.objectProto.add(this.state.objectProto);
                this.evalTransforms(transforms);
                code.call(this);
//                eval(this.prefixCode + code);
                this.state = saveState;
            } else if (this.depth < this.maxDepth) {
                this.backlogBuild.push([name, transforms, this.state]);
            }
            return this;            // method chain
        };

        return nop;
    };
    
    system.prototype.rules = function(map) {
        for (var e in map) {
            this.rule(e, map[e]);
        }
    };
    
    
    
    
    var nop = new Function();
    
    system.prototype.evalTransforms = function(transforms) {
        for(t in transforms) {
            if (t in this) {
                this[t].call(this, transforms[t]);
            } else {
                console.warn("Skipping unknown transform \"" + t +"\".");
            }
        }
    };
             
    
    system.prototype.buildPrefixCode = function() {
        this.prefixCode = "var that = this;\n";
        for (var id in this) {
        //    if (m !== "")
//             this.prefixCode += "var " + m + " = this." + m + ";\n";
            if (id instanceof Function) {
                this.prefixCode += callWrapperFor(m);
            }
            try {
               if (typeof(this[id]) === "function") {
                    this.prefixCode += callWrapperFor(id);
               }
             } catch (err) {
                  // inaccessible
            }
        }

    //    console.debug(prefixCode);
    };
    
    function callWrapperFor(name) {
        return "var " + name + " = function() { return that." + name + ".apply(that, arguments); }\n";
    }
    
    /*
     * Start evaluation
     */
    system.prototype.trigger = function() {
//         console.debug("2: " + this);

//        this.backlog.push([this[name], {}, this.state]);
        this.scene.add(this.state.objectProto);
//        eval(prefixCode + this.script);  // builds first backlog entry!

        this.buildRules = true;
        this.buildPrefixCode();
        var code = this.prefixCode + this.script;
        new Function(code).call(this);

        this.buildRules = false;
        this.buildPrefixCode();
        code = this.prefixCode + this.script + "start();\n";
        new Function(code).call(this);
        
        this.depth = 0;
        
        do {
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];   

            while (this.backlog.length > 0) {
                console.log("[RULE] " + this.backlog[0] + ":" + this.depth + ":" + this.backlog.length);
                var entry = this.backlog.shift();
                this.state = entry[2];
                this[entry[0]].call(this, entry[1], true);
            }
            
        } while (this.backlogBuild.length > 0);
    };
    
    
    /*
     * Move forward (scale sensitive)
     */
     system.prototype.move = function(amount) {
        this.state.objectProto.position.x += amount;
    };

     system.prototype.mv = system.prototype.move; 
    
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


     var cubeFun = function() {
        var cube = new THREE.Mesh(cubeGeometry, this.state.material);
        this.state.objectProto.clone(cube);
        this.state.objectProto.parent.add(cube);
    };


    
    return system;
    
})();

