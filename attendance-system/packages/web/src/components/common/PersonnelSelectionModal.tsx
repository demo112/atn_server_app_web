import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import request from '../../utils/request';
import { ApiResponse } from '@attendance/shared';

export interface SelectionItem {
  id: string;
  name: string;
  type: 'employee' | 'department';
  avatar?: string;
  data?: any;
}

interface PersonnelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: SelectionItem[]) => void;
  multiple?: boolean;
  title?: string;
  initialSelected?: SelectionItem[];
  selectType?: 'all' | 'employee' | 'department';
}

const PersonnelSelectionModal: React.FC<PersonnelSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  multiple = true,
  title = '选择人员/部门',
  initialSelected = [],
  selectType = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'employee' | 'department'>(
    selectType === 'department' ? 'department' : 'employee'
  );
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SelectionItem[]>(initialSelected);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, activeTab, search]);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'employee' ? '/employees' : '/departments';
      const res = await request.get<unknown, ApiResponse<any>>(endpoint, {
        params: { keyword: search, page: 1, pageSize: 50 }
      });

      if (res.success) {
        const data = res.data.items || res.data; // Handle pagination or list response
        const mappedItems: SelectionItem[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          type: activeTab,
          avatar: item.avatar,
          data: item,
        }));
        setItems(mappedItems);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: SelectionItem) => {
    if (multiple) {
      const exists = selected.find(s => s.id === item.id && s.type === item.type);
      if (exists) {
        setSelected(selected.filter(s => s.id !== item.id || s.type !== item.type));
      } else {
        setSelected([...selected, item]);
      }
    } else {
      setSelected([item]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Selection Area */}
            <div className="flex-1 flex flex-col border-r">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'employee' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('employee')}
                >
                  员工
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'department' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('department')}
                >
                  部门
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="搜索..."
                    className="w-full pl-8 pr-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                  <div className="text-center py-4 text-gray-400 text-sm">加载中...</div>
                ) : items.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">无数据</div>
                ) : (
                  items.map(item => {
                    const isSelected = selected.some(s => s.id === item.id && s.type === item.type);
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Checkbox for visual cue */}
                        <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <span className="material-icons text-white text-[10px] font-bold">check</span>}
                        </div>
                        
                        {/* Avatar/Icon */}
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500">
                          {item.avatar ? (
                            <img src={item.avatar} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            <span className="material-icons text-sm">
                              {item.type === 'employee' ? 'person' : 'apartment'}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Selected Area (Only show if multiple) */}
            {multiple && (
              <div className="w-48 flex flex-col bg-gray-50">
                <div className="p-3 border-b text-xs font-medium text-gray-500 flex justify-between items-center">
                  <span>已选 ({selected.length})</span>
                  {selected.length > 0 && (
                    <button 
                      onClick={() => setSelected([])}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      清空
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {selected.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-2 bg-white rounded border shadow-sm">
                      <span className="text-sm truncate max-w-[100px]">{item.name}</span>
                      <button
                        onClick={() => handleSelect(item)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <span className="material-icons text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
            >
              确定
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PersonnelSelectionModal;
