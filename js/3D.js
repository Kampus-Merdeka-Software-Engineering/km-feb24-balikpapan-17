import * as THREE from "https://cdn.skypack.dev/three@0.128.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap@3.9.1";

class SpiralCoffee {
  constructor() {
    this.container = document.getElementById("threedcontainer");
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.scene = new THREE.Scene();
    this.controls = null;
    this.urlLiquidGLB = "/assets/3d/liquid.glb";
    this.urlBeansGLB = "/assets/3d/beans.glb";
    this.models = [];

    this.init = this.init.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);
  }

  init() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 1, 7);
    this.camera.lookAt(0, 0, 0);

    window.addEventListener("resize", this.onWindowResize);

    this.initControls();
    this.loadModels();
    this.addLights();
    this.addGround();
    this.animate();
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = false;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.minPolarAngle = 0;
  }

  onWindowResize() {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  loadModels() {
    const loader = new GLTFLoader();

    loader.load(
      this.urlLiquidGLB,
      (gltf) => {
        const model = gltf.scene;
        model.castShadow = true;
        const scaleFactor = 6;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.setModelPositionAndRotation(
          model,
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 }
        );

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.material.color.set(0x8b14513);
          }
        });

        this.scene.add(model);
        this.models.push({ model, direction: 1 });

        gsap.to(model.rotation, {
          y: Math.PI * 5,
          duration: 100,
          repeat: -1,
          ease: "none",
        });
      },
      undefined,
      (error) => {
        console.error("An error happened", error);
      }
    );

    loader.load(
      this.urlBeansGLB,
      (gltf) => {
        const model = gltf.scene;
        model.castShadow = true;
        const scaleFactor = 10;
        model.scale.set(-scaleFactor, scaleFactor, scaleFactor);

        this.setModelPositionAndRotation(
          model,
          { x: 0, y: -1, z: 0 },
          { x: 0, y: 0, z: 0 }
        );

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
          }
        });

        this.scene.add(model);
        this.models.push({ model, direction: -1 });

        gsap.to(model.rotation, {
          y: -Math.PI * 2,
          duration: 100,
          repeat: -1,
          ease: "none",
        });
      },
      undefined,
      (error) => {
        console.error("An error happened", error);
      }
    );
  }

  setModelPositionAndRotation(model, position, rotation) {
    model.position.set(position.x, position.y, position.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 20, 2);
    directionalLight.castShadow = true;

    directionalLight.shadow.bias = -0.005;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 4024;

    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 60;
    directionalLight.shadow.camera.bottom = -60;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;

    this.scene.add(directionalLight);
  }

  addGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.ShadowMaterial({
      opacity: 0.5,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.3;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.models.forEach(({ model, direction }) => {
      model.rotation.y += direction * 0.001;
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const spiralCoffee = new SpiralCoffee();
  spiralCoffee.init();
});
