import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo } from 'react';
import reservoirImg from '@/assets/reservoir.png';
import tankImg from '@/assets/tank.png';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';

// Common handle styles
const HandleStyle = "w-2 h-2 bg-primary border border-white opacity-0 group-hover:opacity-100 transition-opacity";

// Hook: returns true if this node has a node-order validation error
function useNodeOrderError(id: string) {
  return useNetworkStore(state => state.nodeOrderErrorIds.includes(id));
}

// Wrapper that adds a red error ring overlay when the node has a node-order error
function ErrorRing({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded ring-2 ring-red-500 ring-offset-1 z-10"
      title="Node order error: node numbers must be in ascending sequence"
    />
  );
}

// Reservoir Node
export const ReservoirNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Reservoir Properties" />}>
      <div className={clsx(
        "w-[50px] h-[50px] transition-all group relative flex items-center justify-center",
      )}>
        <ErrorRing show={hasOrderError} />
        <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} />
        <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} />
        <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} />
        <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} />
        <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} />
        
        <img 
          src={reservoirImg} 
          alt="Reservoir" 
          className={clsx(
            "w-full h-full object-contain transition-all",
            selected ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""
          )} 
        />
        
        <div className="absolute -top-6 text-[10px] font-bold text-blue-900 bg-white/80 px-1 rounded border border-blue-200 shadow-sm whitespace-nowrap">
          {data.label as React.ReactNode}
        </div>
      </div>
    </TooltipWrapper>
  );
});

// Basic Node (Simple Node)
export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Node Properties" />}>
      <div className={clsx(
        "w-6 h-6 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
        hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-blue-600 ring-2 ring-blue-600/20" : "border-blue-500"
      )}>
        <span className="text-[8px] font-bold text-blue-600">N{data.nodeNumber as React.ReactNode}</span>

        <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} />
        <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} />
        <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} />
        <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} />
        <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} />
      </div>
    </TooltipWrapper>
  );
});

// Junction Node
export const JunctionNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Junction Properties" />}>
      <div className={clsx(
        "w-6 h-6 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
        hasOrderError ? "border-red-500 ring-4 ring-red-500/50" : selected ? "border-red-600 ring-2 ring-red-600/20" : "border-red-500"
      )}>
        <span className="text-[8px] font-bold text-red-600">J{data.nodeNumber as React.ReactNode}</span>

        <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-red-500")} />
        <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-red-500")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-red-500")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-red-500")} />
        <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-red-500")} />
        <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-red-500")} />
        <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-red-500")} />
        <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-red-500")} />
      </div>
    </TooltipWrapper>
  );
});

// Surge Tank
export const SurgeTankNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Surge Tank Properties" />}>
      <div className={clsx(
        "w-[50px] h-[50px] transition-all group relative flex items-center justify-center",
      )}>
        <ErrorRing show={hasOrderError} />
        <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
        
        <img 
          src={tankImg} 
          alt="Surge Tank" 
          className={clsx(
            "w-full h-full object-contain transition-all",
            selected ? "drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" : ""
          )} 
        />
        
        <div className="absolute -top-6 text-[10px] font-bold text-orange-900 bg-white/80 px-1 rounded border border-orange-200 shadow-sm whitespace-nowrap">
          {data.label as React.ReactNode}
        </div>
      </div>
    </TooltipWrapper>
  );
});

// Pump Node
export const PumpNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Pump Properties" />}>
      <div className={clsx(
        "w-8 h-8 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
        hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-orange-600 ring-2 ring-orange-600/20" : "border-orange-500"
      )}>
        <span className="text-[8px] font-bold text-orange-600 leading-none">{data.label as React.ReactNode}</span>

        <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
        <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
      </div>
    </TooltipWrapper>
  );
});

