import * as THREE from 'three'
import ReativeParticles from './entities/ReactiveParticles'
import * as dat from 'dat.gui'
import BPMManager from './managers/BPMManager'
import AudioManager from './managers/AudioManager'

export default class App {
  //THREE objects
  static camera = null
  static scene = null
  static renderer = null
  static holder = null
  static gui = null

  //Managers
  static audioManager = null
  static bpmManager = null

  constructor() {
    this.width = 0
    this.height = 0

    this.onClickBinder = () => this.init()
    document.addEventListener('pointerdown', this.onClickBinder)
  }

  init() {
    document.removeEventListener('pointerdown', this.onClickBinder)
    App.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    App.renderer.setClearColor(0x000000, 0)
    App.renderer.setSize(window.innerWidth, window.innerHeight)
    App.renderer.autoClear = false
    document.querySelector('.content').appendChild(App.renderer.domElement)

    App.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000)
    App.camera.position.z = 12
    App.camera.frustumCulled = false

    App.scene = new THREE.Scene()
    App.scene.add(App.camera)

    App.holder = new THREE.Object3D()
    App.holder.name = 'holder'
    App.scene.add(App.holder)
    App.holder.sortObjects = false

    App.gui = new dat.GUI()

    this.createManagers()

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  async createManagers() {
    this.managers = []

    App.audioManager = new AudioManager()
    await App.audioManager.loadAudioBuffer()

    App.bpmManager = new BPMManager()
    App.bpmManager.addEventListener('beat', () => {
      this.particles.onBPMBeat()
    })
    await App.bpmManager.detectBPM(App.audioManager.audio.buffer)

    document.querySelector('.user_interaction').remove()

    App.audioManager.play()

    this.createEntities()

    this.update()
  }

  createEntities() {
    this.particles = new ReativeParticles()
    this.particles.init()
  }

  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    App.camera.aspect = this.width / this.height
    App.camera.updateProjectionMatrix()
    App.renderer.setSize(this.width, this.height)
  }

  update() {
    requestAnimationFrame(() => this.update())

    this.particles?.update()
    App.audioManager.update()

    App.renderer.render(App.scene, App.camera)
  }
}
