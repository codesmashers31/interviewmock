import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, Calendar, Clock, Video, Download } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
}



const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const bookingDetails = location.state?.bookingDetails; // Get passed data

  const [activePaymentMethod, setActivePaymentMethod] = useState<
    "card" | "upi" | "netbanking" | "wallet"
  >("card");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvv: "",
    holderName: "",
  });
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [transactionId, setTransactionId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Parse price from string (e.g. "₹500") if needed, or use number directly
  const parsePrice = (price: string | number) => {
    if (typeof price === "number") return price;
    if (typeof price === "string")
      return parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
    return 0;
  };

  const basePrice = bookingDetails ? parsePrice(bookingDetails.price) : 0;

  const orderSummary = {
    productName: bookingDetails
      ? `${bookingDetails.category} Mock Interview`
      : "Premium Subscription",
    plan: bookingDetails
      ? `${bookingDetails.duration} Min Session with ${bookingDetails.expertName}`
      : "Annual Plan",
    basePrice: basePrice,
    discount: appliedDiscount ? Math.floor(basePrice * 0.25) : 0, // 25% discount example
    gst: Math.floor(basePrice * 0.18), // 18% GST example
    get total() {
      return this.basePrice - this.discount + this.gst;
    },
  };

  // Redirect if no booking details
  React.useEffect(() => {
    if (!bookingDetails) {
      // navigate('/'); // Uncomment to enforce flow
      console.warn("No booking details found directly accessing page");
    }
  }, [bookingDetails, navigate]);

  // Validation functions
  const validateCardDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      !cardDetails.number.trim() ||
      cardDetails.number.replace(/\s/g, "").length !== 16
    ) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (
      !cardDetails.expiry.trim() ||
      !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)
    ) {
      newErrors.expiry = "Please enter expiry date in MM/YY format";
    }

    if (!cardDetails.cvv.trim() || cardDetails.cvv.length !== 3) {
      newErrors.cvv = "Please enter a valid 3-digit CVV";
    }

    if (!cardDetails.holderName.trim()) {
      newErrors.holderName = "Card holder name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpi = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      !upiId.trim() ||
      !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)
    ) {
      newErrors.upiId = "Please enter a valid UPI ID";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNetBanking = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedBank.trim()) {
      newErrors.bank = "Please select a bank";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateWallet = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedWallet.trim()) {
      newErrors.wallet = "Please select a wallet";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setPaymentStatus("idle");

    // Validate based on active payment method
    let isValid = false;
    switch (activePaymentMethod) {
      case "card":
        isValid = validateCardDetails();
        break;
      case "upi":
        isValid = validateUpi();
        break;
      case "netbanking":
        isValid = validateNetBanking();
        break;
      case "wallet":
        isValid = validateWallet();
        break;
    }

    if (!isValid) return;

    setIsProcessing(true);

    try {
      // Simulate Payment Processing
      // In a real app, you would integrate Razorpay/Stripe here.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate Start and End Time
      let startTimeISO = new Date().toISOString();
      let endTimeISO = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      if (bookingDetails?.date && bookingDetails?.slot?.time) {
        const dateObj = new Date(bookingDetails.date);
        const timeRange = bookingDetails.slot.time; // "10:00 AM - 11:00 AM"
        const [startStr] = timeRange.split(" - ");

        // Parse time "10:00 AM"
        const [time, period] = startStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        dateObj.setHours(hours, minutes, 0, 0);
        startTimeISO = dateObj.toISOString();

        // End time based on duration
        const duration = bookingDetails.duration || 60;
        const endDateObj = new Date(dateObj.getTime() + duration * 60000);
        endTimeISO = endDateObj.toISOString();
      }

      // 1. Create Session in Backend
      const sessionPayload = {
        expertId: bookingDetails?.expertId,
        candidateId: user?.id || user?.userId, // Get from authenticated user
        startTime: startTimeISO,
        endTime: endTimeISO,
        price: orderSummary.total,
        topics: [bookingDetails?.category || "General Mock Interview"], // Default topic
        status: "confirmed"
      };



      const sessionResponse = await axios.post('/api/sessions', sessionPayload);

      if (sessionResponse.data?.success) {
        setPaymentStatus("success");
        setTransactionId(`TXN${Date.now()}`); // Mock TXN ID

        // Show Success Modal
        setShowSuccessModal(true);
        resetForm();
      } else {
        throw new Error("Failed to create session");
      }

    } catch (error: any) {
      console.error("Payment/Booking Error:", error);
      setPaymentStatus("error");
      setErrors({ submit: error.message || "Payment failed. Please try again." });

      // Show SweetAlert error message (keeping this for errors as requested only custom success)
      Swal.fire({
        title: "Payment Failed",
        text: error.message || "Something went wrong processing your booking.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim() === "SAVE25") {
      setAppliedDiscount(true);
      setErrors({});

      // Show discount applied success message
      Swal.fire({
        title: "Discount Applied!",
        text: "Extra discount has been applied to your order.",
        icon: "success",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      setErrors({ discount: "Invalid discount code" });

      // Show discount error message
      Swal.fire({
        title: "Invalid Code",
        text: "The discount code you entered is invalid.",
        icon: "error",
        confirmButtonColor: "#dc2626",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const resetForm = () => {
    setCardDetails({ number: "", expiry: "", cvv: "", holderName: "" });
    setUpiId("");
    setSelectedBank("");
    setSelectedWallet("");
    setDiscountCode("");
    setAppliedDiscount(false);
    setErrors({});
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const matches = cleaned.match(/.{1,4}/g);
    return matches ? matches.join(" ") : "";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setCardDetails({ ...cardDetails, expiry: value });
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  const popularBanks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"];
  const walletOptions = ["Paytm", "PhonePe", "AmazonPay", "MobiKwik"];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <header className="text-center mb-8 relative">
          <button
            onClick={handleBackClick}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-white/80 hover:bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Secure and encrypted payment processing
          </p>
        </header>

        {/* Payment Status Messages */}
        {paymentStatus === "success" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-800 font-medium">
                Payment Successful!
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Transaction ID: {transactionId}
            </p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-red-800 font-medium">Payment Failed</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{errors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "card" as const,
                    label: "Credit/Debit Card",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "upi" as const,
                    label: "UPI",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "netbanking" as const,
                    label: "Net Banking",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "wallet" as const,
                    label: "Wallet",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    ),
                  },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setActivePaymentMethod(method.id)}
                    className={`p-3 border-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${activePaymentMethod === method.id
                      ? "border-gray-600 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div
                      className={`mb-1 flex justify-center ${activePaymentMethod === method.id
                        ? "text-gray-900"
                        : "text-gray-600"
                        }`}
                    >
                      {method.icon}
                    </div>
                    <span
                      className={`text-sm font-medium text-center ${activePaymentMethod === method.id
                        ? "text-gray-900"
                        : "text-gray-700"
                        }`}
                    >
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Forms */}
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Card Payment Form */}
              {activePaymentMethod === "card" && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${errors.cardNumber ? "border-red-300" : "border-gray-300"
                        }`}
                      value={cardDetails.number}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${errors.expiry ? "border-red-300" : "border-gray-300"
                          }`}
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                      />
                      {errors.expiry && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.expiry}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${errors.cvv ? "border-red-300" : "border-gray-300"
                          }`}
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cvv: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        maxLength={3}
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${errors.holderName
                        ? "border-red-300"
                        : "border-gray-300"
                        }`}
                      value={cardDetails.holderName}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          holderName: e.target.value,
                        })
                      }
                    />
                    {errors.holderName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.holderName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveCard"
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <label
                      htmlFor="saveCard"
                      className="ml-2 text-sm text-gray-600"
                    >
                      Save card for future payments
                    </label>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {activePaymentMethod === "upi" && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${errors.upiId ? "border-red-300" : "border-gray-300"
                        }`}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    {errors.upiId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.upiId}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {["GPay", "PhonePe", "Paytm"].map((app) => (
                      <button
                        key={app}
                        type="button"
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-all flex flex-col items-center justify-center"
                      >
                        <div className="text-gray-700 mb-1 flex justify-center">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-center">
                          {app}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Net Banking Form */}
              {activePaymentMethod === "netbanking" && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Bank
                    </label>
                    <select
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${errors.bank ? "border-red-300" : "border-gray-300"
                        }`}
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="">Choose your bank</option>
                      {popularBanks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    {errors.bank && (
                      <p className="text-red-500 text-sm mt-1">{errors.bank}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {popularBanks.slice(0, 4).map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 border-2 rounded-xl transition-all flex items-center justify-center ${selectedBank === bank
                          ? "border-gray-600 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <span className="text-sm font-medium text-gray-700 text-center">
                          {bank}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallet Payment Form */}
              {activePaymentMethod === "wallet" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    {walletOptions.map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center justify-center ${selectedWallet === wallet
                          ? "border-gray-600 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div
                          className={`mb-2 flex justify-center ${selectedWallet === wallet
                            ? "text-gray-900"
                            : "text-gray-600"
                            }`}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-medium text-center ${selectedWallet === wallet
                            ? "text-gray-900"
                            : "text-gray-700"
                            }`}
                        >
                          {wallet}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.wallet && (
                    <p className="text-red-500 text-sm mt-1">{errors.wallet}</p>
                  )}
                </div>
              )}

              {/* Discount Code */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${errors.discount ? "border-red-300" : "border-gray-300"
                      }`}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={appliedDiscount}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {appliedDiscount ? "Applied" : "Apply"}
                  </button>
                </div>
                {errors.discount && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount}</p>
                )}
                {appliedDiscount && (
                  <p className="text-green-500 text-sm mt-1">
                    Discount applied successfully!
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Try using code: <strong>SAVE25</strong> for extra discount
                </p>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-4 px-6 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ₹${orderSummary.total}`
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white sticky top-2 rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Product Info */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">
                    {orderSummary.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{orderSummary.plan}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Base Price</span>
                  <span>₹{orderSummary.basePrice}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{orderSummary.discount}</span>
                  {appliedDiscount && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                      Extra
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST</span>
                  <span>₹{orderSummary.gst}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total Payable</span>
                  <span>₹{orderSummary.total}</span>
                </div>
              </div>

              {/* Download Invoice */}
              <button className="w-full border border-gray-600 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors font-medium mb-4">
                <Download className="w-4 h-4 inline-block mr-2" />
                Download Proforma Invoice
              </button>

              {/* Support Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Need help with payment?
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Contact our 24/7 support team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-8">
                  Your session has been successfully scheduled. We've sent the details to your email.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 w-full mb-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-3 text-indigo-500" />
                      <span className="text-sm font-medium">Date</span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm">
                      {bookingDetails?.date ? new Date(bookingDetails.date).toLocaleDateString() : "TBD"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-indigo-500" />
                      <span className="text-sm font-medium">Time</span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm">
                      {bookingDetails?.slot?.time || "TBD"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Video className="w-5 h-5 mr-3 text-indigo-500" />
                      <span className="text-sm font-medium">Expert</span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm">
                      {bookingDetails?.expertName || "Expert"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 w-full">
                  <button
                    onClick={() => navigate("/my-sessions")}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-0.5"
                  >
                    Go to My Sessions
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full bg-white text-gray-700 py-3.5 px-6 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;