// Check Valve Node
export const CheckValveNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Check Valve Properties" />}>
      <div className={clsx(
        "w-[72px] h-[60px] transition-all group relative flex items-center justify-center",
      )}>
        <ErrorRing show={hasOrderError} />
        <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-violet-500")} />
        <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-violet-500")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-violet-500")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-violet-500")} />
        <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-violet-500")} />
        <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-violet-500")} />
        <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-violet-500")} />
        <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-violet-500")} />

        {/* 2D Gate Valve Engineering Icon — no background */}
        <svg
          width="72" height="60" viewBox="0 0 72 60" fill="none"
          className={clsx("transition-all", selected ? "drop-shadow-[0_0_10px_rgba(139,92,246,0.9)]" : "")}
        >
          {/* Left pipe */}
          <rect x="0" y="26" width="14" height="8" fill="#a78bfa"/>
          {/* Left flange */}
          <rect x="12" y="22" width="5" height="16" rx="1" fill="#7c3aed"/>
          {/* Right pipe */}
          <rect x="58" y="26" width="14" height="8" fill="#a78bfa"/>
          {/* Right flange */}
          <rect x="55" y="22" width="5" height="16" rx="1" fill="#7c3aed"/>
          {/* Valve body */}
          <rect x="17" y="19" width="38" height="22" rx="3" fill="#8b5cf6"/>
          {/* Body top highlight */}
          <rect x="17" y="19" width="38" height="8" rx="3" fill="#a78bfa"/>
          {/* Body centre panel / gate slot */}
          <rect x="31" y="19" width="10" height="22" rx="1" fill="#7c3aed" opacity="0.5"/>
          {/* Body bolts — left */}
          <circle cx="21" cy="23" r="2" fill="#6d28d9"/>
          <circle cx="21" cy="37" r="2" fill="#6d28d9"/>
          {/* Body bolts — right */}
          <circle cx="51" cy="23" r="2" fill="#6d28d9"/>
          <circle cx="51" cy="37" r="2" fill="#6d28d9"/>
          {/* Stem */}
          <rect x="33" y="5" width="6" height="14" rx="1" fill="#7c3aed"/>
          {/* Handwheel outer ring */}
          <ellipse cx="36" cy="7" rx="13" ry="5" fill="none" stroke="#7c3aed" strokeWidth="3"/>
          {/* Handwheel spokes */}
          <line x1="23" y1="7" x2="36" y2="7" stroke="#7c3aed" strokeWidth="2"/>
          <line x1="49" y1="7" x2="36" y2="7" stroke="#7c3aed" strokeWidth="2"/>
          <line x1="36" y1="2"  x2="36" y2="12" stroke="#7c3aed" strokeWidth="2"/>
          {/* Handwheel hub */}
          <circle cx="36" cy="7" r="3" fill="#7c3aed"/>
          {/* Pressure gauge */}
          <circle cx="56" cy="46" r="6" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5"/>
          <line x1="56" y1="41" x2="56" y2="40" stroke="#7c3aed" strokeWidth="1.5"/>
          <line x1="53" y1="46" x2="56" y2="44" stroke="#7c3aed" strokeWidth="1.5"/>
        </svg>

        <div className="absolute -top-6 text-[10px] font-bold text-violet-900 bg-white/80 px-1 rounded border border-violet-200 shadow-sm whitespace-nowrap">
          {data.label as React.ReactNode}
        </div>
      </div>
    </TooltipWrapper>
  );
});

// Turbine Node
export const TurbineNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Turbine Properties" />}>
      <div className={clsx(
        "w-8 h-8 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
        hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-teal-600 ring-2 ring-teal-600/20" : "border-teal-500"
      )}>
        <span className="text-[8px] font-bold text-teal-600 leading-none">{data.label as React.ReactNode}</span>

        <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-teal-500")} />
        <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-teal-500")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-teal-500")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-teal-500")} />
        <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-teal-500")} />
        <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-teal-500")} />
        <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-teal-500")} />
        <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-teal-500")} />
      </div>
    </TooltipWrapper>
  );
});

// Flow Boundary
export const FlowBoundaryNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Flow Boundary Properties" />}>
      <div className={clsx(
        "p-2 rounded border shadow-sm flex items-center gap-2 transition-all bg-green-50 group relative",
        hasOrderError ? "border-red-500 ring-2 ring-red-500/40" : selected ? "border-green-500 ring-1 ring-green-500/30" : "border-green-400"
      )}>
        <ErrorRing show={hasOrderError} />
        <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-green-500")} />
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-green-600 border-b-[6px] border-b-transparent"></div>
        <div>
          <div className="text-xs font-bold text-green-800">{data.label as React.ReactNode}</div>
          <div className="text-[10px] text-green-600">Q-Sched: {data.scheduleNumber as React.ReactNode}</div>
        </div>
      </div>
    </TooltipWrapper>
  );
});
