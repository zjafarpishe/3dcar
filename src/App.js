import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


import "./App.css"
function App() {

  const renderer = useRef()
  const scene = useRef()
  const camera = useRef()
  const controls = useRef()
  const allAnimatioin = useRef()
  const AppRef = useRef()
  const mixerAnimation = useRef()
  const body = useRef()

  let clock = new THREE.Clock();


  function RenderScene() {
    renderer.current = new THREE.WebGLRenderer({ powerPreference: 'high-performance', antialias: true });
    renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.current.setSize(AppRef.current.offsetWidth, AppRef.current.offsetHeight);
    // renderer.current.outputEncoding = THREE.sRGBEncoding;
    renderer.current.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.current.toneMappingExposure = 0.85;
    console.log(AppRef.current.offsetWidth);
    AppRef.current.appendChild(renderer.current.domElement)
  }


  function Camera() {
    camera.current = new THREE.PerspectiveCamera(40, AppRef.current.offsetWidth / AppRef.current.offsetHeight, 0.1, 100);
    camera.current.position.set(-2, 1, 2);
    camera.current.aspect = AppRef.current.offsetWidth / AppRef.current.offsetHeight;
    camera.current.updateProjectionMatrix();
  }


  function OrbitControl() {
    controls.current = new OrbitControls(camera.current, renderer.current.domElement);
    controls.current.enableDamping = false;
    // controls.current.minDistance = 0.2;
    // controls.current.maxDistance = 4;
    controls.current.target.set(0, 0, 0);
    controls.current.update();
    controls.current.autoRotateSpeed = 0.5
    controls.rotateSpeed = 2;


    controls.current.addEventListener('change', () => {


      controls.current.minPolarAngle = 0;
      controls.current.maxPolarAngle = Math.PI / 2;


    });
  }



  function CreateScene() {
    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(0xffffff);
    scene.current.environment = new RGBELoader().load('christmas_photo_studio_07_1k (1).hdr');
    scene.current.environment.mapping = THREE.EquirectangularReflectionMapping;


  }


  function AddModel() {
    const loader = new GLTFLoader();


    loader.load('car/scene.gltf', function (gltf) {


      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          if (child.material.name == "body")
            body.current = child
        }

      })
      gltf.scene.scale.set(0.5, 0.5, 0.5)
      allAnimatioin.current = gltf.animations
      const clip = THREE.AnimationClip.findByName(gltf.animations, "AllActions");
      if (clip) {
        mixerAnimation.current = new THREE.AnimationMixer(gltf.scene);
        mixerAnimation.current.clipAction(clip).play();
      }

      scene.current.add(gltf.scene)

    });
  }



  function init() {
    CreateScene()
    RenderScene()
    Camera()
    OrbitControl()
    window.addEventListener('resize', onWindowResize);
  }



  function AddLight() {

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.name = 'Spot Light';
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.3;
    spotLight.position.set(15, 15, 10);
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 5;
    spotLight.shadow.camera.far = 40;
    spotLight.shadow.mapSize.width = 1024 * 10;
    spotLight.shadow.mapSize.height = 1024 * 10;
    spotLight.shadow.radius = 5
    spotLight.shadow.blurSamples = 1
    scene.current.add(spotLight);
  }

  function onWindowResize() {
    camera.current.aspect = AppRef.current.offsetWidth / AppRef.current.offsetHeight;
    camera.current.updateProjectionMatrix();
    renderer.current.setSize(AppRef.current.offsetWidth, AppRef.current.offsetHeight);

  }


  function ChangeColorHandler(e){
console.dir(e.target.value);
body.current.material.color.set(e.target.value)
  }
  function render() {
    controls.current.update();
    renderer.current.render(scene.current, camera.current);
    var delta = clock.getDelta();
    if (mixerAnimation.current) mixerAnimation.current.update(delta)
    renderer.current.setAnimationLoop(render)

  }


  useEffect(() => {
    init();
    AddModel()
    AddLight()
    render()


  }, [])




  return (
    <div className="App " ref={AppRef}>
      <div className='absolute bottom-5 right-5 flex flex-col'>
        <button className='bottom-5'>left</button>
        <button className='bottom-5'>right</button>
        <input onChange={ChangeColorHandler} className='bottom-5' type='color' />
      </div>
    </div>
  );
}

export default App;
