import { Component } from 'react'
import Keyboard from './keyboard'
import ParamSlider from './param-slider'
import Playback from '../core/playback'
import testPatch from '../core/patches/test'

const KEYMAP = {
  'q': 48,
  '2': 49,
  'w': 50,
  '3': 51,
  'e': 52,
  'r': 53,
  '5': 54,
  't': 55
}

export default class extends Component {

  constructor (props) {
    super(props)
    this._keyboardNotes = new Set()
  }

  async componentDidMount () {
    await Playback.init()
    Playback.setSynthesizerPatch(testPatch)
    // Need a better way of handling key input
    document.addEventListener('keydown', this._onKeyDown)
    document.addEventListener('keyup', this._onKeyUp)
  }

  componentWillUnmount () {
    this._keyboardNotes.forEach(note => {
      Playback.noteOff(note)
    })
    this._keyboardNotes.clear()
    document.removeEventListener('keydown', this._onKeyDown)
    document.removeEventListener('keyup', this._onKeyUp)
  }

  _onNoteActivated = note => {
    Playback.noteOn(note)
  }

  _onNoteDeactivated = note => {
    Playback.noteOff(note)
  }

  _onKeyDown = event => {
    const note = KEYMAP[event.key]
    if (typeof note === 'number' && !this._keyboardNotes.has(note)) {
      this._keyboardNotes.add(note)
      Playback.noteOn(note)
    }
  }

  _onKeyUp = event => {
    const note = KEYMAP[event.key]
    if (typeof note === 'number' && this._keyboardNotes.has(note)) {
      this._keyboardNotes.delete(note)
      Playback.noteOff(note)
    }
  }

  render () {
    return (
      <div>
        <ParamSlider />
        <Keyboard
          onNoteActivated={this._onNoteActivated}
          onNoteDeactivated={this._onNoteDeactivated}
        />
      </div>
    )
  }
}
