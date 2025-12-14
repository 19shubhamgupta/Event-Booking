import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useOrganizationStore } from "../store/useOrganization";

function CreateOrganizationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createOrganiz } = useOrganizationStore();

  const onSubmit = async (data) => {
    // Form submission handling - to be implemented
    try {
      console.log("Organization Data:", data);
      setIsSubmitting(true);
      await createOrganiz(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 pt-20">
      {/* Left Section - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">
            Create Your Organization
          </h2>
          <p className="text-center text-gray-400 mb-8">
            Fill in the details to get started
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Name Field */}
            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                id="organizationName"
                type="text"
                {...register("organizationName", {
                  required: "Organization name is required",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters",
                  },
                })}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter organization name"
              />
              {errors.organizationName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.organizationName.message}
                </p>
              )}
            </div>

            {/* Organization Email Field */}
            <div>
              <label
                htmlFor="organizationMail"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Organization Email <span className="text-red-500">*</span>
              </label>
              <input
                id="organizationMail"
                type="email"
                {...register("organizationMail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="organization@example.com"
              />
              {errors.organizationMail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.organizationMail.message}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                htmlFor="phoneNo"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNo"
                type="tel"
                {...register("phoneNo", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                })}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="1234567890"
                maxLength="10"
              />
              {errors.phoneNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNo.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Organization"}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Need help?{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Branding/Info */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center bg-gradient-to-br from-blue-900 via-gray-800 to-gray-900 text-white flex-col px-12">
        <div className="max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">
              Start Your
              <br />
              <span className="text-blue-400">Event Journey</span>
            </h1>
            <p className="text-lg text-gray-300">
              Create your organization and begin hosting amazing events
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4 mt-12">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Management</h3>
                <p className="text-gray-400 text-sm">
                  Manage all your events in one place
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Custom Branding</h3>
                <p className="text-gray-400 text-sm">
                  Your organization, your style
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time Analytics</h3>
                <p className="text-gray-400 text-sm">
                  Track your event performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrganizationPage;
