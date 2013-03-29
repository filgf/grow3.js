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
};



ELLY.System = function(maxDepth) {
    this.backlog = [];
    
    this.maxDepth = maxDepth || 20;
    
    this.states = [];
    this.currentState = new ELLY.State(); 
};

ELLY.System.prototype.rule = function(name, code) {
    
    
    this[name] = function(isRoot) { 
        if (isRoot === true) {
            this.states.push(this.currentState);
            this.currentState = this.currentState.clone();
            new Function(code).call(this);
            this.currentState = this.states.pop();
        } else if (this.states.length < this.maxDepth - 1) {
            this.backlog.push(name);
        }
    };
};

ELLY.System.prototype.evalRule = function(name) {
    this.backlog.push(name);
    
    while(this.backlog.length > 0) {
        console.debug("[RULE] " + this.backlog[0] + ":" + this.states.length);
        this[this.backlog.shift()].call(this, true);
        
    }
};




