import { Component } from 'react'

const KEYBOARD_WIDTH = 600
const KEYBOARD_HEIGHT = 150
const BLACK_KEY_WIDTH = 30
const BLACK_KEY_HALF_WIDTH = BLACK_KEY_WIDTH / 2
const NUM_WHITE_KEYS = 14
const KEY_WIDTH = KEYBOARD_WIDTH / NUM_WHITE_KEYS
const BLACK_KEY_HEIGHT = 82

export default class extends Component {

  constructor (props) {
    super(props)
    this._mouseNote = -1
    this._notes = []
  }

  componentWillUnmount () {
    const { onNoteDeactivated } = this.props
    if (onNoteDeactivated) {
      this._notes.forEach(onNoteDeactivated)
    }

    this._mouseNote = -1
    this._notes = []
  }

  _paintCanvas () {
    const ctx = this._canvas.getContext('2d')

    ctx.fillStyle = '#2265B0'
    ctx.fillRect(0, 0, KEYBOARD_WIDTH, KEYBOARD_HEIGHT)

    ctx.fillStyle = '#2A2A36'
    for (let i = 1; i < NUM_WHITE_KEYS; i++) {
      // Space between white keys
      ctx.fillRect(i * KEY_WIDTH - 1, 0, 2, 150)
    }

    for (let i = 0; i < NUM_WHITE_KEYS; i++) {
      const indexInOctave = i % 7
      if (indexInOctave !== 0 && indexInOctave !== 3) {
        // Black keys
        ctx.fillRect((i * KEY_WIDTH) - BLACK_KEY_HALF_WIDTH, 0, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT)
      }
    }
  }

  _setCanvasRef = ref => {
    this._canvas = ref
    if (this._canvas == null) {
      return
    }

    this._canvas.width = KEYBOARD_WIDTH
    this._canvas.height = KEYBOARD_HEIGHT
    this._paintCanvas()
  }

  _onMouseDown = event => {
    event.preventDefault()
    this._activateMouseNote(event)
  }

  _onMouseMove = event => {
    if (this._mouseNote !== -1) {
      this._activateMouseNote(event)
    }
  }

  _onMouseUp = event => {
    event.preventDefault()
    this._deactivateMouseNote()
  }

  _onMouseOut = event => {
    this._deactivateMouseNote()
  }

  _activateMouseNote (mouseEvent) {
    const x = mouseEvent.pageX - this._canvas.offsetLeft
    const y = mouseEvent.pageY - this._canvas.offsetTop
    const note = this._hitTestNote(x, y)

    if (note === -1) {
      this._deactivateMouseNote()
    } else {
      if (this._mouseNote !== note) {
        this._deactivateNote(this._mouseNote)
      }
      this._mouseNote = note
      this._activateNote(note)
    }
  }

  _deactivateMouseNote () {
    if (this._mouseNote !== -1) {
      this._deactivateNote(this._mouseNote)
    }
    this._mouseNote = -1
  }

  _activateNote (note) {
    if (this._notes.indexOf(note) < 0) {
      this._notes.push(note)
      const { onNoteActivated } = this.props
      if (onNoteActivated) {
        onNoteActivated(note)
      }
    }
  }

  _deactivateNote (note) {
    const index = this._notes.indexOf(note)
    if (index >= 0) {
      this._notes.splice(index, 1)
      const { onNoteDeactivated } = this.props
      if (onNoteDeactivated) {
        onNoteDeactivated(note)
      }
    }
  }

  _hitTestNote (x, y) {
    if (x < 0 || x >= KEYBOARD_WIDTH || y < 0 || y >= KEYBOARD_HEIGHT) {
      return -1
    }

    for (let i = 0; i < NUM_WHITE_KEYS; i++) {
      // Black keys
      const indexInOctave = i % 7
      if (indexInOctave !== 0 && indexInOctave !== 3) {
        const keyCenter = i * KEY_WIDTH
        if (x >= keyCenter - BLACK_KEY_HALF_WIDTH && x < keyCenter + BLACK_KEY_HALF_WIDTH &&
          y < BLACK_KEY_HEIGHT) {
          let note = 59 + i * 2  // 59 is B3
          if (indexInOctave > 3) {
            note--
          }
          return note - 2 * Math.floor(i / 7)
        }
      }
    }

    // White keys
    const i = Math.floor(x / KEY_WIDTH)
    const indexInOctave = i % 7

    let note = 60 + i * 2 // 60 is C4
    if (indexInOctave > 2) {
      note--
    }
    return note - 2 * Math.floor(i / 7)
  }

  render () {
    const { style } = this.props
    return (
      <div className='root'>
        <canvas
          className='canvas'
          ref={this._setCanvasRef}
          onMouseDown={this._onMouseDown}
          onMouseMove={this._onMouseMove}
          onMouseUp={this._onMouseUp}
          onMouseOut={this._onMouseOut}
        />
        <style jsx>{`
          .root: {
            width: 600px;
            height: 150px;
          }
          .canvas: {
            cursor: 'arrow';
          }
        `}</style>
      </div>
    )
  }
}
