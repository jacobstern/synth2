const Screen = ({ line1, line2, line3, line4, line5 }) => (
  <div className='root'>
    <div className='line'>{line1}</div>
    <div className='line'>{line2}</div>
    <div className='line'>{line3}</div>
    <div className='line'>{line4}</div>
    <div className='line'>{line5}</div>
    <style jsx>{`
      .root {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace;
        font-size: 12px;
        line-height: 16px;
      }
      .line {
        height: 16px;
      }
    `}</style>
  </div>
)

export default Screen
