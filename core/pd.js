let _zenGarden
let _zenGardenContext
let _audioContext
let _scriptProcessor
let _patchEntries = {}
let _globalId = 0

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
      if (!script.readyState || completeRegex.test(script.readyState)) {
        script.onload = script.onreadystatechange = null
        script = null

        resolve()
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
    const FS = window.FS
    const id = _globalId++
    const directory = 'patch' + id
    const fileName = 'main.pd'
    const filePath = directory + '/' + fileName

    FS.mkdir(directory)
    FS.writeFile(filePath, source)

    const graph = _zenGarden.context_new_graph_from_file(_zenGardenContext, directory + '/', fileName)
    _zenGarden.graph_attach(graph)

    _patchEntries[id] = {
      main: graph
    }

    if (localAbstractions) {
      for (let key in localAbstractions) {
        FS.writeFile(directory + '/' + key, localAbstractions[key])
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
