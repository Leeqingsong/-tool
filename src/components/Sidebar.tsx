import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Building2, Trash2, Edit2, Settings } from 'lucide-react';
import { cn } from '../utils';

export function Sidebar({ onAddUnit }: { onAddUnit: () => void }) {
  const { units, selectedUnitId, setSelectedUnitId, deleteUnit } = useStore();

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-semibold text-white tracking-wide">SecuPatrol</h1>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">组织单位</h2>
          <button 
            onClick={onAddUnit}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="添加单位"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          {units.length === 0 ? (
            <div className="text-sm text-slate-500 italic text-center py-4">
              暂无单位。
            </div>
          ) : (
            units.map(unit => (
              <div
                key={unit.id}
                className={cn(
                  "group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
                  selectedUnitId === unit.id 
                    ? "bg-indigo-600 text-white" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
                onClick={() => setSelectedUnitId(unit.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Building2 className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate text-sm font-medium">{unit.name}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除 ${unit.name} 吗？其下的所有设备将被移除。`)) {
                      deleteUnit(unit.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                  title="删除单位"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
