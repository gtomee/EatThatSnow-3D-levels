var renderer;
var camera;
var scene;
var controls;

var bounds = {x:0, y:0};

//models
var loader;
var textModel;
var starModel;
var fireballModel;

var stars = [];
var fireballs = [];

window.onload = function() {
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
		
		loadFireball();
	});
}

function loadFireball() {
	// star
	loader.load('data/models/fireball.dae', function(collada) {
		fireballModel = collada.scene;
		fireballModel.scale.set(15.0, 15.0, 15.0);
		fireballModel.castShadow = fireballModel.receiveShadow = false;
		fireballModel.updateMatrix();
		
		loadStar();
	});
	
}

function loadStar() {
	// star
	loader.load('data/models/star.dae', function(collada) {
		starModel = collada.scene;
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
		middleMat,
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
	
	// add another light
    var directionalLight = new THREE.DirectionalLight(0xeeeeee, 1.5);
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
				
				var posX = k*50 - bounds.x/2;
				var posY = j*50;
				
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
					cube.position.x = posX;
					cube.position.y = posY;
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
							sphere.position.x = posX;
							sphere.position.y = posY;
							sphere.castShadow = true;
							sphere.receiveShadow = true;
							scene.add(sphere);
							
						break;
						
						case 2:
							var newFireball = THREE.SceneUtils.cloneObject(fireballModel);
							newFireball.position.x = posX;
							newFireball.position.y = posY;
							fireballs.push(newFireball);
							scene.add(newFireball);
							
						break;
						
						case 3:
							var newStar = THREE.SceneUtils.cloneObject(starModel);
							newStar.position.x = posX;
							newStar.position.y = posY;
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

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseWheel(event) {
    fov -= event.wheelDeltaY * 0.05;
    camera.projectionMatrix = THREE.Matrix4.makePerspective(
		fov, 
		window.innerWidth / window.innerHeight, 
		1, 
		1100
	);
}

function render(t) {
	renderer.clear();
	if (starModel) {
		for (i in stars) {
			stars[i].rotation.y = t/900;
		}
	}
	
	if (fireballModel) {
		for (i in fireballs) {
			var delta = (Math.abs(Math.cos(t/200)+5.0)*5.0);
			fireballs[i].scale.set(delta, 15.0, delta);
		}
	}
	
	renderer.render(scene, camera);
	controls.update();
	window.requestAnimFrame(render, renderer.domElement);
};