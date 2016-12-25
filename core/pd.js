import uuid from 'uuid'

let _zenGarden
let _zenGardenContext
let _audioContext
let _scriptProcessor
let _patchEntries = {}

function _getScript (id, source) {
  return new Promise(function (resolve, reject) {
    const completeRegex = /loaded|complete/
    let script = document.getElementById(id)

    if (script && completeRegex.test(script.readyState)) {
      resolve()
    }

    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.async = 1
      document.body.appendChild(script)
    }

    script.onerror = reject
    script.onload = script.onreadystatechange = function () {
      if (!script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = script.onreadystatechange = null
        script = null
      }
    }

    script.src = source
  })
}

function _initZenGarden () {
  const Module = window.Module
  _zenGarden = {
    context_new: Module.cwrap('zg_context_new', 'number', ['number', 'number', 'number', 'number', 'number']),
    context_new_graph_from_file: Module.cwrap('zg_context_new_graph_from_file', 'number', ['number', 'string', 'string']),
    graph_attach: Module.cwrap('zg_graph_attach', null, ['number']),
    context_process: Module.cwrap('zg_context_process', null, ['number', 'number', 'number']),
    context_delete: Module.cwrap('zg_context_delete', null, ['number']),
    context_send_messageV: Module.cwrap('zg_context_send_messageV', null, ['number', 'string', 'number', 'string']),
    context_send_messageV1n: Module.cwrap('zg_context_send_messageV', null, ['number', 'string', 'number', 'string', 'number'])
  }
}

function _initAudio () {
  require('./vendor/AudioContextMonkeyPatch')

  _audioContext = new AudioContext()
  _scriptProcessor = _audioContext.createScriptProcessor(1024, 0, 2)
  _zenGardenContext = _zenGarden.context_new(0, 2, _scriptProcessor.bufferSize, _audioContext.sampleRate, null, null)
}

export default {
  init () {
    return _getScript('__Emscripten_module', 'static/dst/module.js')
      .then(() => {
        _initZenGarden()
        _initAudio()
      })
  },

  loadPatch (source, localAbstractions) {
    const id = uuid.v1()
    const FS = window.FS

    FS.mkdir(id)
    FS.writeFile(id + '/' + id, source)

    _patchEntries[id] = { id }

    if (localAbstractions) {
      for (let key in localAbstractions) {
        FS.writeFile(id + '/' + key, localAbstractions[key])
      }

      _patchEntries[id].localAbstractions = Object.keys(localAbstractions)
    }

    return id
  },

  unloadPatch (id) {
    const entry = _patchEntries[id]
    const FS = window.FS

    if (entry) {
      const abstractions = entry.localAbstractions

      if (abstractions) {
        abstractions.forEach(name => FS.rm(id + '/' + name))
      }

      FS.rm(id + '/' + id)
      FS.rmdir(id)

      _patchEntries[id] = undefined
    }
  }
}
