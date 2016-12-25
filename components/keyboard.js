import { Component } from 'react'
import css, { merge } from 'next/css'

export default class extends Component {

  _paintCanvas () {
    const ctx = this._canvas.getContext('2d')

    ctx.fillStyle = '#30303A'
    ctx.fillRect(0, 0, 600, 150)
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
