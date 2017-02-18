import { Component } from 'react'
import fetch from 'isomorphic-fetch'
import Keyboard from './keyboard'
import ParamSlider from './param-slider'
import Playback from '../core/playback'

export default class extends Component {

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
  }

  _onNoteActivated = note => {
    Playback.noteOn(note)
  }

  _onNoteDeactivated = note => {
    Playback.noteOff(note)
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
