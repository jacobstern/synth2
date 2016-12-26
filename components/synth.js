import { Component } from 'react'
import Keyboard from './keyboard'
import Playback from '../core/playback'

export default class extends Component {

  componentDidMount () {
    if (!Playback.initialized) {
      Playback.init()
    }
  }

  _onNoteActivated = note => {
    console.log(note)
  }

  _onNoteDeactivated = note => {

  }

  render () {
    return (
      <div>
        <Keyboard
          onNoteActivated={this._onNoteActivated}
          onNoteDeactivated={this._onNoteDeactivated}
        />
      </div>
    )
  }
}
