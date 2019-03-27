import * as THREE from 'three';
import orbit from 'three-orbit-controls';
const OrbitControls = orbit(THREE);
import TrackballControls from 'three-trackballcontrols';
import Wall from './models/Wall';

export default class App {
  constructor() {
    const c = document.getElementById('mycanvas');
    // Enable antialias for smoother lines
    this.renderer = new THREE.WebGLRenderer({canvas: c, antialias: true});
    this.scene = new THREE.Scene();
    // Use perspective camera:
    //   Field of view: 75 degrees
    //   Screen aspect ration 4:3
    //   Near plane at z=0.5, far plane at z=500
    this.camera = new THREE.PerspectiveCamera(75, 4/3, 0.5, 500);
    // Place the camera at (0,0,100)
    this.camera.position.z = -120;
    this.camera.position.y = 40;
    //this.camera.position.x = -100;

    this.tracker = new TrackballControls(this.camera);
    this.tracker.rotateSpeed = 2.0;
    // Allow zoom and pan
    this.tracker.noZoom = false;
    this.tracker.noPan = false;

    // Add background
    this.texture = new THREE.TextureLoader().load( 'space.jpg' );
    
    var backGeo = new THREE.BoxGeometry( 600, 200, 5);
    var backMat = new THREE.MeshBasicMaterial( {map: this.texture } );
    var background = new THREE.Mesh( backGeo, backMat );
    var moveBack = new THREE.Vector3(0, 75, 150);
    background.position.copy( moveBack );
    this.scene.add(background);
    
    // Add our Plane
    this.texture2 = new THREE.TextureLoader().load( 'floor.jpg' );

    var geometry = new THREE.BoxGeometry( 400, 5, 400);
    var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3} );
    //var material = new THREE.MeshBasicMaterial( {map: this.texture2} );
    var plane = new THREE.Mesh( geometry, material );  
    this.scene.add( plane );

    // Add our wall(s)
    this.wallArray = [];
    this.allWalls = [];
    this.count = 0;
    for (var i = 0; i < 5; i++){
      this.makeWalls();
    }
    // Wall Movement Matrix
    this.transX = new THREE.Matrix4().makeTranslation(0, 0, -1);
  
    // Add our light
	  const lightOne = new THREE.DirectionalLight (0xFFFFFF, 1.0);
	  lightOne.position.set (10, 40, 100);
    this.scene.add (lightOne);
    
    // Add our Event Listeners
    this.rederBool = true;
    var startBtn = document.getElementById("start");
    startBtn.addEventListener('click', () => this.startRender());
    
    var stopBtn = document.getElementById("stop");
    stopBtn.addEventListener('click', () => this.stopRender());
	
    window.addEventListener('resize', () => this.resizeHandler());
    this.resizeHandler();
    this.startRender();
    requestAnimationFrame(() => this.render());
  }

  render() {
    this.count += 1;
    window.addEventListener('keydown', () => this.moveLeft());

    for (var i = 0; i < this.wallArray.length; i++){
      this.wallArray[i].matrix.multiply(this.transX);
      if(this.wallArray[i].matrix.elements[14] == -200){
        this.removeWalls(this.wallArray[i]);
      }
    }

    if(this.count%75 == 0){
      for (var i = 0; i < 5; i++){
        this.makeWalls();
      }
    }
    
    this.renderer.render(this.scene, this.camera);
    this.tracker.update();
    // setup the render function to "autoloop"
    if (this.renderBool == true){
      requestAnimationFrame(() => this.render());
    }
  }

  resizeHandler() {
    const canvas = document.getElementById("mycanvas");
    let w = window.innerWidth - 16;
    let h = 0.75 * w;  /* maintain 4:3 ratio */
    if (canvas.offsetTop + h > window.innerHeight) {
      h = window.innerHeight - canvas.offsetTop - 16;
      w = 4/3 * h;
    }
    canvas.width = w;
    canvas.height = h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.tracker.handleResize();
  }

  makeWalls(){
    this.newWall = new Wall(20,20,5,this.count);
    this.ypos = Math.floor((Math.random() * 100) - 200); 
    this.xpos = ((Math.random() * 400) - 200); 
    this.move = new THREE.Vector3(this.xpos, 10, -this.ypos);
    this.newWall.position.copy( this.move );
    this.newWall.matrixAutoUpdate = false;
    this.newWall.updateMatrix();
    this.wallArray.push(this.newWall);
    this.scene.add( this.newWall );
  }

  removeWalls(endWall){
    this.scene.remove(endWall);  
  }

  moveLeft(){
    var left = new THREE.Matrix4().makeTranslation(0.01, 0, 0);
    for (var i = 0; i < this.wallArray.length; i++){
      this.wallArray[i].matrix.multiply( left );
    }
    /*
    switch (e.keyCode) {
      case 37:
          alert('left');
          break;
      case 38:
          alert('up');
          break;
      case 39:
          alert('right');
          break;
      case 40:
          alert('down');
          break;
    }
    */
  }

  stopRender(){
    this.renderBool = false;
    console.log(this.renderBool);
  }
  
  startRender(){
    this.renderBool = true;
    console.log(this.renderBool);
  }

}