const FAQ = [
  {
    q: 'How long do I have to pay after booking?',
    a: 'You have 24 hours from the time of booking to complete your payment. If no payment is received, the booking is automatically cancelled and the bed is released.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept KBZPay, WaveMoney, and Bank Transfer via screenshot upload. You can also choose to pay in cash directly at the property.',
  },
  {
    q: 'How do I cancel a booking?',
    a: 'Go to "My Bookings" and click the "Cancel Booking" button on any Pending booking. Cancellation is only possible while the booking is still in Pending status.',
  },
  {
    q: 'When will my booking be confirmed?',
    a: 'For digital payments, the owner will review your screenshot and approve it. For cash payments, the owner records it after you pay in person. You will see the status change to Confirmed.',
  },
  {
    q: 'Can I change my check-in date after booking?',
    a: 'Not directly — you will need to cancel the existing booking and create a new one with your preferred date.',
  },
  {
    q: 'What if my screenshot is rejected?',
    a: 'Contact the hostel owner directly. You can find the hostel address and name in your booking details.',
  },
];

const Support = () => {
  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Support</h1>
        <p className="text-sm text-gray-400 mt-0.5">Help & frequently asked questions</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-bold text-gray-700 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <p className="font-semibold text-gray-800 text-sm mb-1">{item.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-teal-50 rounded-2xl border border-teal-100 p-6">
        <h2 className="text-sm font-bold text-teal-800 mb-3">Still need help?</h2>
        <div className="space-y-2 text-sm text-teal-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>+95 9 123 456 789</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>support@yangonfocus.com</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Available Mon – Sat, 9:00 AM – 6:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
