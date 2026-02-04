
import React from 'react';
import { TimeSegment } from '../types';
import Toggle from './Toggle';

interface SegmentCardProps {
  segment: TimeSegment;
  index: number;
  onUpdate: (updated: TimeSegment) => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment, index, onUpdate }) => {
  return (
    <div className="bg-card-ios rounded-ios-xl p-4 shadow-sm border border-gray-100 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h3 className="text-base font-bold text-gray-800 mb-4">第{index + 1}次</h3>
      
      {/* On Duty Time */}
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 cursor-pointer active:opacity-60 transition-opacity">
          <span className="text-[15px] font-normal text-gray-700">
            <span className="text-red-500 mr-1">*</span>上班时间
          </span>
          <div className="flex items-center text-gray-900 font-semibold">
            {segment.startTime}
            <span className="material-icons-outlined text-gray-300 text-lg ml-1">chevron_right</span>
          </div>
        </div>

        <div className="bg-[#F8F8FA] rounded-xl p-3 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[14px] text-gray-600">必须签到</span>
            <Toggle 
              checked={segment.mustSignIn} 
              onChange={(val) => onUpdate({ ...segment, mustSignIn: val })} 
            />
          </div>
          
          {segment.mustSignIn && (
            <div className="flex justify-between items-center border-t border-gray-100 pt-3 cursor-pointer">
              <span className="text-[14px] text-gray-600">
                <span className="text-red-500 mr-1">*</span>签到时间段
              </span>
              <div className="flex items-center text-sm text-gray-500">
                {segment.signInRange}
                <span className="material-icons-outlined text-gray-300 text-lg ml-1">chevron_right</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between items-center py-2 cursor-pointer active:opacity-60 transition-opacity">
          <span className="text-[15px] font-normal text-gray-700">
            <span className="text-red-500 mr-1">*</span>下班时间
          </span>
          <div className="flex items-center text-gray-900 font-semibold">
            {segment.endTime}
            <span className="material-icons-outlined text-gray-300 text-lg ml-1">chevron_right</span>
          </div>
        </div>

        <div className="bg-[#F8F8FA] rounded-xl p-3 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[14px] text-gray-600">必须签退</span>
            <Toggle 
              checked={segment.mustSignOut} 
              onChange={(val) => onUpdate({ ...segment, mustSignOut: val })} 
            />
          </div>
          
          {segment.mustSignOut && (
            <div className="flex justify-between items-center border-t border-gray-100 pt-3 cursor-pointer">
              <span className="text-[14px] text-gray-600">
                <span className="text-red-500 mr-1">*</span>签退时间段
              </span>
              <div className="flex items-center text-sm text-gray-500">
                {segment.signOutRange}
                <span className="material-icons-outlined text-gray-300 text-lg ml-1">chevron_right</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;
