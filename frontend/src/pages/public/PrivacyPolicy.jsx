import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

const Section = ({ number, title, children }) => (
  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 md:p-9">
    <h2 className="text-lg font-bold text-teal-600 mb-5">
      {number}. {title}
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

const Principle = ({ title, children }) => (
  <li className="flex gap-2 text-sm text-gray-700">
    <span className="text-teal-500 font-semibold flex-shrink-0">•</span>
    <span><span className="font-semibold text-gray-800">{title}:</span> {children}</span>
  </li>
);

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main className="flex-1">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-teal-100 text-sm md:text-base">Commitment to Data Protection</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 md:p-9">
          <p className="text-sm text-gray-700 leading-relaxed">
            We adhere to the seven core principles of data protection inspired by international
            best practices (GDPR) to ensure your information is handled with professional
            integrity.
          </p>
        </section>

        <Section number="2" title="Privacy Policy">
          <Sub letter="A" title="Our Data Principles">
            <span>
              We are committed to the following data protection principles:
            </span>
          </Sub>

          <ul className="space-y-3 pl-1">
            <Principle title="Lawfulness & Transparency">
              We process data fairly under Myanmar regulations.
            </Principle>
            <Principle title="Purpose Limitation">
              Data is collected only for hostel matching and verification.
            </Principle>
            <Principle title="Data Minimization">
              We only ask for what is strictly necessary (e.g., phone, NRC).
            </Principle>
            <Principle title="Accuracy">
              Users have the right to ensure their information is up-to-date.
            </Principle>
            <Principle title="Storage Limitation">
              Information is only kept as long as necessary for platform functionality.
            </Principle>
            <Principle title="Integrity & Confidentiality">
              We use industry-standard security to prevent unauthorized access.
            </Principle>
            <Principle title="Accountability">
              We take responsibility for how we process and protect your data.
            </Principle>
          </ul>

          <Sub letter="B" title="Ethical Processing">
            In alignment with the IEEE Code of Ethics, we prioritize public welfare and user
            privacy in every implementation of our software engineering.
          </Sub>

          <Sub letter="C" title="Accessibility & Inclusion">
            This policy and the entire platform are designed to meet WCAG standards, ensuring
            usability for individuals with disabilities. Assistance is provided in both English
            and Burmese for maximum inclusivity.
          </Sub>
        </Section>

      </div>
    </main>

    <Footer />
  </div>
);

export default PrivacyPolicy;
