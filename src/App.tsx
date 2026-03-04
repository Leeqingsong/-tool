import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DeviceList } from './components/DeviceList';
import { Modal } from './components/Modal';
import { useStore } from './store';
import { Device } from './types';

const PREDEFINED_TYPES = ["Firewall", "WAF", "IPS", "Router", "Switch", "Server"];

export default function App() {
  const { addUnit, addDevice, updateDevice, selectedUnitId } = useStore();
  
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("Firewall");

  const handleAddUnit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addUnit({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    });
    setIsUnitModalOpen(false);
  };

  const handleSaveDevice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const customType = formData.get('customType') as string;
    
    const finalType = type === 'Other' && customType ? customType : type;

    const deviceData = {
      name: formData.get('name') as string,
      type: finalType,
      url: formData.get('url') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      notes: formData.get('notes') as string,
    };

    if (editingDevice) {
      updateDevice(editingDevice.id, deviceData);
    } else if (selectedUnitId) {
      addDevice({ ...deviceData, unitId: selectedUnitId });
    }
    
    setIsDeviceModalOpen(false);
    setEditingDevice(null);
  };

  const openAddDevice = () => {
    setEditingDevice(null);
    setSelectedDeviceType("Firewall");
    setIsDeviceModalOpen(true);
  };

  const openEditDevice = (device: Device) => {
    setEditingDevice(device);
    if (PREDEFINED_TYPES.includes(device.type)) {
      setSelectedDeviceType(device.type);
    } else {
      setSelectedDeviceType("Other");
    }
    setIsDeviceModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar onAddUnit={() => setIsUnitModalOpen(true)} />
      <DeviceList onAddDevice={openAddDevice} onEditDevice={openEditDevice} />

      {/* Add Unit Modal */}
      <Modal 
        isOpen={isUnitModalOpen} 
        onClose={() => setIsUnitModalOpen(false)} 
        title="添加组织单位"
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">单位名称</label>
            <input 
              name="name" 
              required 
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="例如：总部、A分公司"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">描述（可选）</label>
            <textarea 
              name="description" 
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="该单位的简短描述..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsUnitModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              保存单位
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Device Modal */}
      <Modal 
        isOpen={isDeviceModalOpen} 
        onClose={() => setIsDeviceModalOpen(false)} 
        title={editingDevice ? "编辑设备" : "添加设备"}
      >
        <form onSubmit={handleSaveDevice} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">设备名称</label>
              <input 
                name="name" 
                required 
                defaultValue={editingDevice?.name}
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="例如：核心防火墙"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">设备类型</label>
              <select 
                name="type" 
                required
                value={selectedDeviceType}
                onChange={(e) => setSelectedDeviceType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Firewall">防火墙 (Firewall)</option>
                <option value="WAF">WAF</option>
                <option value="IPS">IPS</option>
                <option value="Router">路由器 (Router)</option>
                <option value="Switch">交换机 (Switch)</option>
                <option value="Server">服务器 (Server)</option>
                <option value="Other">其他 (Other)</option>
              </select>
            </div>
          </div>
          
          {selectedDeviceType === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">自定义设备类型</label>
              <input 
                name="customType" 
                required 
                defaultValue={editingDevice && !PREDEFINED_TYPES.includes(editingDevice.type) ? editingDevice.type : ''}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="例如：负载均衡"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">登录地址 / IP</label>
            <input 
              name="url" 
              required 
              defaultValue={editingDevice?.url}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
              placeholder="https://192.168.1.1 或 10.0.0.1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">用户名</label>
              <input 
                name="username" 
                required 
                defaultValue={editingDevice?.username}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">密码</label>
              <input 
                name="password" 
                type="password"
                defaultValue={editingDevice?.password}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">备注（可选）</label>
            <textarea 
              name="notes" 
              rows={2}
              defaultValue={editingDevice?.notes}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="任何特殊的登录说明..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsDeviceModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {editingDevice ? "保存更改" : "保存设备"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
