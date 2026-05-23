import { memo, type ReactNode } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';
import waterPumpIcon from '@assets/water-pump_1779523451215.png';
import pipeIcon from '@assets/pipe_1779523475650.png';
import turbineImgIcon from '@assets/turbine_1779523517554.png';

function PumpIcon({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: `3px solid ${color}`, background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={waterPumpIcon} style={{ width: 28, height: 28, objectFit: 'contain', pointerEvents: 'none' }} alt="Pump" />
    </div>
  );
}

function CheckValveIcon({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: `3px solid ${color}`, background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={pipeIcon} style={{ width: 28, height: 28, objectFit: 'contain', pointerEvents: 'none' }} alt="Check Valve" />
    </div>
  );
}

function TurbineIcon({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: `3px solid ${color}`, background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={turbineImgIcon} style={{ width: 28, height: 28, objectFit: 'contain', pointerEvents: 'none' }} alt="Turbine" />
    </div>
  );
}

export const ConnectionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  type,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edge = useNetworkStore(state => state.edges.find(e => e.id === id));
  const displayData = edge ? edge.data : data;

  const edgeType = displayData?.type as string;
  const isPump = edgeType === 'pump';
  const isCheckValve = edgeType === 'checkValve';
  const isTurbine = edgeType === 'turbine';
  const isElementEdge = isPump || isCheckValve || isTurbine;

  const isDummy = edgeType === 'dummy';

  const strokeColor = isPump ? '#3d3100'
    : isCheckValve ? '#007a3f'
    : isTurbine ? '#ffd21f'
    : isDummy ? '#94a3b8'
    : '#3b82f6';

  const strokeDasharray = isDummy ? '8 8' : undefined;

  const tooltipTitle = isPump ? 'Pump Properties'
    : isCheckValve ? 'Check Valve Properties'
    : isTurbine ? 'Turbine Properties'
    : isDummy ? 'Dummy Pipe Properties'
    : 'Conduit Properties';

  const edgeLabel = (displayData?.label as string) || id;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isElementEdge ? 2.5 : isDummy ? 2 : 2.5,
          stroke: strokeColor,
          strokeDasharray,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <TooltipWrapper
            content={<DataList data={displayData} title={tooltipTitle} />}
          >
            {isElementEdge ? (
              <div className="flex flex-col items-center cursor-help" style={{ gap: 2 }}>
                {isPump && <PumpIcon color={strokeColor} label={edgeLabel} />}
                {isCheckValve && <CheckValveIcon color={strokeColor} label={edgeLabel} />}
                {isTurbine && <TurbineIcon color={strokeColor} label={edgeLabel} />}
                <span style={{ fontSize: 11, fontWeight: 700, color: '#000', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none' }}>{edgeLabel}</span>
              </div>
            ) : (
              <div className="bg-white px-2 py-0.5 rounded-full border border-black text-[10px] font-semibold text-black cursor-help hover:bg-slate-50 transition-colors">
                {(displayData?.label as ReactNode) || id}
              </div>
            )}
          </TooltipWrapper>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
