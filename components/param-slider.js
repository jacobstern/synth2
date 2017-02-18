import { css } from 'glamor'

const ParamSlider = (css, value) => (
  <div className={css}>
    <input
      className={styles.input}
      type='range'
    />
  </div>
)

const styles = {
  input: css({
    width: '250px'
  })
}

export default ParamSlider
