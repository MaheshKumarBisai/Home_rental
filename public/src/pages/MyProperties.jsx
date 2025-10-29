import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { propertyAPI } from '../api/propertyService'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import { Building2, Edit, Trash2, Plus, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const MyProperties = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyProperties()
  }, [])

  const fetchMyProperties = async () => {
    try {
      const response = await propertyAPI.getMyProperties()
      setProperties(response.data.data.properties)
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to fetch your properties')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return

    try {
      await propertyAPI.delete(propertyId)
      toast.success('Property deleted successfully')
      fetchMyProperties()
    } catch (error) {
      toast.error('Failed to delete property')
    }
  }

  if (loading) return <Loader fullScreen />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            My Properties
          </h1>
          <p className="text-gray-500 mt-2">
            View, manage, and edit your property listings.
          </p>
        </div>

        <Link to="/create-property" className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          List a New Property
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="card bg-white">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Property Image */}
                <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={property.images?.[0] || 'https://via.placeholder.com/300x200.png?text=No+Image'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Property Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-text-primary">
                      {property.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.availability !== 'Booked'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.availability}
                    </span>
                  </div>

                  <p className="text-gray-500 mb-3 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{property.city}</span>
                    <span className="text-gray-300">•</span>
                    <span>{property.bedrooms} Beds</span>
                    <span className="text-gray-300">•</span>
                    <span>{property.bathrooms} Baths</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-primary font-semibold text-lg">
                      ₹{property.price.toLocaleString('en-IN')}
                      {property.listingType === 'RENT' && ' / month'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="flex items-center gap-1 text-sm btn-outline"
                    >
                      <Eye className="h-4 w-4" />
                      View Listing
                    </button>

                    <button
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                      className="flex items-center gap-1 text-sm btn-outline"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white text-center py-12">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            You haven't listed any properties yet.
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by listing your first property to find tenants or buyers.
          </p>
          <Link to="/create-property" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-5 w-5" />
            List Your First Property
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyProperties