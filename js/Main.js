var renderer;
var camera;
var scene;
var controls;

var paused;

var bounds = {x:0, y:0};

//models
var loader;
var textModel;
var starModel;

var stars = [];


window.onload = function() {
	// MODELS
	// text
	loader = new THREE.ColladaLoader();
	loadText();
}

function loadText() {
	loader.load('data/models/level4.dae', function(collada) {
		textModel = collada.scene;
		textModel.scale.set(100.1, 100.1, 100.1);
		textModel.position.x = 0;
		textModel.position.y = 300;
		textModel.castShadow = textModel.receiveShadow = true;
		textModel.updateMatrix();
		
		loadStar();
	});
}

function loadStar() {
	// star
	loader.load('data/models/star.dae', function(collada) {
		starModel = collada.scene;
		starModel.geometry = collada.scene.geometry;
		starModel.material = collada.scene.material;
		
		starModel.scale.set(15.0, 15.0, 15.0);
		starModel.castShadow = starModel.receiveShadow = true;
		starModel.updateMatrix();
		loaded = true;
		
		init();
		// start rendering
		render(new Date().getTime());
	});
	
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
		
	camera.position.z = 1500;
	
	controls = new THREE.TrackballControls(camera);
	
	// init scene
	scene = new THREE.Scene();
	
	// add text to scene
	scene.add(textModel);
	
	// loading block materials
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
	
	// loading snowball material
	var snowballMat = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("data/img/snowball.png")
	});
	
	// init light
	var light = new THREE.AmbientLight(0x999999);
	light.position.set(0, 330, 160);
	scene.add(light);
	
	// Add some lights to the scene
    var directionalLight = new THREE.DirectionalLight(0xeeeeee, 1.0);
    directionalLight.position.set(-1, 0, 500);
    scene.add(directionalLight);
	
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
			
			bounds.x = width*50;
			bounds.y = height*50;
			
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
					
					var cube = new THREE.Mesh(
						new THREE.CubeGeometry(50,50,50,3,3,3, materials),
						new THREE.MeshFaceMaterial()
					);
					cube.position.x = k*50 - bounds.x/2;
					cube.position.y = j*50;
					cube.castShadow = true;
					cube.receiveShadow = true;
					
					scene.add(cube);
					
				} else {
					switch (tiles[i]) {
						case 1:
							var sphere = new THREE.Mesh(
								new THREE.SphereGeometry(25, 50, 50),
								snowballMat
							);
							
							sphere.position.x = k*50 - bounds.x/2;
							sphere.position.y = j*50;
							sphere.castShadow = true;
							sphere.receiveShadow = true;
							
							scene.add(sphere);
							
						break;
						
						case 3:
							var newStar = THREE.SceneUtils.cloneObject(starModel);
							newStar.position.x = k*50 - bounds.x/2;
							newStar.position.y = j*50;
							stars.push(newStar);
							scene.add(newStar);
							
						break;
						
					}
					
				}
				
			}
			
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

function onDocumentMouseWheel( event ) {
    fov -= event.wheelDeltaY * 0.05;
    camera.projectionMatrix = THREE.Matrix4.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
}


function render(t) {
	//camera.position.set(Math.sin(t/1000)*1900 + bounds.x/2, bounds.y, 900);
	renderer.clear();
	//camera.lookAt(scene.position.x +bounds.x/2, scene.position.y + bounds.y);
	//camera.lookAt(scene.position);
	if (starModel) {
		for (i in stars) {
			stars[i].rotation.y = t/900;
		}
	}
		
	renderer.render(scene, camera);
	
	controls.update();
	
	window.requestAnimFrame(render, renderer.domElement);
};