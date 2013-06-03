/**
 * @author Philipp Graf
 */
var grow3 = grow3 || {};

grow3.Runner = (function() {
    var that;
        
    var runner = function(parentElement, doScreenshot) {
        that = this;
        
        this.isRendering = false;
        this.frameCount = 0;

        var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
        
        // RENDERER
        if (Detector.webgl) {
            this.renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
        } else {
            parentElement.appendChild(Detector.getWebGLErrorMessage());
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

        this.doScreenshot = doScreenshot;

        animate();
    };
    
   

    runner.prototype.run = function(script) {
        this.isRendering = false;
        this.frameCount = 0;

        // SCENE WITH CAM
        this.scene = new THREE.Scene();

        this.scene.add(this.camera);
        this.camera.position.set(-25, -10, 0);
        this.camera.lookAt(0);


        // GROW3
        this.g = new grow3.System(this.scene, script, this.camera);
        this.g.build();

        if(!this.g.hasLighting) {
            // default lighting
            var light = new THREE.PointLight(0xffeeee, 1.3);
            light.position.set(10, 10, 10);
            this.scene.add(light);

            var light2 = new THREE.PointLight(0xeeeeff, 1.0); // soft white light
            light2.position.set(-10, -10, -10);
            this.scene.add(light2);
        }

        this.isRendering = true;

//        console.debug(JSON.stringify(this.renderer.info));

    };

     var animate = function() {
        requestAnimationFrame(animate);
        if (that.isRendering) {
            that.frameCount++;

            render();
            update();
        } else {
            that.frameCount = 0;
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