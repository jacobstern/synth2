import { Component } from 'react'
import fetch from 'isomorphic-fetch'
import Keyboard from './keyboard'
import ParamSlider from './param-slider'
import Playback from '../core/playback'

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
    const responses = await Promise.all([
      fetch('static/pd/sample_audio.pd'),
      fetch('static/pd/sample_audio_note.pd')
    ])
    const [
      main,
      sample_audio_note // eslint-disable-line camelcase
    ] = await Promise.all(responses.map(
      response => response.text()
    ))
    Playback.setSynthesizerPatch({
      source: main,
      abstractions: [
        { name: 'sample_audio_note', source: sample_audio_note }
      ]
    })
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
      <div onKeyPress={this._onKeyDown}>
        <ParamSlider />
        <Keyboard
          onNoteActivated={this._onNoteActivated}
          onNoteDeactivated={this._onNoteDeactivated}
        />
      </div>
    )
  }
}
