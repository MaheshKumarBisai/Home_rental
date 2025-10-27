import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../api/bookingService';
import Loader from '../components/Loader';
import { Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // This endpoint needs to be created - get bookings for the owner's properties
      const response = await bookingAPI.getOwnerBookings();
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch your property bookings.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Manage Applications</h1>
      {/* Content will be added in the next step */}
    </div>
  );
};

export default ManageBookings;
