// (C) Philipp Graf

var grow3 = grow3 || {};

grow3.Runner = (function() {
    var that;
        
    var runner = function(parentElement) {
        that = this;
        
        this.isRendering = false;
        
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

   //     this.g = null;

        animate();
    };
    
   

    runner.prototype.run = function(script) {
        this.isRendering = false;

        // SCENE WITH CAM
        this.scene = new THREE.Scene();

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

        // GROW3
        this.g = new grow3.System(this.scene, script, this.camera);
        this.g.trigger();

        this.isRendering = true;

//        console.debug(JSON.stringify(this.renderer.info));

    };

     var animate = function() {
        requestAnimationFrame(animate);
        if (that.isRendering) {
            render();
            update();
        }
    };

    var render = function() {
        that.renderer.setClearColor(that.g.backgroundColor);
        that.renderer.render(that.scene, that.camera);
    };
    
    var update = function() {
        that.controls.update();
    };
    
    return runner;
})();