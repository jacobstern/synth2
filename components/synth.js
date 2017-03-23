import { Component } from 'react'
import AuxButton from './aux-button'
import Keyboard from './keyboard'
import ParamSlider from './param-slider'
import Playback from '../core/playback'
import Screen from './screen'
import basicPoly from '../core/patches/basic-poly'

const keyMap = new Map([
  ['q', 60],
  ['2', 61],
  ['w', 62],
  ['3', 63],
  ['e', 64],
  ['r', 65],
  ['5', 66],
  ['t', 67],
  ['6', 68],
  ['y', 69],
  ['7', 70],
  ['u', 71],
  ['i', 72],
  ['9', 73],
  ['o', 74],
  ['0', 75],
  ['p', 76],
  ['[', 77],
  ['=', 78],
  [']', 79]
])

export default class extends Component {

  constructor (props) {
    super(props)
    this.state = {
      knobValues: [0.5, 0.3, 0.3, 0.3],
      volume: 0.8,
      screen: ['', '', '', '', '']
    }
    this.keyboardNotes = new Set()
  }

  async componentDidMount () {
    await Playback.init()

    const handleLineUpdate = index => message => {
      const screen = this.state.screen.splice(0)
      screen[index] = message
      this.setState({ screen })
    }

    Playback.addListener('screenLine1', handleLineUpdate(0))
    Playback.addListener('screenLine2', handleLineUpdate(1))
    Playback.addListener('screenLine3', handleLineUpdate(2))
    Playback.addListener('screenLine4', handleLineUpdate(3))
    Playback.addListener('screenLine5', handleLineUpdate(4))

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
    if (event.key === '1') {
      Playback.auxButtonPressed()
      Playback.auxButtonReleased()
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
    const { volume, screen } = this.state
    return (
      <div>
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
            <Screen
              line1={screen[0]}
              line2={screen[1]}
              line3={screen[2]}
              line4={screen[3]}
              line5={screen[4]}
            />
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
        `}</style>
      </div>
    )
  }
}
