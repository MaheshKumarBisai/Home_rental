import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../api/reviewService';
import { bookingAPI } from '../api/bookingService';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewForm = ({ propertyId, onReviewSubmitted }) => {
  const { user, isAuthenticated } = useAuth();
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBookingStatus = async () => {
      if (isAuthenticated) {
        try {
          // This is not perfectly efficient, but it's the simplest way for now
          // A dedicated backend endpoint `can-review` would be better
          const response = await bookingAPI.getUserBookings(user.id);
          const bookings = response.data.data.bookings;
          const hasAcceptedBooking = bookings.some(b => b.propertyId === propertyId && b.status === 'ACCEPTED');
          setCanReview(hasAcceptedBooking);
        } catch (error) {
          console.error("Could not verify booking status for review eligibility.", error);
        }
      }
    };
    checkBookingStatus();
  }, [isAuthenticated, user, propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    setLoading(true);
    try {
      await reviewAPI.create({ propertyId, rating, comment });
      toast.success('Thank you for your review!');
      setRating(0);
      setComment('');
      onReviewSubmitted(); // Re-fetch reviews
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !canReview) {
    return null; // Don't show the form if user is not eligible
  }

  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={22}
              className={`cursor-pointer ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="input-field w-full"
          rows="3"
          required
        />
        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
