const colors = [
  '#F93B2F',
  '#FCC803',
  '#5AC4F6',
  '#0376F7',
  '#F92D52',
  '#F99205',
  '#4ED55F',
  '#666'
]

const AuxIndicator = ({ value }) => {
  const colorIndex = typeof value === 'number' ? value % 8 : 7
  const color = colors[colorIndex]
  return (
    <div style={{
      position: 'relative',
      top: '5px',
      width: '15px',
      height: '15px',
      display: 'inline-block',
      backgroundColor: color,
      transition: 'background-color 0.2s ease',
      border: '1px solid #666'
    }} />
  )
}

export default AuxIndicator
