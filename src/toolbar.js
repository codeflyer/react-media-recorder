import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import AdjustIcon from '@material-ui/icons/Adjust'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import StopIcon from '@material-ui/icons/Stop'
import DeleteIcon from '@material-ui/icons/Delete'
import { red, green } from '@material-ui/core/colors'
import {
  IDLE,
  RECORDER_ERROR,
  RECORDING_COUNTDOWN,
  RECORDING,
  STOPPING,
  PLAY,
  STOPPED
} from './status'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '120px',
    backgroundColor: 'black',
    alignItems: 'center'
  },
  container: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center'
  },
  record: {
    // width: '50px',
    // height: '50px'
  },
  debug: {
    position: 'absolute',
    top: 70,
    color: 'white'
  }
}))

const iconsSize = 80

const Toolbar = ({
  status,
  cameraReady,
  startRecording,
  stopRecording,
  play,
  stop,
  remove
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {!cameraReady && <div className={classes.container}></div>}
      {cameraReady && (
        <div className={classes.container}>
          {[IDLE].includes(status) && (
            <div className={classes.record} onClick={startRecording}>
              <AdjustIcon style={{ color: red[500], fontSize: iconsSize }} />
            </div>
          )}
          {[RECORDING, RECORDING_COUNTDOWN].includes(status) && (
            <div className={classes.record} onClick={stopRecording}>
              <StopIcon style={{ color: red[500], fontSize: iconsSize }} />
            </div>
          )}
          {[STOPPED].includes(status) && (
            <>
              <div className={classes.record} onClick={play}>
                <PlayCircleOutlineIcon
                  style={{ color: green[500], fontSize: iconsSize }}
                />
              </div>
              <div className={classes.record} onClick={remove}>
                <DeleteIcon style={{ color: red[500], fontSize: iconsSize }} />
              </div>
            </>
          )}
          {[PLAY].includes(status) && (
            <div className={classes.record} onClick={stop}>
              <StopIcon style={{ fontSize: iconsSize }} />
            </div>
          )}
        </div>
      )}
      {/*<div className={classes.debug}>{status}</div>*/}
    </div>
  )
}

export default Toolbar
