
const AuxButton = ({ onMouseUp, onMouseDown }) => (
  <div className='root'>
    <button
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
    >
      Aux
    </button>
    <style jsx>{`
      .root {
        margin: 0 10px;
        display: inline-block;
      }
    `}</style>
  </div>
)

export default AuxButton
