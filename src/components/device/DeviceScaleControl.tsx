import { deviceScales, type DeviceScale } from "../../design/deviceTokens";

export default function DeviceScaleControl({ value, onChange }: { value: DeviceScale; onChange: (scale: DeviceScale) => void }) {
  return <div className="device-scale-control" role="group" aria-label="设备显示比例"><span>设备比例</span>{deviceScales.map((scale) => <button key={scale} type="button" aria-pressed={value === scale} className={value === scale ? "is-active" : ""} onClick={() => onChange(scale)}>{scale}%</button>)}</div>;
}
