import { Component } from 'react'
import css, { merge } from 'next/css'

export default class extends Component {

  _paintCanvas () {
    const ctx = this._canvas.getContext('2d')

    ctx.fillStyle = '#2265B0'
    ctx.fillRect(0, 0, 600, 150)

    ctx.fillStyle = '#2A2A36'
    for (let i = 1; i < 18; i++) {
      // Space between white keys
      ctx.fillRect(i * 33.33 - 1, 0, 2, 150)
    }

    for (let i = 0; i < 18; i++) {
      if (i % 7 !== 0 && i % 7 !== 3) {
        // Black keys
        ctx.fillRect((i * 33.33) - 13, 0, 26, 85)
      }
    }
  }

  _setCanvasRef = ref => {
    this._canvas = ref
    if (this._canvas == null) {
      return
    }

    this._canvas.width = 600
    this._canvas.height = 150
    this._paintCanvas()
  }

  _onMouseDown = event => {
    this._activateMouseNote(event.clientX, event.clientY)
  }

  _onMouseMove = event => {
    this._activateMouseNote(event.clientX, event.clientY)
  }

  _onMouseUp = event => {
    this._deactivateMouseNote()
  }

  _onMouseOut = event => {
    this._deactivateMouseNote()
  }

  _activateMouseNote (x, y) {

  }

  _deactivateMouseNote () {

  }

  _hitTestNote (x, y) {
    let note = -1

    return note
  }

  render () {
    const { css, style } = this.props
    return (
      <div
        style={style}
        className={merge(styles.root, css)}
      >
        <canvas
          ref={this._setCanvasRef}
          onMouseDown={this._onMouseDown}
          onMouseMove={this._onMouseMove}
          onMouseUp={this._onMouseUp}
          onMouseOut={this._onMouseOut}
        />
      </div>
    )
  }
}

const styles = {
  root: css({
    width: '600px',
    height: '150px'
  })
}
