## Contents

[TOC]

## Hello grow3.js!

A minimal code example for a simple silvery cube:

    :::js:::<script>
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

The easiest way to build and view structures with grow3.js ist using `grow3.Runner` *(lines 11-12)*: After creating the
runner, evaluation of a script ist started by calling `run()`.

The runner is provided with a script, which is an ordinary JavaScript-function *(lines 2-8)*. Its main task is to
define a set of recursive rules that describe how to construct the object *(lines 4-6)*.

The function takes one argument: A reference to a grow3.System object that contains all functions (evaluation, helpers,
builtin rules and modifiers) for working with a grow3.js system.

In this case there is only the `start` rule that is the starting point of the evaluation. It calls one built-in rule
(`cube()`) and that's all.

grow3.js is tightly coupled to THREE.js in that it creates a hierarchy of scene nodes for THREE.js.


## Basics

### Rules and Modifiers

Every Grow3 script consists of a set of **rules** that can be called as functions from other rules. There are a few
buitin rules (such as `cube()` in the example above) that are the basic building blocks for every structure. Every rule
has a name and an implementation which mostly consists of rule calls (and modifiers - see below) but is just plain
JavaScript.

Every rule is influenced by grow3's **state** when it is run. The state includes the local coordinate system (rotation
and scaling), materials to apply and other data that influences the outcome of a rule based on the time it's run.

The state for a rule can be manipulated using **modifiers**. Modifiers can be placed inside the rule call arguments for
a rule or be called prior to calling a rule.

### Rule Evaluation

Grow3 evaluates rules recursively. This means that often rules contain a call to themselves (or to another rule that
calls the original rule again). Recursion is evaluated using a breadth first approach.

The maximum recursion depth is limited to a call depth of 20. This value can be changed using the method `maxDepth(n)`.


### The Coordinate System

In practice modifiers most commonly move, rotate and scale the local coordinate system. Movements follow the
[turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics) principle: Think of it as a little person moving and
rotating in 3D, who is also able to magically change its size (grow and shrink). Every action (rule call) will have its
effect based on it position and size.

Modifiers can be...

* chained: `move(<code> 10).yaw(5).move(10)`
* called as an argument for a rule: `cube(move(10))`.
* called prior to calling a rule: `move(10).cube()`.

Basic modifiers for changing the local coordinate system:

**Move:**

* `move(amount)` or `m(amount)`: Move forward *amount* units
* `transHoriz(amount)` or `tH(amount)`: Move right *amount* units (based on local orientation). Use negative values to
move left.
* `transVert(amount)` or `tV(amount)`: Move down *amount* units (based on local orientation). Use negative values to
move up.

**Rotate:**

* `roll(amount)` or `rX(amount)`: Rotate along viewing direction (around local X-axis) for *amount* degrees (= *roll*).
* `yaw(amount)` or `rY(amount)`: Rotate "right" (around local Y-axis) for *amount* degrees (= *yaw*).
* `pitch(amount)` or `rZ(amount)`: Rotate "up" (around local Z-axis) for *amount* degrees (= *pitch*).

**Scale:**

* `scale(factor)` or `s(factor)`: Scale by amount *factor*. Effectively this scales all following movements and meshes.




## A more interesting example!

To create this...

![Spikey Screenshot](screenshots/Spikey.png)

...you will need the following code:

    :::js:::<script>
        var g3 = function(g) {
            with(g) {
              background(0x443333);

              var materials = [
                new THREE.MeshPhongMaterial({color: 0xbbbbbb}),
                new THREE.MeshPhongMaterial({color: 0xddbbbb})];

              maxDepth(100);

              rules({
                    spiral: function () {
                        cube(material(materials).scale(1.2));
                        spiral(pitch(10).roll(13).move(0.6).scale(0.98));
                    },
                    start: function () {
                        camera(move(30).yaw(90));

                        for (var i = 0; i < 720; i += 15) {
                            spiral(scale(0.9).yaw(i / 3).pitch(i));
                        }
                    }
                });
            }
        };

        window.onload = function() {
            var runner = new grow3.Runner(document.body);
            runner.run(g3);
        };
    </script>

The same basic structure as before, but there's much more happening (for details see the following reference sections):

There are two rules (`start` and `spiral`). `spiral`
gets called 720/15 = 48 times from within the loop in `start`, each call starting one "branch". The corkscrew-type
branches are built from cubes by recursive calls to `spiral`, each with a changed and slightly scaled down local
coordinate system *(line 15)*.

The maximum recursion depth is set to 100 in the script with the helper function `maxDepth()` *(line 10)*. The default
value is 20.

The helper `background()` sets a background color *(line 4)*.

