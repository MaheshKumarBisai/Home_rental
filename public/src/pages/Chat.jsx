import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { chatAPI } from '../api/chatService'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { Send } from 'lucide-react'
import Loader from '../components/Loader'

const Chat = () => {
  const { bookingId } = useParams()
  const { socket } = useSocket()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChatHistory()

    if (socket) {
      socket.emit('joinRoom', { bookingId })

      socket.on('receiveMessage', (message) => {
        setMessages(prev => [...prev, message])
      })

      return () => {
        socket.off('receiveMessage')
      }
    }
  }, [bookingId, socket])

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getChatHistory(bookingId)
      setMessages(response.data.data.messages)
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', {
        bookingId,
        message: newMessage.trim()
      })
      setNewMessage('')
    }
  }

  if (loading) return <Loader fullScreen />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Chat
      </h1>

      <div className="card h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p>{message.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat