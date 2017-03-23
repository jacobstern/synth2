let _zenGarden
let _callbackFunctionPtr
let _zenGardenContext
let _helpers
let _audioContext
let _scriptProcessor
let _initialized = false
let _isStarted = false
let _receivers = new Map()

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

function _getMessageElements (message) {
  const numElements = _zenGarden.message_get_num_elements(message)
  const elements = []

  for (let i = 0; i < numElements; i++) {
    switch (_zenGarden.message_get_element_type(message, i)) {
      case MessageElementType.bang:
        elements.push('bang')
        break
      case MessageElementType.float:
        const value = _zenGarden.message_get_float(message, i)
        elements.push(value)
        break
      case MessageElementType.symbol:
        const symbol = _zenGarden.message_get_symbol(message, i)
        elements.push(symbol)
        break
    }
  }

  return elements
}

function _callbackFunction (functionType, userData, ptr) {
  if (functionType === CallbackFunctionType.receiverMessage) {
    const name = _helpers.name_message_pair_get_name(ptr)
    const receiver = _receivers.get(name)

    if (typeof receiver === 'function') {
      const message = _helpers.name_message_pair_get_message(ptr)
      const messageElements = _getMessageElements(message)

      receiver(messageElements)
    }
  }
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
    message_set_bang: Module.cwrap('zg_message_set_bang', null, ['number', 'number']),
    context_register_receiver: Module.cwrap('zg_context_register_receiver', null, ['number', 'string']),
    context_unregister_receiver: Module.cwrap('zg_context_unregister_receiver', null, ['number', 'string']),
    message_get_num_elements: Module.cwrap('zg_message_get_num_elements', 'number', ['number']),
    message_get_element_type: Module.cwrap('zg_message_get_element_type', 'number', ['number', 'number']),
    message_get_float: Module.cwrap('zg_message_get_float', 'number', ['number', 'number']),
    message_get_symbol: Module.cwrap('zg_message_get_symbol', 'string', ['number', 'number'])
  }
  _helpers = {
    name_message_pair_get_name: Module.cwrap('name_message_pair_get_name', 'string', ['number']),
    name_message_pair_get_message: Module.cwrap('name_message_pair_get_message', 'number', ['number'])
  }
  _callbackFunctionPtr = window.Runtime.addFunction(_callbackFunction)
}

const CallbackFunctionType = {
  printStd: 0,
  printErr: 1,
  pdDSP: 2,
  receiverMessage: 3,
  cannotFindObject: 4
}

const MessageElementType = {
  float: 0,
  symbol: 1,
  bang: 2
}

function _initAudio () {
  require('./vendor/AudioContextMonkeyPatch')

  _audioContext = new AudioContext()
  _scriptProcessor = _audioContext.createScriptProcessor(1024, 0, 2)
  _zenGardenContext = _zenGarden.context_new(
    0,
    2,
    _scriptProcessor.bufferSize,
    _audioContext.sampleRate,
    _callbackFunctionPtr,
    null
  )
}

export default {
  init () {
    if (_initialized) {
      return Promise.resolve()
    }

    return _getScript('__Emscripten_module', 'static/dst/module.js')
      .then(() => {
        if (_initialized) {
          return
        }

        _initZenGarden()
        _initAudio()
        _initialized = true
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

  receive (name, callback) {
    _receivers.set(name, callback)
    _zenGarden.context_register_receiver(_zenGardenContext, name)
  },

  send (receiver, args) {
    if (typeof args === 'number' || typeof args === 'string') {
      args = [args]
    }
    const message = _zenGarden.message_new(0.0, args.length)

    args.forEach((arg, index) => {
      switch (typeof arg) {
        case 'number':
          _zenGarden.message_set_float(message, index, arg)
          break
        case 'string':
          _zenGarden.message_set_symbol(message, index, arg)
          break
        default:
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
