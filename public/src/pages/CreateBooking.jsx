import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { bookingAPI } from '../api/bookingService'
import { propertyAPI } from '../api/propertyService'
import { useAuth } from '../context/AuthContext'
import { Calendar, DollarSign, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const CreateBooking = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const propertyId = location.state?.propertyId

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState({
    checkInDate: '',
    checkOutDate: ''
  })

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const fetchProperty = async () => {
    try {
      const response = await propertyAPI.getById(propertyId)
      setProperty(response.data.data.property)
    } catch (error) {
      console.error('Error fetching property:', error)
      toast.error('Property not found')
      navigate('/properties')
    }
  }

  const calculateTotalPrice = () => {
    if (!dates.checkInDate || !dates.checkOutDate || !property) return 0

    const checkIn = new Date(dates.checkInDate)
    const checkOut = new Date(dates.checkOutDate)
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

    return days > 0 ? days * property.price : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!dates.checkInDate || !dates.checkOutDate) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    const checkIn = new Date(dates.checkInDate)
    const checkOut = new Date(dates.checkOutDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      toast.error('Check-in date cannot be in the past')
      return
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date')
      return
    }

    setLoading(true)
    try {
      const bookingData = {
        propertyId,
        checkInDate: new Date(dates.checkInDate).toISOString(),
        checkOutDate: new Date(dates.checkOutDate).toISOString()
      }

      await bookingAPI.create(bookingData)
      toast.success('Booking created successfully!')
      navigate('/bookings')
    } catch (error) {
      console.error('Error creating booking:', error)
      if (error.response?.status === 409) {
        toast.error('Property is already booked for these dates. Please choose different dates.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to create booking')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <p className="text-center text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  const totalPrice = calculateTotalPrice()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Create Booking
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Select Dates</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  required
                  value={dates.checkInDate}
                  onChange={(e) => setDates(prev => ({ ...prev, checkInDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  required
                  value={dates.checkOutDate}
                  onChange={(e) => setDates(prev => ({ ...prev, checkOutDate: e.target.value }))}
                  min={dates.checkInDate || new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Booking Policy:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Minimum booking duration: 1 day</li>
                      <li>Cancellation allowed up to 24 hours before check-in</li>
                      <li>Full refund on cancellation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !totalPrice}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Creating Booking...' : 'Confirm Booking'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Property Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

            <div className="mb-4">
              <img
                src={property.images?.[0] || '/placeholder.png'}
                alt={property.title}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {property.title}
            </h4>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {property.city}
            </p>

            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Nightly Rate:</span>
                <span className="font-semibold">₹{property.price}</span>
              </div>

              {dates.checkInDate && dates.checkOutDate && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-semibold">
                      {Math.ceil((new Date(dates.checkOutDate) - new Date(dates.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span>Total:</span>
                    <span className="text-primary-600">₹{totalPrice}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBooking