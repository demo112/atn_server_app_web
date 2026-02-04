
import React from 'react';

interface IOSSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const IOSSwitch: React.FC<IOSSwitchProps> = ({ checked, onChange }) => {
  return (
    <label className="relative inline-block w-[51px] h-[31px]">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <div className={`
        absolute inset-0 cursor-pointer transition-colors duration-200 rounded-full
        ${checked ? 'bg-[#34C759]' : 'bg-[#E9E9EA]'}
      `}>
        <div className={`
          absolute top-[2px] left-[2px] h-[27px] w-[27px] bg-white rounded-full shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-[20px]' : 'translate-x-0'}
        `} />
      </div>
    </label>
  );
};

export default IOSSwitch;
