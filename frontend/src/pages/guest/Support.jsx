import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../../api/client';

const FAQ = [
  {
    q: 'How long do I have to pay after booking?',
    a: 'You have 24 hours from the time of booking to complete your payment. If no payment is received, the booking is automatically cancelled and the bed is released.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept KBZPay and WaveMoney via screenshot upload. You can also choose to pay in cash directly at the property.',
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
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: contactInfo } = useQuery({
    queryKey: ['contact-info'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-info');
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const mutation = useMutation({
    mutationFn: (payload) => apiClient.post('/comments', payload),
    onSuccess: () => {
      setSubmitted(true);
      setForm({ subject: '', message: '' });
      setErrors({});
    },
    onError: (err) => {
      setErrors(err?.response?.data?.errors ?? { _general: ['Something went wrong. Please try again.'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    mutation.mutate({ subject: form.subject.trim(), message: form.message.trim() });
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined, _general: undefined }));
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Support</h1>
        <p className="text-sm text-gray-400 mt-0.5">Help & frequently asked questions</p>
      </div>

      {/* FAQ */}
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

      {/* Contact Info */}
      <div className="bg-teal-50 rounded-2xl border border-teal-100 p-6 mb-5">
        <h2 className="text-sm font-bold text-teal-800 mb-3">Still need help?</h2>
        <div className="space-y-2 text-sm text-teal-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{contactInfo?.phone_number ?? '—'}</span>
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

      {/* Contact Us Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-1">Send Us a Message</h2>
        <p className="text-xs text-gray-400 mb-5">Our team will get back to you as soon as possible.</p>

        {submitted ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">Message sent!</p>
              <p className="text-xs text-green-600 mt-0.5">We received your inquiry and will respond shortly.</p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="ml-auto text-xs text-green-700 hover:underline font-medium"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors._general && (
              <p className="text-xs text-red-500">{errors._general}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
              <input
                type="text"
                placeholder="e.g. Problem with my booking"
                value={form.subject}
                onChange={set('subject')}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition ${errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
              />
              {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                rows={4}
                placeholder="Describe your issue or question in detail..."
                value={form.message}
                onChange={set('message')}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition resize-none ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
              />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Support;
