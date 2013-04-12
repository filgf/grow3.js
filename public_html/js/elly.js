var ELLY = ELLY || {};

ELLY.State = function() {
    this.objectProto = new THREE.Object3D();
    
};

ELLY.State.prototype = {
   constructor : ELLY.State 
};



ELLY.System = (function() {
    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

    
    var m =  function(scene, maxDepth) {
        this.scene = scene;

        this.backlog = [];
        this.backlogBuild = [];

        this.maxDepth = maxDepth || 10;
        this.depth = 0;

        this.state = new ELLY.State();
        this.scene.add(this.state.objectProto);
    }
    
    m.prototype.constructor = m;
    
    m.prototype.rule = function(name, code) {
        
        this[name] = function(transforms, isRoot) {
            if (isRoot === true) {
                saveState = this.state;
                this.state = new ELLY.State();
                saveState.objectProto.add(this.state.objectProto);
                
                this.evalTransforms(transforms);
                if (typeof code == 'string' || code instanceof String) {
                    new Function(code).call(this);
                } else {
                    code.call(this);
                }
                this.state = saveState;
            } else if (this.depth < this.maxDepth) {
                this.backlogBuild.push([name, transforms, this.state]);
            }
            return this;            // method chain
        };
    };
    
   
    m.prototype.evalTransforms = function(transforms) {
        for(t in transforms) {
            if (t in this) {
                this[t].call(this, transforms[t]);
            } else {
                console.warn("Skipping unknown transform \"" + t +"\".")
            }
        }
    };
             
    
    /*
     * Start evaluation with rule "name"
     */
    m.prototype.trigger = function(name) {
        this.backlog.push([name, {}, this.state]);
        this.scene.add(this.state.objectProto);

        this.depth = 0;
        while (this.backlog.length > 0) {
//            console.debug("[ITERATION] D: " + this.depth + " Size: " + this.backlog.length);
            while (this.backlog.length > 0) {
//                console.debug("[RULE] " + this.backlog[0] + ":" + this.depth);
                var entry = this.backlog.shift();
                this.state = entry[2];
                this[entry[0]].call(this, entry[1], true);
            }
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];
        }
    };
    
    
    /*
     * Move forward (scale sensitive)
     */
    m.prototype.move =  m.prototype.m = function(amount) {
        this.state.objectProto.position.x += amount;
        return this;
    };

    /*
     * Change scale by factor amount
     */
    m.prototype.scale =  m.prototype.s = function(amount) {
        this.state.objectProto.scale.multiplyScalar(amount);
        return this;
    };
    
    // pitch roll yaw
    m.prototype.roll = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.x += angle;
    };
    
    m.prototype.yaw = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.y += angle;
    };
    
    m.prototype.pitch = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.z += angle;
    };
    

  
    m.prototype.rule("cube", function() {

    
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.state.objectProto.clone(cube);
        this.state.objectProto.parent.add(cube);

//        return this;
    });

    
    return m;
    
})();

