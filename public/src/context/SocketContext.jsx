import { createContext, useState, useEffect, useContext } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { accessToken } = useAuth()
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

  useEffect(() => {
    if (accessToken) {
      const newSocket = io(SOCKET_URL, {
        auth: { token: accessToken }
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [accessToken])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}