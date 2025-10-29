import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../api/bookingService';
import Loader from '../components/Loader';
import { Calendar, Check, X, Clock, User, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getUserBookings(user.id);
      // We need owner details, so a new endpoint might be better, but we can fetch for now
      const bookingsWithDetails = await Promise.all(
        response.data.data.bookings.map(async b => {
          if (b.status === 'ACCEPTED') {
            const details = await bookingAPI.getDetails(b.id);
            return details.data.data.booking;
          }
          return b;
        })
      );
      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch your applications.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const getStatusPill = (status) => {
    switch (status) {
      case 'PENDING':
        return <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Clock size={14} /><span>Pending</span></div>;
      case 'ACCEPTED':
        return <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><Check size={14} /><span>Accepted</span></div>;
      case 'DENIED':
        return <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><X size={14} /><span>Denied</span></div>;
      default:
        return <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">My Applications</h1>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="card bg-white">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={booking.property.images?.split(',')[0] || 'https://via.placeholder.com/300x200.png?text=No+Image'}
                    alt={booking.property.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/properties/${booking.property.id}`} className="hover:underline">
                      <h3 className="text-xl font-semibold text-primary">{booking.property.title}</h3>
                    </Link>
                    {getStatusPill(booking.status)}
                  </div>

                  <p className="text-gray-500 mb-4">{booking.property.city}</p>

                  {booking.status === 'ACCEPTED' && booking.property.owner && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Application Accepted!</h4>
                      <p className="text-sm text-green-700 mb-3">The property owner has accepted your application. Here are their contact details:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-green-600"/>
                          <span>{booking.property.owner.firstName} {booking.property.owner.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-green-600"/>
                          <a href={`mailto:${booking.property.owner.email}`} className="text-primary hover:underline">{booking.property.owner.email}</a>
                        </div>
                        {booking.property.owner.phone && (
                           <div className="flex items-center gap-2">
                             <Phone size={14} className="text-green-600"/>
                             <span>{booking.property.owner.phone}</span>
                           </div>
                        )}
                      </div>
                    </div>
                  )}

                  {booking.status === 'PENDING' && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">The property owner is reviewing your application. You will be notified of their decision.</p>
                  )}

                  {booking.status === 'DENIED' && (
                     <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">Unfortunately, the property owner has decided not to move forward with your application at this time.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white text-center py-12">
           <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            You haven't applied for any properties yet.
          </h3>
          <p className="text-gray-500 mb-6">
            Start by browsing properties and apply for the ones you like.
          </p>
          <Link to="/properties" className="btn-primary">
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  );
};

export default Bookings;
