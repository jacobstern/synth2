import Pd from './pd'

let _initialized = false

export default {

  get initialized () {
    return _initialized
  },

  init () {
    if (_initialized) {
      return Promise.resolve()
    }

    return Pd.init()
      .then(() => {
        _initialized = true
      })
  }
}
