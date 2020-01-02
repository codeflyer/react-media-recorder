import React from 'react'
import RecordView from '../src'

export default {
  title: 'MediaRecorder'
}

export const RecordViewStory = () => (
  <div style={{border: '1px solid black', width: 300, height: 600}}>
    <RecordView width={300} height={480}/>
  </div>
)
