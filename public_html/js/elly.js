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
ELLY.State = function() {
    
};

ELLY.State.prototype.clone = function() {
    return new ELLY.State();
}





ELLY.System = function(scene, maxDepth) {
    this.scene = scene;
    
    this.backlog = [];
    this.backlogBuild = [];
    
    this.maxDepth = maxDepth || 5;
    this.depth = 0;
    
    this.state = new ELLY.State();
};

ELLY.System.prototype.rule = function(name, code) {
    this[name] = function(isRoot) { 
        if (isRoot === true) {
            saveState = this.state.clone();
            new Function(code).call(this);
            this.state = saveState;
        } else if (this.depth < this.maxDepth) {
            this.backlogBuild.push([name, this.state]);
        }
        return this;            // method chain
    };
};

ELLY.System.prototype.evalRule = function(name) {
    this.backlog.push([name, this.state]);
    
    this.depth = 0;
    while (this.backlog.length > 0) {
        console.debug("[ITERATION] D: "+this.depth + " Size: " + this.backlog.length);
        while(this.backlog.length > 0) {
            console.debug("[RULE] " + this.backlog[0] + ":" + this.depth);
            var entry = this.backlog.shift();
            this.state = entry[1];
            this[entry[0]].call(this, true);
        }
        this.depth++;
        this.backlog = this.backlogBuild;
        this.backlogBuild = [];
    }
};

ELLY.System.prototype.m = ELLY.System.prototype.move = function(amount) {
   // TODO 
    return this;
}

ELLY.System.prototype.s = ELLY.System.prototype.scale = function(amount) {
   // TODO 
    return this;
}

var xxx = 0;
ELLY.System.prototype.cube = function(amount) {
    xxx += 2;
    var cubeGeometry = new THREE.CubeGeometry( 1, 1, 1 );
    var cubeMaterial = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
    
    var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
    cube.position.set(-0.5+xxx,-0.5,-0.5);
    this.scene.add(cube);
    
    return this;
   // TODO 
}
