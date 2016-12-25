import { Component } from 'react'
import Keyboard from './keyboard'
import Playback from '../core/playback'

export default class extends Component {

  render () {
    return (
      <div>
        <Keyboard />
      </div>
    )
  }

  componentDidMount () {
    if (!Playback.initialized) {
      Playback.init()
    }
  }
}
