import Pd from './pd'
import motherPatch from './patches/mother'

let _initialized = false
let _currentSynthesizerPatch = null

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
      Pd.send('vol', [0.6])

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

    Pd.send('knob1', [0.6])
    Pd.send('knob2', [0.6])
    Pd.send('knob3', [0.6])
    Pd.send('knob4', [0.6])
  }
}
