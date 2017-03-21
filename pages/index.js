import { Component } from 'react'
import Synth from '../components/synth'

export default class extends Component {

  render () {
    return (
      <div className='page-root'>
        <Synth />
        <style jsx>{`
          .page-root {
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            height: 100%;
            width: 100%;
          }
        `}</style>
      </div>
    )
  }
}