The camera can be set as a special node in our scene using the camera rule *(line 18)*: The camera is placed at the
current position defined by the modifiers and always facing towards the global coordinate systems origin (0,0,0).

Finally, you can use the THREE.js material system, using the `material()` modifier *(line 14)*. It takes as its argument
any material. If you supply it with an *array* of possible values insted, grow3.js automatically selects one based on
the current recursion depth. Here this results in a subtle grey-red stripe effect.


## Embedding grow3

### ...in a web page

To build a webpage containing a grow3-script import
[`grow3.min.js`]{https://github.com/filgf/grow3.js/blob/master/build/grow3.min.js}, the minified library. For debugging
directly include `grow3.js` and `grow3.Runner.js` from the
[source code]{https://github.com/filgf/grow3.js/tree/master/src}.

grow3.js has a few dependencies (see [src/lib](https://github.com/filgf/grow3.js/tree/master/src/lib) or original
sources):

* Always: `three.js`
* If you use grow3.Runner as your framework: `Detector.js`, `TrackballControls.js`, `THREEx.FullScreen.js`,
 `THREEx.WindowResize.js`, `helvetiker_regular.typeface.js`


A basic stub could look like this:

    :::html:::<!doctype html>
    <html lang="en">
        <head>
            <style>body { margin: 0; overflow: hidden; }</style>
        </head>
        <body>

        <!-- Needed dependency -->
        <script src="js/lib/three.js"></script>

        <!-- Needed if you use grow3.Runner -->
        <script src="js/lib/Detector.js"></script>
        <script src="js/lib/TrackballControls.js"></script>
        <script src="js/lib/THREEx.FullScreen.js"></script>
        <script src="js/lib/THREEx.WindowResize.js"></script>
        <script src="js/lib/helvetiker_regular.typeface.js"></script>

        <!-- grow3 minified -->
        <script src="js/grow3.min.js"></script>


        <script>
            // ^^^ Example code from above ^^^
        </script>
        </body>
    </html>

### ...as an object generator for THREE.js

You can use grow3.js as an object generator for your own THREE.js application, without using grow3.Runner.js as a
framework.

The API is pretty straightforward:

    :::js:::var g = new grow3.System(scene, camera /* optional */);

    with(g) {
        // your script here
    }

    var root = g.build();

Giving a reference to the THREE.js scene is mandatory. Supplying a camera object in the constructor is optional. If
given, it's possible to set the camera using the `camera()` rule.

Calling `g.build()` triggers generating the structure and return a reference to its root node.

### How it Actually Works

The central hub of grow3.js is an object from the `grow3.System` prototype. It contains all rules (predefined or added
through the `rules()` method), modifiers and helper functions. To be able to access them without prepending the object
name (f.e. `g.` in the example before), I recommend to surround your actual script with `with(g) {...}'.

The `build()` function starts the evaluation of the script. As the `rule()` method wraps each rule it is possible to
intercept each recursive call and put it in a backlist to ensure are breadth first evaluation strategy and manage
*state* information.


## Rules

Every grow3.js script consists of a set of **rules** that can be called as functions from other rules. There exist some
predefined rules that act as basic atomic building blocks for a rule set.

### Defining Rules

One rule can be defined using the method `rule(function)` which takes a function as its argument.

The function itself will be wrapped by grow3.js to be able to evaluate modifiers, but can have any number of additional
arguments. By defining rules, the grow3.js object is extended with additional methods that allow controlled evaluation
of the recursive calls.

Example:

    :::js:::var script = function(g) {
        g.start = rule(function(){
            cube();
        });
    };

As usually more than one rule is defined you will usually use the short version `rules(map_name_function)` that takes
an object as a basis for a complete rule set.

Example:

    :::js:::var script = function(g) {
        with(g) {
            rules({
                segment : function() {
                    segment(roll(10).move(1).scale(0.99));
                    cube();
                },
                start : function() {
                    segment();
                }
            });

        }
    };

For more examples see the scripts above and pretty much all examples at in the
[examples folder](https://github.com/filgf/grow3.js/tree/master/examples).

### Randomly select a rule implementation

Instead of supplying one function for a rule you can specify an array of functions:

    :::js:::rules({
        seg: [
            function () {
                cube(scale(0.5));
                seg(move(2.0).pitch(-45));
            },
            function () {
                cube(scale(0.5).material(mat1));
                seg(yaw(90).pitch(45).move(1.0));
            },
            function () {
                cube(scale(0.5).material(mat2));
                seg(yaw(-90).move(1.0));
            }
        ],

        start: function () {
            for (var i = 0; i < 35; i++) {
                seg();
            }
        }
    });

Whenever the rule `seg()` is triggered one of its three implementations is randomly selected (with equal probability).
This realizes a simple form of polymorphism and introduces larger scale randomness into the constructed structures.

### Built-in Rules

grow3.js currently has the following bultin rules to create meshes:

* `cube()` creates a cube mesh with edge length 1.0, centered at (0,0,0).
* `sphere()`: creates a sphere mesh with diameter 1.0, centered at (0,0,0).
* `glyphs(string)`: creates a text mesh from a string, centered at (0,0,0). The appearance can be influenced with the
`textParams` modifier (see below).
* `mesh(geometry)`: creates an arbitrary mesh using an arbitrary self defined THREE.js geometry. The
[MeshRings example](https://github.com/filgf/grow3.js/blob/master/examples/html/MeshRings.html) shows how to use it.

All positions/sizes are in local coordinates! To place and scale the meshes just use grow3's modifiers.

Additionally there are two special builtin rules for placing and adding camera and lights:

* `camera()` places the camera at the current position defined by the modifiers and is always facing towards the global
coordinate systems origin (0,0,0). If no camera is defined in the script, `grow3.Runner` places a default camera at
(-25, -10, 0).
* `light(hex, intensity, distance)` adds a new point light at the current position. The parameters are the same as in
the constructor for [THREE.PointLight](http://threejs.org/docs/59/#Reference/Lights/PointLight). If no lights are
defined in the script, `grow3.Runner` places two default lights.

### Limiting Recursion Depth

The maximum depth at which recursion will be stopped can be set using the function `maxDepth()` (see example above). The
default value is 20.

If you need finer control (f.e. setting modifier parameters based on depth), the `grow3.System` object has an attribute
called `depth` you can read.

### Arrays as Rule Arguments

When a rule allows arguments (f.e. `glyphs()`) or a script defined one and an array is supplied instead of a value, one
value will be selected based on the current recursion depth.

The [TextWorld example](https://github.com/filgf/grow3.js/blob/master/examples/html/TextWorld.html) uses this to
generate a twisty path built from single letters of a string.

## Modifiers

Every rule is influenced by grow3's **state** when it is run. The state includes the local coordinate system (rotation
and scaling), materials to apply and other data that influences the outcome of a rule based on the time it's run.

The state for a rule can be manipulated using **modifiers**. Modifiers can be placed inside the rule call arguments for
a rule or be called prior to calling a rule.

### Supported Modifiers

**Move:**

* `move(amount)` or `m(amount)`: Move forward *amount* units
* `transHoriz(amount)` or `tH(amount)`: Move right *amount* units (based on local orientation). Use negative values to
move left.
* `transVert(amount)` or `tV(amount)`: Move down *amount* units (based on local orientation). Use negative values to
move up.

**Rotate:**

* `roll(amount)` or `rX(amount)`: Rotate along viewing direction (around local X-axis) for *amount* degrees (= *roll*).
* `yaw(amount)` or `rY(amount)`: Rotate "right" (around local Y-axis) for *amount* degrees (= *yaw*).
* `pitch(amount)` or `rZ(amount)`: Rotate "up" (around local Z-axis) for *amount* degrees (= *pitch*).

**Scale:**

* `scale(factor)` or `s(factor)`: Scale by amount *factor*. Effectively this scales all following movements and meshes.

**Others:**

* `material(mat)`: Set material for every mesh constructing rule. Any
[THREE.js material](http://threejs.org/docs/59/#Reference/Materials/Material) can be used.
* `textParam(par)`: Control the appearance of the text renderer with the glyphs() rule. `par` is an object that can
contain all attributes described in THREE.js docs for
[TextGeometry](http://threejs.org/docs/59/#Reference/Extras.Geometries/TextGeometry).


### Arrays as Modifier Arguments

Like with rules, you can use arrays instead of values as parameter values for modifiers. One
value will be selected based on the current recursion depth at the time the modifier function is called.

The example in the beginning uses this technique to change material based on recursion depth.


## Helpers

grow3.js includes a few helper functions and objects:

**`grow3.Runner`** is a micro framework to render and view grow3 scripts. The basic usage pattern is shown in all examples
in this documentation:

    :::js:::var runner = new grow3.Runner(parent_dom_element);
    runner.run(script_function);

When using `grow3.Runner` the function `background(rgb)` sets the background color of the canvas. `rgb` is a hexadecimal
color value in the form `0xRRGGBB`.

**`rnd()`** is a multifunctional random value function:

* `rnd(value)` returns a random number between -value and +value.
* `rnd(min, max)` returns a random number between min and max.
* `rnd(array)` returns a random entry from the given array.

