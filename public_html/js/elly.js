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

ELLY.System = function(maxDepth) {
    this.backlog = [];
    this.backlogBuild = [];
    
    
    this.maxDepth = maxDepth || 5;
    
    this.state = new ELLY.State();
    this.currentState = new ELLY.State(); 
};

ELLY.System.prototype.rule = function(name, code) {
    this[name] = function(isRoot) { 
        if (isRoot === true) {
            saveState = this.state.clone();
            new Function(code).call(this);
            this.state = saveState;
        } else if (this.depth < this.maxDepth) {
            this.backlogBuild.push(name);
        }
    };
};

ELLY.System.prototype.evalRule = function(name) {
    this.backlog.push(name);
    
    this.depth = 0;
    while (this.backlog.length > 0) {
        console.debug("[ITERATION] D: "+this.depth + " Size: " + this.backlog.length);
        while(this.backlog.length > 0) {
            console.debug("[RULE] " + this.backlog[0] + ":" + this.depth);
            this[this.backlog.shift()].call(this, true);
        }
        this.depth++;
        this.backlog = this.backlogBuild;
        this.backlogBuild = [];
    }
};




