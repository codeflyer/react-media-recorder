import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Counter from './components/Counter'
import Recording from './components/Recording'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative'
  }
}))

// type ReactMediaRecorderRenderProps = {
//   error: string;
//   muteAudio: () => void;
//   unMuteAudio: () => void;
//   startRecording: () => void;
//   pauseRecording: () => void;
//   resumeRecording: () => void;
//   stopRecording: () => void;
//   mediaBlobUrl: null | string;
//   status: StatusMessages;
//   isAudioMuted: boolean;
//   previewStream: MediaStream | null;
// };
//
// type ReactMediaRecorderProps = {
//   render: (props: ReactMediaRecorderRenderProps) => ReactElement;
//   audio?: boolean | MediaTrackConstraints;
//   video?: boolean | MediaTrackConstraints;
//   screen?: boolean;
//   onStop?: (blobUrl: string) => void;
//   blobPropertyBag?: BlobPropertyBag;
//   mediaRecorderOptions?: MediaRecorderOptions | null;
// };
//
// type StatusMessages =
//   | "media_aborted"
//   | "permission_denied"
//   | "no_specified_media_found"
//   | "media_in_use"
//   | "invalid_media_constraints"
//   | "no_constraints"
//   | "recorder_error"
//   | "idle"
//   | "acquiring_media"
//   | "delayed_start"
//   | "recording"
//   | "stopping"
//   | "stopped";

const RecorderErrors = {
  AbortError: 'media_aborted',
  NotAllowedError: 'permission_denied',
  NotFoundError: 'no_specified_media_found',
  NotReadableError: 'media_in_use',
  OverconstrainedError: 'invalid_media_constraints',
  TypeError: 'no_constraints',
  NONE: '',
  NO_RECORDER: 'recorder_error'
}

import {
  ACQUIRING_MEDIA,
  DELAYED_START,
  IDLE,
  INIT,
  RECORDING_COUNTDOWN,
  RECORDING,
  INVALID_MEDIA_CONSTRAINTS,
  MEDIA_ABORTED,
  MEDIA_IN_USE,
  NO_CONSTRAINTS,
  NO_SPECIFIED_MEDIA_FOUND,
  PERMISSION_DENIED,
  RECORDER_ERROR,
  STOPPED,
  STOPPING
} from './status'
import VideoPreview from './videoPreview'
import Toolbar from './toolbar'

const COUNT_DOWN = 3
const RECORDING_TIME = 3

export const ReactMediaRecorder = ({
  audio = true,
  video = false,
  onStop = () => null,
  blobPropertyBag,
  screen = false,
  size = { width: 800, height: 600 },
  mediaRecorderOptions = null
}) => {
  const classes = useStyles()
  const mediaPlayer = useRef(null)
  const mediaRecorder = useRef(null)
  const mediaChunks = useRef([])
  const mediaStream = useRef(null)
  const [status, setStatus] = useState(INIT)
  const [cameraReady, setCameraReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(COUNT_DOWN)
  const [recordTimeLeft, setRecordTimeLeft] = useState(RECORDING_TIME)
  const statusRef = useRef(status)
  const countdownRef = useRef(countdown)
  const recordTimeLeftRef = useRef(recordTimeLeft)
  statusRef.current = status
  countdownRef.current = countdown
  recordTimeLeftRef.current = recordTimeLeft

  const [isUsingCamera, setIsUsingCamera] = useState(
    [INIT, IDLE, RECORDING, RECORDER_ERROR, STOPPING].includes(status)
  )
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null)
  const [error, setError] = useState('NONE')
  const [stopTimeout, setStopTimeout] = useState(null)

  const getMediaStream = useCallback(async () => {
    console.log('GET MEDIA STREAM')
    setStatus(ACQUIRING_MEDIA)
    const requiredMedia = {
      audio: typeof audio === 'boolean' ? !!audio : audio,
      video: typeof video === 'boolean' ? !!video : video
    }
    try {
      if (screen) {
        const stream = await window.navigator.mediaDevices.getDisplayMedia({
          video: video || true
        })
        if (audio) {
          const audioStream = await window.navigator.mediaDevices.getUserMedia({
            audio
          })

          audioStream
            .getAudioTracks()
            .forEach(audioTrack => stream.addTrack(audioTrack))
        }
        mediaStream.current = stream
      } else {
        const stream = await window.navigator.mediaDevices.getUserMedia({
          ...requiredMedia,
          video: {
            width: { exact: size.width },
            height: { exact: size.height }
          }
        })
        mediaStream.current = stream
      }
      setStatus(IDLE)
    } catch (error) {
      setError(error.name)
      setStatus(IDLE)
    }
  }, [audio, video, screen, progress])

  useEffect(() => {
    console.log('USE')
    if (!window.MediaRecorder) {
      throw new Error('Unsupported Browser')
    }

    if (screen) {
      if (!window.navigator.mediaDevices.getDisplayMedia) {
        throw new Error("This browser doesn't support screen capturing")
      }
    }

    const checkConstraints = mediaType => {
      const supportedMediaConstraints = navigator.mediaDevices.getSupportedConstraints()
      const unSupportedConstraints = Object.keys(mediaType).filter(
        constraint => !supportedMediaConstraints[constraint]
      )

      if (unSupportedConstraints.length > 0) {
        console.error(
          `The constraints ${unSupportedConstraints.join(
            ','
          )} doesn't support on this browser. Please check your ReactMediaRecorder component.`
        )
      }
    }

    if (typeof audio === 'object') {
      checkConstraints(audio)
    }
    if (typeof video === 'object') {
      checkConstraints(video)
    }

    if (mediaRecorderOptions && mediaRecorderOptions.mimeType) {
      if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType)) {
        console.error(
          `The specified MIME type you supplied for MediaRecorder doesn't support this browser`
        )
      }
    }

    async function loadStream() {
      await getMediaStream()
    }

    if (!mediaStream.current && isUsingCamera) {
      loadStream()
    } else {
    }
  }, [
    audio,
    screen,
    video,
    getMediaStream,
    mediaRecorderOptions,
    isUsingCamera,
    progress
  ])

  // Media Recorder Handlers

  const startPreRecording = async () => {
    setError('NONE')
    setCountdown(COUNT_DOWN)
    setStatus(RECORDING_COUNTDOWN)
    setTimeout(() => {
      doCountdown()
    }, 100)
  }

  const doCountdown = async () => {
    if (statusRef.current !== RECORDING_COUNTDOWN) {
      return
    }
    if (countdownRef.current === 0) {
      startRecording()
    } else {
      setTimeout(() => {
        setCountdown(countdownRef.current - 1)
        doCountdown()
      }, 1000)
    }
  }

  const updateRecordTimeLeft = async () => {
    if (statusRef.current !== RECORDING) {
      return
    }

    if (recordTimeLeftRef.current === 0) {
      stopRecording()
    } else {
      setTimeout(() => {
        setRecordTimeLeft(recordTimeLeftRef.current - 1)
        updateRecordTimeLeft()
      }, 1000)
    }
  }

  const startRecording = async () => {
    setError('NONE')
    if (!mediaStream.current) {
      await getMediaStream()
    }
    if (mediaStream.current) {
      mediaRecorder.current = new MediaRecorder(mediaStream.current)
      mediaRecorder.current.ondataavailable = ({ data }) => {
        mediaChunks.current.push(data)
      }
      mediaRecorder.current.onstop = onRecordingStop
      mediaRecorder.current.onerror = () => {
        setError('NO_RECORDER')
        setStatus(IDLE)
      }
      mediaRecorder.current.start()
      setStatus(RECORDING)
      setRecordTimeLeft(RECORDING_TIME)
      setTimeout(() => {
        updateRecordTimeLeft()
      }, 50)
    }
  }

  const onRecordingStop = () => {
    if (statusRef.current === RECORDING_COUNTDOWN) {
      setStatus(IDLE)
      return
    }

    mediaStream.current &&
      mediaStream.current.getTracks().forEach(function(track) {
        track.stop()
      })
    mediaStream.current = null

    console.log('statusRef.current', statusRef.current)
    const blobProperty =
      blobPropertyBag || video ? { type: 'video/mp4' } : { type: 'audio/wav' }
    const blob = new Blob(mediaChunks.current, blobProperty)
    const url = URL.createObjectURL(blob)
    setStatus(STOPPED)
    setMediaBlobUrl(url)
    onStop(url)
    console.log('STOP ALL')
    setIsUsingCamera(false)
    mediaChunks.current = []
    console.log('DONE')
  }

  const muteAudio = mute => {
    setIsAudioMuted(mute)
    if (mediaStream.current) {
      mediaStream.current
        .getAudioTracks()
        .forEach(audioTrack => (audioTrack.enabled = !mute))
    }
  }

  const pauseRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause()
    }
  }
  const resumeRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume()
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      setStatus(STOPPING)
      mediaRecorder.current.stop()
    }
    clearTimeout(stopTimeout)
    setStopTimeout(null)
    onRecordingStop()
  }

  const play = () => {
    if (mediaPlayer.current) {
      // setStatus(STOPPING)
      mediaPlayer.current.play()
    }
  }

  const stop = () => {
    if (mediaPlayer.current) {
      // setStatus(STOPPING)
      mediaPlayer.current.pause()
    }
  }

  const remove = () => {
    setProgress(progress + 1)
    setMediaBlobUrl(null)
    setIsUsingCamera(true)
    setStatus(IDLE)
  }

  return (
    <div className={classes.root}>
      {[
        IDLE,
        RECORDING,
        RECORDING_COUNTDOWN,
        RECORDER_ERROR,
        STOPPING
      ].includes(status) ? (
        <VideoPreview mediaStream={mediaStream} size={size} onReady={() => setCameraReady(true)}/>
      ) : (
        <video src={mediaBlobUrl} ref={mediaPlayer} />
      )}
      {[RECORDING_COUNTDOWN].includes(status) && <Counter count={-countdown} />}
      {[RECORDING].includes(status) && <Recording count={recordTimeLeft} />}
      <Toolbar
        cameraReady={cameraReady}
        startRecording={startPreRecording}
        stopRecording={stopRecording}
        play={play}
        stop={stop}
        remove={remove}
        status={status}
      />
    </div>
  )
}
