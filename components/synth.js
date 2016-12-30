import { Component } from 'react'
import Keyboard from './keyboard'
import Playback from '../core/playback'

export default class extends Component {

  componentDidMount () {
    Playback.init()
      .then(() => {
        const patch = this.props.patches[0]
        Playback.setSynthesizerPatch(patch)
      })
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
