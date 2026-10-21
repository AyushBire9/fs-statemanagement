/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react'

const NotificationContext = createContext(null)

const notificationReducer = (_state, action) => {
  switch (action.type) {
    case 'SHOW':
      return action.message
    case 'CLEAR':
      return null
    default:
      return _state
  }
}

export const NotificationContextProvider = ({ children }) => {
  const [message, dispatch] = useReducer(notificationReducer, null)
  const timeoutRef = useRef(null)

  const notify = useCallback((text) => {
    clearTimeout(timeoutRef.current)
    dispatch({ type: 'SHOW', message: text })
    timeoutRef.current = setTimeout(() => {
      dispatch({ type: 'CLEAR' })
      timeoutRef.current = null
    }, 5000)
  }, [])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <NotificationContext.Provider value={{ message, notify }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('Notification provider is missing')
  return context
}
