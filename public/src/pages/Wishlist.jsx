import { useState, useEffect } from 'react';
import { wishlistAPI } from '../api/wishlistService';
import Loader from '../components/Loader';
import PropertyCard from '../components/PropertyCard';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistAPI.get();
      setWishlist(response.data.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to fetch your wishlist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">My Wishlist</h1>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => (
            <PropertyCard key={item.property.id} property={item.property} />
          ))}
        </div>
      ) : (
        <div className="card bg-white text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Your wishlist is empty.
          </h3>
          <p className="text-gray-500 mb-6">
            Browse properties and click the heart icon to save them for later.
          </p>
          <Link to="/properties" className="btn-primary">
            Find Properties
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
