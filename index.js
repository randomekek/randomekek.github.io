var camera, scene, renderer, uniforms;
var startTime = Date.now(), lastRender = Date.now();
var rotationDiv = document.getElementById('rotation');
var positionDiv = document.getElementById('position');
var ToRadians = Math.PI / 180;
var debug = true;
var addedDirectionX = 0;
var deviceOrientation = {x: 0, y: 0, z: 0};

init();

function init() {
  camera = new THREE.Camera(0, 0, 1);
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  uniforms = {
    iGlobalTime: { type: 'f', value: 1.0 },
    iResolution: { type: 'v2', value: new THREE.Vector2() },
    iChannel0: { type: 't', value: loadTex16() },
    iDirection: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
    iPosition: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
  }
  scene.add(new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent
    })
  ));
  document.getElementById('container').appendChild(renderer.domElement);
  onResize();
  window.addEventListener('resize', onResize, false);
  window.addEventListener('deviceorientation', onRotate, false);
  window.addEventListener('click', onClick, false);
  requestAnimationFrame(animate);
  setInterval(integrate, 33);
}

function loadTex16() {
  var texture = new THREE.TextureLoader().load('tex16.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.flipY = false;
  return texture;
}

function onResize(event) {
  uniforms.iResolution.value.x = window.innerWidth;
  uniforms.iResolution.value.y = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onRotate(event) {
  // the orientation values do not seem to change with device rotation
  var direction = uniforms.iDirection.value;
  var down = event.gamma < 0;
  deviceOrientation.x = (down ? event.alpha : (event.alpha + 180) % 360) * ToRadians;
  deviceOrientation.y = (down ? event.beta : (event.beta > 0 ? 180 : -180) - event.beta) * ToRadians;
  deviceOrientation.z = ((down ? -90 : 90) - event.gamma) * ToRadians;
}

function integrate() {
  var direction = uniforms.iDirection.value;
  var position = uniforms.iPosition.value;
  var velocity = 0.03;
  addedDirectionX += -0.03 * direction.y;
  direction.x = deviceOrientation.x + addedDirectionX;
  direction.y = deviceOrientation.y;
  direction.z = deviceOrientation.z;
  position.x += velocity * Math.cos(direction.z) * Math.sin(direction.x);
  position.y += velocity * Math.sin(direction.z) * 1;
  position.z += velocity * Math.cos(direction.z) * Math.cos(direction.x);
  if(debug) {
    rotationDiv.innerText = 'rot: ' + [deviceOrientation.x, deviceOrientation.y, deviceOrientation.z].map(round2).join(', ');
    positionDiv.innerText = 'pos: ' + [position.x, position.y, position.z].map(round2).join(', ');
  }
}

function onClick() {
  document.body.webkitRequestFullscreen();
}

function round2(value) {
  return [value >= 0 ? '+' : '', Math.round(value * 20) / 20, '000000'].join('').substr(0, 5);
}

function animate() {
  requestAnimationFrame(animate);
  var frameWait = 33
  if(Date.now() > lastRender + frameWait) {
    lastRender = Date.now();
    uniforms.iGlobalTime.value = 0.001 * (lastRender - startTime);
    renderer.render(scene, camera);
  }
}
