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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            My Properties
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your property listings
          </p>
        </div>

        <Link to="/create-property" className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Property
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="card">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Property Image */}
                <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={property.images?.[0] || '/placeholder.png'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Property Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {property.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.isAvailable
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {property.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{property.city}</span>
                    <span>•</span>
                    <span>{property.bedrooms} Beds</span>
                    <span>•</span>
                    <span>{property.bathrooms} Baths</span>
                    <span>•</span>
                    <span className="text-primary-600 font-semibold">₹{property.price}/month</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                      className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900 dark:hover:bg-primary-800 dark:text-primary-200 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200 transition-colors"
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
        <div className="card text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Properties Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by creating your first property listing
          </p>
          <Link to="/create-property" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Your First Property
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyProperties