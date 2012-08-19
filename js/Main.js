var renderer;
var camera;
var scene;
var controls;

var paused;

var bounds = {x:0, y:0};

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
	renderer.setClearColorHex(0x50CCE1FF, 1.0);
	renderer.clear();
	
	
	// init camera
	camera = new THREE.PerspectiveCamera(45, 
		renderer.domElement.width/renderer.domElement.height, 
		1, 
		10000);
	camera.position.z = 300;
	
	controls = new THREE.TrackballControls(camera);
	
	// init scene
	scene = new THREE.Scene();
	
	
	// loading materials
	var topMat = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("data/img/top.png")
	});
	
	var bottomMat = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("data/img/bottom.png")
	});
	
	var upDownMat = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("data/img/up_down.png")
	});
	
	var middleMat = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("data/img/middle.png")
	});
	
	var upMiddleMat = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("data/img/up_middle.png")
	});
	
	var materials; // final materials
	
	var matUpDown = [
		upDownMat,
		upDownMat,
		topMat,
		bottomMat,
		upDownMat,
		upDownMat
	];
	
	var matMiddle = [
		middleMat,
		middleMat,
		middleMat,
		middleMat,
		middleMat,
		middleMat
	];
	
	var matUpMiddle = [
		upMiddleMat,
		upMiddleMat,
		topMat,
		bottomMat,
		upMiddleMat,
		upMiddleMat
	];
	
	// init light
	var light = new THREE.AmbientLight(0x999999);
	light.position.set(0, 330, 160);
	scene.add(light);
	
	// enable shadows on the renderer
	renderer.shadowMapEnabled = false;

	// enable shadows for a light
	light.castShadow = true;
	
	// load level
	$.ajax({
		dataType: 'text',
		success: function(string) {
			var file = $.parseJSON(string);
			var tiles = file.data;
			
			var width = file.width;
			var height = file.height;
			
			
			var j = height-1;
			for (var i = 0; i < tiles.length; ++i) {
				
				var k = i%width;
				if (k == 0) {
					j--;
				}
				
				if (tiles[i] >= 9) {
					
					switch (tiles[i]) {
					
						case 9:
							materials = matUpMiddle;
						break;
						case 10:
							materials = matMiddle;
						break;
						case 11:
							materials = matUpDown;
						break;
						case 12:
							materials = matUpDown;
						break;
					}
					
					cube = new THREE.Mesh(
						new THREE.CubeGeometry(50,50,50,3,3,3, materials),
						new THREE.MeshFaceMaterial()
					);
					cube.position.x = k*50;
					cube.position.y = j*50;
					cube.castShadow = true;
					cube.receiveShadow = true;
					
					scene.add(cube);
					
					if (cube.position.x > bounds.x) {
						bounds.x = cube.position.x;
					}
					
					if (cube.position.y > bounds.y) {
						bounds.y = cube.position.y;
					}
				}
				
			}
			
			scene.position.x = scene.position.x+bounds.x/2;
			camera.position.set(bounds.x/2, bounds.y, 1900);
			camera.lookAt(scene.position.x +bounds.x/2, scene.position.y + bounds.y);
			console.log(scene.position.x +bounds.x/2);
		},
		url: 'data/levels/4.json'
	});
		
	
	
	renderer.render(scene, camera);
	paused = false;
	
	window.addEventListener('resize', onWindowResize, false );
	
}



function update() {
	
	
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}


function render(t) {
	if (!paused) {
	  //camera.position.set(Math.sin(t/1000)*1900 + bounds.x/2, bounds.y, 900);
	  renderer.clear();
	  //camera.lookAt(scene.position.x +bounds.x/2, scene.position.y + bounds.y);
	  //camera.lookAt(scene.position);
	  renderer.render(scene, camera);
	}
	
	controls.update();
	
	window.requestAnimFrame(render, renderer.domElement);
};