let _zenGarden
let _zenGardenContext
let _audioContext
let _scriptProcessor
let _isStarted = false

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
    context_new_graph_from_string: Module.cwrap('zg_context_new_graph_from_string', 'number', ['number', 'string']),
    context_register_memorymapped_abstraction: Module.cwrap('zg_context_register_memorymapped_abstraction', null, ['number', 'string', 'string']),
    context_unregister_memorymapped_abstraction: Module.cwrap('zg_context_unregister_memorymapped_abstraction', null, ['number', 'string']),
    graph_attach: Module.cwrap('zg_graph_attach', null, ['number']),
    graph_delete: Module.cwrap('zg_graph_delete', null, ['number']),
    context_process: Module.cwrap('zg_context_process', null, ['number', 'number', 'number']),
    context_delete: Module.cwrap('zg_context_delete', null, ['number']),
    context_send_message: Module.cwrap('zg_context_send_message', null, ['number', 'string', 'number']),
    message_new: Module.cwrap('zg_message_new', 'number', ['number', 'number']),
    message_delete: Module.cwrap('zg_message_delete', null, ['number']),
    message_set_float: Module.cwrap('zg_message_set_float', null, ['number', 'number', 'number']),
    message_set_symbol: Module.cwrap('zg_message_set_symbol', null, ['number', 'number', 'string']),
    message_set_bang: Module.cwrap('zg_message_set_bang', null, ['number', 'number'])
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

  loadPatch (source) {
    const graph = _zenGarden.context_new_graph_from_string(_zenGardenContext, source)
    _zenGarden.graph_attach(graph)

    return {
      _ptr: graph
    }
  },

  destroyPatch (patch) {
    _zenGarden.graph_delete(patch._ptr)
  },

  registerAbstraction (name, source) {
    _zenGarden.context_register_memorymapped_abstraction(_zenGardenContext, name, source)
  },

  send (receiver, args) {
    const message = _zenGarden.message_new(0.0, args.length)

    args.forEach((arg, index) => {
      if (typeof arg === 'number') {
        _zenGarden.message_set_float(message, index, arg)
      } else if (typeof arg === 'string') {
        _zenGarden.message_set_symbol(message, index, arg)
      } else {
        throw new Error('Invalid message arg: ' + arg)
      }
    })

    _zenGarden.context_send_message(_zenGardenContext, receiver, message)
    _zenGarden.message_delete(message)
  },

  start () {
    if (_isStarted) {
      return
    }

    const Module = window.Module
    const blockSize = _scriptProcessor.bufferSize
    const bufferSize = blockSize * 2 * 4
    const scriptOutputPtr = Module._malloc(bufferSize)
    const scriptOutputBuffer = Module.HEAPU8.subarray(scriptOutputPtr, scriptOutputPtr + bufferSize)
    const outputBufferChannel1 = new Float32Array(
      scriptOutputBuffer.buffer,
      scriptOutputBuffer.byteOffset,
      blockSize
    )
    const outputBufferChannel2 = new Float32Array(
      scriptOutputBuffer.buffer,
      scriptOutputBuffer.byteOffset + blockSize * 4,
      blockSize
    )

    _scriptProcessor.onaudioprocess = audioProcessingEvent => {
      _zenGarden.context_process(_zenGardenContext, 0, scriptOutputPtr)

      const outputBuffer = audioProcessingEvent.outputBuffer

      outputBuffer.copyToChannel(outputBufferChannel1, 0)
      outputBuffer.copyToChannel(outputBufferChannel2, 1)
    }

    _scriptProcessor.connect(_audioContext.destination)
    _isStarted = true
  }
}
