import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const size = 200

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: 100,
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  value: {
    display: 'flex',
    justifyContent: 'center',
    width: `${size*1.15}px`,
    height: `${size*1.15}px`,
    border: '1px solid black',
    borderRadius: `${size*1.15}px`,
    fontSize: `${size}px`,
    backgroundColor: '#98989894'
  }
}))

const Counter = ({ count }) => {
  const classes = useStyles()
  return <div className={classes.root}>
    <div className={classes.value}><div>{count}</div></div>
  </div>
}


export default Counter
