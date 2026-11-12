type Bar = { label: string; value: number | null };

type BarChartProps = {
  title: string;
  data: Bar[];
  unit?: string;
  decimals?: number;
};

const WIDTH = 640;
const HEIGHT = 230;
const MARGIN = { top: 26, right: 12, bottom: 38, left: 12 };

export default function BarChart({
  title,
  data,
  unit = "",
  decimals = 1,
}: BarChartProps) {
  const points = data.filter(
    (item): item is { label: string; value: number } =>
      item.value !== null && Number.isFinite(item.value),
  );

  if (points.length === 0) {
    return (
      <figure>
        <figcaption className="mb-2 text-sm text-[#d9cdb8]/80">{title}</figcaption>
        <p className="text-sm text-[#d9cdb8]/60">Sem dados para exibir.</p>
      </figure>
    );
  }

  const max = Math.max(0, ...points.map((point) => point.value));
  const min = Math.min(0, ...points.map((point) => point.value));
  const range = max - min || 1;
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const step = innerWidth / points.length;
  const barWidth = Math.min(40, step * 0.68);
  const zeroY = MARGIN.top + (max / range) * innerHeight;
  const summary = points
    .map(
      (point) =>
        `${point.label}: ${point.value.toFixed(decimals)}${unit ? " " + unit : ""}`,
    )
    .join("; ");

  return (
    <figure>
      <figcaption className="mb-2 text-sm text-[#d9cdb8]/80">{title}</figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title}. ${summary}`}
        className="h-auto w-full"
      >
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={zeroY}
          y2={zeroY}
          stroke="#f3ead8"
          strokeOpacity="0.25"
        />
        {points.map((point, index) => {
          const barHeight = (Math.abs(point.value) / range) * innerHeight;
          const x = MARGIN.left + step * index + (step - barWidth) / 2;
          const y = point.value >= 0 ? zeroY - barHeight : zeroY;
          const labelY = point.value >= 0 ? y - 6 : y + barHeight + 12;
          return (
            <g key={`${point.label}-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                fill="#c4a35a"
                rx="1"
              />
              <text
                x={x + barWidth / 2}
                y={labelY}
                textAnchor="middle"
                fontSize="11"
                fill="#f3ead8"
              >
                {point.value.toFixed(decimals)}
              </text>
              <text
                x={x + barWidth / 2}
                y={HEIGHT - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#d9cdb8"
                fillOpacity="0.8"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
