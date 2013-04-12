var ELLY = ELLY || {};

ELLY.State = function() {
    this.objectProto = new THREE.Object3D();
    
};


ELLY.System = (function() {
    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

    
    var system = function(scene, maxDepth) {
        this.scene = scene;

        this.backlog = [];
        this.backlogBuild = [];

        this.maxDepth = maxDepth || 10;
        this.depth = 0;

        this.state = new ELLY.State();
        this.scene.add(this.state.objectProto);
    }

    system.prototype.constructor = system;
    
    var that = this;

    
    var rulify = function (code) {
       currentF = function(transforms, isRoot) {
            if (isRoot === true) {
                saveState = this.state;
                this.state = new ELLY.State();
                saveState.objectProto.add(this.state.objectProto);
                this.evalTransforms(transforms);
                code.call(this);
                this.state = saveState;
            } else if (this.depth < this.maxDepth) {
                this.backlogBuild.push([currentF, transforms, this.state]);
            }
            return this;            // method chain
        };
        
        return currentF;
    };
    
    system.prototype.rule = function(name, code) {
        that[name] = this[name] = rulify(code);
    };
    
   
    system.prototype.evalTransforms = function(transforms) {
        for(t in transforms) {
            if (t in that) {
                that[t].call(this, transforms[t]);
            } else {
                console.warn("Skipping unknown transform \"" + t +"\".")
            }
        }
    };
             
    
    /*
     * Start evaluation with rule "name"
     */
    system.prototype.trigger = function(name) {
        this.backlog.push([that[name], {}, this.state]);
        this.scene.add(this.state.objectProto);

        this.depth = 0;
        while (this.backlog.length > 0) {
            console.debug("[ITERATION] D: " + this.depth + " Size: " + this.backlog.length);
            while (this.backlog.length > 0) {
                console.debug("[RULE] " + this.backlog[0] + ":" + this.depth);
                var entry = this.backlog.shift();
                this.state = entry[2];
                entry[0].call(this, entry[1],true);

            }
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];
        }
    };
    
    
    /*
     * Move forward (scale sensitive)
     */
    var move = function(amount) {
        this.state.objectProto.position.x += amount;
        return this;
    };

    var m = move; 
    
    /*
     * Change scale by factor amount
     */
    var scale = function(amount) {
        this.state.objectProto.scale.multiplyScalar(amount);
        return this;
    };
    
    var s = scale;
    
    // pitch roll yaw
    var roll = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.x += angle;
    };
    
    var yaw = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.y += angle;
    };
    
    var pitch = function(angle) {
        angle = angle * Math.PI / 180.0;
        this.state.objectProto.rotation.z += angle;
    };
    

    that.cuby = rulify(function() {
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        console.log("YEAH");
        this.state.objectProto.clone(cube);
        this.state.objectProto.parent.add(cube);

//        return this;
    });

    
    return system;
    
})();

