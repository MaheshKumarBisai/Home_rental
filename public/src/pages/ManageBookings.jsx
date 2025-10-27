import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../api/bookingService';
import Loader from '../components/Loader';
import { Check, X, Clock, Mail, User, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getOwnerBookings();
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch your property bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await bookingAPI.updateApplicationStatus(bookingId, status);
      toast.success(`Application has been ${status.toLowerCase()}.`);
      fetchBookings(); // Re-fetch to update the list
    } catch (error) {
      toast.error('Failed to update application status.');
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === 'ALL') return bookings;
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const FilterButton = ({ status, children }) => (
    <button
      onClick={() => setFilter(status)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        filter === status
          ? 'bg-primary text-white'
          : 'bg-white hover:bg-gray-50 text-gray-600'
      }`}
    >
      {children}
    </button>
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Manage Property Applications</h1>

      <div className="card bg-white mb-6">
        <div className="flex items-center space-x-2">
          <FilterButton status="ALL">All</FilterButton>
          <FilterButton status="PENDING">Pending</FilterButton>
          <FilterButton status="ACCEPTED">Accepted</FilterButton>
          <FilterButton status="DENIED">Denied</FilterButton>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="card bg-white">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Building size={18} />
                    <Link to={`/properties/${booking.property.id}`} className="hover:underline">{booking.property.title}</Link>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{booking.property.city}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-opacity-10
                  ${booking.status === 'PENDING' ? 'bg-yellow-500 text-yellow-800' : ''}
                  ${booking.status === 'ACCEPTED' ? 'bg-green-500 text-green-800' : ''}
                  ${booking.status === 'DENIED' ? 'bg-red-500 text-red-800' : ''}
                `}>
                  {booking.status === 'PENDING' && <Clock size={14} />}
                  {booking.status === 'ACCEPTED' && <Check size={14} />}
                  {booking.status === 'DENIED' && <X size={14} />}
                  <span>{booking.status}</span>
                </div>
              </div>

              <div className="border-t my-4"></div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Applicant Details</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={14} />
                  <span>{booking.renter.firstName} {booking.renter.lastName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Mail size={14} />
                  <a href={`mailto:${booking.renter.email}`} className="text-primary hover:underline">{booking.renter.email}</a>
                </div>
              </div>

              {booking.status === 'PENDING' && (
                <div className="border-t my-4"></div>
              )}

              {booking.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'ACCEPTED')}
                    className="flex-1 btn-primary bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'DENIED')}
                    className="flex-1 btn-primary bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white text-center py-12">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No Applications Found
          </h3>
          <p className="text-gray-500">
            There are no applications matching the "{filter}" filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
