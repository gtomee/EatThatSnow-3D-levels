var renderer;
var camera;
var scene;

// objects
var cube;


var paused;


window.onload = function() {
	init();
	
	// start rendering
	render(new Date().getTime());
	onmessage = function(ev) {
		paused = (ev.data == 'pause');
	};
}


function init() {
	// init renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(document.body.clientWidth, document.body.clientHeight);
	document.body.appendChild(renderer.domElement);
	renderer.setClearColorHex(0xEEEEEE, 1.0);
	renderer.clear();
	
	
	// init camera
	camera = new THREE.PerspectiveCamera(45, renderer.domElement.width/renderer.domElement.height, 1, 10000);
	camera.position.z = 300;
	
	// init scene
	scene = new THREE.Scene();
	
	for (var i = 0; i < 10; ++i) {
		// init cube and add it to the scene
		cube = new THREE.Mesh(
			new THREE.CubeGeometry(50,50,50),
			new THREE.MeshBasicMaterial({color: 0x00FF00, opacity: 1})
		);
		cube.position.x = i*60;
		cube.castShadow = true;
		cube.receiveShadow = true;
		
		scene.add(cube);
	}
	
	// init light
	var light = new THREE.SpotLight();
	light.position.set( 170, 330, -160 );
	scene.add(light);
	
	// enable shadows on the renderer
	renderer.shadowMapEnabled = true;

	// enable shadows for a light
	light.castShadow = true;
	
	renderer.render(scene, camera);
	paused = false;
	
}


function update() {
	
	
}

function render(t) {
	if (!paused) {
	  camera.position.set(
		Math.sin(t/1000)*300, 150, Math.cos(t/1000)*300);
	  renderer.clear();
	  camera.lookAt(scene.position);
	  renderer.render(scene, camera);
	}
	window.requestAnimFrame(render, renderer.domElement);
};