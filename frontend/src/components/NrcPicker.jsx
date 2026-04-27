import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import SearchableSelect from './SearchableSelect';

const SelectField = ({ label, id, error, children, ...props }) => (
  <div className="min-w-0">
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <select
      id={id}
      className={`w-full max-w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition appearance-none truncate ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const NrcPicker = ({ value, onChange, errors = {}, disabled = false }) => {
  const [nrcNumError, setNrcNumError] = useState('');

  const { data: nrcData } = useQuery({
    queryKey: ['nrc-lookup'],
    queryFn: () => apiClient.get('/nrc-lookup').then(r => r.data),
    staleTime: Infinity,
  });

  const regionCodes = nrcData ? Object.keys(nrcData).map(Number).sort((a, b) => a - b) : [];
  const townshipsForRegion = value.nrc_region && nrcData ? (nrcData[String(value.nrc_region)] || []) : [];

  const set = (field) => (e) => {
    const val = e.target.value;
    const updated = { ...value, [field]: val };
    if (field === 'nrc_region') updated.nrc_township_id = '';
    onChange(updated);
  };

  const onChangeNrcNum = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange({ ...value, nrc_number: val });
  };

  const onBlurNrcNum = () => {
    if (value.nrc_number && !/^\d{6}$/.test(value.nrc_number)) {
      setNrcNumError('The NRC number must be exactly 6 digits.');
    }
  };

  const onFocusNrcNum = () => setNrcNumError('');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">NRC Number</label>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <SelectField id="nrc_region" value={value.nrc_region} onChange={set('nrc_region')} error={errors.nrc_region?.[0]} disabled={disabled}>
          <option value="">Region</option>
          {regionCodes.map(code => (
            <option key={code} value={code}>{code}</option>
          ))}
        </SelectField>
        <SearchableSelect
          id="nrc_township_id"
          value={value.nrc_township_id}
          onChange={(v) => onChange({ ...value, nrc_township_id: v })}
          placeholder="Township"
          disabled={disabled || !value.nrc_region}
          error={errors.nrc_township_id?.[0]}
          options={townshipsForRegion.map(t => ({ value: t.id, label: t.township_code }))}
        />
        <SelectField id="nrc_type" value={value.nrc_type} onChange={set('nrc_type')} error={errors.nrc_type?.[0]} disabled={disabled}>
          <option value="">Type</option>
          <option value="N">N</option>
          <option value="P">P</option>
          <option value="E">E</option>
          <option value="T">T</option>
        </SelectField>
        <div className="min-w-0">
          <input
            id="nrc_number" type="text" inputMode="numeric" maxLength={6} placeholder="123456"
            value={value.nrc_number} onChange={onChangeNrcNum}
            onBlur={onBlurNrcNum} onFocus={onFocusNrcNum}
            disabled={disabled}
            className={`w-full pl-3 pr-2 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition ${
              (errors.nrc_number || nrcNumError) ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          {(errors.nrc_number?.[0] || nrcNumError) && <p className="mt-1 text-xs text-red-500">{errors.nrc_number?.[0] || nrcNumError}</p>}
        </div>
      </div>
    </div>
  );
};

export default NrcPicker;
