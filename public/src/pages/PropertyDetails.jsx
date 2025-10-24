import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { propertyAPI } from '../api/propertyService'
import { reviewAPI } from '../api/reviewService'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import { MapPin, Bed, Bath, DollarSign, Star, Calendar, User, Maximize } from 'lucide-react'
import toast from 'react-hot-toast'

const PropertyDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPropertyDetails()
    fetchReviews()
  }, [id])

  const fetchPropertyDetails = async () => {
    try {
      const response = await propertyAPI.getById(id)
      setProperty(response.data.data.property)
    } catch (error) {
      console.error('Error fetching property:', error)
      toast.error('Property not found')
      navigate('/properties')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getPropertyReviews(id)
      setReviews(response.data.data.reviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this property')
      navigate('/login')
      return
    }
    navigate('/create-booking', { state: { propertyId: id } })
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) return <Loader fullScreen />

  if (!property) return null

  const averageRating = calculateAverageRating()

  return (
    <div className="min-h-screen bg-gradient-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Images */}
        <div className="mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 h-96 rounded-2xl overflow-hidden">
              <img
                src={property.images?.[0] || '/placeholder.png'}
                alt={property.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {property.images?.slice(1, 5).map((image, index) => (
              <div key={index} className="h-48 rounded-2xl overflow-hidden">
                <img
                  src={image}
                  alt={`${property.title} ${index + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Location */}
            <div className="card animate-slide-up">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-lg">{property.address}, {property.city}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  property.isAvailable
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {property.isAvailable ? 'Available' : 'Not Available'}
                </span>
              </div>

              {/* Property Stats */}
              <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-2 rounded-xl">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-2 rounded-xl">
                  <Bath className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">{property.bathrooms} Bathrooms</span>
                </div>
                {property.area && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-2 rounded-xl">
                    <Maximize className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">{property.area} sq ft</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                    {property.type}
                  </span>
                </div>
              </div>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 pt-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-lg">{averageRating}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-2xl font-bold mb-4 gradient-text">About this Property</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold mb-4 gradient-text">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                      <span className="font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold mb-6 gradient-text">Guest Reviews</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-900"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                            {review.renter.firstName[0]}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {review.renter.firstName} {review.renter.lastName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No reviews yet. Be the first to review this property!
                </p>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 animate-scale-in">
              <div className="flex items-center justify-center mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="text-center text-white">
                  <div className="flex items-center justify-center text-4xl font-bold mb-2">
                    <DollarSign className="h-8 w-8" />
                    <span>{property.price}</span>
                  </div>
                  <p className="text-blue-100">per month</p>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={!property.isAvailable}
                className="w-full btn-primary mb-4 flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                {property.isAvailable ? 'Book This Property' : 'Not Available'}
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Property Owner</p>
                    <p className="font-semibold">
                      {property.owner?.firstName} {property.owner?.lastName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">💡 Quick Tip:</span> Book early to secure the best dates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails