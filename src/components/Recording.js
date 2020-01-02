import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: 10,
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  value: {
    display: 'flex',
    padding: '3px',
    justifyContent: 'center',
    fontSize: `${20}px`,
    color: 'red'
  }
}))

const Recording = ({ count }) => {
  const classes = useStyles()
  return <div className={classes.root}>
    <div className={classes.value}><div>In registrazione: {count}s</div></div>
  </div>
}


export default Recording
