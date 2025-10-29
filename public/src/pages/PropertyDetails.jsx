import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../api/propertyService';
import { reviewAPI } from '../api/reviewService';
import { bookingAPI } from '../api/bookingService';
import { wishlistAPI } from '../api/wishlistService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { MapPin, Bed, Bath, Star, Maximize, Heart, Check, X, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
    fetchReviews();
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [id, isAuthenticated]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const response = await propertyAPI.getById(id);
      setProperty(response.data.data.property);
    } catch (error) {
      toast.error('Property not found.');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getPropertyReviews(id);
      setReviews(response.data.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.get();
      const wishlist = response.data.data.wishlist;
      setIsInWishlist(wishlist.some(item => item.propertyId === id));
    } catch (error) {
      console.error('Error checking wishlist status', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist.');
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(id);
        toast.success('Removed from wishlist!');
      } else {
        await wishlistAPI.add(id);
        toast.success('Added to wishlist!');
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      toast.error('Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to apply for this property.');
      navigate('/login');
      return;
    }
    try {
      await bookingAPI.apply(id);
      toast.success('Application submitted successfully!');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application.');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!property) return null;

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Images */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 h-[500px] rounded-2xl overflow-hidden group">
              <img
                src={property.images?.[0] || 'https://via.placeholder.com/800x600.png?text=No+Image'}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {property.images?.slice(1, 5).map((image, index) => (
              <div key={index} className="h-48 rounded-2xl overflow-hidden group">
                <img
                  src={image}
                  alt={`${property.title} ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-text-primary mb-3">{property.title}</h1>
                  <div className="flex items-center text-gray-500">
                    <MapPin size={18} className="mr-2" />
                    <span className="text-lg">{property.address}, {property.city}</span>
                  </div>
                </div>
                <button onClick={handleToggleWishlist} disabled={wishlistLoading} className="p-3 rounded-full hover:bg-red-50 transition-colors">
                  <Heart className={`h-6 w-6 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4 border-y">
                <div className="flex items-center gap-2"><Bed size={20} className="text-primary" /><span>{property.bedrooms} Bedrooms</span></div>
                <div className="flex items-center gap-2"><Bath size={20} className="text-primary" /><span>{property.bathrooms} Bathrooms</span></div>
                {property.area && <div className="flex items-center gap-2"><Maximize size={20} className="text-primary" /><span>{property.area} sq ft</span></div>}
                <span className="px-3 py-1 rounded-full bg-primary bg-opacity-10 text-primary text-sm font-medium">{property.type}</span>
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 pt-4">
                   <div className="flex items-center">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} className={` ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                  </div>
                  <span className="font-semibold">{averageRating}</span>
                  <span className="text-gray-500">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            <div className="card bg-white">
              <h2 className="text-2xl font-bold mb-4 text-text-primary">About this Property</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{property.description}</p>
            </div>

            {property.amenities?.length > 0 && (
              <div className="card bg-white">
                <h2 className="text-2xl font-bold mb-4 text-text-primary">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                      <Check size={16} className="text-green-500" />
                      <span className="font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card bg-white">
              <h2 className="text-2xl font-bold mb-4 text-text-primary">Guest Reviews</h2>

              <ReviewForm propertyId={id} onReviewSubmitted={fetchReviews} />

              {reviews.length > 0 ? (
                <div className="space-y-4 mt-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-lg border bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary font-bold">
                            {review.renter.firstName[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{review.renter.firstName} {review.renter.lastName}</p>
                            <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} size={16} className={` ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet for this property.</p>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-white sticky top-24">
              <div className="text-center mb-6">
                <p className="text-lg text-gray-500">{property.listingType === 'RENT' ? 'Monthly Rent' : 'Sale Price'}</p>
                <p className="text-4xl font-bold text-primary">
                  ₹{property.price.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={handleApply}
                disabled={property.availability === 'Booked' || (user && user.id === property.ownerId)}
                className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {user && user.id === property.ownerId ? "This is Your Property" : property.availability === 'Booked' ? 'Booked' : 'Apply Now'}
              </button>

              <div className="border-t my-6"></div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Property Owner</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={24} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{property.owner?.firstName} {property.owner?.lastName}</p>
                    <p className="text-sm text-gray-500">Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
