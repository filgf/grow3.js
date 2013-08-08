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
define a set of recursive rules that describe how to construct the object *(lines 4-6)*. In this case there is only
the `start` rule that is the starting point of the evaluation. It calls one built-in rule (`cube()`) and that's all.


## Basics

#### Rules and Modifiers

Every Grow3 script consists of a set of **rules** that can be called as functions from other rules. There are a few buitin rules (such as `cube()` in the example above) that are the basic building blocks for every structure. Every rule has a name and an implementation which mostly consists of rule calls (and modifiers - see below) but is just plain JavaScript.

Every rule is influenced by grow3's **state** when it is run. The state includes the local coordinate system (rotation and scaling), materials to apply and other data that influences the outcome of a rule based on the time it's run.

The state for a rule can be manipulated using **modifiers**. Modifiers can be placed inside the rule call arguments fora rule or be called prior to calling a rule.

#### Rule Evaluation

Grow3 evaluates rules recursively. This means that often rules contain a call to themselves (or to another rule that calls the original rule again). Recursion is evaluated using a breadth first approach.

The maximum recursion depth is limited to a call depth of 20. This value can be changed using the method `maxDepth(n)`.


#### The Coordinate System

In practice modifiers most commonly move, rotate and scale the local coordinate system. Movements follow the
[turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics) principle: Think of it as a little person moving and rotating
in 3D, who is also able to magically change its size (grow and shrink). Every action (rule call) will have its effect
based on it position and size.

Modifiers can be...

* chained: `move(<code> 10).yaw(5).move(10)`
* called as an argument for a rule: `cube(move(10))`.
* called prior to calling a rule: `move(10).cube()`.

Basic modifiers for changing the local coordinate system:

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
branches are built from cubes by recursive calls to `spiral`, each with a changed and slightly scaled down local coordinate system
*(line 15)*.

The maximum recursion depth is set to 100 in the script with the helper function `maxDepth()` *(line 10)*. The default
value is 20.

The helper `background()` sets a background color *(line 4)*.

The camera can be set as a special node in our scene using the camera rule *(line 18)*: The camera is placed at the
current position defined by the modifiers and always facing towards the global coordinate systems origin (0,0,0).

Finally, you can use the THREE.js material system, using the `material()` modifier *(line 14)*. It takes as its argument
any material. If you supply it with an *array* of possible values insted, grow3.js automatically selects one based on the
current recursion depth. Here this results in a subtle grey-red stripe effect.


## Embedding grow3

### ...in a web page

To build a webpage containing a grow3-script import [`grow3.min.js`]{https://github.com/filgf/grow3.js/blob/master/build/grow3.min.js},
the minified library. For debugging directly include `grow3.js` and `grow3.Runner.js` from the
[source code]{https://github.com/filgf/grow3.js/tree/master/src}.

grow3.js has a few dependencies (see [src/lib](https://github.com/filgf/grow3.js/tree/master/src/lib) or original sources):

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

You can use grow3.js as an object generator for your own THREE.js application, without using grow3.Runner.js as a framework.

The API is pretty straightforward:

    :::js:::var g = new grow3.System(scene, camera /* optional */);

    with(g) {
        // your script here
    }

    var root = g.build();

Giving a reference to the THREE.js scene is mandatory. Supplying a camera object in the constructor is optional. If given, it's possible to set the camera using the `camera()`
rule.

Calling `g.build()` triggers generating the structure and return a reference to its root node.


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
