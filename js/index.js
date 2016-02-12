var container;
var camera, scene, renderer;
var uniforms;
var startTime;
var lastRender = Date.now();

init();
animate();
startTime = Date.now();

function init() {
  container = document.getElementById( 'container' );
  camera = new THREE.Camera();
  camera.position.z = 1;
  scene = new THREE.Scene();
  var texture = new THREE.TextureLoader().load("tex16.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.flipY = false;
  uniforms = {
    iGlobalTime: { type: "f", value: 1.0 },
    iResolution: { type: "v2", value: new THREE.Vector2() },
    iChannel0: { type: "t", value: texture },
    iCamera: { type: "v3", value: new THREE.Vector3() },
  }
  var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
  var material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  });
  var mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);
  renderer = new THREE.WebGLRenderer();
  container.appendChild( renderer.domElement );
  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener("deviceorientation", onRotate);
}

function onWindowResize( event ) {
  uniforms.iResolution.value.x = window.innerWidth;
  uniforms.iResolution.value.y = window.innerHeight;
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onRotate(event) {
  uniforms.iCamera.value.x = event.alpha;
  uniforms.iCamera.value.y = event.beta;
  uniforms.iCamera.value.z = event.gamma;
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  if(Date.now() > lastRender + 33) {
    var currentTime = Date.now();
    lastRender = Date.now();
    uniforms.iGlobalTime.value = (currentTime - startTime) * 0.001;
    renderer.render( scene, camera );
  }
}
