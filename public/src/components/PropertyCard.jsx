import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Star } from 'lucide-react';

const PropertyCard = ({ property }) => {
  return (
    <Link to={`/properties/${property.id}`} className="card bg-white card-hover">
      <div className="relative h-48 rounded-lg overflow-hidden mb-4">
        <img
          src={property.images?.[0] || 'https://via.placeholder.com/300x200.png?text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 px-2 py-1 bg-white bg-opacity-90 rounded-full text-xs font-semibold text-text-primary">
          {property.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-lg font-semibold text-white line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-white/90">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.city}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Bed className="h-4 w-4 text-primary" />
          <span>{property.bedrooms} Beds</span>
        </div>
        <div className="flex items-center gap-1">
          <Bath className="h-4 w-4 text-primary" />
          <span>{property.bathrooms} Baths</span>
        </div>
        {property.averageRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{property.averageRating} ({property.totalReviews})</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <p>
          <span className="text-xl font-bold text-primary">
            ₹{property.price.toLocaleString('en-IN')}
          </span>
          {property.listingType === 'RENT' && (
            <span className="text-sm text-gray-500 ml-1">/ month</span>
          )}
        </p>
        <span className="text-xs px-3 py-1 rounded-full bg-primary bg-opacity-10 text-primary font-medium">
          {property.type}
        </span>
      </div>
    </Link>
  );
};

export default PropertyCard;
