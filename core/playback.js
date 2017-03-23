import EventEmitter from 'wolfy87-eventemitter'
import Pd from './pd'
import motherPatch from './patches/mother'

class PlaybackManager extends EventEmitter {

  constructor () {
    super()

    this._initialized = false
    this._currentSynthesizerPatch = null
    this._knob1 = 0
    this._knob2 = 0
    this._knob3 = 0
    this._knob4 = 0
    this._volume = 0
  }

  get initialized () {
    return this._initialized
  }

  init () {
    if (this._initialized) {
      return Promise.resolve()
    }

    const handleScreenMessage = messageName => args => {
      this.emitEvent(messageName, [args.join(' ')])
    }

    return Pd.init().then(() => {
      Pd.start()
      Pd.loadPatch(motherPatch.source)
      Pd.send('vol', this._volume)
      Pd.receive('screenLine1', handleScreenMessage('screenLine1'))
      Pd.receive('screenLine2', handleScreenMessage('screenLine2'))
      Pd.receive('screenLine3', handleScreenMessage('screenLine3'))
      Pd.receive('screenLine4', handleScreenMessage('screenLine4'))
      Pd.receive('screenLine5', handleScreenMessage('screenLine5'))
      Pd.receive('led', value => {
        const color = parseInt(value[0])
        this.emitEvent('led', [color])
      })

      this._initialized = true
    })
  }

  noteOn (number) {
    if (!this._initialized) {
      return
    }

    Pd.send('notes', [number, 100])
  }

  noteOff (number) {
    if (!this._initialized) {
      return
    }

    Pd.send('notes', [number, 0])
  }

  auxButtonPressed () {
    Pd.send('aux', 1)
  }

  auxButtonReleased () {
    Pd.send('aux', 0)
  }

  getKnobValue (index) {
    switch (index) {
      case 0:
        return this._knob1
      case 1:
        return this._knob2
      case 2:
        return this._knob3
      case 3:
        return this._knob4
      default:
        throw new Error('Invalid knob index')
    }
  }

  setKnobValue (index, value) {
    if (!this._initialized) {
      return
    }
    let nameValuePair = {}
    switch (index) {
      case 0:
        nameValuePair = ['knob1', this._knob1]
        break
      case 1:
        nameValuePair = ['knob2', this._knob2]
        break
      case 2:
        nameValuePair = ['knob3', this._knob3]
        break
      case 3:
        nameValuePair = ['knob4', this._knob4]
        break
      default:
        throw new Error('Invalid knob index')
    }
    const [name, currentValue] = nameValuePair
    if (currentValue !== value) {
      Pd.send(name, value)
    }
  }

  getVolume () {
    return this._volume
  }

  setVolume (value) {
    if (this._initialized && value !== this._volume) {
      Pd.send('vol', value)
    }
    this._volume = value
  }

  getSynthesizerPatch () {
    return this._currentSynthesizerPatch
  }

  setSynthesizerPatch (patchDefinition) {
    if (this._currentSynthesizerPatch !== null) {
      Pd.destroyPatch(this._currentSynthesizerPatch)
    }

    if (patchDefinition.abstractions) {
      patchDefinition.abstractions.forEach(abstraction => {
        Pd.registerAbstraction(abstraction.name, abstraction.source)
      })
    }

    this._currentSynthesizerPatch = Pd.loadPatch(patchDefinition.source)

    Pd.send('knob1', this._knob1)
    Pd.send('knob2', this._knob2)
    Pd.send('knob3', this._knob3)
    Pd.send('knob4', this._knob4)
  }
}

export default new PlaybackManager()
