import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBookingStore } from "../store/useBookingStore";

const PaymentPage = () => {
  const { reservationId } = useParams();
  const [click , setClick] = useState(false)
  const navigate = useNavigate()
  const { isProcessingPayment, processingPayment, cancellingPayment } =
    useBookingStore();

  const handleConfirmClick = async () => {
    setClick(true)
    await processingPayment(reservationId);
    setClick(false)
    navigate("/")
  };

  const handleCancelClick = async () => {
    setClick(true)
    await cancellingPayment(reservationId);
    setClick(false)
    navigate("/")
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">Secure payment powered by Stripe</p>
        </div>

        {/* Payment Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Order Summary */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Event Ticket</span>
                <span className="font-medium">$99.00</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Service Fee</span>
                <span className="font-medium">$5.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>$104.00</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Payment Details
            </h2>

            {/* Card Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
                <div className="absolute right-3 top-3 flex space-x-2">
                  <img
                    src="https://img.icons8.com/color/24/visa.png"
                    alt="Visa"
                  />
                  <img
                    src="https://img.icons8.com/color/24/mastercard.png"
                    alt="Mastercard"
                  />
                </div>
              </div>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Country */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white">
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Secure Payment
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            onClick={handleConfirmClick}
            disabled = {click}
          >
            Confirm Payment
          </button>
          <button
            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            onClick={handleCancelClick}
            disabled = {click}
          >
            Cancel Payment
          </button>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By confirming your payment, you agree to our terms and conditions
          </p>
        </div>

        {/* Stripe Badge */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Powered by{" "}
            <span className="font-semibold text-purple-600">Stripe</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
