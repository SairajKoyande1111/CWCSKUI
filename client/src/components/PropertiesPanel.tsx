import { useState, useEffect, useRef, type ComponentProps } from 'react';
import { useNetworkStore, type UnitSystem, type PcharType, type TcharType } from '@/lib/store';
import { PIPE_MATERIALS, PIPE_MATERIALS_BY_ID } from '@/lib/pipe-materials';
import { TurbineCurvePanel } from '@/components/TurbineCurvePanel';
import { PumpCurvePanel } from '@/components/PumpCurvePanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, ChevronDown, ChevronRight, Plus, CheckCircle2, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getNodeSequenceViolations } from '@/lib/validator';
import saveIconImg from '@assets/diskette_(1)_1779571608664.png';
import deleteIconImg from '@assets/bin_(4)_1779571627860.png';

type NumericInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type' | 'inputMode'> & {
  value: any;
  onValueChange: (val: string) => void;
};

function NumericInput({ value, onValueChange, ...props }: NumericInputProps) {
  const display =
    value === undefined || value === null || value === ''
      ? ''
      : typeof value === 'string'
        ? value
        : String(parseFloat(Number(value).toFixed(8)));
  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={display}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '' || v === '-' || /^-?\d*\.?\d*$/.test(v)) {
          onValueChange(v);
        }
      }}
    />
  );
}

function VScheduleInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(() => String(value));
  const skipNextSync = useRef(false);

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    setRaw(String(value));
  }, [value]);

  return (
    <input
      className="w-16 min-w-0 h-6 px-1.5 text-[10px] border rounded"
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={e => {
        const v = e.target.value;
        if (v === '' || v === '-' || /^-?\d*\.?\d*$/.test(v)) {
          setRaw(v);
        }
      }}
      onBlur={() => {
        const parsed = parseFloat(raw);
        const final = isNaN(parsed) ? 0 : parsed;
        if (raw === '' || raw === '-') setRaw('0');
        skipNextSync.current = true;
        onChange(final);
      }}
    />
  );
}

