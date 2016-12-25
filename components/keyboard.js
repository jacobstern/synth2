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

  render () {
    const { css, style } = this.props
    return (
      <div
        style={style}
        className={merge(styles.root, css)}
      >
        <canvas ref={this._setCanvasRef} />
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
