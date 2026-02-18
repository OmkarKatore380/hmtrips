import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createOrder, 
  createPayment, 
  updatePayment, 
  updateOrderStatus, 
  createInquiry,
  syncUserCRM
} from '../lib/firestore';
import { openRazorpayCheckout } from '../lib/razorpay';
import { calculateTourPrice } from '../data/pricingEngine';
import { getDestinationById } from '../data/destinations';
import { 
  DynamicPricingDisplay, 
  PriceRangeSlider, 
  BudgetRecommendations,
  getLiveMinimumPrice 
} from './DynamicPricing';
import { 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  Shield,
  Check,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Info,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import BookingWizard from './BookingWizard';

const API_BASE = '';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SEo7lCnNbH00WM';

// Configurable Group Booking Settings
const GROUP_BOOKING_THRESHOLD = parseInt(import.meta.env.VITE_GROUP_BOOKING_MIN) || 7;
const GROUP_CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || '+91-8278717103';
const GROUP_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '918805795706';

// Admin notification settings
const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || '918805795706';
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '+91-8805795706';

export default function EnhancedBookSection({ tour, formatPrice }) {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [guests, setGuests] = useState(2);
  const [budget, setBudget] = useState(30000);
  const [hotelStars, setHotelStars] = useState('3');
  const [transportType, setTransportType] = useState('bus');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Lead form state
  const [leadData, setLeadData] = useState({
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    pickupLocation: '',
    travelDate: '',
    specialRequests: ''
  });

  // Get live minimum price for destination
  const liveMinPrice = tour?.destination ? getLiveMinimumPrice(tour.destination) : 5000;

  // Calculate pricing based on user selections
  const priceData = calculateTourPrice({
    origin: 'Delhi',
    destination: tour?.destination,
    transportType: transportType,
    transportClass: transportType === 'bus' ? 'ac' : transportType === 'train' ? 'ac3' : 'sedan',
    hotelStars: hotelStars,
    nights: tour?.nights || 3,
    passengers: guests,
    rooms: Math.ceil(guests / 2),
    mealPlan: 'cp',
    activityTypes: ['sightseeing'],
    travelMonth: new Date().getMonth() + 1
  });

  const totalAmount = priceData.total;
  const downPayment = priceData.downPayment;
  const remainingAmount = priceData.remainingAmount;
  const isGroupBooking = guests >= GROUP_BOOKING_THRESHOLD;

  // Auto-adjust recommendations based on budget
  useEffect(() => {
    if (budget < 20000) {
      setHotelStars('2');
      setTransportType('bus');
    } else if (budget < 50000) {
      setHotelStars('3');
      setTransportType('train');
    } else if (budget < 100000) {
      setHotelStars('4');
      setTransportType('flight');
    } else {
      setHotelStars('5');
      setTransportType('flight');
    }
  }, [budget]);

  // Send WhatsApp notification to admin
  const sendAdminNotification = (type, data) => {
    const message = encodeURIComponent(
      `🚨 *New Booking ${type}* 🚨\n\n` +
      `👤 *Customer:* ${data.userName || 'Guest'}\n` +
      `📧 *Email:* ${data.email}\n` +
      `📱 *Phone:* ${data.phone}\n` +
      `🏖️ *Tour:* ${data.tourName}\n` +
      `📍 *Destination:* ${data.destination}\n` +
      `👥 *Guests:* ${data.guests}\n` +
      `💰 *Total Amount:* ₹${data.totalAmount?.toLocaleString()}\n` +
      `💳 *Down Payment:* ₹${data.downPayment?.toLocaleString()}\n` +
      `📅 *Travel Date:* ${data.travelDate || 'Not specified'}\n` +
      `📍 *Pickup:* ${data.pickupLocation || 'Not specified'}\n` +
      (data.specialRequests ? `📝 *Requests:* ${data.specialRequests}\n` : '') +
      `\n⏰ *Time:* ${new Date().toLocaleString('en-IN')}`
    );
    
    // Open WhatsApp with pre-filled message to admin
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentError('');

    try {
      // Create inquiry/lead
      await createInquiry({
        userId: user?.uid || null,
        userEmail: leadData.email,
        userPhone: leadData.phone,
        userName: user?.displayName || null,
        tourId: tour?.id,
        tourName: tour?.name,
        message: leadData.specialRequests,
        numberOfGuests: guests,
        preferredDate: leadData.travelDate,
        tripInterest: 'fixed_package',
        priceQuote: totalAmount,
        notes: JSON.stringify({
          pickupLocation: leadData.pickupLocation,
          downPayment: downPayment,
          remainingAmount: remainingAmount
        })
      });

      // Track in CRM
      if (user?.uid) {
        syncUserCRM(user.uid, {
          lastInquiry: tour?.name,
          inquiryValue: totalAmount,
          action: 'booking_lead_captured'
        });
      }

      // Notify admin via WhatsApp
      sendAdminNotification('Lead Captured', {
        userName: user?.displayName,
        email: leadData.email,
        phone: leadData.phone,
        tourName: tour?.name,
        destination: tour?.destination,
        guests: guests,
        totalAmount: totalAmount,
        downPayment: downPayment,
        travelDate: leadData.travelDate,
        pickupLocation: leadData.pickupLocation,
        specialRequests: leadData.specialRequests
      });

      // Show payment section
      setShowLeadForm(false);
      handlePayment();
    } catch (error) {
      console.error('Error submitting lead:', error);
      setPaymentError('Failed to save your details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    setPaymentError('');

    try {
      // Create order in Firestore
      const orderId = await createOrder({
        userId: user?.uid || null,
        userEmail: leadData.email || user?.email || null,
        userPhone: leadData.phone || user?.phoneNumber || null,
        userName: user?.displayName || null,
        tourId: tour?.id,
        tourName: tour?.name,
        amount: downPayment, // 50% down payment
        totalAmount: totalAmount,
        remainingAmount: remainingAmount,
        guests,
        status: 'pending',
        paymentType: 'down_payment'
      });

      // Create payment record
      const paymentId = await createPayment({
        orderId,
        userId: user?.uid || null,
        amount: downPayment,
        totalAmount: totalAmount,
        status: 'pending',
        method: 'razorpay',
        paymentType: 'down_payment'
      });

      // Create Razorpay order
      const createOrderRes = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: downPayment,
          receipt: orderId,
          tourName: tour?.name,
          notes: {
            type: 'down_payment',
            totalAmount: totalAmount,
            remainingAmount: remainingAmount
          }
        }),
      });

      const createOrderData = await createOrderRes.json();
      
      if (!createOrderRes.ok) {
        throw new Error(createOrderData.error || 'Failed to create payment order');
      }

      // Open Razorpay checkout
      const response = await openRazorpayCheckout({
        keyId: RAZORPAY_KEY_ID,
        orderId: createOrderData.orderId,
        amount: createOrderData.amount,
        currency: createOrderData.currency || 'INR',
        name: 'HM Tours',
        description: `${tour?.name} - 50% Down Payment`,
        prefillEmail: leadData.email || user?.email || undefined,
        prefillContact: leadData.phone || user?.phoneNumber || undefined,
      });

      // Verify payment
      const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verifyData = await verifyRes.json();
      
      if (!verifyData.success) {
        throw new Error('Payment verification failed');
      }

      // Update payment and order status
      await updatePayment(paymentId, {
        status: 'completed',
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        paymentType: 'down_payment'
      });
      
      await updateOrderStatus(orderId, 'confirmed');

      // Track in CRM
      if (user?.uid) {
        syncUserCRM(user.uid, {
          totalSpent: downPayment,
          lastBooked: tour?.name,
          bookingCount: 1,
          action: 'down_payment_completed'
        });
      }

      // Notify admin about successful payment
      sendAdminNotification('Payment Received ✅', {
        userName: user?.displayName || leadData.email,
        email: leadData.email || user?.email,
        phone: leadData.phone || user?.phoneNumber,
        tourName: tour?.name,
        destination: tour?.destination,
        guests: guests,
        totalAmount: totalAmount,
        downPayment: downPayment,
        remainingAmount: remainingAmount,
        travelDate: leadData.travelDate,
        pickupLocation: leadData.pickupLocation,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id
      });

      setPaymentSuccess(true);
    } catch (err) {
      console.error('Payment error:', err);
      if (err?.message === 'Payment closed') {
        setPaymentError('Payment was cancelled.');
      } else {
        setPaymentError(err?.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (paymentSuccess) {
    return (
      <section id="book" className="py-12 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your down payment of <strong>₹{downPayment.toLocaleString()}</strong> has been received.
          </p>
          <div className="bg-blue-50 p-6 rounded-xl mb-6">
            <p className="text-blue-900 font-medium">Remaining Payment</p>
            <p className="text-3xl font-bold text-blue-600">₹{remainingAmount.toLocaleString()}</p>
            <p className="text-sm text-blue-700 mt-2">Due 7 days before departure</p>
          </div>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to {leadData.email || user?.email}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-12 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Book Your Trip</h2>
          <p className="text-gray-600">Secure your spot with just 50% down payment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Booking Summary */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Package</span>
                <span className="font-medium">{tour?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Destination</span>
                <span className="font-medium">{tour?.destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{tour?.nights || 3} Nights / {(tour?.nights || 3) + 1} Days</span>
              </div>
            </div>

            {/* Guest Selector */}
            <div className="bg-white p-4 rounded-xl mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Users className="w-4 h-4" />
                Number of Guests
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-semibold w-12 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(guests + 1)}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  +
                </button>
              </div>
              {isGroupBooking && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900">Group Booking Detected!</p>
                      <p className="text-sm text-amber-800 mt-1">
                        For exclusive group discounts, contact us:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a 
                          href={`tel:${GROUP_CONTACT_PHONE}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {GROUP_CONTACT_PHONE}
                        </a>
                        <a 
                          href={`https://wa.me/${GROUP_WHATSAPP}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Pricing Display */}
            <DynamicPricingDisplay 
              basePrice={priceData.perPerson}
              destination={tour?.destination}
              hotelStars={hotelStars}
              budget={budget}
              guests={guests}
            />

            {/* Price Range Slider */}
            <div className="mt-6">
              <PriceRangeSlider 
                min={liveMinPrice}
                max={200000}
                value={budget}
                onChange={setBudget}
                destination={tour?.destination}
              />
            </div>

            {/* Budget-Based Recommendations */}
            <div className="mt-6">
              <BudgetRecommendations 
                budget={budget}
                destination={tour?.destination}
              />
            </div>

            {/* Payment Structure */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Flexible Payment</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">Pay Now (50%)</span>
                  <span className="font-bold text-blue-900">₹{downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pay Later (50%)</span>
                  <span className="text-gray-700">₹{remainingAmount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Balance due 7 days before departure
                </p>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-xs text-red-700">
                  <strong>Cancellation Policy:</strong> 10% cancellation charge applies to all bookings. 
                  Free rescheduling up to 7 days before travel.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Lead Form or Payment */}
          <div>
            {!showLeadForm ? (
              <div className="bg-white border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Book?</h3>
                <p className="text-gray-600 mb-6">
                  Enter your details to proceed with the booking. You'll pay 50% now to secure your spot.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Secure Payment</p>
                      <p className="text-sm text-gray-500">Powered by Razorpay with bank-grade security</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Cancellation Policy</p>
                      <p className="text-sm text-gray-500">10% cancellation charge applies. Free rescheduling up to 7 days before travel.</p>
                    </div>
                  </div>
                </div>

                {!isGroupBooking ? (
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Book
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 font-medium mb-2">Group Booking Available</p>
                    <p className="text-sm text-amber-700 mb-3">
                      For groups of {GROUP_BOOKING_THRESHOLD}+ guests, please contact us for exclusive discounts.
                    </p>
                    <div className="flex gap-2">
                      <a 
                        href={`tel:${GROUP_CONTACT_PHONE}`}
                        className="flex-1 py-2 bg-white text-amber-700 rounded-lg text-center font-medium hover:bg-amber-100 transition-colors"
                      >
                        Call Now
                      </a>
                      <a 
                        href={`https://wa.me/${GROUP_WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg text-center font-medium hover:bg-green-700 transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowWizard(true)}
                  className="w-full mt-3 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                >
                  Customize This Package
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="bg-white border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={leadData.email}
                      onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={leadData.phone}
                      onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Preferred Travel Date
                    </label>
                    <input
                      type="date"
                      value={leadData.travelDate}
                      onChange={(e) => setLeadData({...leadData, travelDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={leadData.pickupLocation}
                      onChange={(e) => setLeadData({...leadData, pickupLocation: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={leadData.specialRequests}
                      onChange={(e) => setLeadData({...leadData, specialRequests: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                      placeholder="Any special requirements..."
                    />
                  </div>
                </div>

                {paymentError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {paymentError}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="flex-1 py-3 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Processing...' : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay ₹{downPayment.toLocaleString()} Now
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  By proceeding, you agree to our Terms & Conditions and Cancellation Policy
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      {showWizard && (
        <BookingWizard
          initialTour={tour}
          onClose={() => setShowWizard(false)}
          onComplete={() => {
            setShowWizard(false);
            setPaymentSuccess(true);
          }}
        />
      )}
    </section>
  );
}
