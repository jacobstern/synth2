import Pd from './pd'
import motherPatch from './patches/mother'

let _initialized = false
let _currentSynthesizerPatch = null
let _knob1 = 0
let _knob2 = 0
let _knob3 = 0
let _knob4 = 0
let _volume = 0

export default {

  get initialized () {
    return _initialized
  },

  init () {
    if (_initialized) {
      return Promise.resolve()
    }

    return Pd.init().then(() => {
      Pd.start()
      Pd.loadPatch(motherPatch.source)
      Pd.send('vol', _volume)

      _initialized = true
    })
  },

  noteOn (number) {
    if (!_initialized) {
      return
    }

    Pd.send('notes', [number, 100])
  },

  noteOff (number) {
    if (!_initialized) {
      return
    }

    Pd.send('notes', [number, 0])
  },

  auxButtonPressed () {
    Pd.send('aux', 1)
  },

  auxButtonReleased () {
    Pd.send('aux', 0)
  },

  getKnobValue (index) {
    switch (index) {
      case 0:
        return _knob1
      case 1:
        return _knob2
      case 2:
        return _knob3
      case 3:
        return _knob4
      default:
        throw new Error('Invalid knob index')
    }
  },

  setKnobValue (index, value) {
    if (!_initialized) {
      return
    }
    let nameValuePair = {}
    switch (index) {
      case 0:
        nameValuePair = ['knob1', _knob1]
        break
      case 1:
        nameValuePair = ['knob2', _knob2]
        break
      case 2:
        nameValuePair = ['knob3', _knob3]
        break
      case 3:
        nameValuePair = ['knob4', _knob4]
        break
      default:
        throw new Error('Invalid knob index')
    }
    const [name, currentValue] = nameValuePair
    if (currentValue !== value) {
      Pd.send(name, value)
    }
  },

  getVolume () {
    return _volume
  },

  setVolume (value) {
    if (_initialized && value !== _volume) {
      Pd.send('vol', value)
    }
    _volume = value
  },

  getSynthesizerPatch () {
    return _currentSynthesizerPatch
  },

  setSynthesizerPatch (patchDefinition) {
    if (_currentSynthesizerPatch !== null) {
      Pd.destroyPatch(_currentSynthesizerPatch)
    }

    if (patchDefinition.abstractions) {
      patchDefinition.abstractions.forEach(abstraction => {
        Pd.registerAbstraction(abstraction.name, abstraction.source)
      })
    }

    _currentSynthesizerPatch = Pd.loadPatch(patchDefinition.source)

    Pd.send('knob1', _knob1)
    Pd.send('knob2', _knob2)
    Pd.send('knob3', _knob3)
    Pd.send('knob4', _knob4)
  }
}
