import { Component } from 'react'
import { getPureDataPatch } from '../common/api'
import Synth from '../components/synth'

export default class extends Component {

  static async getInitialProps () {
    const patches = await Promise.all([
      getPureDataPatch('UHVyZURhdGFQYXRjaDo5')
    ])
    return { patches }
  }

  render () {
    return (
      <Synth patches={this.props.patches} />
    )
  }
}
