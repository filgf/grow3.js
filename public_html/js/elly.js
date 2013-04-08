var ELLY = ELLY || {};

/*
 var ruleset = { "R1" : function() {c("R2").call("R1"); },
 "R2" : function() {call("R1"); }};
 */

/*
 var sys = new ELLY.System();
 sys.R1 = function() { R2().R1(); }
 sys.rule("R1", "R2().R1();");
 sys.rule("R1", function() { R2().R1(); });
 sys.rule("R1", "R2 R1");
 
 
 var Test = ELLY.System.extend() {
 init: function() {
 this.super();
 }
 
 build: function() {
 R1 = function() { R2().R1(); };
 eval("R1 = function() { R2().R1(); }");
 }
 }
 
 sys.R2 = function() { move(10).scale(0.9).R2() }
 */

// new ELLY.Rule("R1", function() {});
ELLY.State = function(o) {
    if (o === undefined) {
        this.position = new THREE.Vector3();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.scale = 1.0;
    } else {
        this.position = o.position.clone();
        this.direction = o.direction.clone();
        this.scale = o.scale;
    }
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
};

ELLY.System.prototype = {
    constuctor : ELLY.System,
            
    rule : function(name, code) {
        this[name] = function(isRoot) {
            if (isRoot === true) {
                saveState = this.state;
                this.state = new ELLY.State(this.state);
                new Function(code).call(this);
                this.state = saveState;
            } else if (this.depth < this.maxDepth) {
                this.backlogBuild.push([name, this.state]);
            }
            return this;            // method chain
        };
    },
    
    evalRule: function(name) {
        this.backlog.push([name, this.state]);

        this.depth = 0;
        while (this.backlog.length > 0) {
            console.debug("[ITERATION] D: " + this.depth + " Size: " + this.backlog.length);
            while (this.backlog.length > 0) {
                console.debug("[RULE] " + this.backlog[0] + ":" + this.depth);
                var entry = this.backlog.shift();
                this.state = entry[1];
                this[entry[0]].call(this, true);
            }
            this.depth++;
            this.backlog = this.backlogBuild;
            this.backlogBuild = [];
        }
    },
    
    move: function(amount) {
        delta = this.state.direction.clone().multiplyScalar(amount);
        this.state.position.add(delta);
        return this;
    },
    
    scale: function(amount) {
        this.state.scale *= amount;
        this.state.direction.multiplyScalar(amount);
        return this;
    },
   
    cube: function(amount) {
        var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
        var cubeMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc});

        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.copy(this.state.position);
        cube.scale.set(this.state.scale, this.state.scale, this.state.scale);
        this.scene.add(cube);

        return this;
        // TODO 
    }
};

// Shortcuts
ELLY.System.prototype.m = ELLY.System.prototype.move;
ELLY.System.prototype.s = ELLY.System.prototype.scale;
