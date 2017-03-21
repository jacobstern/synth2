import { Component } from 'react'
import AuxButton from './aux-button'
import Keyboard from './keyboard'
import ParamSlider from './param-slider'
import Playback from '../core/playback'
import basicPoly from '../core/patches/basic-poly'

const keyMap = new Map([
  ['q', 48],
  ['2', 49],
  ['w', 50],
  ['3', 51],
  ['e', 52],
  ['r', 53],
  ['5', 54],
  ['t', 55]
])

export default class extends Component {

  constructor (props) {
    super(props)
    this.state = {
      knobValues: [0.5, 0.3, 0.3, 0.3],
      volume: 0.8
    }
    this.keyboardNotes = new Set()
  }

  async componentDidMount () {
    await Playback.init()
    Playback.setSynthesizerPatch(basicPoly)
    this.state.knobValues.forEach((value, index) => {
      Playback.setKnobValue(index, parseFloat(value))
    })
    Playback.setVolume(this.state.volume)

    // TODO: Need a better way of handling key input
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount () {
    this.keyboardNotes.forEach(note => {
      Playback.noteOff(note)
    })
    this.keyboardNotes.clear()
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  onNoteActivated = note => {
    Playback.noteOn(note)
  }

  onNoteDeactivated = note => {
    Playback.noteOff(note)
  }

  onKeyDown = event => {
    const note = keyMap.get(event.key)
    if (typeof note === 'number' && !this.keyboardNotes.has(note)) {
      this.keyboardNotes.add(note)
      Playback.noteOn(note)
    }
  }

  onKeyUp = event => {
    const note = keyMap.get(event.key)
    if (typeof note === 'number' && this.keyboardNotes.has(note)) {
      this.keyboardNotes.delete(note)
      Playback.noteOff(note)
    }
  }

  onAuxMouseDown = event => {
    event.preventDefault()
    Playback.auxButtonPressed()
  }

  onAuxMouseUp = event => {
    event.preventDefault()
    Playback.auxButtonReleased()
  }

  onVolumeValueUpdate = value => {
    this.setState({ volume: value })
    Playback.setVolume(value)
  }

  renderKnob (index) {
    const onValueUpdate = value => {
      const updated = this.state.knobValues.slice(0)
      updated[index] = value
      this.setState({ knobValues: updated })

      if (Playback.initialized) {
        Playback.setKnobValue(index, value)
      }
    }
    return (
      <ParamSlider
        value={this.state.knobValues[index]}
        onValueUpdate={onValueUpdate}
      />
    )
  }

  render () {
    const { volume } = this.state
    return (
      <div className='synth'>
        <div className='upper-content'>
          <div className='left'>
            {this.renderKnob(0)}
            {this.renderKnob(1)}
            {this.renderKnob(2)}
            {this.renderKnob(3)}
            <AuxButton
              onMouseDown={this.onAuxMouseDown}
              onMouseUp={this.onAuxMouseUp}
            />
          </div>
          <div className='right'>
            <ParamSlider
              value={volume}
              onValueUpdate={this.onVolumeValueUpdate}
            />
          </div>
        </div>
        <Keyboard
          onNoteActivated={this.onNoteActivated}
          onNoteDeactivated={this.onNoteDeactivated}
        />
        <style jsx>{`
          .upper-content {
            display: flex;
          }
          .left {
            width: 50%;
            margin: 12px;
          }
          .right {
            width: 50%;
            margin: 12px;
          }
          .aux-button {
            margin-left: 2px;
          }
        `}</style>
      </div>
    )
  }
}
