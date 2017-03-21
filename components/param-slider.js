const ParamSlider = ({ value, onValueUpdate }) => {
  const onChange = event => {
    onValueUpdate(parseFloat(event.target.value) / 100)
  }
  return (
    <div>
      <input
        type='range'
        value={'' + value * 100}
        onChange={onChange}
      />
      <style jsx>{`
        input[type=range] {
          width: 250px;
        }
      `}</style>
    </div>
  )
}

export default ParamSlider
