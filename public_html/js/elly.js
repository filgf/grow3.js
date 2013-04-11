var ELLY = ELLY || {};

ELLY.State = function() {
    this.objectProto = new THREE.Object3D();
    
};

ELLY.State.prototype = {
   constructor : ELLY.State 
};



ELLY.System = function(scene, maxDepth) {
    this.scene = scene;

    this.backlog = [];
    this.backlogBuild = [];

    this.maxDepth = maxDepth || 10;
    this.depth = 0;

    this.state = new ELLY.State();
    this.scene.add(this.state.objectProto);
};




ELLY.System.prototype = {
    constuctor : ELLY.System,
    /*
     * Define a new rule "name" with given "code"
     */  
     
    
    rule : function(name, code) {
        
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
    },
    
    evalTransforms : function(transforms) {
        for(t in transforms) {
            if (t in this) {
                this[t].call(this, transforms[t]);
            } else {
                console.warn("Skipping unknown transform \"" + t +"\".")
            }
        }
    },
            
    /*
     * Start evaluation with rule "name"
     */
    trigger : function(name) {
        this.backlog.push([name, {}, this.state]);
        this.scene.add(this.state.objectProto);

        this.depth = 0;
        while (this.backlog.length > 0) {
            console.debug("[ITERATION] D: " + this.depth + " Size: " + this.backlog.length);
            while (this.backlog.length > 0) {
                console.debug("[RULE] " + this.backlog[0] + ":" + this.depth);
                var entry = this.backlog.shift();
                this.state = entry[2];
                this[entry[0]].call(this, entry[1], true);
            }
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];
        }
    },
    
    /*
     * Move forward (scale sensitive)
     */
    move : function(amount) {
        this.state.objectProto.position.x += amount;
        return this;
    },
    
    // pitch roll yaw
    pitch : function(angle) {
        axis = this.state.objectProto.up.clone().cross(this.state.objectProto)
        
        this.state.objectProto.rotateOnAxis(axis, angle)
    },
    
    
    
    /*
     * Change scale by factor amount
     */
    scale : function(amount) {
        this.state.objectProto.scale.multiplyScalar(amount);
        return this;
    },
   
    /*
     * Draw cube
     */
};

ELLY.System.prototype.rule("cube", function() {
        var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
        var cubeMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.state.objectProto.clone(cube);
        this.state.objectProto.parent.add(cube);

//        return this;
    });


/*
 * Shortcuts
 */
ELLY.System.prototype.m = ELLY.System.prototype.move;
ELLY.System.prototype.s = ELLY.System.prototype.scale;
