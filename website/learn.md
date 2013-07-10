## Getting Started {: #GettingStarted}

### Hello grow3.js!

Minimal example code for a simple silvery cube:

    <script>
        var g3 = function(g) {
            with(g) {
                rules({
                    start : function() { cube(); }
                });
            }
        };

        window.onload = function() {
            var runner = new grow3.Runner(document.body);
            runner.run(g3);
        };
    </script>

### A more interesting script...

A more elaborate example:



### Basics of a Grow3 Script

#### Rules and Modifiers

Every Grow3 script consists of a set of **rules** that can be called as functions from other rules. There are a few buitin rule
(such as `cube()` in the example above) that are the basic building blocks for every structure. Every rule has a name and
an implementation which mostly consists of rule calls (and modifiers - see below) but is just plain JavaScript.

Every rule is influenced by grow3's **state** when it is run. The state includes the local coordinate system (rotation and scaling),
materials to apply and other data that influences the outcome of a rule based on the time it's run.

The state for a rule can be manipulated using **modifiers**. Modifiers can be placed inside the rule call arguments for a rule or be
called prior to calling a rule.

#### Rule Evaluation

Grow3 evaluates rules recursively. This means that often rules contain a call to themselves (or to another rule that calls
the original rule again). Recursion is evaluated using a breadth first approach.

The maximum recursion depth is limited to a call depth of 20. This value can be changed using the method `maxDepth(n)`.


#### The Coordinate System

In practice modifiers most commonly move, rotate and scale the local coordinate system.

**Move:**

* `move(amount)` or `m(amount)`: Move forward *amount* units
* `transHoriz(amount)` or `tH(amount)`: Move right *amount* units (based on local orientation). Use negative values to move left.
* `transVert(amount)` or `tV(amount)`: Move down *amount* units (based on local orientation). Use negative values to move up.

**Rotate:**

* `roll(amount)` or `rX(amount)`: Rotate along viewing direction (around local X-axis) for *amount* degrees (= *roll*).
* `yaw(amount)` or `rY(amount)`: Rotate "right" (around local Y-axis) for *amount* degrees (= *yaw*).
* `pitch(amount)` or `rZ(amount)`: Rotate "up" (around local Z-axis) for *amount* degrees (= *pitch*).

**Scale:**

* `scale(factor)` or `s(factor)`: Scale by amount *factor*. Effectively this scales all following movements and meshes.

### Embedding Grow3 in a page



## Rules

### Defining Rules

### Randomly select a Rule

### Built-in Rules
#### Mesh, Cube, Sphere, Glyphs
#### Camera, Light

### Limiting Recursion



## Modifiers

### The Coordinate System

### Supported Modifiers
#### Rotating: Pitch, Roll, Yaw
#### Moving: Move, TranslateH, TranslateV
#### Scaling
#### Material

### Arrays as Modifier Arguments



## Helpers

### Background Color

### Random Values and Selection

### Grow3Runner



## Leveraging Three.js

### Materials



## Cheat Sheet