function PcharEditor({ pType, activePc, updatePcharData }: {
  pType: number;
  activePc: PcharType;
  updatePcharData: (pumpType: number, data: PcharType) => void;
}) {
  const arrayToText = (arr: number[]) => arr.join(' ');
  const hratioToText = (m: number[][]) => m.map(r => r.join(' ')).join('\n');
  const textToArray = (text: string): number[] =>
    text.trim().split(/[\s,\n]+/).map(parseFloat).filter(n => !isNaN(n));
  const tratioToText = (f: number[]) => {
    const lines: string[] = [];
    for (let i = 0; i < f.length; i += 8) lines.push(f.slice(i, i + 8).join(' '));
    return lines.join('\n');
  };

  const [showPchar, setShowPchar] = useState(false);
  const [sratioText, setSratioText] = useState(() => arrayToText(activePc.sratio));
  const [qratioText, setQratioText] = useState(() => arrayToText(activePc.qratio));
  const [hratioText, setHratioText] = useState(() => hratioToText(activePc.hratio));
  const [tratioText, setTratioText] = useState(() => tratioToText(activePc.tratio));

  useEffect(() => {
    setSratioText(arrayToText(activePc.sratio));
    setQratioText(arrayToText(activePc.qratio));
    setHratioText(hratioToText(activePc.hratio));
    setTratioText(tratioToText(activePc.tratio));
  }, [pType, activePc]);

  const savePchar = (updates: Partial<PcharType>) => {
    updatePcharData(pType, { ...activePc, ...updates });
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-orange-50 hover:bg-orange-100 transition-colors text-orange-800"
        onClick={() => setShowPchar(v => !v)}
        data-testid="btn-toggle-pchar"
        type="button"
      >
        <span>Pump Characteristics (PCHAR TYPE {pType})</span>
        {showPchar ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {showPchar && (
        <div className="p-3 space-y-3 bg-white">
          <p className="text-[10px] text-muted-foreground italic">
            PCHAR TYPE {pType} data is global — shared across all pumps of this type.
          </p>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">SRATIO (space-separated)</Label>
            <textarea
              data-testid="textarea-sratio"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-10 focus:outline-none focus:ring-1 focus:ring-orange-400"
              value={sratioText}
              onChange={(e) => setSratioText(e.target.value)}
              onBlur={(e) => savePchar({ sratio: textToArray(e.target.value) })}
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">QRATIO (space-separated)</Label>
            <textarea
              data-testid="textarea-qratio"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-10 focus:outline-none focus:ring-1 focus:ring-orange-400"
              value={qratioText}
              onChange={(e) => setQratioText(e.target.value)}
              onBlur={(e) => savePchar({ qratio: textToArray(e.target.value) })}
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">HRATIO (one row per line)</Label>
            <textarea
              data-testid="textarea-hratio"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-28 focus:outline-none focus:ring-1 focus:ring-orange-400"
              value={hratioText}
              onChange={(e) => setHratioText(e.target.value)}
              onBlur={(e) => {
                const rows = e.target.value.trim().split('\n').map(row =>
                  row.trim().split(/\s+/).map(parseFloat).filter(n => !isNaN(n))
                ).filter(r => r.length > 0);
                savePchar({ hratio: rows });
              }}
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">TRATIO (space-separated, 8 per line)</Label>
            <textarea
              data-testid="textarea-tratio"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-28 focus:outline-none focus:ring-1 focus:ring-orange-400"
              value={tratioText}
              onChange={(e) => setTratioText(e.target.value)}
              onBlur={(e) => savePchar({ tratio: textToArray(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TcharEditor({ tType, activeTc, updateTcharData }: {
  tType: number;
  activeTc: TcharType;
  updateTcharData: (turbineType: number, data: TcharType) => void;
}) {
  const arrToText = (arr: number[]) => arr.join(' ');
  const matToText = (m: number[][]) => m.map(r => r.join(' ')).join('\n');
  const textToArr = (text: string): number[] =>
    text.trim().split(/[\s,\n]+/).map(parseFloat).filter(n => !isNaN(n));
  const textToMat = (text: string): number[][] =>
    text.trim().split('\n').map(row => row.trim().split(/\s+/).map(parseFloat).filter(n => !isNaN(n))).filter(r => r.length > 0);

  const [show, setShow] = useState(false);
  const [gateText, setGateText] = useState(() => arrToText(activeTc.gate));
  const [headText, setHeadText] = useState(() => arrToText(activeTc.head));
  const [qText, setQText] = useState(() => matToText(activeTc.qMatrix));
  const [effText, setEffText] = useState(() => matToText(activeTc.effMatrix));

  useEffect(() => {
    setGateText(arrToText(activeTc.gate));
    setHeadText(arrToText(activeTc.head));
    setQText(matToText(activeTc.qMatrix));
    setEffText(matToText(activeTc.effMatrix));
  }, [tType, activeTc]);

  const save = (updates: Partial<TcharType>) => updateTcharData(tType, { ...activeTc, ...updates });

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-teal-50 hover:bg-teal-100 transition-colors text-teal-800"
        onClick={() => setShow(v => !v)}
        data-testid="btn-toggle-tchar"
        type="button"
      >
        <span>Turbine Characteristics (TCHAR TYPE {tType})</span>
        {show ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {show && (
        <div className="p-3 space-y-3 bg-white">
          <p className="text-[10px] text-muted-foreground italic">
            TCHAR TYPE {tType} data is global — shared across all turbines of this type.
          </p>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">GATE (gate opening fractions, space-separated)</Label>
            <textarea data-testid="textarea-gate"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-10 focus:outline-none focus:ring-1 focus:ring-teal-400"
              value={gateText}
              onChange={e => setGateText(e.target.value)}
              onBlur={e => save({ gate: textToArr(e.target.value) })} />
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">HEAD (head values, space-separated)</Label>
            <textarea data-testid="textarea-head"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-10 focus:outline-none focus:ring-1 focus:ring-teal-400"
              value={headText}
              onChange={e => setHeadText(e.target.value)}
              onBlur={e => save({ head: textToArr(e.target.value) })} />
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">QMATRIX (one row per gate value)</Label>
            <textarea data-testid="textarea-qmatrix"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-teal-400"
              value={qText}
              onChange={e => setQText(e.target.value)}
              onBlur={e => save({ qMatrix: textToMat(e.target.value) })} />
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">EFFICIENCY (one row per gate value)</Label>
            <textarea data-testid="textarea-efficiency"
              className="w-full border rounded text-[10px] font-mono p-1.5 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-teal-400"
              value={effText}
              onChange={e => setEffText(e.target.value)}
              onBlur={e => save({ effMatrix: textToMat(e.target.value) })} />
          </div>
        </div>
      )}
    </div>
  );
}

function PropSection({ title, children, defaultOpen = true, headerExtra }: { title: string; children: React.ReactNode; defaultOpen?: boolean; headerExtra?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <div className="w-full flex items-center justify-between px-3 py-2 bg-[#e8edf5] select-none">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
        >
          <span className="text-[11px] font-semibold text-black uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</span>
          {open ? <ChevronDown className="h-3.5 w-3.5 text-black shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-black shrink-0" />}
        </button>
        {headerExtra && (
          <div className="flex items-center gap-1 ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {headerExtra}
          </div>
        )}
      </div>
      {open && <div className="bg-white">{children}</div>}
    </div>
  );
}

function PropRow({ label, children, noBorder }: { label: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-3 ${!noBorder ? 'border-b border-slate-100' : ''}`}>
      <span className="text-[13px] font-semibold text-black w-[42%] shrink-0 leading-normal" style={{ fontFamily: 'Poppins, sans-serif' }}>{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function PropertiesPanel() {

  const { 
    nodes, 
    edges, 
    selectedElementId, 
    selectedElementType, 
    updateNodeData, 
    updateEdgeData,
    deleteElement,
    globalUnit,
    hSchedules,
    updateHSchedule,
    addHSchedule,
    pcharData,
    updatePcharData,
    addPcharType,
    deletePcharType,
    tcharData,
    updateTcharData,
    addTcharType,
    deleteTcharType,
    vSchedules,
    updateVSchedule,
    addVSchedule,
    qSchedules,
    updateQSchedule,
    applyMaterialToAllConduits,
    setApplyMaterialToAllConduits,
  } = useNetworkStore();

  const { toast } = useToast();
  const [newTypeNum, setNewTypeNum] = useState<string>("");
  const [profileApplied, setProfileApplied] = useState<string | null>(null);
  const [nodeNumInput, setNodeNumInput] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [materialPickerOpen, setMaterialPickerOpen] = useState(false);
  const [showMaterialProps, setShowMaterialProps] = useState(false);

  useEffect(() => {
    const el = selectedElementId
      ? nodes.find(n => n.id === selectedElementId)
      : null;
    setNodeNumInput(el?.data?.nodeNumber !== undefined ? String(el.data.nodeNumber) : "");
  }, [selectedElementId, nodes]);

  useEffect(() => {
    const isNode = selectedElementType === 'node';
    const element = isNode
      ? nodes.find(n => n.id === selectedElementId)
      : edges.find(e => e.id === selectedElementId);
    if (element?.data) {
      setFormData({ ...element.data });
      setIsDirty(false);
    }
  }, [selectedElementId]);

  // Re-sync formData when the underlying element's unit changes (e.g. via the
  // global Configuration → SI/FPS menu, or programmatic unit changes elsewhere).
  // Without this, only labels update but the displayed numeric values stay stale.
  const selectedElementForSync = selectedElementType === 'node'
    ? nodes.find(n => n.id === selectedElementId)
    : edges.find(e => e.id === selectedElementId);
  const effectiveUnitForSync = (selectedElementForSync?.data?.unit as UnitSystem) || globalUnit;
  useEffect(() => {
    if (!selectedElementForSync?.data) return;
    setFormData({ ...selectedElementForSync.data });
    setIsDirty(false);
  }, [effectiveUnitForSync, selectedElementId]);

  const handleLocalChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!selectedElementId) return;
    const isNodeEl = selectedElementType === 'node';

    const numericValue = (val: any) =>
      typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)) ? Number(val) : val;

    const processedData: Record<string, any> = {};
    Object.entries(formData).forEach(([key, value]) => {
      processedData[key] = Array.isArray(value) ? value : numericValue(value);
    });

    if (isNodeEl) {
      const thisNode = nodes.find(n => n.id === selectedElementId);
      const elementTypes = new Set(['pump', 'checkValve', 'turbine']);

      // Block save if new nodeNumber violates ascending order for non-element nodes
      if (thisNode && !elementTypes.has(thisNode.type!)) {
        const newNum = processedData.nodeNumber !== undefined ? Number(processedData.nodeNumber) : NaN;
        if (!isNaN(newNum)) {
          const duplicate = nodes.find(
            n => n.id !== selectedElementId && n.data?.nodeNumber === newNum
          );
          if (duplicate) {
            toast({
              variant: "destructive",
              title: "Duplicate Node Number",
              description: `Node number ${newNum} is already used by another node. Please choose a unique number.`,
            });
            return;
          }

          const nextNodes = nodes.map(n =>
            n.id === selectedElementId ? { ...n, data: { ...n.data, ...processedData } } : n
          );
          const violations = getNodeSequenceViolations(nextNodes, edges).filter(
            violation => violation.id === selectedElementId ||
              edges.some(e => (e.source === selectedElementId && e.target === violation.id) || (e.target === selectedElementId && e.source === violation.id))
          );

          if (violations.length > 0) {
            toast({
              variant: "destructive",
              title: "Invalid Node Number",
              description: violations[0].message,
            });
            return;
          }
        }
      }

      // For flowBoundary nodes, link schedulePoints to the global qSchedules for the (possibly changed) scheduleNumber
      if (element?.data?.type === 'flowBoundary' && processedData.scheduleNumber !== undefined) {
        const newSchedNum = Number(processedData.scheduleNumber);
        if (!isNaN(newSchedNum)) {
          processedData.schedulePoints = qSchedules[newSchedNum] || [];
        }
      }
      updateNodeData(selectedElementId, processedData);
    } else {
      updateEdgeData(selectedElementId, processedData);
      const currentLabel = (processedData.label as string) || '';
      const duplicates = currentLabel
        ? edges.filter(e =>
            e.id !== selectedElementId &&
            (e.data?.label as string) === currentLabel &&
            (e.data?.type === 'conduit' || e.data?.type === 'dummy')
          )
        : [];

      duplicates.forEach(e => updateEdgeData(e.id, processedData));

      setIsDirty(false);
      toast({ variant: "success", title: "Saved", description: "Changes saved successfully." });
      return;
    }

    setIsDirty(false);
    toast({ variant: "success", title: "Saved", description: "Changes saved successfully." });
  };

  const handleNodeNumberBlur = () => {
    const newNum = parseInt(nodeNumInput, 10);
    if (isNaN(newNum)) {
      const original = nodes.find(n => n.id === selectedElementId)?.data?.nodeNumber;
      setNodeNumInput(original !== undefined ? String(original) : "");
      return;
    }
    const duplicate = nodes.find(
      n => n.id !== selectedElementId && n.data?.nodeNumber === newNum
    );
    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Node Number",
        description: `Node number ${newNum} is already used by another node. Please choose a unique number.`,
      });
      const original = nodes.find(n => n.id === selectedElementId)?.data?.nodeNumber;
      setNodeNumInput(original !== undefined ? String(original) : "");
      return;
    }
    handleLocalChange('nodeNumber', nodeNumInput);
  };

  if (!selectedElementId) return null;

  const isNode = selectedElementType === 'node';
  const element = isNode 
    ? nodes.find(n => n.id === selectedElementId) 
    : edges.find(e => e.id === selectedElementId);

  if (!element) return null;

  const currentUnit = (formData.unit as UnitSystem) || globalUnit;

  const SI_TO_FPS = {
    length: 3.28084, // m to ft
    diameter: 3.28084, // m to ft
    elevation: 3.28084, // m to ft
    celerity: 3.28084, // m/s to ft/s
    area: 10.7639, // m2 to ft2
    flow: 35.3147, // m3/s to ft3/s
    pressure: 1 / 6894.76, // Pa to psi
  };

  const convertValue = (value: number, from: UnitSystem, to: UnitSystem, type: keyof typeof SI_TO_FPS) => {
    if (from === to) return value;
    const factor = SI_TO_FPS[type] || 1;
    const result = to === 'FPS' ? value * factor : value / factor;
    return parseFloat(result.toFixed(8));
  };

  const fieldMapping: Record<string, keyof typeof SI_TO_FPS> = {
    length: 'length',
    diameter: 'diameter',
    elevation: 'elevation',
    reservoirElevation: 'elevation',
    tankTop: 'elevation',
    tankBottom: 'elevation',
    initialWaterLevel: 'elevation',
    riserDiameter: 'diameter',
    riserTop: 'elevation',
    distance: 'length',
    celerity: 'celerity',
    area: 'area',
    pipeWT: 'diameter',   // wall thickness (ft or m)
    pipeE: 'pressure',    // modulus of elasticity (psi or Pa)
    rq: 'flow',           // pump rated flow (m³/s or ft³/s)
    rhead: 'elevation',   // pump rated head (m or ft)
    valveDiam: 'diameter', // check valve diameter (m or ft)
  };

  const cacheableFields = Object.keys(fieldMapping);

  const handleUnitToggle = (newUnit: UnitSystem) => {
    if (newUnit === currentUnit) return;

    const existingCache: Record<string, any> = (formData._unitCache as any) || {};

    // Save current values into cache for the current unit
    const savedForCurrentUnit: Record<string, any> = {};
    cacheableFields.forEach(key => {
      const val = (element.data as any)?.[key];
      if (val !== undefined && val !== null && val !== '') {
        savedForCurrentUnit[key] = val;
      }
    });
    if (formData.schedulePoints) {
      savedForCurrentUnit.schedulePoints = JSON.parse(JSON.stringify(formData.schedulePoints));
    }

    const newCache = {
      ...existingCache,
      [currentUnit]: { ...(existingCache[currentUnit] || {}), ...savedForCurrentUnit },
    };

    const dataUpdate: any = { unit: newUnit, _unitCache: newCache };

    // Use the cached target-unit value when it's consistent with the current
    // value (i.e. it round-trips back via math conversion). This preserves the
    // user's exact original number across SI→FPS→SI toggles. If the cache is
    // stale (e.g. copied via auto-applied pipe profile, or loaded from a file),
    // fall back to a fresh math conversion so values aren't frozen.
    const cachedTarget: Record<string, any> = newCache[newUnit] || {};
    const isCacheConsistent = (key: string, currentNum: number, type: keyof typeof SI_TO_FPS) => {
      const cached = cachedTarget[key];
      if (cached === undefined || cached === null || cached === '') return false;
      const cachedNum = typeof cached === 'string' ? parseFloat(cached) : cached;
      if (isNaN(cachedNum)) return false;
      const projected = convertValue(cachedNum, newUnit, currentUnit, type);
      const tol = Math.max(Math.abs(currentNum) * 1e-4, 1e-6);
      return Math.abs(projected - currentNum) <= tol;
    };

    Object.entries(element.data || {}).forEach(([key, value]) => {
      if (!fieldMapping[key]) return;
      if (key === 'pipeE' || key === 'pipeWT') return;
      const numValue = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : NaN);
      if (isNaN(numValue)) return;
      if (isCacheConsistent(key, numValue, fieldMapping[key])) {
        dataUpdate[key] = cachedTarget[key];
      } else {
        dataUpdate[key] = convertValue(numValue, currentUnit, newUnit, fieldMapping[key]);
      }
    });

    // pipeE (Pa ↔ psi) and pipeWT (m ↔ ft): same cache-consistency policy.
    if (formData.pipeE != null && formData.pipeE !== '') {
      const val = parseFloat(String(formData.pipeE));
      if (!isNaN(val)) {
        dataUpdate.pipeE = isCacheConsistent('pipeE', val, 'pressure')
          ? cachedTarget['pipeE']
          : parseFloat(convertValue(val, currentUnit, newUnit, 'pressure').toPrecision(10));
      }
    }
    if (formData.pipeWT != null && formData.pipeWT !== '') {
      const val = parseFloat(String(formData.pipeWT));
      if (!isNaN(val)) {
        dataUpdate.pipeWT = isCacheConsistent('pipeWT', val, 'diameter')
          ? cachedTarget['pipeWT']
          : parseFloat(convertValue(val, currentUnit, newUnit, 'diameter').toPrecision(10));
      }
    }

    // Handle schedulePoints — math-convert per-point.
    if (formData.schedulePoints) {
      dataUpdate.schedulePoints = (formData.schedulePoints as any[]).map(p => ({
        ...p,
        flow: convertValue(p.flow, currentUnit, newUnit, 'flow')
      }));
    }

    if (isNode) {
      updateNodeData(selectedElementId, dataUpdate);
    } else {
      updateEdgeData(selectedElementId, dataUpdate);
    }
    setFormData(prev => ({ ...prev, ...dataUpdate }));
  };

  const handleChange = (key: string, value: any) => {
    // Preserve raw string while typing so intermediate decimal forms like "1." or "1.50"
    // aren't collapsed by Number() conversion. saveChanges() converts strings to numbers
    // when the value is committed.
    const numericValue = value;

    const update: any = { [key]: numericValue };
    if (cacheableFields.includes(key)) {
      const existingCache: Record<string, any> = (formData._unitCache as any) || (formData._unitCache as any) || {};
      const otherUnit: UnitSystem = currentUnit === 'FPS' ? 'SI' : 'FPS';
      update._unitCache = {
        ...existingCache,
        [currentUnit]: { ...(existingCache[currentUnit] || {}), [key]: numericValue },
        [otherUnit]: existingCache[otherUnit]
          ? { ...existingCache[otherUnit], [key]: undefined }
          : existingCache[otherUnit],
      };
    }

    setFormData(prev => ({ ...prev, ...update }));
    setIsDirty(true);
  };

  const PROFILE_FIELDS = [
    'type', 'length', 'diameter', 'celerity', 'friction', 'numSegments',
    'variable', 'distance', 'area', 'd', 'a', 'pipeE', 'pipeWT', 'manningsN',
    'cplus', 'cminus', 'hasAddedLoss', 'includeNumSegments',
  ];

  const applyProfile = (sourceEdge: typeof edges[0]) => {
    const update: Record<string, any> = {};
    PROFILE_FIELDS.forEach(field => {
      const val = (sourceEdge.data as any)?.[field];
      if (val !== undefined) update[field] = val;
    });
    if (sourceEdge.data?._unitCache) {
      update._unitCache = sourceEdge.data._unitCache;
    }
    setFormData(prev => ({ ...prev, ...update }));
    setIsDirty(true);
    const lbl = (sourceEdge.data?.label as string) || '';
    setProfileApplied(lbl);
    setTimeout(() => setProfileApplied(null), 3000);
  };

  const handleLabelChange = (newLabel: string) => {
    handleChange('label', newLabel);
    if (!isNode && newLabel.trim()) {
      const match = edges.find(e =>
        e.id !== selectedElementId &&
        (e.data?.label as string) === newLabel.trim() &&
        (e.data?.type === 'conduit' || e.data?.type === 'dummy')
      );
      if (match) applyProfile(match);
    }
  };

  const elementTypeLabel = (() => {
    const t = element.data?.type || element.type || '';
    const map: Record<string, string> = {
      reservoir: 'Reservoir',
      node: 'Node',
      junction: 'Junction',
      surgeTank: 'Surge Tank',
      flowBoundary: 'Flow Boundary',
      conduit: 'Conduit',
      pump: 'Pump',
      checkValve: 'Check Valve',
      turbine: 'Turbine',
    };
    return map[t] || t.charAt(0).toUpperCase() + t.slice(1);
  })();

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* ── MS HAMMER-style header ── */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="px-4 pt-3 pb-1">
          <span className="text-[10px] font-semibold text-black uppercase tracking-[0.12em]">Properties</span>
        </div>
        <div className="flex items-center justify-between px-4 pb-3 gap-2">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold text-black leading-tight truncate">{elementTypeLabel}</div>
            <div className="text-[11px] font-medium text-black mt-0.5">ID: {selectedElementId}</div>
          </div>
          {/* SI / FPS pill — identical to header */}
          <div className="flex items-center rounded-full border-2 border-slate-300 bg-white overflow-hidden shadow-sm shrink-0">
            <button
              onClick={() => handleUnitToggle('SI')}
              className={`text-[12px] font-bold px-3 py-0.5 transition-colors ${currentUnit === 'SI' ? 'bg-blue-600 text-white' : 'text-black hover:bg-slate-50'}`}
            >SI</button>
            <button
              onClick={() => handleUnitToggle('FPS')}
              className={`text-[12px] font-bold px-3 py-0.5 transition-colors ${currentUnit === 'FPS' ? 'bg-blue-600 text-white' : 'text-black hover:bg-slate-50'}`}
            >FPS</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-3">

        {/* ── GENERAL SECTION ── */}
        {element.data?.type === 'reservoir' ? (
          <PropSection title="General">
            <PropRow label="Label / ID">
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => isNode ? handleChange('label', e.target.value) : handleLabelChange(e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
              {profileApplied && (
                <p className="text-[10px] text-green-700 flex items-center gap-1 mt-1" data-testid="text-profile-applied">
                  <CheckCircle2 className="h-3 w-3" /> Profile &quot;{profileApplied}&quot; applied
                </p>
              )}
            </PropRow>
            <PropRow label="Comment" noBorder>
              <Input
                id="comment"
                placeholder="Internal comment"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
          </PropSection>
        ) : (!isNode && (element.data?.type === 'conduit' || element.data?.type === 'dummy' || !element.data?.type)) ? (
          /* HAMMER-style General block for conduit/dummy */
          <>
            <PropSection title="General">
              <PropRow label="Label / ID">
                <div>
                  <Input
                    id="label"
                    data-testid="input-label"
                    value={formData.label ?? ''}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                  {(() => {
                    const lbl = (formData.label as string) || '';
                    const others = edges.filter(e => e.id !== selectedElementId && (e.data?.label as string) === lbl && (e.data?.type === 'conduit' || e.data?.type === 'dummy'));
                    if (others.length > 0) {
                      return (
                        <div className="rounded-md bg-amber-50 border border-amber-300 px-2 py-1 flex items-start gap-1.5 mt-1" data-testid="warning-duplicate-label">
                          <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-amber-700 leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Label &quot;{lbl}&quot; already used by {others.length === 1 ? '1 other conduit' : `${others.length} other conduits`}.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {profileApplied && (
                    <p className="text-[10px] text-green-700 flex items-center gap-1 mt-1" data-testid="text-profile-applied">
                      <CheckCircle2 className="h-3 w-3" /> Profile &quot;{profileApplied}&quot; applied
                    </p>
                  )}
                </div>
              </PropRow>
              <PropRow label="Comment" noBorder>
                <Input
                  id="comment"
                  placeholder="Internal comment"
                  value={formData.comment ?? ''}
                  onChange={(e) => handleChange('comment', e.target.value)}
                  className="h-7 text-[12px] font-medium text-black border-slate-300"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </PropRow>
            </PropSection>
            <PropSection title="Connection Type">
              <PropRow label="Type" noBorder>
                <RadioGroup
                  value={formData.type || 'conduit'}
                  onValueChange={(v) => handleChange('type', v)}
                  className="flex gap-5"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="conduit" id="conduit" />
                    <span className="text-[13px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Conduit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="dummy" id="dummy" />
                    <span className="text-[13px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Dummy Pipe</span>
                  </label>
                </RadioGroup>
              </PropRow>
            </PropSection>
          </>
        ) : (isNode && (element.data?.type === 'node' || element.data?.type === 'junction')) ? (
          /* HAMMER-style General block for node / junction */
          <PropSection title="General">
            <PropRow label="Label / ID">
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
            <PropRow label="Comment" noBorder>
              <Input
                id="comment"
                placeholder="Internal comment"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
          </PropSection>
        ) : (isNode && element.data?.type === 'surgeTank') ? (
          /* HAMMER-style General block for surge tank */
          <PropSection title="General">
            <PropRow label="Label / ID">
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
            <PropRow label="Comment" noBorder>
              <Input
                id="comment"
                placeholder="Internal comment (c/C style)"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
          </PropSection>
        ) : (isNode && element.data?.type === 'flowBoundary') ? (
          /* HAMMER-style General block for flow boundary */
          <PropSection title="General">
            <PropRow label="Label / ID">
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
            <PropRow label="Comment" noBorder>
              <Input
                id="comment"
                placeholder="Internal comment (c/C style)"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
          </PropSection>
        ) : (element.data?.type === 'pump') ? (
          /* HAMMER-style General block for pump */
          <PropSection title="General">
            <PropRow label="Label / ID">
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
            <PropRow label="Comment" noBorder>
              <Input
                id="comment"
                placeholder="Internal comment (c/C style)"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
          </PropSection>
        ) : (element.data?.type === 'checkValve') ? (
          /* HAMMER-style General block for check valve */
          <PropSection title="General">
            <PropRow label="Label / ID">
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
            <PropRow label="Comment" noBorder>
              <Input
                id="comment"
                placeholder="Internal comment (c/C style)"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
          </PropSection>
        ) : (element.data?.type === 'turbine') ? (
          /* HAMMER-style General block for turbine */
          <PropSection title="General">
            <PropRow label="Label / ID">
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
            <PropRow label="Comment" noBorder>
              <Input
                id="comment"
                placeholder="Internal comment (c/C style)"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="h-7 text-[12px] font-medium text-black border-slate-300"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </PropRow>
          </PropSection>
        ) : (
          /* Legacy General block for any remaining types */
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>General</h4>
            <div className="grid gap-2">
              <Label htmlFor="label">Label / ID</Label>
              <Input
                id="label"
                data-testid="input-label"
                value={formData.label ?? ''}
                onChange={(e) => isNode ? handleChange('label', e.target.value) : handleLabelChange(e.target.value)}
              />
              {profileApplied && (
                <p className="text-[10px] text-green-600 flex items-center gap-1" data-testid="text-profile-applied">
                  <CheckCircle2 className="h-3 w-3" />
                  Profile &quot;{profileApplied}&quot; applied
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment</Label>
              <Input
                id="comment"
                placeholder="Internal comment (c/C style)"
                value={formData.comment ?? ''}
                onChange={(e) => handleChange('comment', e.target.value)}
              />
            </div>
          </div>
        )}

        {element.data?.type !== 'reservoir' &&
          !(!isNode && (element.data?.type === 'conduit' || element.data?.type === 'dummy' || !element.data?.type)) &&
          !(isNode && (element.data?.type === 'node' || element.data?.type === 'junction')) &&
          !(isNode && element.data?.type === 'surgeTank') &&
          !(isNode && element.data?.type === 'flowBoundary') &&
          element.data?.type !== 'pump' &&
          element.data?.type !== 'checkValve' &&
          element.data?.type !== 'turbine' &&
          <Separator />}

        {/* Specific Properties based on Type */}
        <div className="space-y-4">
          {element.data?.type !== 'reservoir' &&
            !(!isNode && (element.data?.type === 'conduit' || element.data?.type === 'dummy' || !element.data?.type)) &&
            !(isNode && (element.data?.type === 'node' || element.data?.type === 'junction')) &&
            !(isNode && element.data?.type === 'surgeTank') &&
            !(isNode && element.data?.type === 'flowBoundary') &&
            element.data?.type !== 'pump' &&
            element.data?.type !== 'checkValve' &&
            element.data?.type !== 'turbine' &&
            <h4 className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Parameters</h4>}

          {isNode && (element.data?.type === 'node' || element.data?.type === 'junction' || element.data?.type === 'reservoir' || element.data?.type === 'surgeTank' || element.data?.type === 'flowBoundary' || formData.type_st) && (
            <>
              {/* ── NODE / JUNCTION: HAMMER-style Identification PropSection ── */}
              {(element.data?.type === 'node' || element.data?.type === 'junction') && (() => {
                const parsedNum = parseInt(nodeNumInput, 10);
                const isDuplicate = !isNaN(parsedNum) && nodes.some(
                  n => n.id !== selectedElementId && n.data?.nodeNumber === parsedNum
                );
                return (
                  <PropSection title="Identification">
                    <PropRow label="Node Number">
                      <div>
                        <Input
                          id="nodeNum"
                          data-testid="input-node-number"
                          type="text"
                          inputMode="numeric"
                          value={nodeNumInput}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '' || /^\d+$/.test(v)) setNodeNumInput(v);
                          }}
                          onBlur={handleNodeNumberBlur}
                          className={`h-7 text-[12px] font-medium text-black border-slate-300 ${isDuplicate ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {isDuplicate && (
                          <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1" data-testid="error-node-number-duplicate">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Node {parsedNum} already exists
                          </p>
                        )}
                      </div>
                    </PropRow>
                    <PropRow label={`Elevation (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                      <NumericInput
                        id="elev"
                        value={formData.elevation}
                        onValueChange={(v) => handleChange('elevation', v)}
                        className="h-7 text-[12px] font-medium text-black border-slate-300"
                        style={{ fontFamily: 'Poppins, sans-serif' } as any}
                      />
                    </PropRow>
                  </PropSection>
                );
              })()}

              {/* ── RESERVOIR: already has its own PropSections (no change) ── */}
              {element.data?.type === 'reservoir' ? null : (element.data?.type !== 'node' && element.data?.type !== 'junction' && element.data?.type !== 'surgeTank' && element.data?.type !== 'flowBoundary') ? (
              <div className="grid gap-1">
                <Label htmlFor="nodeNum">Node Number</Label>
                {(() => {
                  const parsedNum = parseInt(nodeNumInput, 10);
                  const isDuplicate = !isNaN(parsedNum) && nodes.some(
                    n => n.id !== selectedElementId && n.data?.nodeNumber === parsedNum
                  );
                  return (
                    <>
                      <Input
                        id="nodeNum"
                        data-testid="input-node-number"
                        type="text" inputMode="numeric"
                        value={nodeNumInput}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '' || /^\d+$/.test(v)) {
                            setNodeNumInput(v);
                          }
                        }}
                        onBlur={handleNodeNumberBlur}
                        className={isDuplicate ? "border-destructive ring-1 ring-destructive focus-visible:ring-destructive" : ""}
                      />
                      {isDuplicate && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-0.5" data-testid="error-node-number-duplicate">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Node {parsedNum} already exists
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
              ) : null}

              {/* ── RESERVOIR: HAMMER-style PropSections ── */}
              {element.data?.type === 'reservoir' && (() => {
                const parsedNum = parseInt(nodeNumInput, 10);
                const isDuplicate = !isNaN(parsedNum) && nodes.some(
                  n => n.id !== selectedElementId && n.data?.nodeNumber === parsedNum
                );
                return (
                  <>
                    {/* Identification section */}
                    <PropSection title="Identification">
                      <PropRow label="Node Number">
                        <Input
                          id="nodeNum"
                          data-testid="input-node-number"
                          type="text"
                          inputMode="numeric"
                          value={nodeNumInput}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '' || /^\d+$/.test(v)) setNodeNumInput(v);
                          }}
                          onBlur={handleNodeNumberBlur}
                          className={`h-7 text-[12px] font-medium text-black border-slate-300 ${isDuplicate ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {isDuplicate && (
                          <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1" data-testid="error-node-number-duplicate">
                            Node {parsedNum} already exists
                          </p>
                        )}
                      </PropRow>
                      <PropRow label={`Elevation (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                        <NumericInput
                          id="elev"
                          value={formData.elevation}
                          onValueChange={(v) => handleChange('elevation', v)}
                          className="h-7 text-[12px] font-medium text-black border-slate-300"
                          style={{ fontFamily: 'Poppins, sans-serif' } as any}
                        />
                      </PropRow>
                    </PropSection>

                    {/* Boundary Condition section */}
                    <PropSection title="Boundary Condition">
                      <PropRow label="Mode" noBorder>
                        <RadioGroup
                          value={formData.mode || 'fixed'}
                          onValueChange={(v) => handleChange('mode', v)}
                          className="flex gap-5"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="fixed" id="res-mode-fixed" />
                            <span className="text-[13px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Fixed HW</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="schedule" id="res-mode-schedule" />
                            <span className="text-[13px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>H Schedule</span>
                          </label>
                        </RadioGroup>
                      </PropRow>
                    </PropSection>

                    {/* Fixed elevation or schedule */}
                    {(formData.mode || 'fixed') === 'fixed' && (
                      <PropSection title="Head Water">
                        <PropRow label={`Reservoir Elev HW (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                          <NumericInput
                            id="resElev"
                            value={formData.reservoirElevation}
                            onValueChange={(v) => handleChange('reservoirElevation', v)}
                            className="h-7 text-[12px] font-medium text-black border-slate-300"
                            style={{ fontFamily: 'Poppins, sans-serif' } as any}
                          />
                        </PropRow>
                      </PropSection>
                    )}

                    {formData.mode === 'schedule' && (
                      <PropSection title="H Schedule">
                        <PropRow label="Schedule Number">
                          <Select
                            value={(formData.hScheduleNumber || 1).toString()}
                            onValueChange={(v) => {
                              if (v === 'add-new') {
                                const maxSched = hSchedules.length > 0 ? Math.max(...hSchedules.map(s => s.number)) : 5;
                                const newNum = maxSched + 1;
                                addHSchedule(newNum);
                                handleChange('hScheduleNumber', newNum);
                                return;
                              }
                              const num = parseInt(v);
                              addHSchedule(num);
                              handleChange('hScheduleNumber', num);
                            }}
                          >
                            <SelectTrigger id="hScheduleNum" className="h-7 text-[12px] font-medium text-black border-slate-300">
                              <SelectValue placeholder="Select schedule" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: Math.max(5, ...hSchedules.map(s => s.number)) }, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                              <Separator className="my-1" />
                              <SelectItem value="add-new" className="text-primary font-medium cursor-pointer">+ Add New Schedule</SelectItem>
                            </SelectContent>
                          </Select>
                        </PropRow>
                        <div className="px-3 pt-2 pb-3 space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-black uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>T / H Pairs</span>
                            <button
                              type="button"
                              onClick={() => {
                                const schedNum = formData.hScheduleNumber || 1;
                                const currentSched = hSchedules.find(s => s.number === schedNum);
                                const points = currentSched ? [...currentSched.points] : [];
                                updateHSchedule(schedNum, [...points, { time: 0, head: 0 }]);
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              <Plus className="h-3 w-3" /> Add Pair
                            </button>
                          </div>
                          {(hSchedules.find(s => s.number === (formData.hScheduleNumber || 1))?.points || []).map((point, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border border-slate-200 rounded-md bg-slate-50 relative group">
                              <div className="flex-1">
                                <div className="text-[10px] font-medium text-black mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>Time (T)</div>
                                <NumericInput
                                  className="h-6 text-[11px] font-medium text-black border-slate-300"
                                  value={point.time}
                                  onValueChange={(v) => {
                                    const schedNum = formData.hScheduleNumber || 1;
                                    const currentSched = hSchedules.find(s => s.number === schedNum);
                                    if (currentSched) {
                                      const newPoints = [...currentSched.points];
                                      newPoints[index] = { ...newPoints[index], time: v as any };
                                      updateHSchedule(schedNum, newPoints);
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="text-[10px] font-medium text-black mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>Head ({currentUnit === 'SI' ? 'm' : 'ft'})</div>
                                <NumericInput
                                  className="h-6 text-[11px] font-medium text-black border-slate-300"
                                  value={point.head}
                                  onValueChange={(v) => {
                                    const schedNum = formData.hScheduleNumber || 1;
                                    const currentSched = hSchedules.find(s => s.number === schedNum);
                                    if (currentSched) {
                                      const newPoints = [...currentSched.points];
                                      newPoints[index] = { ...newPoints[index], head: v as any };
                                      updateHSchedule(schedNum, newPoints);
                                    }
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700 p-1 shrink-0 flex items-center justify-center"
                                onClick={() => {
                                  const schedNum = formData.hScheduleNumber || 1;
                                  const currentSched = hSchedules.find(s => s.number === schedNum);
                                  if (currentSched) {
                                    updateHSchedule(schedNum, currentSched.points.filter((_, i) => i !== index));
                                  }
                                }}
                              >
                                <img
                                  src={deleteIconImg}
                                  alt="Delete"
                                  className="h-3.5 w-3.5 object-contain"
                                  style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(95%) saturate(2000%) hue-rotate(340deg) brightness(100%) contrast(110%)' }}
                                />
                              </button>
                            </div>
                          ))}
                          {(!hSchedules.find(s => s.number === (formData.hScheduleNumber || 1))?.points?.length) && (
                            <p className="text-[11px] text-black text-center py-2 italic" style={{ fontFamily: 'Poppins, sans-serif' }}>No T/H pairs added.</p>
                          )}
                        </div>
                      </PropSection>
                    )}
                  </>
                );
              })()}

              {/* Non-reservoir, non-node/junction, non-surgeTank, non-flowBoundary: elevation */}
              {element.data?.type !== 'reservoir' && element.data?.type !== 'node' && element.data?.type !== 'junction' && element.data?.type !== 'surgeTank' && element.data?.type !== 'flowBoundary' && (
              <div className="grid gap-2">
                <Label htmlFor="elev">Elevation ({currentUnit === 'SI' ? 'm' : 'ft'})</Label>
                <NumericInput 
                  id="elev" 
                  value={formData.elevation} 
                  onValueChange={(v) => handleChange('elevation', v)} 
                />
              </div>
              )}

              {/* ── FLOW BOUNDARY: HAMMER-style PropSections ── */}
              {element.data?.type === 'flowBoundary' && (() => {
                const activeSchedNum = Number(formData.scheduleNumber ?? element.data?.scheduleNumber ?? 1);
                const activeQPoints: { time: number; flow: number | string }[] =
                  (qSchedules[activeSchedNum] as any[]) || [];
                const sharedCount = nodes.filter(
                  n => n.type === 'flowBoundary' &&
                       n.id !== selectedElementId &&
                       Number(n.data?.scheduleNumber) === activeSchedNum
                ).length;
                const parsedNum = parseInt(nodeNumInput, 10);
                const isDuplicate = !isNaN(parsedNum) && nodes.some(
                  n => n.id !== selectedElementId && n.data?.nodeNumber === parsedNum
                );
                return (
                  <>
                    {/* Identification */}
                    <PropSection title="Identification">
                      <PropRow label="Node Number">
                        <div>
                          <Input
                            id="nodeNum"
                            data-testid="input-node-number"
                            type="text"
                            inputMode="numeric"
                            value={nodeNumInput}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === '' || /^\d+$/.test(v)) setNodeNumInput(v);
                            }}
                            onBlur={handleNodeNumberBlur}
                            className={`h-7 text-[12px] font-medium text-black border-slate-300 ${isDuplicate ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          />
                          {isDuplicate && (
                            <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1" data-testid="error-node-number-duplicate">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Node {parsedNum} already exists
                            </p>
                          )}
                        </div>
                      </PropRow>
                      <PropRow label={`Node Elevation (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                        <NumericInput
                          id="elev"
                          value={formData.elevation}
                          onValueChange={(v) => handleChange('elevation', v)}
                          className="h-7 text-[12px] font-medium text-black border-slate-300"
                          style={{ fontFamily: 'Poppins, sans-serif' } as any}
                        />
                      </PropRow>
                    </PropSection>

                    {/* Flow Schedule */}
                    <PropSection title="Flow Schedule">
                      <PropRow label="Schedule Number" noBorder>
                        <NumericInput
                          id="scheduleNum"
                          data-testid="input-schedule-number"
                          value={formData.scheduleNumber}
                          onValueChange={(v) => handleChange('scheduleNumber', v)}
                          className="h-7 text-[12px] font-medium text-black border-slate-300"
                          style={{ fontFamily: 'Poppins, sans-serif' } as any}
                        />
                      </PropRow>
                    </PropSection>

                    {/* Q Schedule Points */}
                    <PropSection title="Q Schedule Points">
                      <div className="px-3 py-2 space-y-2">
                        {/* Header row with shared-sync hint and Add Point button */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-semibold text-[#3a4a6b]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Schedule {activeSchedNum}
                            </p>
                            {sharedCount > 0 && (
                              <p className="text-[10px] text-blue-600 mt-0.5">
                                Shared with {sharedCount} other Flow BC{sharedCount !== 1 ? 's' : ''} — edits sync instantly
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                            onClick={() => {
                              updateQSchedule(activeSchedNum, [...activeQPoints, { time: 0, flow: 0 }]);
                            }}
                          >
                            Add Point
                          </Button>
                        </div>

                        {/* Column headers */}
                        {activeQPoints.length > 0 && (
                          <div className="flex items-center gap-2 px-1">
                            <span className="flex-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Time (T)</span>
                            <span className="flex-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Flow (Q) ({currentUnit === 'SI' ? 'm³/s' : 'ft³/s'})</span>
                            <span className="w-7" />
                          </div>
                        )}

                        {/* Point rows */}
                        <div className="space-y-1.5">
                          {activeQPoints.map((point, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border border-slate-200 rounded-md bg-white relative group">
                              <NumericInput
                                className="flex-1 h-7 text-[12px] font-medium text-black border-slate-300"
                                style={{ fontFamily: 'Poppins, sans-serif' } as any}
                                value={point.time}
                                onValueChange={(v) => {
                                  const newPoints = [...activeQPoints];
                                  newPoints[index] = { ...newPoints[index], time: v as any };
                                  updateQSchedule(activeSchedNum, newPoints);
                                }}
                              />
                              <NumericInput
                                className="flex-1 h-7 text-[12px] font-medium text-black border-slate-300"
                                style={{ fontFamily: 'Poppins, sans-serif' } as any}
                                value={point.flow}
                                onValueChange={(v) => {
                                  const newPoints = [...activeQPoints];
                                  newPoints[index] = { ...newPoints[index], flow: v as any };
                                  updateQSchedule(activeSchedNum, newPoints);
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newPoints = activeQPoints.filter((_, i) => i !== index);
                                  updateQSchedule(activeSchedNum, newPoints);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {activeQPoints.length === 0 && (
                            <p className="text-[10px] text-muted-foreground text-center py-3 italic">
                              No schedule points added. Click &quot;Add Point&quot; to begin.
                            </p>
                          )}
                        </div>
                      </div>
                    </PropSection>
                  </>
                );
              })()}
            </>
          )}

          {element.data?.type === 'pump' && (() => {
            const pType = Number(formData.pumpType ?? 1);
            const pc: PcharType | undefined = pcharData[pType];
            const defaultPchar: PcharType = {
              sratio: [],
              qratio: [],
              hratio: [],
              tratio: [],
            };
            const activePc = pc || defaultPchar;

            return (
              <>
                {/* ── PUMP: Configuration ── */}
                <PropSection title="Configuration">
                  {/* Pump Status */}
                  <PropRow label="Pump Status">
                    <Select
                      value={formData.pumpStatus || 'ACTIVE'}
                      onValueChange={(v) => handleChange('pumpStatus', v)}
                    >
                      <SelectTrigger id="pumpStatus" data-testid="select-pumpstatus" className="h-7 text-[12px] font-medium text-black border-slate-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                  </PropRow>

                  {/* Pump Type (PCHAR) */}
                  <PropRow label="PCHAR Type" noBorder>
                    <div className="flex gap-1 items-center w-full">
                      <Select
                        value={String(formData.pumpType ?? 1)}
                        onValueChange={(v) => handleChange('pumpType', v)}
                      >
                        <SelectTrigger id="pumpType" data-testid="select-pumptype" className="h-7 text-[12px] font-medium text-black border-slate-300 flex-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(pcharData).map(Number).sort((a, b) => a - b).map(t => (
                            <SelectItem key={t} value={String(t)}>TYPE {t}</SelectItem>
                          ))}
                          <div
                            className="flex gap-1 items-center px-2 py-1.5 border-t mt-1"
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text" inputMode="decimal"
                              min="1"
                              className="flex h-7 w-full rounded border border-input bg-transparent px-2 py-0.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              placeholder="Type no. (blank = auto)"
                              value={newTypeNum}
                              onChange={(e) => setNewTypeNum(e.target.value)}
                              data-testid="input-new-pchar-type"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              title="Add new PCHAR type"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                const parsed = newTypeNum.trim() !== "" ? parseInt(newTypeNum) : undefined;
                                const existingNums = Object.keys(pcharData).map(Number);
                                const nextNum = parsed !== undefined && !isNaN(parsed)
                                  ? parsed
                                  : (existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1);
                                if (pcharData[nextNum] !== undefined) return;
                                addPcharType(nextNum);
                                handleChange('pumpType', String(nextNum));
                                setNewTypeNum("");
                              }}
                              data-testid="button-add-pchar-type"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                        title="Delete this PCHAR type"
                        disabled={Object.keys(pcharData).length <= 1}
                        onClick={() => {
                          const currentType = Number(formData.pumpType ?? 1);
                          deletePcharType(currentType);
                          const remaining = Object.keys(pcharData).map(Number).filter(t => t !== currentType).sort((a, b) => a - b);
                          if (remaining.length > 0) handleChange('pumpType', String(remaining[0]));
                        }}
                        data-testid="button-delete-pchar-type"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </PropRow>
                </PropSection>

                {/* ── PUMP: Rated Parameters ── */}
                <PropSection title="Rated Parameters">
                  <PropRow label={`Rated Flow RQ (${currentUnit === 'SI' ? 'm³/s' : 'ft³/s'})`}>
                    <NumericInput id="rq" data-testid="input-rq"
                      value={formData.rq}
                      onValueChange={(v) => handleChange('rq', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label={`Rated Head RHEAD (${currentUnit === 'SI' ? 'm' : 'ft'})`}>
                    <NumericInput id="rhead" data-testid="input-rhead"
                      value={formData.rhead}
                      onValueChange={(v) => handleChange('rhead', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label="Rated Speed RSPEED (RPM)">
                    <NumericInput id="rspeed" data-testid="input-rspeed"
                      value={formData.rspeed}
                      onValueChange={(v) => handleChange('rspeed', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label="Rated Torque RTORQUE">
                    <NumericInput id="rtorque" data-testid="input-rtorque"
                      value={formData.rtorque}
                      onValueChange={(v) => handleChange('rtorque', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label="WR² — Moment of Inertia" noBorder>
                    <NumericInput id="wr2" data-testid="input-wr2"
                      value={formData.wr2}
                      onValueChange={(v) => handleChange('wr2', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                </PropSection>

                <PcharEditor pType={pType} activePc={activePc} updatePcharData={updatePcharData} />
                <PumpCurvePanel pType={pType} activePc={activePc} updatePcharData={updatePcharData} />
              </>
            );
          })()}

          {element.data?.type === 'turbine' && (() => {
            const tType = Number(formData.turbineType ?? 1);
            const activeTc: TcharType = tcharData[tType] || { gate: [], head: [], qMatrix: [], effMatrix: [] };
            const tcharTypeOptions = Object.keys(tcharData).map(Number).sort((a, b) => a - b)
              .map(t => ({ label: `TYPE ${t}`, value: String(t) }));
            const opMode = (formData.operationMode as string) || 'TURBINE';
            return (
              <>
                {/* ── TURBINE: TCHAR Configuration ── */}
                <PropSection
                  title="TCHAR Configuration"
                  headerExtra={
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-5 text-[10px] px-1.5"
                        onClick={() => {
                          const nums = Object.keys(tcharData).map(Number);
                          const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
                          addTcharType(next);
                        }}
                      >
                        + TCHAR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-5 text-[10px] px-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
                        disabled={tcharTypeOptions.length <= 1}
                        onClick={() => {
                          const nums = Object.keys(tcharData).map(Number).sort((a, b) => a - b);
                          if (nums.length <= 1) return;
                          deleteTcharType(tType);
                          const remaining = nums.filter(n => n !== tType);
                          if (remaining.length > 0) handleLocalChange('turbineType', remaining[0]);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-0.5" /> Del
                      </Button>
                    </div>
                  }
                >
                  <PropRow label="TCHAR Type" noBorder>
                    <Select
                      value={String(tType)}
                      onValueChange={v => handleLocalChange('turbineType', Number(v))}
                    >
                      <SelectTrigger id="turbineType" className="h-7 text-[12px] font-medium text-black border-slate-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tcharTypeOptions.length > 0 ? tcharTypeOptions : [{ label: 'TYPE 1', value: '1' }]).map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PropRow>
                </PropSection>

                {/* ── TURBINE: Parameters ── */}
                <PropSection title="Parameters">
                  <PropRow label="Sync Speed SYNCSPD (RPM)">
                    <NumericInput id="syncSpeed" data-testid="input-syncspeed"
                      value={formData.syncSpeed}
                      onValueChange={v => handleLocalChange('syncSpeed', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label="WR² — Moment of Inertia">
                    <NumericInput id="turb-wr2" data-testid="input-turb-wr2"
                      value={formData.wr2}
                      onValueChange={v => handleLocalChange('wr2', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label={`Diameter (${currentUnit === 'SI' ? 'm' : 'ft'})`}>
                    <NumericInput id="turbineDiameter" data-testid="input-turbine-diameter"
                      value={formData.turbineDiameter}
                      onValueChange={v => handleLocalChange('turbineDiameter', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label="Friction">
                    <NumericInput id="turbFriction" data-testid="input-turbfriction"
                      value={formData.turbFriction}
                      onValueChange={v => handleLocalChange('turbFriction', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                  <PropRow label="Windage" noBorder>
                    <NumericInput id="windage" data-testid="input-windage"
                      value={formData.windage}
                      onValueChange={v => handleLocalChange('windage', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                </PropSection>

                {/* ── TURBINE: Operation Mode ── */}
                <PropSection title="Operation Mode">
                  <PropRow label="Mode (OPTURB)" noBorder>
                    <Select value={opMode} onValueChange={v => handleLocalChange('operationMode', v)}>
                      <SelectTrigger id="operationMode" className="h-7 text-[12px] font-medium text-black border-slate-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <SelectValue placeholder="Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TURBINE">TURBINE</SelectItem>
                        <SelectItem value="GENERATE">GENERATE</SelectItem>
                        <SelectItem value="TURBGOV">TURBGOV</SelectItem>
                        <SelectItem value="EMERGENCY">EMERGENCY</SelectItem>
                      </SelectContent>
                    </Select>
                  </PropRow>
                </PropSection>

                {/* ── TURBINE: VSCHEDULE (only for GENERATE / TURBGOV / EMERGENCY) ── */}
                {(opMode === 'GENERATE' || opMode === 'TURBGOV' || opMode === 'EMERGENCY') && (
                  <PropSection title="VSCHEDULE">
                    <PropRow label="Schedule Number">
                      <NumericInput id="vScheduleNumber" data-testid="input-vschednum"
                        value={formData.vScheduleNumber}
                        onValueChange={v => handleLocalChange('vScheduleNumber', v)}
                        className="h-7 text-[12px] font-medium text-black border-slate-300"
                        style={{ fontFamily: 'Poppins, sans-serif' } as any}
                      />
                    </PropRow>
                    {(() => {
                      const schedNum = Number(formData.vScheduleNumber ?? 1);
                      const pts: { t: number; g: number }[] = vSchedules[schedNum] || [];
                      return (
                        <div className="px-0 pb-2">
                          {/* Sub-header with T/G label and Add button */}
                          <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200 bg-[#f4f7fc]">
                            <span className="text-[10px] font-semibold text-[#3a4a6b] uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              VSCHEDULE {schedNum} — T / G pairs
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-5 text-[10px] px-1.5"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                              onClick={() => {
                                if (!vSchedules[schedNum]) addVSchedule(schedNum);
                                updateVSchedule(schedNum, [...pts, { t: 0, g: 1.0 }]);
                              }}
                            >
                              + Pair
                            </Button>
                          </div>
                          {/* Column headers */}
                          {pts.length > 0 && (
                            <div className="flex items-center gap-2 px-3 pt-1">
                              <span className="flex-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Time (T)</span>
                              <span className="flex-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Gate (G)</span>
                              <span className="w-5" />
                            </div>
                          )}
                          <div className="px-3 pt-1 space-y-1">
                            {pts.length === 0 && (
                              <p className="text-[10px] text-muted-foreground italic text-center py-2">No T/G pairs. Add one above.</p>
                            )}
                            {pts.map((pt, idx) => (
                              <div key={idx} className="flex items-center gap-2 group p-1 rounded border border-slate-200 bg-white">
                                <VScheduleInput
                                  value={pt.t}
                                  onChange={v => {
                                    const np = [...pts];
                                    np[idx] = { ...np[idx], t: v };
                                    updateVSchedule(schedNum, np);
                                  }}
                                />
                                <VScheduleInput
                                  value={pt.g}
                                  onChange={v => {
                                    const np = [...pts];
                                    np[idx] = { ...np[idx], g: v };
                                    updateVSchedule(schedNum, np);
                                  }}
                                />
                                <button
                                  className="text-destructive hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => updateVSchedule(schedNum, pts.filter((_, i) => i !== idx))}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </PropSection>
                )}

                <TcharEditor tType={tType} activeTc={activeTc} updateTcharData={updateTcharData} />

                <TurbineCurvePanel
                  tType={tType}
                  activeTc={activeTc}
                  updateTcharData={updateTcharData}
                  designHead={typeof formData.designHead === 'number' ? formData.designHead : undefined}
                />
              </>
            );
          })()}

          {element.data?.type === 'checkValve' && (
            <>
              {/* ── CHECK VALVE: Configuration ── */}
              <PropSection title="Configuration">
                <PropRow label="Valve Status">
                  <Select
                    value={formData.valveStatus || 'OPEN'}
                    onValueChange={(v) => handleChange('valveStatus', v)}
                  >
                    <SelectTrigger id="valveStatus" className="h-7 text-[12px] font-medium text-black border-slate-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">OPEN</SelectItem>
                      <SelectItem value="CLOSED">CLOSED</SelectItem>
                    </SelectContent>
                  </Select>
                </PropRow>
                <PropRow label={`Diameter DIAM (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                  <NumericInput
                    id="valveDiam"
                    data-testid="input-valvediam"
                    value={formData.valveDiam}
                    onValueChange={(v) => handleChange('valveDiam', v)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
              </PropSection>
            </>
          )}

          {isNode && (element.data?.type === 'surgeTank' || formData.type_st) && (
            <>
              {/* ── SURGE TANK: Identification ── */}
              {(() => {
                const parsedNum = parseInt(nodeNumInput, 10);
                const isDuplicate = !isNaN(parsedNum) && nodes.some(
                  n => n.id !== selectedElementId && n.data?.nodeNumber === parsedNum
                );
                return (
                  <PropSection title="Identification">
                    <PropRow label="Node Number">
                      <div>
                        <Input
                          id="nodeNum"
                          data-testid="input-node-number"
                          type="text"
                          inputMode="numeric"
                          value={nodeNumInput}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '' || /^\d+$/.test(v)) setNodeNumInput(v);
                          }}
                          onBlur={handleNodeNumberBlur}
                          className={`h-7 text-[12px] font-medium text-black border-slate-300 ${isDuplicate ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {isDuplicate && (
                          <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1" data-testid="error-node-number-duplicate">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Node {parsedNum} already exists
                          </p>
                        )}
                      </div>
                    </PropRow>
                    <PropRow label={`Node Elevation (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                      <NumericInput
                        id="elev"
                        value={formData.elevation}
                        onValueChange={(v) => handleChange('elevation', v)}
                        className="h-7 text-[12px] font-medium text-black border-slate-300"
                        style={{ fontFamily: 'Poppins, sans-serif' } as any}
                      />
                    </PropRow>
                  </PropSection>
                );
              })()}

              {/* ── SURGE TANK: Tank Configuration ── */}
              <PropSection title="Tank Configuration">
                <PropRow label="Tank Type" noBorder>
                  <Select
                    value={formData.type_st || 'SIMPLE'}
                    onValueChange={(v) => handleChange('type_st', v)}
                  >
                    <SelectTrigger id="st-type" className="h-7 text-[12px] font-medium text-black border-slate-300">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLE">SIMPLE</SelectItem>
                      <SelectItem value="DIFFERENTIAL">DIFFERENTIAL</SelectItem>
                      <SelectItem value="AIRTANK">AIRTANK</SelectItem>
                    </SelectContent>
                  </Select>
                </PropRow>
              </PropSection>

              {/* ── SURGE TANK: Geometry ── */}
              <PropSection title="Geometry">
                <PropRow label={`Top Elevation (${currentUnit === 'SI' ? 'm' : 'ft'})`}>
                  <NumericInput
                    id="tankTop"
                    value={formData.tankTop}
                    onValueChange={(v) => handleChange('tankTop', v)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                <PropRow
                  label={`Bottom Elevation (${currentUnit === 'SI' ? 'm' : 'ft'})`}
                  noBorder={!(formData.type_st === 'AIRTANK' || formData.type_st === 'DIFFERENTIAL')}
                >
                  <NumericInput
                    id="tankBottom"
                    value={formData.tankBottom}
                    onValueChange={(v) => handleChange('tankBottom', v)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                {(formData.type_st === 'AIRTANK' || formData.type_st === 'DIFFERENTIAL') && (
                  <PropRow
                    label={`Initial Water Level HTANK (${currentUnit === 'SI' ? 'm' : 'ft'})`}
                    noBorder={formData.type_st !== 'DIFFERENTIAL'}
                  >
                    <NumericInput
                      id="htank"
                      value={formData.initialWaterLevel}
                      onValueChange={(v) => handleChange('initialWaterLevel', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                )}
                {formData.type_st === 'DIFFERENTIAL' && (
                  <>
                    <PropRow label={`Riser Diameter (${currentUnit === 'SI' ? 'm' : 'ft'})`}>
                      <NumericInput
                        id="riserdiam"
                        value={formData.riserDiameter}
                        onValueChange={(v) => handleChange('riserDiameter', v)}
                        className="h-7 text-[12px] font-medium text-black border-slate-300"
                        style={{ fontFamily: 'Poppins, sans-serif' } as any}
                      />
                    </PropRow>
                    <PropRow label={`Riser Top Elevation (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                      <NumericInput
                        id="risertop"
                        value={formData.riserTop}
                        onValueChange={(v) => handleChange('riserTop', v)}
                        className="h-7 text-[12px] font-medium text-black border-slate-300"
                        style={{ fontFamily: 'Poppins, sans-serif' } as any}
                      />
                    </PropRow>
                  </>
                )}
              </PropSection>

              {/* ── SURGE TANK: Cross-section ── */}
              <PropSection title="Cross-section">
                <PropRow label="Use SHAPE instead of DIAM" noBorder={!formData.hasShape}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="hasShape"
                      checked={formData.hasShape || false}
                      onCheckedChange={(checked) => handleChange('hasShape', !!checked)}
                    />
                    <span className="text-[12px] font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Enable SHAPE</span>
                  </label>
                </PropRow>
                {!formData.hasShape && (
                  <PropRow label={`Diameter (${currentUnit === 'SI' ? 'm' : 'ft'})`} noBorder>
                    <NumericInput
                      id="diam"
                      value={formData.diameter}
                      onValueChange={(v) => handleChange('diameter', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                )}
                {formData.hasShape && (
                  <div className="px-3 pb-3 space-y-2">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-black uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Shape (E, A pairs)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const shape = (formData.shape as any[]) || [];
                          handleChange('shape', [...shape, { e: 0, a: 0 }]);
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <Plus className="h-3 w-3" /> Add Pair
                      </button>
                    </div>
                    {((formData.shape as any[]) || []).map((pair, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border border-slate-200 rounded-md bg-slate-50 relative group">
                        <div className="flex-1">
                          <div className="text-[10px] font-medium text-black mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>E ({currentUnit === 'SI' ? 'm' : 'ft'})</div>
                          <NumericInput
                            className="h-6 text-[11px] font-medium text-black border-slate-300"
                            value={pair.e}
                            onValueChange={(v) => {
                              const newShape = [...(formData.shape as any[])];
                              newShape[index] = { ...newShape[index], e: v };
                              handleChange('shape', newShape);
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-medium text-black mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>A ({currentUnit === 'SI' ? 'm²' : 'ft²'})</div>
                          <NumericInput
                            className="h-6 text-[11px] font-medium text-black border-slate-300"
                            value={pair.a}
                            onValueChange={(v) => {
                              const newShape = [...(formData.shape as any[])];
                              newShape[index] = { ...newShape[index], a: v };
                              handleChange('shape', newShape);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-1 shrink-0 flex items-center justify-center"
                          onClick={() => {
                            const newShape = (formData.shape as any[]).filter((_, i) => i !== index);
                            handleChange('shape', newShape);
                          }}
                        >
                          <img
                            src={deleteIconImg}
                            alt="Delete"
                            className="h-3.5 w-3.5 object-contain"
                            style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(95%) saturate(2000%) hue-rotate(340deg) brightness(100%) contrast(110%)' }}
                          />
                        </button>
                      </div>
                    ))}
                    {(!formData.shape || (formData.shape as any[]).length === 0) && (
                      <p className="text-[11px] text-black text-center py-2 italic" style={{ fontFamily: 'Poppins, sans-serif' }}>No shape pairs added.</p>
                    )}
                  </div>
                )}
              </PropSection>

              {/* ── SURGE TANK: Hydraulics ── */}
              <PropSection title="Hydraulics">
                <PropRow label={`Celerity (${currentUnit === 'SI' ? 'm/s' : 'ft/s'})`}>
                  <NumericInput
                    id="st-celerity"
                    value={formData.celerity}
                    onValueChange={(v) => handleChange('celerity', v)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                <PropRow label="Friction" noBorder>
                  <NumericInput
                    id="st-friction"
                    value={formData.friction}
                    onValueChange={(v) => handleChange('friction', v)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
              </PropSection>

              {/* ── SURGE TANK: Added Loss ── */}
              <PropSection title="Added Loss Coefficients">
                <PropRow label="Enable ADDEDLOSS" noBorder={!formData.hasAddedLoss}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="hasAddedLossST"
                      checked={formData.hasAddedLoss || false}
                      onCheckedChange={(checked) => handleChange('hasAddedLoss', !!checked)}
                    />
                    <span className="text-[12px] font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Include ADDEDLOSS</span>
                  </label>
                </PropRow>
                {formData.hasAddedLoss && (
                  <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>CPLUS</div>
                      <NumericInput
                        id="st-cplus"
                        value={formData.cplus}
                        onValueChange={(v) => handleChange('cplus', v)}
                        className="h-7 text-[11px] border-slate-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>CMINUS</div>
                      <NumericInput
                        id="st-cminus"
                        value={formData.cminus}
                        onValueChange={(v) => handleChange('cminus', v)}
                        className="h-7 text-[11px] border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </PropSection>
            </>
          )}

          {!isNode && (element.data?.type === 'conduit' || !element.data?.type) && (
            <>
              {/* ── GEOMETRY ── */}
              <PropSection title="Geometry">
                <PropRow label={`Length (${currentUnit === 'SI' ? 'm' : 'ft'})`}>
                  <NumericInput
                    id="length"
                    value={formData.length}
                    onValueChange={(v) => handleChange('length', v)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                {!formData.variable && (
                  <PropRow label={`Diameter (${currentUnit === 'SI' ? 'm' : 'ft'})`}>
                    <NumericInput
                      id="diam"
                      value={formData.diameter}
                      onValueChange={(v) => {
                        const newDiam = parseFloat(v);
                        handleChange('diameter', v);
                        if (!isNaN(newDiam) && newDiam > 0) {
                          const C0 = currentUnit === 'SI' ? 1440 : 4720;
                          const Kw = currentUnit === 'SI' ? 2.07e9 : 3e5;
                          const E  = parseFloat(formData.pipeE) || 0;
                          const WT = parseFloat(formData.pipeWT) || 0;
                          if (E > 0 && WT > 0) {
                            const c = C0 / Math.sqrt(1 + (Kw / E) * (newDiam / WT));
                            handleChange('celerity', parseFloat(c.toFixed(4)).toString());
                          }
                          const K = currentUnit === 'SI' ? 124.58 : 185;
                          const n = parseFloat(formData.manningsN);
                          if (!isNaN(n) && n > 0) {
                            const f = (K * n * n) / Math.pow(newDiam, 1 / 3);
                            handleChange('friction', parseFloat(f.toFixed(6)).toString());
                          } else {
                            const f = parseFloat(formData.friction);
                            if (!isNaN(f) && f > 0) {
                              const nNew = Math.sqrt((f * Math.pow(newDiam, 1 / 3)) / K);
                              handleChange('manningsN', parseFloat(nNew.toFixed(6)).toString());
                            }
                          }
                        }
                      }}
                      className="h-7 text-[12px] font-medium text-black border-slate-300"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                  </PropRow>
                )}
                <PropRow label="Variable Cross-section" noBorder>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="variable"
                      checked={formData.variable || false}
                      onCheckedChange={(checked) => handleChange('variable', !!checked)}
                    />
                    <span className="text-[12px] font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Enable VARIABLE</span>
                  </label>
                </PropRow>
                {formData.variable && (
                  <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Distance ({currentUnit === 'SI' ? 'm' : 'ft'})</div>
                      <NumericInput id="distance" value={formData.distance} onValueChange={(v) => handleChange('distance', v)} className="h-7 text-[11px] border-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Area ({currentUnit === 'SI' ? 'm²' : 'ft²'})</div>
                      <NumericInput id="area" value={formData.area} onValueChange={(v) => handleChange('area', v)} className="h-7 text-[11px] border-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>D ({currentUnit === 'SI' ? 'm' : 'ft'})</div>
                      <NumericInput id="d" value={formData.d} onValueChange={(v) => handleChange('d', v)} className="h-7 text-[11px] border-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>A ({currentUnit === 'SI' ? 'm²' : 'ft²'})</div>
                      <NumericInput id="a" value={formData.a} onValueChange={(v) => handleChange('a', v)} className="h-7 text-[11px] border-slate-300" />
                    </div>
                  </div>
                )}
              </PropSection>

              {/* ── HYDRAULICS ── */}
              <PropSection title="Hydraulics">
                <PropRow label={
                  <div className="flex items-center gap-1.5">
                    <span>Wave Speed ({currentUnit === 'SI' ? 'm/s' : 'ft/s'})</span>
                    {(parseFloat(formData.pipeE) > 0 && parseFloat(formData.pipeWT) > 0)
                      ? <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-semibold">Auto</span>
                      : <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">Manual</span>}
                  </div>
                }>
                  <NumericInput
                    id="celerity"
                    value={formData.celerity}
                    onValueChange={(v) => handleChange('celerity', v)}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                <PropRow label="Friction (f)" noBorder>
                  <NumericInput
                    id="friction"
                    data-testid="input-friction"
                    value={formData.friction}
                    onValueChange={(v) => {
                      handleChange('friction', v);
                      const f = parseFloat(v);
                      const diam = parseFloat(formData.diameter) || 0;
                      const K = currentUnit === 'SI' ? 124.58 : 185;
                      if (!isNaN(f) && f > 0 && diam > 0) {
                        const n = Math.sqrt((f * Math.pow(diam, 1 / 3)) / K);
                        handleChange('manningsN', parseFloat(n.toFixed(6)).toString());
                      }
                    }}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
              </PropSection>

              {/* ── PIPE MATERIAL ── */}
              {(() => {
                const matId = formData.materialId ? Number(formData.materialId) : null;
                const mat = matId != null ? PIPE_MATERIALS_BY_ID[matId] : null;
                const applyMaterial = (idStr: string, forceAll: boolean = false) => {
                  const all = forceAll || applyMaterialToAllConduits;
                  if (idStr === '__none__') {
                    handleChange('materialId', '');
                    const lbl = (formData.label as string) || '';
                    if (all || lbl) {
                      edges
                        .filter(e => e.id !== selectedElementId && e.data?.type === 'conduit' && (all || (e.data?.label as string) === lbl))
                        .forEach(e => updateEdgeData(e.id, { materialId: '' } as any));
                    }
                    return;
                  }
                  const id = parseInt(idStr, 10);
                  const m = PIPE_MATERIALS_BY_ID[id];
                  if (!m) return;
                  handleChange('materialId', String(id));
                  const n = m.manningsN;
                  handleChange('manningsN', String(n));
                  const eVal = currentUnit === 'SI' ? m.youngsModulus_Pa : m.youngsModulus_psi;
                  if (eVal > 0) handleChange('pipeE', String(eVal));
                  const D = parseFloat(formData.diameter) || 0;
                  if (D > 0 && n > 0) {
                    const K = currentUnit === 'SI' ? 124.58 : 185;
                    const f = (K * n * n) / Math.pow(D, 1 / 3);
                    handleChange('friction', parseFloat(f.toFixed(6)).toString());
                  }
                  const WT = parseFloat(formData.pipeWT) || 0;
                  if (eVal > 0 && WT > 0 && D > 0) {
                    const C0 = currentUnit === 'SI' ? 1440 : 4720;
                    const Kw = currentUnit === 'SI' ? 2.07e9 : 3e5;
                    const c = C0 / Math.sqrt(1 + (Kw / eVal) * (D / WT));
                    handleChange('celerity', parseFloat(c.toFixed(4)).toString());
                  }
                  const lbl = (formData.label as string) || '';
                  if (all || lbl) {
                    const siblings = edges.filter(e => e.id !== selectedElementId && e.data?.type === 'conduit' && (all || (e.data?.label as string) === lbl));
                    siblings.forEach(e => {
                      const eUnit: UnitSystem = (e.data?.unit as UnitSystem) || currentUnit;
                      const eEval = eUnit === 'SI' ? m.youngsModulus_Pa : m.youngsModulus_psi;
                      const sibUpdate: any = { materialId: String(id), manningsN: n };
                      if (eEval > 0) sibUpdate.pipeE = eEval;
                      const eD = parseFloat(String((e.data as any)?.diameter)) || 0;
                      if (eD > 0 && n > 0) {
                        const K = eUnit === 'SI' ? 124.58 : 185;
                        sibUpdate.friction = parseFloat(((K * n * n) / Math.pow(eD, 1 / 3)).toFixed(6));
                      }
                      const eWT = parseFloat(String((e.data as any)?.pipeWT)) || 0;
                      if (eEval > 0 && eWT > 0 && eD > 0) {
                        const C0 = eUnit === 'SI' ? 1440 : 4720;
                        const Kw = eUnit === 'SI' ? 2.07e9 : 3e5;
                        sibUpdate.celerity = parseFloat((C0 / Math.sqrt(1 + (Kw / eEval) * (eD / eWT))).toFixed(4));
                      }
                      updateEdgeData(e.id, sibUpdate);
                    });
                    if (siblings.length > 0) {
                      toast({
                        title: all ? 'Material applied to all conduits' : 'Material applied to group',
                        description: all
                          ? `${m.label} applied to ${siblings.length + 1} conduit${siblings.length + 1 > 1 ? 's' : ''}.`
                          : `${m.label} also applied to ${siblings.length} other "${lbl}" conduit${siblings.length > 1 ? 's' : ''}.`,
                      });
                    }
                  }
                };
                return (
                  <PropSection title="Pipe Material">
                    <div className="px-3 pt-2 pb-3 space-y-3">
                      <p className="text-[11px] font-medium text-black leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Select a material to auto-fill Manning's n and Young's Modulus (E).
                      </p>
                      <Popover open={materialPickerOpen} onOpenChange={setMaterialPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="pipe-material"
                            data-testid="select-pipe-material"
                            variant="outline"
                            role="combobox"
                            aria-expanded={materialPickerOpen}
                            className="w-full justify-between bg-white font-semibold text-[12px] text-black border-slate-300 h-8"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            <span className={mat ? 'text-black' : 'text-slate-400 font-normal'}>
                              {mat ? mat.label : '— Select pipe material —'}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-2" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                          <Command filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
                            <CommandInput placeholder="Search material..." data-testid="input-material-search" />
                            <CommandList className="max-h-64">
                              <CommandEmpty>No material found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem value="-- None (manual entry) --" onSelect={() => { applyMaterial('__none__'); setMaterialPickerOpen(false); }} data-testid="material-option-none">
                                  — None (manual entry) —
                                </CommandItem>
                                {PIPE_MATERIALS.map(m => (
                                  <CommandItem key={m.id} value={m.label} onSelect={() => { applyMaterial(String(m.id)); setMaterialPickerOpen(false); }} data-testid={`material-option-${m.id}`}>
                                    {m.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="apply-mat-all"
                          data-testid="checkbox-apply-material-all"
                          checked={applyMaterialToAllConduits}
                          onCheckedChange={(c) => {
                            const checked = !!c;
                            setApplyMaterialToAllConduits(checked);
                            if (checked && formData.materialId) applyMaterial(String(formData.materialId), true);
                          }}
                        />
                        <span className="text-[11px] font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Apply to <strong>all conduits</strong> in network
                        </span>
                      </label>
                      {mat && (
                        <div className="rounded border border-slate-200 bg-slate-50 overflow-hidden">
                          <button
                            type="button"
                            data-testid="btn-toggle-material-properties"
                            onClick={() => setShowMaterialProps(v => !v)}
                            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-black hover:bg-slate-100 transition-colors"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            <span>{mat.label} — properties</span>
                            {showMaterialProps ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                          {showMaterialProps && (
                            <div data-testid="material-properties-summary" className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] px-3 pb-2.5 pt-1 border-t border-slate-200">
                              <div className="text-black font-medium">Manning's n</div>
                              <div className="font-mono text-right text-black" data-testid="mat-prop-mannings">{mat.manningsN}</div>
                              <div className="text-black font-medium">Kutter's n</div>
                              <div className="font-mono text-right text-black">{mat.kuttersN}</div>
                              <div className="text-black font-medium">Hazen-Williams C</div>
                              <div className="font-mono text-right text-black">{mat.hazenWilliamsC}</div>
                              <div className="text-black font-medium">Modified H-W CR</div>
                              <div className="font-mono text-right text-black">{mat.modifiedHWCR}</div>
                              <div className="text-black font-medium">Roughness ε ({currentUnit === 'SI' ? 'm' : 'ft'})</div>
                              <div className="font-mono text-right text-black">{currentUnit === 'SI' ? mat.roughnessHeight_m : mat.roughnessHeight_ft}</div>
                              <div className="text-black font-medium">Young's E ({currentUnit === 'SI' ? 'Pa' : 'psi'})</div>
                              <div className="font-mono text-right text-black" data-testid="mat-prop-e">
                                {(() => { const v = currentUnit === 'SI' ? mat.youngsModulus_Pa : mat.youngsModulus_psi; if (!v) return <span className="text-amber-600">n/a</span>; return v.toLocaleString(undefined, { maximumFractionDigits: 2 }); })()}
                              </div>
                              <div className="text-black font-medium">Poisson's Ratio</div>
                              <div className="font-mono text-right text-black">{mat.poissonsRatio || <span className="text-amber-600">n/a</span>}</div>
                              <div className="col-span-2 text-[10px] text-slate-500 italic mt-1 pt-1 border-t border-slate-200">
                                Manning's n and E auto-filled. Enter WT below to compute wave speed.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </PropSection>
                );
              })()}

              {/* ── WALL PROPERTIES ── */}
              <PropSection title="Wall Properties (E &amp; WT)">
                <div className="px-3 pt-2 pb-0">
                  <p className="text-[11px] font-medium text-black leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Enter both <strong>E</strong> and <strong>WT</strong> to calculate wave speed. Diameter is used automatically.
                  </p>
                </div>
                <PropRow label={`E (${currentUnit === 'SI' ? 'Pa' : 'psi'})`}>
                  <NumericInput
                    id="pipe-e"
                    data-testid="input-pipe-e"
                    placeholder={currentUnit === 'SI' ? 'e.g. 2.07e11' : 'e.g. 30000000'}
                    value={formData.pipeE}
                    onValueChange={(v) => {
                      handleChange('pipeE', v);
                      const E = parseFloat(v);
                      const C0 = currentUnit === 'SI' ? 1440 : 4720;
                      const Kw = currentUnit === 'SI' ? 2.07e9 : 3e5;
                      const D = parseFloat(formData.diameter) || 0;
                      const WT = parseFloat(formData.pipeWT) || 0;
                      if (!isNaN(E) && E > 0 && WT > 0 && D > 0) {
                        const c = C0 / Math.sqrt(1 + (Kw / E) * (D / WT));
                        handleChange('celerity', parseFloat(c.toFixed(4)).toString());
                      }
                    }}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                <PropRow label={`WT (${currentUnit === 'SI' ? 'm' : 'ft'})`}>
                  <NumericInput
                    id="pipe-wt"
                    data-testid="input-pipe-wt"
                    placeholder={currentUnit === 'SI' ? 'e.g. 0.006' : 'e.g. 0.02'}
                    value={formData.pipeWT}
                    onValueChange={(v) => {
                      handleChange('pipeWT', v);
                      const WT = parseFloat(v);
                      const C0 = currentUnit === 'SI' ? 1440 : 4720;
                      const Kw = currentUnit === 'SI' ? 2.07e9 : 3e5;
                      const D = parseFloat(formData.diameter) || 0;
                      const E = parseFloat(formData.pipeE) || 0;
                      if (!isNaN(WT) && WT > 0 && E > 0 && D > 0) {
                        const c = C0 / Math.sqrt(1 + (Kw / E) * (D / WT));
                        handleChange('celerity', parseFloat(c.toFixed(4)).toString());
                      }
                    }}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                <div className="px-3 pb-3">
                  <div className="rounded bg-slate-100 px-3 py-2 text-[11px] text-black font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span>{currentUnit === 'SI' ? 'c = 1440 / √(1 + (2.07·10⁹/E)·(D/WT))' : 'c = 4720 / √(1 + (3·10⁵/E)·(D/WT))'}</span>
                    {formData.celerity && (formData.pipeE || formData.pipeWT) ? (
                      <span className="ml-2 font-bold text-blue-700">= {parseFloat(Number(formData.celerity).toFixed(4))} {currentUnit === 'SI' ? 'm/s' : 'ft/s'}</span>
                    ) : null}
                  </div>
                </div>
              </PropSection>

              {/* ── MANNING'S n ── */}
              <PropSection title="Manning's Coefficient">
                <PropRow label="n" noBorder>
                  <NumericInput
                    id="mannings-n"
                    data-testid="input-mannings-n"
                    placeholder="e.g. 0.013"
                    value={(() => {
                      if (formData.manningsN != null && formData.manningsN !== '') return formData.manningsN;
                      const f = parseFloat(formData.friction) || 0;
                      const diam = parseFloat(formData.diameter) || 0;
                      const K = currentUnit === 'SI' ? 124.58 : 185;
                      if (f > 0 && diam > 0) return parseFloat(Math.sqrt((f * Math.pow(diam, 1 / 3)) / K).toFixed(6));
                      return '';
                    })()}
                    onValueChange={(v) => {
                      const n = parseFloat(v);
                      handleChange('manningsN', v);
                      if (!isNaN(n) && n > 0) {
                        const diam = parseFloat(formData.diameter) || 0;
                        const K = currentUnit === 'SI' ? 124.58 : 185;
                        if (diam > 0) {
                          const f = (K * n * n) / Math.pow(diam, 1 / 3);
                          handleChange('friction', parseFloat(f.toFixed(6)).toString());
                        }
                      }
                    }}
                    className="h-7 text-[12px] font-medium text-black border-slate-300"
                    style={{ fontFamily: 'Poppins, sans-serif' } as any}
                  />
                </PropRow>
                <div className="px-3 pb-3">
                  <div className="rounded bg-slate-100 px-3 py-2 text-[11px] text-black font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span>f = {currentUnit === 'SI' ? '124.58' : '185'} · n² / D<sup>1/3</sup></span>
                    {formData.friction ? <span className="ml-2 font-bold text-blue-700">= {parseFloat(Number(formData.friction).toFixed(6))}</span> : null}
                  </div>
                </div>
              </PropSection>

              {/* ── ADVANCED ── */}
              <PropSection title="Advanced">
                <PropRow label="Num Segments">
                  <div className="flex items-center gap-2">
                    <NumericInput
                      id="segments"
                      value={formData.numSegments ?? 1}
                      onValueChange={(v) => handleChange('numSegments', v)}
                      className="h-7 text-[12px] font-medium text-black border-slate-300 flex-1"
                      style={{ fontFamily: 'Poppins, sans-serif' } as any}
                    />
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Checkbox
                        id="includeNumSeg"
                        checked={formData.includeNumSegments !== false}
                        onCheckedChange={(checked) => handleChange('includeNumSegments', !!checked)}
                      />
                      <span className="text-[11px] font-medium text-black whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif' }}>In .INP</span>
                    </label>
                  </div>
                </PropRow>
                <PropRow label="Added Loss" noBorder={!formData.hasAddedLoss}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="hasAddedLoss"
                      checked={formData.hasAddedLoss || false}
                      onCheckedChange={(checked) => handleChange('hasAddedLoss', !!checked)}
                    />
                    <span className="text-[12px] font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Include ADDEDLOSS</span>
                  </label>
                </PropRow>
                {formData.hasAddedLoss && (
                  <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>CPLUS (opt)</div>
                      <NumericInput id="cplus" placeholder="0.0" value={formData.cplus} onValueChange={(v) => handleChange('cplus', v === '' ? undefined : v)} className="h-7 text-[11px] border-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>CMINUS (opt)</div>
                      <NumericInput id="cminus" placeholder="0.0" value={formData.cminus} onValueChange={(v) => handleChange('cminus', v === '' ? undefined : v)} className="h-7 text-[11px] border-slate-300" />
                    </div>
                  </div>
                )}
              </PropSection>
            </>
          )}

          {!isNode && element.data?.type === 'dummy' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="diam">Diameter ({currentUnit === 'SI' ? 'm' : 'ft'})</Label>
                <NumericInput 
                  id="diam" 
                  value={formData.diameter} 
                  onValueChange={(v) => handleChange('diameter', v)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 my-2">
                <Checkbox 
                  id="hasAddedLoss" 
                  checked={formData.hasAddedLoss || false} 
                  onCheckedChange={(checked) => handleChange('hasAddedLoss', !!checked)}
                />
                <Label htmlFor="hasAddedLoss" className="font-semibold text-primary">Include ADDEDLOSS</Label>
              </div>

              {formData.hasAddedLoss && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cplus">CPLUS (opt)</Label>
                    <NumericInput 
                      id="cplus" 
                      placeholder="0.0"
                      value={formData.cplus} 
                      onValueChange={(v) => handleChange('cplus', v === '' ? undefined : v)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cminus">CMINUS (opt)</Label>
                    <NumericInput 
                      id="cminus" 
                      placeholder="0.0"
                      value={formData.cminus} 
                      onValueChange={(v) => handleChange('cminus', v === '' ? undefined : v)} 
                    />
                  </div>
                </div>
              )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Fixed footer: pill-shaped Save / Delete ── */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            data-testid="button-save-element"
            className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2 transition-colors
              ${isDirty
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <img
              src={saveIconImg}
              alt="Save"
              className="h-[18px] w-[18px] object-contain"
              style={{ filter: isDirty ? 'brightness(0) invert(1)' : 'brightness(0) opacity(0.4)' }}
            />
            <span className="text-[14px] font-semibold">Save</span>
          </button>
          <button
            onClick={() => selectedElementId && selectedElementType && deleteElement(selectedElementId, selectedElementType)}
            data-testid="button-delete-element"
            className="flex-1 flex items-center justify-center gap-2 rounded-full py-2 bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <img
              src={deleteIconImg}
              alt="Delete"
              className="h-[18px] w-[18px] object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-[14px] font-semibold">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
