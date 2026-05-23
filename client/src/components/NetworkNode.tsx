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
      <div className="flex flex-col items-center">
        <div className={clsx(
          "w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
          hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-blue-700 ring-2 ring-blue-700/20" : "border-blue-600"
        )}>
          <img src={damIcon} className="w-5 h-5 object-contain pointer-events-none" alt="Reservoir" />
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

// Basic Node (Simple Node)
export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Node Properties" />}>
      <div className={clsx(
        "w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
        hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-blue-600 ring-2 ring-blue-600/20" : "border-blue-500"
      )}>
        <span className="text-[12px] font-bold text-black">N{data.nodeNumber as React.ReactNode}</span>

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
        "w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
        hasOrderError ? "border-red-500 ring-4 ring-red-500/50" : selected ? "border-red-600 ring-2 ring-red-600/20" : "border-red-500"
      )}>
        <span className="text-[12px] font-bold text-black">J{data.nodeNumber as React.ReactNode}</span>

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
      <div className="flex flex-col items-center">
        <div className={clsx(
          "w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
          hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-orange-600 ring-2 ring-orange-600/20" : "border-orange-500"
        )}>
          <img src={waterTankIcon} className="w-5 h-5 object-contain pointer-events-none" alt="Surge Tank" />
          <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
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
      <div className="flex flex-col items-center">
        <div className={clsx(
          "w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
          hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-orange-600 ring-2 ring-orange-600/20" : "border-orange-500"
        )}>
          <img src={waterPumpIcon} className="w-5 h-5 object-contain pointer-events-none" alt="Pump" />
          <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
          <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
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
      <div className="flex flex-col items-center">
        <div className={clsx(
          "w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
          hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-violet-600 ring-2 ring-violet-600/20" : "border-violet-500"
        )}>
          <img src={pipeIcon} className="w-5 h-5 object-contain pointer-events-none" alt="Check Valve" />
          <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-violet-500")} />
          <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-violet-500")} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-violet-500")} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-violet-500")} />
          <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-violet-500")} />
          <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-violet-500")} />
          <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-violet-500")} />
          <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-violet-500")} />
        </div>
        <span className="text-[11px] font-bold text-black mt-1 whitespace-nowrap leading-none select-none">{data.label as React.ReactNode}</span>
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
      <div className="flex flex-col items-center">
        <div className={clsx(
          "w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white",
          hasOrderError ? "border-red-500 ring-2 ring-red-500/30" : selected ? "border-teal-600 ring-2 ring-teal-600/20" : "border-teal-500"
        )}>
          <img src={turbineImgIcon} className="w-5 h-5 object-contain pointer-events-none" alt="Turbine" />
          <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-teal-500")} />
          <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-teal-500")} />
          <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-teal-500")} />
          <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-teal-500")} />
          <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-teal-500")} />
          <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-teal-500")} />
          <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-teal-500")} />
          <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-teal-500")} />
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
