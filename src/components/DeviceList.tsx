import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Search, ExternalLink, Copy, Check, Trash2, Edit, ShieldAlert, Monitor, Server, Lock, Download, Upload, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';
import { Device } from '../types';

const DEVICE_ICONS: Record<string, React.ElementType> = {
  Firewall: ShieldAlert,
  WAF: ShieldAlert,
  IPS: ShieldAlert,
  Router: Server,
  Switch: Server,
  Server: Monitor,
  Other: Lock,
};

export function DeviceList({ onAddDevice, onEditDevice }: { onAddDevice: () => void, onEditDevice: (d: Device) => void }) {
  const { devices, selectedUnitId, units, deleteDevice, toggleInspected } = useStore();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const unitDevices = devices.filter(d => d.unitId === selectedUnitId);
  
  const filteredDevices = unitDevices.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.url.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpen = (url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  if (!selectedUnitId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50">
        <Server className="w-16 h-16 mb-4 text-slate-300" />
        <h2 className="text-xl font-medium text-slate-700">未选择单位</h2>
        <p className="mt-2 text-sm">请从侧边栏选择一个单位以查看其设备。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedUnit?.name}</h1>
          <p className="text-sm text-slate-500 mt-1">共 {unitDevices.length} 台设备</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="搜索设备..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-64"
            />
          </div>
          <button 
            onClick={onAddDevice}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            添加设备
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
        {filteredDevices.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">未找到设备</h3>
            <p className="text-slate-500 mt-1">
              {search ? "请尝试调整搜索词。" : "点击添加您的第一个设备。"}
            </p>
            {!search && (
              <button 
                onClick={onAddDevice}
                className="mt-6 text-indigo-600 font-medium hover:text-indigo-700"
              >
                + 添加第一个设备
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredDevices.map(device => {
              const Icon = DEVICE_ICONS[device.type] || DEVICE_ICONS.Other;
              
              return (
                <div key={device.id} className={cn(
                  "bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col",
                  device.isInspected ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200"
                )}>
                  <div className={cn(
                    "p-5 border-b flex justify-between items-start transition-colors",
                    device.isInspected ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-lg transition-colors",
                        device.isInspected ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 text-lg">{device.name}</h3>
                          {device.isInspected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              已巡检
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {device.type}
                          </span>
                          <span className="text-sm text-slate-500 font-mono truncate max-w-[200px]" title={device.url}>
                            {device.url}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleInspected(device.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          device.isInspected 
                            ? "text-emerald-600 hover:bg-emerald-100" 
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                        title={device.isInspected ? "标记为未巡检" : "标记为已巡检"}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEditDevice(device)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="编辑设备"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`确定要删除 ${device.name} 吗？`)) deleteDevice(device.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除设备"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-5 flex flex-col gap-4 flex-1 transition-colors",
                    device.isInspected ? "bg-emerald-50/10" : "bg-slate-50/50"
                  )}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">用户名</label>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 flex-1 truncate">
                            {device.username}
                          </span>
                          <button 
                            onClick={() => handleCopy(device.username, `${device.id}-user`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                            title="复制用户名"
                          >
                            {copiedId === `${device.id}-user` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">密码</label>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 flex-1 truncate select-none">
                            ••••••••
                          </span>
                          <button 
                            onClick={() => handleCopy(device.password || '', `${device.id}-pass`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                            title="复制密码"
                          >
                            {copiedId === `${device.id}-pass` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 mt-auto">
                      <div className="text-xs text-slate-500 max-w-[60%] truncate" title={device.notes}>
                        {device.notes || "暂无备注"}
                      </div>
                      <button 
                        onClick={() => handleOpen(device.url)}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        打开登录页
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
