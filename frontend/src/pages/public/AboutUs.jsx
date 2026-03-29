import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Yangon Focus</h1>
            <p className="text-xl md:text-2xl text-teal-50 font-light">
              Redefining the Urban Living Experience in Myanmar
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
            <p className="text-lg text-gray-700 leading-relaxed">
              For too long, finding a hostel in Yangon meant navigating a maze of unverified listings, 
              endless phone calls, and manual rent tracking. We saw a gap between property owners and 
              seekers—a gap filled with uncertainty.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-6">
              Yangon Focus was built to close that gap. We are more than just a marketplace; we are a 
              digital backbone for the city's hospitality community.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our Three Pillars of Trust
            </h2>
            <p className="text-base text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              We designed our ecosystem to serve the three essential roles that keep our city moving:
            </p>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      For the Guests (The Seekers)
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We provide a safe harbor. With real-time bed availability in "Hall" type dorms, 
                      precise payment countdowns, and verified residency details, guests can 
                      focus on their studies and careers, not their housing stress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      For the Owners (The Providers)
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We empower local entrepreneurs. Property owners get a professional suite of tools 
                      to manage high-capacity rooms, track multi-month advance payments, and maintain the 
                      security of their properties through verified tenant records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      For the Platform (The Governance)
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Integrity is non-negotiable. Managed by our Super Admin team, our governance layer ensures 
                      that every hostel license is legitimate and every dispute is resolved fairly through our 
                      evidence-based Misconduct Reporting system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100 p-8 md:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Transparency</h3>
                  <p className="text-gray-700 leading-relaxed">
                    No hidden fees, no "ghost" listings. What you see on the dashboard is what you get at the property.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Safety First</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Through our integrated reporting system and user verification, we foster a respectful 
                    community for everyone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Local Innovation</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Built specifically for the Myanmar market, supporting local payment behaviors like KBZPay, 
                    WaveMoney, and traditional cash-at-property.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 text-center">
            <div className="max-w-3xl mx-auto">
              <svg className="w-12 h-12 text-teal-500 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl md:text-2xl text-gray-800 font-medium italic leading-relaxed mb-4">
                "Our mission is to turn every hostel stay in Yangon into a seamless, digital-first experience 
                where trust is the default setting."
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
