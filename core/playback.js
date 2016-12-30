import Pd from './pd'
import { getPureDataPatch } from '../common/api'

const MOTHER_PATCH_ID = 'UHVyZURhdGFQYXRjaDoxMg=='

let _initialized = false
let _currentSynthesizerPatch = -1

export default {

  get initialized () {
    return _initialized
  },

  init () {
    if (_initialized) {
      return Promise.resolve()
    }

    return Promise.all([Pd.init(), getPureDataPatch(MOTHER_PATCH_ID)])
      .then(([_, patchDefinition]) => {
        Pd.loadPatch(patchDefinition.source)
        _initialized = true
      })
  },

  setSynthesizerPatch (patchDefinition) {
    const abstractions = {}
    for (let { name, source } in patchDefinition.abstractions) {
      abstractions[name] = source
    }

    _currentSynthesizerPatch = Pd.loadPatch(patchDefinition.source, abstractions)
  }
}
