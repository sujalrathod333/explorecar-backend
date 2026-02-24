import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const API_BASE = "http://localhost:5000";

const VerifyPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  
  const sessionId = searchParams.get('session_id');
  const paymentStatus = searchParams.get('payment_status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (paymentStatus === 'cancel') {
        setStatus('cancelled');
        setMessage('Payment was cancelled. You can try again.');
        return;
      }

      if (!sessionId) {
        setStatus('error');
        setMessage('Invalid payment session.');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/api/payments/confirm?session_id=${sessionId}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Payment confirmed successfully! Your booking is confirmed.');
        } else {
          setStatus('error');
          setMessage('Payment verification failed.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Failed to verify payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [sessionId, paymentStatus]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <FaSpinner className="animate-spin text-4xl text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-300">Please wait while we confirm your payment...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleViewBookings}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
        
        {status === 'cancelled' && (
          <>
            <FaTimesCircle className="text-4xl text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <FaTimesCircle className="text-4xl text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPaymentPage;