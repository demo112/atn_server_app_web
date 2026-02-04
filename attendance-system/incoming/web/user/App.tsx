
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserModal from './components/UserModal';
import { User, UserStatus, ModalType } from './types';
import { INITIAL_USERS, ROLES } from './constants';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchName, setSearchName] = useState('');
  const [filteredName, setFilteredName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalType, setModalType] = useState<ModalType>(null);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [showToast, setShowToast] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!filteredName) return users;
    return users.filter(u => u.name.toLowerCase().includes(filteredName.toLowerCase()));
  }, [users, filteredName]);

  const handleSearch = () => setFilteredName(searchName);
  const handleReset = () => {
    setSearchName('');
    setFilteredName('');
  };

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddUser = () => {
    setCurrentUser(undefined);
    setModalType('add');
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setModalType('edit');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('确定要删除该用户吗？')) {
      setUsers(users.filter(u => u.id !== id));
      triggerToast();
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 个用户吗？`)) {
      setUsers(users.filter(u => !selectedIds.has(u.id)));
      setSelectedIds(new Set());
      triggerToast();
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleModalConfirm = (data: Partial<User>) => {
    if (modalType === 'add') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name || 'New User',
        phone: data.phone || '',
        department: data.department || 'Default',
        employeeId: data.employeeId || '',
        role: data.role || '',
        status: UserStatus.PENDING,
      };
      setUsers([...users, newUser]);
    } else if (modalType === 'edit' && currentUser) {
      setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...data } : u));
    }
    setModalType(null);
    triggerToast();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto relative">
          {/* Search Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 whitespace-nowrap">姓名:</label>
              <input 
                className="border border-gray-300 rounded px-3 py-1.5 w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm"
                placeholder="请输入姓名"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSearch}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-1.5 rounded transition-all text-sm font-medium"
              >
                查询
              </button>
              <button 
                onClick={handleReset}
                className="border border-gray-300 hover:bg-gray-50 px-6 py-1.5 rounded transition-all text-sm"
              >
                重置
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={handleAddUser}
              className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-all text-gray-700 bg-white"
            >
              <span className="material-icons text-lg">add</span> 添加
            </button>
            <button 
              disabled={selectedIds.size === 0}
              onClick={handleBatchDelete}
              className={`flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded text-sm transition-all text-gray-700 bg-white ${selectedIds.size > 0 ? 'hover:bg-red-50 hover:text-red-600' : 'opacity-50 cursor-not-allowed'}`}
            >
              <span className="material-icons text-lg">delete_outline</span> 删除
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                        onChange={handleToggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3">姓名</th>
                    <th className="px-6 py-3">联系方式</th>
                    <th className="px-6 py-3">部门</th>
                    <th className="px-6 py-3">工号</th>
                    <th className="px-6 py-3">角色</th>
                    <th className="px-6 py-3 text-center">状态</th>
                    <th className="px-6 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedIds.has(user.id)}
                          onChange={() => handleToggleSelect(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                      <td className="px-6 py-4">{user.phone}</td>
                      <td className="px-6 py-4 text-gray-600">{user.department}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{user.employeeId}</td>
                      <td className="px-6 py-4">{ROLES.find(r => r.value === user.role)?.label || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === UserStatus.PENDING 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3 text-gray-400 group-hover:text-gray-600 transition-colors">
                          <button onClick={() => handleEditUser(user)} className="hover:text-primary transition-colors">
                            <span className="material-icons text-lg">edit</span>
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="hover:text-red-500 transition-colors">
                            <span className="material-icons text-lg">delete_outline</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <span className="material-icons text-4xl mb-2">inbox</span>
                          <p>暂无数据</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-4 text-sm text-gray-600 bg-white">
              <span>共 {filteredUsers.length} 条</span>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
                  <span className="material-icons text-sm">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                  <span className="material-icons text-sm">chevron_right</span>
                </button>
              </div>
              <select className="border border-gray-300 rounded px-3 py-1 bg-white text-sm outline-none">
                <option>20条/页</option>
                <option>50条/页</option>
              </select>
              <div className="flex items-center gap-2">
                <span>跳至</span>
                <input className="w-12 border border-gray-300 rounded px-1 py-1 text-center text-sm" type="text" defaultValue="1"/>
                <span>页</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      <UserModal 
        type={modalType} 
        user={currentUser} 
        onClose={() => setModalType(null)} 
        onConfirm={handleModalConfirm}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-2xl z-[60] border border-gray-700 animate-in slide-in-from-right duration-300">
          <div className="flex items-start gap-3">
            <span className="material-icons text-emerald-400">task_alt</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">任务完成</h4>
              <p className="text-xs text-gray-300 mt-1">操作已成功执行并同步到服务器。</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-gray-500 hover:text-white transition-colors">
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Windows Activation Watermark (Easter Egg) */}
      <div className="fixed bottom-4 right-4 pointer-events-none opacity-20 text-xs text-gray-500 text-right z-0 hidden lg:block">
        激活 Windows<br/>
        转到“设置”以激活 Windows。
      </div>
    </div>
  );
};

export default App;
