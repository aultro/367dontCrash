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
    this.camera.position.z = -200;
    this.camera.position.y = 40;
    //this.camera.position.x = -100;

    this.tracker = new TrackballControls(this.camera);
    this.tracker.rotateSpeed = 2.0;
    // Allow zoom and pan
    this.tracker.noZoom = false;
    this.tracker.noPan = false;

    // Add background
    this.texture = new THREE.TextureLoader().load( 'space.jpg' );
    
    var backGeo = new THREE.BoxGeometry( 800, 400, 5);
    var backMat = new THREE.MeshBasicMaterial( {map: this.texture } );
    var background = new THREE.Mesh( backGeo, backMat );
    var moveBack = new THREE.Vector3(0, 75, 150);
    background.position.copy( moveBack );
    this.scene.add(background);
    
    // Add our Plane
    this.texture2 = new THREE.TextureLoader().load( 'floor.jpg' );

    var geometry = new THREE.BoxGeometry( 650, 5, 400);
    var material = new THREE.MeshPhongMaterial( {color: 0xd3d3d3} );
    //var material = new THREE.MeshBasicMaterial( {map: this.texture2} );
    var plane = new THREE.Mesh( geometry, material );  
    this.scene.add( plane );

    // Add our Player
    var playerGeo = new THREE.BoxGeometry( 8, 10, 5);
    var playerMat = new THREE.MeshBasicMaterial( {color: 0x0000FF} );
    var player = new THREE.Mesh( playerGeo, playerMat );
    var placePlayer = new THREE.Vector3(0, 5, -150);
    player.position.copy( placePlayer );
    this.scene.add(player);

    // Add our wall(s)
    this.wallArray = [];
    this.allWalls = [];
    this.count = 0;
    for (var i = 0; i < 5; i++){
      this.makeWalls();
    }
    // Wall Movement Matrix
    this.transX = new THREE.Matrix4().makeTranslation(0, 0, -2);
  
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

    window.addEventListener('keydown', (e) => this.moveLeft(e));
    
    this.score = 0;
    window.addEventListener('resize', () => this.resizeHandler());
    this.resizeHandler();
    this.startRender();
    //requestAnimationFrame(() => this.render());
  }
  
  render() {
    this.count += 1;
    //window.addEventListener('keydown', (e) => this.moveLeft(e));

    //Move and Remove Walls
    for (var i = 0; i < this.wallArray.length; i++){
      this.wallArray[i].matrix.multiply(this.transX);
      if(this.wallArray[i].matrix.elements[14] == -200){
        this.removeWalls(this.wallArray[i]);
      }
    }

    // Make new Walls ever 75 renders
    if(this.count%65 == 0){
      for (var i = 0; i < 5; i++){
        this.makeWalls();
      }
    }
    
    this.renderer.render(this.scene, this.camera);
    this.tracker.update();
    // Update Score
    if(this.count%10 == 0){
      this.score+=1;
      document.getElementById("finalScore").innerHTML = this.score;
    }
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

  moveLeft(e){
    switch (e.keyCode) {
      case 37:
          var right = new THREE.Matrix4().makeTranslation(-2, 0, 0);
          for (var i = 0; i < this.wallArray.length; i++){
            this.wallArray[i].matrix.multiply( right );
          }
          break;
      case 38:
          break;
      case 39:
          var left = new THREE.Matrix4().makeTranslation(2, 0, 0);
          for (var i = 0; i < this.wallArray.length; i++){
            this.wallArray[i].matrix.multiply( left );
          }
          break;
      case 40:
          break;
    }
  }

  stopRender(){
    this.renderBool = false;
    console.log(this.renderBool);
    console.log(this.wallArray.length);
  }
  
  startRender(){
    this.renderBool = true;
    requestAnimationFrame(() => this.render());
    console.log(this.renderBool);
  }

}