import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, DollarSign } from 'lucide-react'

const PropertyCard = ({ property }) => {
  return (
    <Link to={`/properties/${property.id}`} className="card hover:scale-105 transition-transform">
      <div className="relative h-48 rounded-lg overflow-hidden mb-4">
        <img
          src={property.images?.[0] || '/placeholder.png'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        {!property.isAvailable && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Not Available
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
        {property.title}
      </h3>

      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
        <MapPin className="h-4 w-4 mr-1" />
        <span className="text-sm">{property.city}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
        <div className="flex items-center">
          <Bed className="h-4 w-4 mr-1" />
          <span>{property.bedrooms} Beds</span>
        </div>
        <div className="flex items-center">
          <Bath className="h-4 w-4 mr-1" />
          <span>{property.bathrooms} Baths</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-primary-600 font-semibold">
          <DollarSign className="h-5 w-5" />
          <span className="text-xl">{property.price}</span>
          <span className="text-sm text-gray-500 ml-1">/month</span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
          {property.type}
        </span>
      </div>
    </Link>
  )
}

export default PropertyCard