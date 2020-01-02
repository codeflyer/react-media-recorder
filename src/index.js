import React from 'react'
import { ReactMediaRecorder } from './recorder'

// VOLUME visualizer
// https://codepen.io/zapplebee/pen/gbNbZE

const defaultStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: 'grey'
}

export const RecordView = ({ width, height, style }) => (
  <div
    style={{
      ...defaultStyle,
      style
    }}
  >
    <ReactMediaRecorder
      video
      size={{ width, height }}
    />
  </div>
)

export default RecordView
