const   SDDP_WEBSOCKET_DOMAIN_NAME = 'wta.performgroup.io',
        MAX_RECONNECT_ATTEMTS = 3,
 	    imgPath = "./img/",
        ASPECT = 1 / 1.3;        

let     WIDTH,					
        HEIGHT,
        canvas,
        container;

function init(){
    // common settings	
    container = document.getElementById('webgl');					
    canvas = document.getElementById('webgl_canvas');					
    const 	interfaceCanvas = document.getElementById('interface_canvas');					

    const 	sampleRatio = 2;

    const 	distance = 15,
            ASPECT = 1 / 1.3,            
            HEIGHT2 = HEIGHT >> 1,
            WIDTH2 = WIDTH >> 1;

    WIDTH = container.clientWidth;
    HEIGHT = WIDTH * ASPECT;
    
    const 	angle = 75,
            aspect = WIDTH / HEIGHT,
            near = 0.1,
            far = 3000;


    // linking libs and objects
    const 	loader = new THREE.TextureLoader(),
            scene = new THREE.Scene(),
            scene2 = new THREE.Scene(),
            gl = canvas.getContext('webgl'),
            glInterface = interfaceCanvas.getContext('webgl'),
            renderer = new THREE.WebGLRenderer({canvas: canvas, context: gl, antialiasing : false});
    //
            interface = new THREE.WebGLRenderer({antialiasing : false, context: glInterface});

            renderer.setSize(WIDTH, HEIGHT);
            interface.setSize(WIDTH, HEIGHT);
            
            //interface.domElement.style.position = 'absolute';
            ///interface.domElement.style.offsetLeft = '0px';

    container.appendChild(renderer.domElement);
    container.appendChild(interface.domElement);

    renderer.autoClear = false;
    renderer.setPixelRatio( window.devicePixelRatio * sampleRatio );
    const camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
    const camera2 = new THREE.PerspectiveCamera(angle, aspect, near, far);
    // This render pass will render the big result.
    
    let steps = 30,
        blocked = true,
        faraway = 300,
         xStart = -1, 
        yStart = -1, 
        interacting = false, 
        alpha = 0, 
        betta = 0,
        ball,
        ballShadow,
        ballShadowMaterial, 
        ballX = 0, 
        ballY = 0,
        step = 0;
// API 
    function openConnection() {
        const websocket_url = `wss://${SDDP_WEBSOCKET_DOMAIN_NAME}/football/${this.fixture_uuid}/${
        this.feed_name
        }${this.getQueryString()}`;

        this.connection = new WebSocket(websocket_url);
        this.connection.onopen = (event) => this.onOpen(event);
        this.connection.onmessage = (event) => this.onMessage(event);
    }

    function getQueryString() {
        return this.query_string ? `?${this.query_string}` : '';
    }

    function onOpen(_event) {
        this.connection.send(
        JSON.stringify({
            authToken: $.AppSettings.outlet_key
        })
        );

        // exponential backoff with retry process implementation
        // https://docs.performgroup.com/docs/data/push/tennis/tennis-sddp-integration-guide-wta.htm#websocket-disconnected-from-feed
        this.runConnectionCheck();
    };

    function onMessage(event) {
        const message = JSON.parse(event.data);

        //this.handleMessageType(message);
    };

///// MOUSE
    // Functions
    function catchEvents(){
        container.addEventListener('mousedown', onMouseDown, false);
        container.addEventListener('mousemove', onMouseMove, false); 
        container.addEventListener('mouseup', onMouseUp, false); 
        container.addEventListener('mouseout', onMouseUp, false); 
    }	

    function onMouseDown(event) {
        event.preventDefault();

        if (blocked) {
            return;
        }

        interacting = true;
        //if (xStart < 0){ // only for initial drag
            xStart = event.clientX;
            yStart = event.clientY;
        
    }

    function onMouseMove(event) {
        event.preventDefault();

        if (interacting){
            const x = xStart - event.clientX;
            const y = yStart - event.clientY;
        
            betta += x/10;
            alpha -= y/4;
        }
    }	

    function onMouseUp(event) {
        event.preventDefault();
        interacting = false;
    }
// WEBGL
    function loadTexture(fileName){
        return loader.load(imgPath+fileName);
    }	

    function createScene(){	
        camera.position.set(300 + faraway, 00, -0);
        camera.up = new THREE.Vector3(0,1,0);
        camera.lookAt(new THREE.Vector3(00,00,0));
    

        const pitchGeometry = new THREE.PlaneGeometry(600, 338);
        const pitchMaterial = new THREE.MeshBasicMaterial(); 
        pitchMaterial.map = loadTexture('pitch.jpg');
        const pitch = new THREE.Mesh( pitchGeometry, pitchMaterial );
        pitch.position.set(-100, -150, -0); 
        pitch.rotation.x = -Math.PI / 2;
        pitch.rotation.z = -Math.PI / 2;	
        scene.add(pitch);	

        const bordersGeometry = new THREE.BoxGeometry(600, 338, 40);
        const bordersMaterial = new THREE.MeshBasicMaterial(); 
        const borders = new THREE.Mesh( bordersGeometry, bordersMaterial );
        bordersMaterial.map = loadTexture('logo_stats.png');
        bordersMaterial.side = THREE.BackSide //flip normals
        bordersMaterial.wrapS = THREE.RepeatWrapping;
        bordersMaterial.wrapT = THREE.RepeatWrapping;
        bordersMaterial.repeat =  4;
        borders.position.set(-100, -131, 0); 
        borders.rotation.x = Math.PI / 2;
        borders.rotation.z = Math.PI / 2;		
        scene.add(borders);

        const ballGeometry = new THREE.SphereGeometry(6, 8, 8);
        const ballMaterial = new THREE.MeshBasicMaterial(); 
        ballMaterial.map = loadTexture('ball.jpg');
        ball = new THREE.Mesh( ballGeometry, ballMaterial );
        ball.position.set(-100, -144, 0); 
        scene.add(ball);	


        const ballShadowGeometry = new THREE.PlaneGeometry(30, 30);
        ballShadowMaterial = new THREE.MeshBasicMaterial(); 
        ballShadowMaterial.map = loadTexture('ball_shadow.png');
        ballShadowMaterial.transparent = true;
        ballShadow = new THREE.Mesh( ballShadowGeometry, ballShadowMaterial );
        ballShadow.position.set(-100, -149, -0); 
        ballShadow.rotation.x = -Math.PI / 2;
        ballShadow.rotation.z = -Math.PI / 2;	
        scene.add(ballShadow);	
    }	function createScene(){	
        camera.position.set(300 + faraway, 00, -0);
        camera.up = new THREE.Vector3(0,1,0);
        camera.lookAt(new THREE.Vector3(00,00,0));

        const tribunesGeometry = new THREE.CylinderGeometry(1200, 800, 1200, 18, 1, true);
        const tribunesMaterial = new THREE.MeshBasicMaterial(); 
        tribunesMaterial.map = loadTexture('tribunes.jpg');
        tribunesMaterial.lights = false;
        tribunesMaterial.side = THREE.BackSide //flip normals
        const tribunes = new THREE.Mesh( tribunesGeometry, tribunesMaterial );
        tribunes.position.set(-100, 100, -0); 
        scene.add(tribunes);

        const pitchGeometry = new THREE.PlaneGeometry(600, 338);
        const pitchMaterial = new THREE.MeshBasicMaterial(); 
        pitchMaterial.map = loadTexture('pitch.jpg');
        const pitch = new THREE.Mesh( pitchGeometry, pitchMaterial );
        pitch.position.set(-100, -150, -0); 
        pitch.rotation.x = -Math.PI / 2;
        pitch.rotation.z = -Math.PI / 2;	
        scene.add(pitch);	

        const bordersGeometry = new THREE.BoxGeometry(600, 338, 40);
        const bordersMaterial = new THREE.MeshBasicMaterial(); 
        const borders = new THREE.Mesh( bordersGeometry, bordersMaterial );
        bordersMaterial.map = loadTexture('logo_stats.png');
        bordersMaterial.side = THREE.BackSide //flip normals
        bordersMaterial.wrapS = THREE.RepeatWrapping;
        bordersMaterial.wrapT = THREE.RepeatWrapping;
        bordersMaterial.repeat =  4;
        borders.position.set(-100, -131, 0); 
        borders.rotation.x = Math.PI / 2;
        borders.rotation.z = Math.PI / 2;		
        scene.add(borders);

        const ballGeometry = new THREE.SphereGeometry(6, 8, 8);
        const ballMaterial = new THREE.MeshBasicMaterial(); 
        ballMaterial.map = loadTexture('ball.jpg');
        ball = new THREE.Mesh( ballGeometry, ballMaterial );
        ball.position.set(-100, -144, 0); 
        scene.add(ball);	


        const ballShadowGeometry = new THREE.PlaneGeometry(30, 30);
        ballShadowMaterial = new THREE.MeshBasicMaterial(); 
        ballShadowMaterial.map = loadTexture('ball_shadow.png');
        ballShadowMaterial.transparent = true;
        ballShadow = new THREE.Mesh( ballShadowGeometry, ballShadowMaterial );
        ballShadow.position.set(-100, -149, -0); 
        ballShadow.rotation.x = -Math.PI / 2;
        ballShadow.rotation.z = -Math.PI / 2;	
        scene.add(ballShadow);	
    }

    function createInterface(){	
        camera2.position.set(300 + faraway, 00, -0);
        camera2.up = new THREE.Vector3(0,1,0);
        camera2.lookAt(new THREE.Vector3(00,00,0));
    
        const pitch2Geometry = new THREE.PlaneGeometry(600, 338);
        const pitch2Material = new THREE.MeshBasicMaterial(); 
        pitch2Material.map = loadTexture('ball.jpg');
        const pitch2 = new THREE.Mesh( pitch2Geometry, pitch2Material );
        pitch2.position.set(-100, -150, -0); 
        pitch2.rotation.x = -Math.PI / 2;
        pitch2.rotation.z = -Math.PI / 2;
    
        scene2.add(pitch2);					
    }


    function render () {
        renderer.render(scene, camera);
      //  interface.render(scene2, camera2);
    };	
/// main
    function setRandomBallPosition() {
                        
        const position = ball.position.clone();
        camera.updateMatrixWorld();
        position.project(camera);
        const x = (position.x + 1) * HEIGHT2;
        const y = (1 - position.y) * WIDTH2;
        console.log(x, y)

        steps = 10 + ((Math.random()*20) >> 1),
        ballTargetX = Math.random()*320,
        ballTargetY = Math.random()*620;
        step = 1;
        setTimeout(setRandomBallPosition, 2500);
    }

    function applyChanges(){
        const clock = new THREE.Clock(),
        delta = clock.getDelta(); 	 

        if (blocked) { // intro animation
            camera.position.set(300 + faraway, 00, 0);
            faraway -= 5;
            if (faraway == 0){
                blocked = false;
            }
        }

        else {
            // ball
            if (step && step < steps){
                const x = ballX + (ballTargetX - ballX) * step / steps;
                const y = ballY + (ballTargetY - ballY) * step / steps;
                const maxH = steps >> 1;
                let h =maxH - Math.abs(step - maxH);

                ball.position.set(-264 + x , -144 + h, y - 330); 
                ballShadow.position.set(-264 + x , -149, y - 330); 
                ballShadowMaterial.opacity = (1- h/maxH);

                step++;
            } else if (step === steps){ // reset
                step = 0;
                ballX = ballTargetX;
                ballY = ballTargetY;
            }

                ball.rotation.z += .2;	
                ball.rotation.y += .3;	
            // Camera
            // apply limits
            betta = Math.min(60, Math.max( betta, -60));
            alpha = Math.min(399, Math.max( alpha, -60));

            //magnet
            if (Math.abs(betta) < 15){
                betta =0;
            }

            // rotate
            camera.position.set(300 - alpha, alpha>>2, betta * (399-alpha)/300);	
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(-alpha/4, 0, 0));
        }
    };

    function update()   // Main cycle Resident funct
    {
        applyChanges();
        resize();
        render(); 
        //window.requestAnimationFrame(update);
        setTimeout(update, 33);

    };

    function resize() {
        if (container.clientWidth != WIDTH) {
            WIDTH = container.clientWidth;
            HEIGHT = WIDTH * ASPECT;
            container.width = WIDTH;
            container.height = HEIGHT;
            canvas.width = WIDTH;
            canvas.height = HEIGHT;

            renderer.setSize(WIDTH, HEIGHT );
     //       interface.setSize(WIDTH, HEIGHT);
            gl.viewport(0, 0, WIDTH *2, HEIGHT *2);
       
       }
    }

    //resizeHandler();
    createScene();
    createInterface()
    catchEvents();
    setRandomBallPosition();
    update();
}

