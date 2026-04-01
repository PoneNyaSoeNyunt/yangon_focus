import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

const Section = ({ number, title, children }) => (
  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 md:p-9">
    <h2 className="text-lg font-bold text-teal-600 mb-5">
      {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </section>
);

const Sub = ({ letter, title, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-teal-500 mb-1.5">
      {letter}. {title}
    </h3>
    <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
  </div>
);

const TermsOfService = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main className="flex-1">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-teal-100 text-sm md:text-base">Last Updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        <Section number="1" title="Terms of Service">
          <Sub letter="A" title="Nature of Service">
            Yangon Focus serves exclusively as a digital facilitator to connect verified hostel
            owners with potential tenants. We do not own, manage, or control the hostels listed
            on the platform.
          </Sub>

          <Sub letter="B" title="User Authenticity & Verification">
            <span>
              <span className="font-semibold text-gray-800">Owners:</span> To discourage
              fraudulent entries, owners must provide valid business licenses for authentication.
              <br /><br />
              <span className="font-semibold text-gray-800">Integrity:</span> Users are
              prohibited from submitting false information. Scams or fraudulent behavior will
              result in immediate blacklisting and potential legal action under the Electronic
              Transaction Law (2004/2021).
            </span>
          </Sub>

          <Sub letter="C" title="Payment Verification Process">
            <span>
              <span className="font-semibold text-gray-800">Owner-Specific Transfers:</span> Digital
              payments must be executed externally using the specific mobile wallet service(s)
              pre-determined and designated by the individual Hostel Owner (e.g., KBZPay or
              WaveMoney).
              <br /><br />
              <span className="font-semibold text-gray-800">Guest Responsibility:</span> It is the
              guest's responsibility to verify which mobile wallet(s) the owner accepts before
              initiating a transfer. Yangon Focus is not liable for transfers made to incorrect
              accounts or through unsupported services.
              <br /><br />
              <span className="font-semibold text-gray-800">Cash Alternative:</span> If a guest does
              not have access to the specific digital payment method(s) accepted by the Hostel Owner,
              they must select the "Pay at Property" option to settle the balance in cash upon arrival.
              <br /><br />
              <span className="font-semibold text-gray-800">Screenshot Proof:</span> For all digital
              transactions, guests must upload a clear screenshot of the transaction success screen as
              proof of payment to the owner's specific account.
              <br /><br />
              <span className="font-semibold text-gray-800">Final Confirmation:</span> A booking
              remains in "Pending" status until the Hostel Owner manually verifies the received funds
              and the uploaded screenshot.
            </span>
          </Sub>

          <Sub letter="D" title="Limitation of Liability">
            Yangon Focus is not liable for disputes arising from the physical rental agreement,
            property damage, or interpersonal conflicts between owners and tenants. Our role is
            strictly limited to facilitating the discovery and booking process.
          </Sub>

          <Sub letter="E" title="Intellectual Property">
            All software design, branding, and original graphics are the property of Yangon
            Focus. The platform is built using licensed or open-source technologies to ensure
            legal compliance.
          </Sub>
        </Section>

      </div>
    </main>

    <Footer />
  </div>
);

export default TermsOfService;
