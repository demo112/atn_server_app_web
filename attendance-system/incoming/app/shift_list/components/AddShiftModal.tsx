
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Shift } from '../types';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (shift: Omit<Shift, 'id'>) => void;
}

const AddShiftModal: React.FC<AddShiftModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, startTime, endTime });
    setName('');
  };

  const handleSmartSuggest = async () => {
    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Suggest a creative and professional name for a work shift and standard start/end times in JSON format. Provide 3 options. Focus on Chinese names like '夜猫专班' or '高效早班'.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                start: { type: Type.STRING },
                end: { type: Type.STRING }
              },
              required: ["name", "start", "end"]
            }
          }
        }
      });

      const suggestions = JSON.parse(response.text);
      if (suggestions && suggestions.length > 0) {
        const first = suggestions[0];
        setName(first.name);
        setStartTime(first.start);
        setEndTime(first.end);
      }
    } catch (error) {
      console.error("AI Suggestion failed", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">新建班次</h2>
          <button onClick={onClose} className="p-1 text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 rounded-full">
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-500">班次名称</label>
              <button 
                type="button"
                onClick={handleSmartSuggest}
                disabled={isSuggesting}
                className="text-xs font-bold text-primary flex items-center gap-1 active:opacity-50 disabled:opacity-30"
              >
                <span className="material-icons-outlined text-sm">auto_awesome</span>
                {isSuggesting ? '生成中...' : '智能建议'}
              </button>
            </div>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="例如：白班、夜班"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1.5">开始时间</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1.5">结束时间</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 active:scale-95 transition-all"
            >
              取消
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/25 active:scale-95 transition-all"
            >
              确定保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShiftModal;
