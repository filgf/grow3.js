// (C) Philipp Graf

var ELLY = ELLY || {};

ELLY.Runner = (function() {
    var that;
        
    var runner = function(parentElement) {
        that = this;
        
        var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
        
        // RENDERER
        if (Detector.webgl) {
            this.renderer = new THREE.WebGLRenderer({antialias: true});
        } else {
            this.renderer = new THREE.CanvasRenderer();
        }
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        this.container = document.createElement('div');
        parentElement.appendChild(this.container);
        this.container.appendChild(this.renderer.domElement);
        
        // CAMERA
        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
 

        // EVENTS
        THREEx.FullScreen.bindKey({charCode: 'f'.charCodeAt(0)});
        THREEx.WindowResize(this.renderer, this.camera);

        // CONTROLS
        this.controls = new THREE.TrackballControls(this.camera, this.container);

        // SCENE
        this.scene = new THREE.Scene();

    };
    
   

    runner.prototype.run = function(script) {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        this.scene.add(this.camera);
        this.camera.position.set(-25, -10, 10);
        this.camera.lookAt(0);



        // LIGHT
        var light = new THREE.PointLight(0xffeeee, 1.3);
        light.position.set(10, 10, 10);
        this.scene.add(light);
        var light2 = new THREE.PointLight(0xeeeeff, 1.0); // soft white light
        light2.position.set(-10, -10, -10);
        this.scene.add(light2);

        // ELLY
        this.elly = new ELLY.System(this.scene, script, this.camera);
        this.elly.trigger();

        animate();

    };

     var animate = function() {
        requestAnimationFrame(animate);
        render();
        update();
    };

    var render = function() {
        that.renderer.render(that.scene, that.camera);
    };
    
    var update = function() {
        that.controls.update();
    };
    
    return runner;
})();