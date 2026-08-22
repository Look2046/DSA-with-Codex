import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import {
  flattenSymmetricByHalf,
  getCompressedIndex,
  getStoredCoordinate,
  getSymmetricMatrixPreset,
  getSymmetricMatrixPresetIds,
  isValidSymmetricTarget,
  type SymmetricMatrixPresetId,
  type SymmetricMatrixStorageHalf,
} from '../../modules/storage/symmetricMatrix';

const DEFAULT_PRESET: SymmetricMatrixPresetId = 'symmetric-4x4';
const DEFAULT_ROW = 3;
const DEFAULT_COL = 1;
const BASE_ADDRESS = 2000;
const ADDRESS_STEP = 4;

function getPresetLabel(presetId: SymmetricMatrixPresetId, t: ReturnType<typeof useI18n>['t']): string {
  return presetId === 'symmetric-4x4' ? t('module.m02.preset.4x4') : t('module.m02.preset.5x5');
}

function interpolateTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (current, [key, value]) => current.replaceAll(`{${key}}`, value),
    template,
  );
}

function formatExplicitSum(values: number[]): string {
  if (values.length === 0) {
    return '0';
  }
  return values.join(' + ');
}

export function SymmetricMatrixPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<SymmetricMatrixPresetId>(DEFAULT_PRESET);
  const [selectedRow, setSelectedRow] = useState(DEFAULT_ROW);
  const [selectedCol, setSelectedCol] = useState(DEFAULT_COL);
  const [storageHalf, setStorageHalf] = useState<SymmetricMatrixStorageHalf>('upper');

  const preset = useMemo(() => getSymmetricMatrixPreset(presetId), [presetId]);
  const presetOptions = useMemo(() => getSymmetricMatrixPresetIds(), []);

  const storedCoordinate = getStoredCoordinate(selectedRow, selectedCol, storageHalf);
  const compressedIndex = getCompressedIndex(preset.size, selectedRow, selectedCol, storageHalf);
  const compressedValues = useMemo(() => flattenSymmetricByHalf(preset.values, storageHalf), [preset.values, storageHalf]);
  const selectedValue = preset.values[selectedRow]?.[selectedCol] ?? '-';
  const storedValue = preset.values[storedCoordinate.row]?.[storedCoordinate.col] ?? '-';
  const mirrorText = `a[${selectedRow}][${selectedCol}] = a[${storedCoordinate.row}][${storedCoordinate.col}]`;
  const formulaText =
    storageHalf === 'upper'
      ? 'k = i * n - i * (i - 1) / 2 + (j - i)'
      : 'k = i * (i + 1) / 2 + j';
  const mappedRow = storedCoordinate.row;
  const mappedCol = storedCoordinate.col;
  const preservedBeforeCount =
    storageHalf === 'upper'
      ? mappedRow * preset.size - (mappedRow * (mappedRow - 1)) / 2
      : (mappedRow * (mappedRow + 1)) / 2;
  const currentBandOffset = storageHalf === 'upper' ? mappedCol - mappedRow : mappedCol;
  const upperRowCounts = Array.from({ length: mappedRow }, (_, index) => preset.size - index);
  const lowerRowCounts = Array.from({ length: mappedRow }, (_, index) => index + 1);
  const upperMissingCounts = Array.from({ length: mappedRow }, (_, index) => index);
  const expansionText =
    storageHalf === 'upper'
      ? `k = ${mappedRow} * ${preset.size} - ${mappedRow} * (${mappedRow} - 1) / 2 + (${mappedCol} - ${mappedRow}) = ${compressedIndex}`
      : `k = ${mappedRow} * (${mappedRow} + 1) / 2 + ${mappedCol} = ${compressedIndex}`;
  const explanationText =
    storageHalf === 'upper'
      ? interpolateTemplate(t('module.m02.explain.upper'), {
          row: String(mappedRow),
          missing: String((mappedRow * (mappedRow - 1)) / 2),
          offset: String(mappedCol - mappedRow),
          fullRows: formatExplicitSum(upperRowCounts),
          missingRows: formatExplicitSum(upperMissingCounts),
          fullRowBlocks: formatExplicitSum(Array.from({ length: mappedRow }, () => preset.size)),
        })
      : interpolateTemplate(t('module.m02.explain.lower'), {
          row: String(mappedRow),
          offset: String(mappedCol),
          fullRows: formatExplicitSum(lowerRowCounts),
        });

  const handleSelectCell = (rowIndex: number, colIndex: number) => {
    if (!isValidSymmetricTarget(preset, rowIndex, colIndex)) {
      return;
    }
    setSelectedRow(rowIndex);
    setSelectedCol(colIndex);
  };

  const handleReset = () => {
    setPresetId(DEFAULT_PRESET);
    setSelectedRow(DEFAULT_ROW);
    setSelectedCol(DEFAULT_COL);
    setStorageHalf('upper');
  };

  return (
    <section className="array-page tree-page storage-page">
      <div className="tree-workspace-header">
        <h2>{t('module.m02.title')}</h2>
        <p>{t('module.m02.body')}</p>
      </div>

      <section className="storage-workbench" aria-label={t('module.m02.stage')}>
        <div className="storage-toolbar">
          <label className="tree-workspace-field" htmlFor="m02-preset">
            <span>{t('module.m02.input.preset')}</span>
            <select
              id="m02-preset"
              value={presetId}
              onChange={(event) => {
                const nextPresetId = event.target.value as SymmetricMatrixPresetId;
                setPresetId(nextPresetId);
                setSelectedRow(0);
                setSelectedCol(0);
              }}
            >
              {presetOptions.map((option) => (
                <option key={option} value={option}>
                  {getPresetLabel(option, t)}
                </option>
              ))}
            </select>
          </label>

          <div className="tree-workspace-field">
            <span>{t('module.m02.input.half')}</span>
            <div className="tree-workspace-toggle-row">
              <button
                type="button"
                className={`tree-workspace-toggle${storageHalf === 'upper' ? ' tree-workspace-toggle-active' : ''}`}
                onClick={() => setStorageHalf('upper')}
              >
                {t('module.m02.half.upper')}
              </button>
              <button
                type="button"
                className={`tree-workspace-toggle${storageHalf === 'lower' ? ' tree-workspace-toggle-active' : ''}`}
                onClick={() => setStorageHalf('lower')}
              >
                {t('module.m02.half.lower')}
              </button>
            </div>
          </div>

          <div className="storage-toolbar-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={handleReset}>
              {t('playback.reset')}
            </button>
          </div>
        </div>

        <div className="storage-summary-strip">
          <span className="tree-workspace-pill">
            {t('module.m02.meta.shape')}: {preset.size} x {preset.size}
          </span>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('module.m02.meta.target')}: a[{selectedRow}][{selectedCol}] = {selectedValue}
          </span>
          <span className="tree-workspace-pill">{storageHalf === 'upper' ? t('module.m02.half.upper') : t('module.m02.half.lower')}</span>
          <span className="tree-workspace-pill">
            {t('module.m02.meta.linearIndex')}: k = {compressedIndex}
          </span>
        </div>

        <div className="storage-layout">
          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m02.view.matrix')}</strong>
              <span>{t('module.m02.view.matrixHint')}</span>
            </div>

            <div className="graph-matrix-scroll">
              <table className="graph-matrix storage-matrix-table">
                <thead>
                  <tr>
                    <th aria-label={t('module.g01.matrix.corner')} />
                    {preset.values[0]?.map((_, colIndex) => (
                      <th key={`m02-head-${colIndex}`}>j={colIndex}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preset.values.map((row, rowIndex) => (
                    <tr key={`m02-row-${rowIndex}`}>
                      <th>i={rowIndex}</th>
                      {row.map((value, colIndex) => {
                        const isSelected = rowIndex === selectedRow && colIndex === selectedCol;
                        const isStored = rowIndex === storedCoordinate.row && colIndex === storedCoordinate.col;
                        const isActiveHalf = storageHalf === 'upper' ? rowIndex <= colIndex : rowIndex >= colIndex;
                        const isMirrorZone = storageHalf === 'upper' ? rowIndex > colIndex : rowIndex < colIndex;
                        const isDiagonal = rowIndex === colIndex;
                        const mappedCell = getStoredCoordinate(rowIndex, colIndex, storageHalf);
                        return (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className={`${isSelected ? ' storage-matrix-cell-target' : ''}${isStored ? ' storage-matrix-cell-stored' : ''}${
                              isActiveHalf ? ' storage-matrix-cell-kept-half' : ''
                            }${isMirrorZone ? ' storage-matrix-cell-mirror-zone' : ''}${isDiagonal ? ' storage-matrix-cell-diagonal' : ''}${
                              isSelected && storedCoordinate.mirrored ? ' storage-matrix-cell-mirror-target' : ''
                            } storage-matrix-cell-clickable`}
                          >
                            <button type="button" className="storage-matrix-cell-button" onClick={() => handleSelectCell(rowIndex, colIndex)}>
                              <span className="storage-matrix-value">{value}</span>
                              <small>{isMirrorZone ? `-> [${mappedCell.row},${mappedCell.col}]` : `[${rowIndex},${colIndex}]`}</small>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="graph-stage-view-card storage-layout-panel storage-formula-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m02.meta.formula')}</strong>
              <span>{storageHalf === 'upper' ? t('module.m02.sample.upper') : t('module.m02.sample.lower')}</span>
            </div>

            <div className="storage-formula-stack">
              <div className="storage-formula-compact-grid">
                <div className="storage-formula-card">
                  <span>{t('module.m02.meta.target')}</span>
                  <strong>
                    a[{selectedRow}][{selectedCol}] = {selectedValue}
                  </strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m02.meta.storedCell')}</span>
                  <strong>
                    a[{storedCoordinate.row}][{storedCoordinate.col}] = {storedValue}
                  </strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m02.meta.mirror')}</span>
                  <strong>{storedCoordinate.mirrored ? t('module.m02.meta.mirrorYes') : t('module.m02.meta.mirrorNo')}</strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m02.meta.linearIndex')}</span>
                  <strong>
                    {preservedBeforeCount} + {currentBandOffset} = {compressedIndex}
                  </strong>
                </div>
              </div>

              {storedCoordinate.mirrored ? (
                <div className="storage-formula-card storage-formula-card-accent">
                  <span>{t('module.m02.meta.mirrorRule')}</span>
                  <strong>{mirrorText}</strong>
                </div>
              ) : null}

              <div className="storage-formula-card">
                <span>{t('module.m02.meta.counting')}</span>
                <strong>{t('module.m02.meta.countingRule')}</strong>
                <p className="storage-formula-explainer">{explanationText}</p>
              </div>

              <div className="storage-formula-main">
                <code>{formulaText}</code>
                <code>{expansionText}</code>
              </div>
            </div>
          </section>

          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m02.view.linear')}</strong>
              <span>{t('module.m02.view.linearHint')}</span>
            </div>

            <div className="storage-memory-table-wrap">
              <table className="storage-memory-table">
                <tbody>
                  {compressedValues.map((item, index) => {
                    const isSelected = index === compressedIndex;
                    const address = BASE_ADDRESS + index * ADDRESS_STEP;
                    return (
                      <tr key={`${index}-${item.row}-${item.col}`} className={isSelected ? 'storage-memory-row-active' : undefined}>
                        <td className="storage-memory-address-cell">{address}</td>
                        <td className={isSelected ? 'storage-memory-value-cell storage-memory-value-cell-active' : 'storage-memory-value-cell'}>
                          {item.value}
                        </td>
                        <td className="storage-memory-source-cell">
                          a[{item.row}][{item.col}]
                        </td>
                        <td className="storage-memory-index-cell">
                          <span className="storage-memory-index-prefix">k=</span>
                          <span className="storage-memory-index-value">{index}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}
