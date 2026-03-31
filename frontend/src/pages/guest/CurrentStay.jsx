import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import currentStayService from '../../services/currentStayService';
import CurrentStayCard from '../../components/guest/CurrentStayCard';

const CurrentStay = () => {
  const navigate = useNavigate();
  const { data: stays = [], isPending, isError } = useQuery({
    queryKey: ['guest-current-stays'],
    queryFn:  () => currentStayService.getCurrentStays(),
  });

  if (isPending) {
    return (
      <div className="p-6 sm:p-8">
        <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || stays.length === 0) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Current Stay</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your active residency details</p>
        </div>
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No active stays at the moment.</p>
          <p className="text-sm text-gray-400 mt-1">Once your booking is confirmed, your stay details will appear here.</p>
          <Link to="/" className="mt-4 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition">
            Find a Hostel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Current Stay</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {stays.length} active {stays.length === 1 ? 'residency' : 'residencies'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stays.map((stay) => (
          <CurrentStayCard
            key={stay.id}
            stay={stay}
            onClick={() => navigate(`/guest/current-stay/${stay.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default CurrentStay;
