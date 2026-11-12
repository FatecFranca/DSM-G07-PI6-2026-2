type ConfusionMatrixProps = {
  title: string;
  matrix: unknown;
};

type Grid = [[number, number], [number, number]];

function toGrid(matrix: unknown): Grid | null {
  if (!Array.isArray(matrix) || matrix.length !== 2) return null;
  const rows = matrix.map((row) =>
    Array.isArray(row) && row.length === 2 && row.every((n) => typeof n === "number")
      ? (row as [number, number])
      : null,
  );
  if (!rows[0] || !rows[1]) return null;
  return [rows[0], rows[1]];
}

export default function ConfusionMatrix({ title, matrix }: ConfusionMatrixProps) {
  const grid = toGrid(matrix);

  if (!grid) {
    return (
      <pre className="mt-2 overflow-auto text-xs">
        {title + "\n" + JSON.stringify(matrix, null, 2)}
      </pre>
    );
  }

  const [[trueNegative, falsePositive], [falseNegative, truePositive]] = grid;
  const total = trueNegative + falsePositive + falseNegative + truePositive;
  const hits = total ? ((trueNegative + truePositive) / total) * 100 : 0;
  const cell = "px-3 py-2 text-center";
  const hit = cell + " bg-[#c4a35a]/20 font-semibold";

  return (
    <div className="mt-3">
      <p className="mb-1 text-sm">{title}</p>
      <div className="overflow-auto">
        <table className="w-full max-w-md text-sm">
          <thead>
            <tr className="text-xs text-[#d9cdb8]/70">
              <th className={cell} />
              <th className={cell}>Previsto: não apto</th>
              <th className={cell}>Previsto: apto</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/10">
              <th className="px-3 py-2 text-left text-xs font-normal text-[#d9cdb8]/70">
                Real: não apto
              </th>
              <td className={hit}>{trueNegative}</td>
              <td className={cell}>{falsePositive}</td>
            </tr>
            <tr className="border-t border-white/10">
              <th className="px-3 py-2 text-left text-xs font-normal text-[#d9cdb8]/70">
                Real: apto
              </th>
              <td className={cell}>{falseNegative}</td>
              <td className={hit}>{truePositive}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-xs text-[#d9cdb8]/60">
        Destaque = acertos ({hits.toFixed(1)}% de {total} municípios avaliados).
      </p>
    </div>
  );
}
