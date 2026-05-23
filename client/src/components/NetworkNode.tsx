import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo } from 'react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';
import damIcon from '@assets/dam_1779522984604.png';
import waterTankIcon from '@assets/water-tank_(2)_1779523360829.png';
import waterPumpIcon from '@assets/water-pump_1779523451215.png';
import pipeIcon from '@assets/pipe_1779523475650.png';
import turbineImgIcon from '@assets/turbine_1779523517554.png';

const HandleStyle = "w-2 h-2 bg-primary border border-white opacity-0 group-hover:opacity-100 transition-opacity";

function useNodeOrderError(id: string) {
  return useNetworkStore(state => state.nodeOrderErrorIds.includes(id));
}

function ErrorRing({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded ring-2 ring-red-500 ring-offset-1 z-10"
      title="Node order error: node numbers must be in ascending sequence"
    />
  );
}

// Reservoir Node — #001b3d
export const ReservoirNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Reservoir Properties" />}>
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all relative group bg-white"
          style={{
            border: `3px solid ${hasOrderError ? '#ef4444' : selected ? '#001b3d' : '#001b3d'}`,
            boxShadow: selected ? '0 0 0 3px rgba(0,27,61,0.2)' : undefined,
          }}
        >
          <img src={damIcon} className="w-7 h-7 object-contain pointer-events-none" alt="Reservoir" />
          <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} />
          <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
          <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} />
          <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} />
          <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} />
          <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
      </div>
    </TooltipWrapper>
  );
});

// Basic Node (Simple Node) — original blue
export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Node Properties" />}>
      <div
        className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all relative group bg-white"
        style={{
          border: `3px solid ${hasOrderError ? '#ef4444' : '#3b82f6'}`,
          boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.2)' : undefined,
        }}
      >
        <span className="text-[13px] font-bold" style={{ color: '#3b82f6' }}>N{data.nodeNumber as React.ReactNode}</span>
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

// Junction Node — #cc0000
export const JunctionNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Junction Properties" />}>
      <div
        className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all relative group bg-white"
        style={{
          border: `3px solid ${hasOrderError ? '#ef4444' : '#cc0000'}`,
          boxShadow: selected ? '0 0 0 3px rgba(204,0,0,0.2)' : undefined,
        }}
      >
        <span className="text-[13px] font-bold" style={{ color: '#cc0000' }}>J{data.nodeNumber as React.ReactNode}</span>
        <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} style={{ background: '#cc0000' }} />
        <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} style={{ background: '#cc0000' }} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#cc0000' }} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#cc0000' }} />
        <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} style={{ background: '#cc0000' }} />
        <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} style={{ background: '#cc0000' }} />
        <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} style={{ background: '#cc0000' }} />
        <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} style={{ background: '#cc0000' }} />
      </div>
    </TooltipWrapper>
  );
});

// Surge Tank — #ff751f
export const SurgeTankNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Surge Tank Properties" />}>
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all relative group bg-white"
          style={{
            border: `3px solid ${hasOrderError ? '#ef4444' : '#ff751f'}`,
            boxShadow: selected ? '0 0 0 3px rgba(255,117,31,0.2)' : undefined,
          }}
        >
          <img src={waterTankIcon} className="w-7 h-7 object-contain pointer-events-none" alt="Surge Tank" />
          <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} style={{ background: '#ff751f' }} />
          <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} style={{ background: '#ff751f' }} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#ff751f' }} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#ff751f' }} />
          <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} style={{ background: '#ff751f' }} />
          <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} style={{ background: '#ff751f' }} />
          <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} style={{ background: '#ff751f' }} />
          <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} style={{ background: '#ff751f' }} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
      </div>
    </TooltipWrapper>
  );
});

// Pump Node — #3d3100
export const PumpNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Pump Properties" />}>
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all relative group bg-white"
          style={{
            border: `3px solid ${hasOrderError ? '#ef4444' : '#3d3100'}`,
            boxShadow: selected ? '0 0 0 3px rgba(61,49,0,0.2)' : undefined,
          }}
        >
          <img src={waterPumpIcon} className="w-7 h-7 object-contain pointer-events-none" alt="Pump" />
          <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} style={{ background: '#3d3100' }} />
          <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} style={{ background: '#3d3100' }} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#3d3100' }} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#3d3100' }} />
          <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} style={{ background: '#3d3100' }} />
          <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} style={{ background: '#3d3100' }} />
          <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} style={{ background: '#3d3100' }} />
          <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} style={{ background: '#3d3100' }} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
      </div>
    </TooltipWrapper>
  );
});

// Check Valve Node — #007a3f
export const CheckValveNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Check Valve Properties" />}>
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all relative group bg-white"
          style={{
            border: `3px solid ${hasOrderError ? '#ef4444' : '#007a3f'}`,
            boxShadow: selected ? '0 0 0 3px rgba(0,122,63,0.2)' : undefined,
          }}
        >
          <img src={pipeIcon} className="w-7 h-7 object-contain pointer-events-none" alt="Check Valve" />
          <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} style={{ background: '#007a3f' }} />
          <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} style={{ background: '#007a3f' }} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#007a3f' }} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#007a3f' }} />
          <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} style={{ background: '#007a3f' }} />
          <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} style={{ background: '#007a3f' }} />
          <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} style={{ background: '#007a3f' }} />
          <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} style={{ background: '#007a3f' }} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
      </div>
    </TooltipWrapper>
  );
});

// Turbine Node — #ffd21f
export const TurbineNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Turbine Properties" />}>
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all relative group bg-white"
          style={{
            border: `3px solid ${hasOrderError ? '#ef4444' : '#ffd21f'}`,
            boxShadow: selected ? '0 0 0 3px rgba(255,210,31,0.3)' : undefined,
          }}
        >
          <img src={turbineImgIcon} className="w-7 h-7 object-contain pointer-events-none" alt="Turbine" />
          <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} style={{ background: '#ffd21f' }} />
          <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} style={{ background: '#ffd21f' }} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#ffd21f' }} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: '#ffd21f' }} />
          <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} style={{ background: '#ffd21f' }} />
          <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} style={{ background: '#ffd21f' }} />
          <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} style={{ background: '#ffd21f' }} />
          <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} style={{ background: '#ffd21f' }} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
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
