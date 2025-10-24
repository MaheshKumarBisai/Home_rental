import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { propertyAPI } from '../api/propertyService'
import { useAuth } from '../context/AuthContext'
import { Building2, Upload, MapPin, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const CreateProperty = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'APARTMENT',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    amenities: [],
    images: []
  })

  const [amenityInput, setAmenityInput] = useState('')
  const [imageUrls, setImageUrls] = useState([''])

  const propertyTypes = [
    'APARTMENT', 'VILLA', 'HOUSE', 'STUDIO', 'PG', 'CONDO', 'TOWNHOUSE'
  ]

  const commonAmenities = [
    'WiFi', 'Parking', 'Gym', 'Swimming Pool', 'Security',
    'Power Backup', 'Elevator', 'Garden', 'Play Area', 'Club House'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
    setFormData(prev => ({ ...prev, images: newUrls.filter(url => url.trim() !== '') }))
  }

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, ''])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.images.length === 0) {
      toast.error('Please add at least one property image URL')
      return
    }

    setLoading(true)
    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: formData.area ? parseFloat(formData.area) : null
      }

      await propertyAPI.create(propertyData)
      toast.success('Property created successfully!')
      navigate('/properties')
    } catch (error) {
      console.error('Error creating property:', error)
      toast.error(error.response?.data?.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Only property owners can create listings
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary-600" />
          Create New Property Listing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Fill in the details to list your property
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                required
                minLength={10}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Spacious 2BHK Apartment in Downtown"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                minLength={50}
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property in detail..."
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 50 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="25000"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bedrooms *
              </label>
              <input
                type="number"
                name="bedrooms"
                required
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bathrooms *
              </label>
              <input
                type="number"
                name="bathrooms"
                required
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Area (sq ft)
              </label>
              <input
                type="number"
                name="area"
                min="0"
                value={formData.area}
                onChange={handleChange}
                placeholder="1200"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Amenities</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {commonAmenities.map(amenity => (
              <label
                key={amenity}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Property Images *
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Add image URLs for your property. First image will be the cover photo.
          </p>

          <div className="space-y-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder={`Image URL ${index + 1}`}
                  className="input-field flex-1"
                />
                {index === 0 && (
                  <span className="px-3 py-2 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addImageUrlField}
            className="btn-secondary mt-4"
          >
            + Add Another Image
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Creating Property...' : 'Create Property Listing'}
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
  )
}

export default CreateProperty