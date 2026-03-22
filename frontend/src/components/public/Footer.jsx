import { Link } from 'react-router-dom';

const Footer = () => (
  <footer id="contact" className="bg-gray-900 text-gray-400">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9.5L12 4l9 5.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21V12h6v9" />
              </svg>
            </div>
            <span className="text-white font-bold text-base">Yangon Focus</span>
          </div>
          <p className="text-sm leading-relaxed">
            Myanmar's trusted hostel discovery platform. We connect verified hostel owners
            with tenants looking for safe, affordable accommodation in Yangon.
          </p>
        </div>

        <div id="about">
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-teal-400 transition">Home</Link></li>
            <li><a href="#results" className="hover:text-teal-400 transition">Browse Hostels</a></li>
            <li><Link to="/login" className="hover:text-teal-400 transition">Owner Login</Link></li>
            <li><Link to="/login" className="hover:text-teal-400 transition">Register Property</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@yangoonfocus.mm
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +95 9 765 432 189
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Yangon, Myanmar
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p>&copy; {new Date().getFullYear()} Yangon Focus. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-teal-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-teal-400 transition">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
