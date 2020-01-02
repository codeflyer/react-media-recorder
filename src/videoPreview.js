import React, { useRef, useEffect, useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    margin: 0
  },
  modal: {
    position: 'absolute',
    top: 0,
    padding: 0,
    margin: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: `100%`,
    height: `100%`,
    backgroundColor: '#98989894'
  }
}))

const VideoPreview = ({ mediaStream, size, onReady }) => {
  const classes = useStyles()
  const videoRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  const stream = useMemo(
    () =>
      mediaStream.current
        ? new MediaStream(mediaStream.current.getVideoTracks())
        : null,
    [mediaStream, size, isReady]
  )

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }

    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', event => {
        if (!isReady) {
          onReady()
          setIsReady(true)
        }
      })
    }
  }, [stream])

  if (!stream) {
    return null
  }
  return (
    <div className={classes.root} style={{ ...size }}>
      <video ref={videoRef} width={size.width} height={size.height} autoPlay />
      {!isReady && (
        <div className={classes.modal}>
          <CircularProgress color="secondary" />
        </div>
      )}
    </div>
  )
}

export default React.memo(VideoPreview)
