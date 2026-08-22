import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import {
  flattenLowerTriangularWithConstant,
  getLowerTriangularCompressedIndex,
  getLowerTriangularMatrixPreset,
  getLowerTriangularMatrixPresetIds,
  getLowerTriangularStoredCount,
  getLowerTriangularStoredInfo,
  isLowerStoredCell,
  isValidLowerTriangularTarget,
  type LowerTriangularMatrixPresetId,
} from '../../modules/storage/lowerTriangularMatrix';

const DEFAULT_PRESET: LowerTriangularMatrixPresetId = 'lower-4x4';
const DEFAULT_ROW = 3;
const DEFAULT_COL = 1;
const BASE_ADDRESS = 2800;
const ADDRESS_STEP = 4;

function getPresetLabel(presetId: LowerTriangularMatrixPresetId, t: ReturnType<typeof useI18n>['t']): string {
  return presetId === 'lower-4x4' ? t('module.m04.preset.4x4') : t('module.m04.preset.5x5');
}

function formatExplicitSum(values: number[]): string {
  if (values.length === 0) {
    return '0';
  }
  return values.join(' + ');
}

function interpolateTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (current, [key, value]) => current.replaceAll(`{${key}}`, value),
    template,
  );
}

export function LowerTriangularMatrixPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<LowerTriangularMatrixPresetId>(DEFAULT_PRESET);
  const [selectedRow, setSelectedRow] = useState(DEFAULT_ROW);
  const [selectedCol, setSelectedCol] = useState(DEFAULT_COL);

  const preset = useMemo(() => getLowerTriangularMatrixPreset(presetId), [presetId]);
  const presetOptions = useMemo(() => getLowerTriangularMatrixPresetIds(), []);
  const storedInfo = getLowerTriangularStoredInfo(preset.size, selectedRow, selectedCol);
  const selectedValue = storedInfo.kind === 'constant' ? 'c' : (preset.values[selectedRow]?.[selectedCol] ?? '-');
  const compressedIndex = getLowerTriangularCompressedIndex(preset.size, selectedRow, selectedCol);
  const compressedValues = useMemo(() => flattenLowerTriangularWithConstant(preset.values), [preset.values]);
  const constantSlotIndex = getLowerTriangularStoredCount(preset.size);
  const isConstantZoneTarget = storedInfo.kind === 'constant';
  const preservedBeforeCount = isConstantZoneTarget ? 0 : (selectedRow * (selectedRow + 1)) / 2;
  const currentRowOffset = isConstantZoneTarget ? 0 : selectedCol;
  const lowerRowCounts = Array.from({ length: selectedRow }, (_, index) => index + 1);
  const formulaText = isConstantZoneTarget
    ? 'k = n * (n + 1) / 2   (i < j，统一映射到常量单元 c)'
    : 'k = i * (i + 1) / 2 + j   (i >= j)';
  const expansionText = isConstantZoneTarget
    ? `k = ${preset.size} * (${preset.size} + 1) / 2 = ${compressedIndex}`
    : `k = ${selectedRow} * (${selectedRow} + 1) / 2 + ${selectedCol} = ${compressedIndex}`;
  const explanationText = isConstantZoneTarget
    ? t('module.m04.explain.constant')
    : interpolateTemplate(t('module.m04.explain.lower'), {
        row: String(selectedRow),
        offset: String(currentRowOffset),
        fullRows: formatExplicitSum(lowerRowCounts),
      });

  const handleSelectCell = (rowIndex: number, colIndex: number) => {
    if (!isValidLowerTriangularTarget(preset, rowIndex, colIndex)) {
      return;
    }
    setSelectedRow(rowIndex);
    setSelectedCol(colIndex);
  };

  const handleReset = () => {
    setPresetId(DEFAULT_PRESET);
    setSelectedRow(DEFAULT_ROW);
    setSelectedCol(DEFAULT_COL);
  };

  return (
    <section className="array-page tree-page storage-page">
      <div className="tree-workspace-header">
        <h2>{t('module.m04.title')}</h2>
        <p>{t('module.m04.body')}</p>
      </div>

      <section className="storage-workbench" aria-label={t('module.m04.stage')}>
        <div className="storage-toolbar">
          <label className="tree-workspace-field" htmlFor="m04-preset">
            <span>{t('module.m04.input.preset')}</span>
            <select
              id="m04-preset"
              value={presetId}
              onChange={(event) => {
                const nextPresetId = event.target.value as LowerTriangularMatrixPresetId;
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

          <div className="storage-toolbar-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={handleReset}>
              {t('playback.reset')}
            </button>
          </div>
        </div>

        <div className="storage-summary-strip">
          <span className="tree-workspace-pill">
            {t('module.m04.meta.shape')}: {preset.size} x {preset.size}
          </span>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('module.m04.meta.target')}: a[{selectedRow}][{selectedCol}] = {selectedValue}
          </span>
          <span className={isConstantZoneTarget ? 'tree-workspace-pill tree-workspace-pill-warning' : 'tree-workspace-pill'}>
            {isConstantZoneTarget ? t('module.m04.meta.constantZone') : t('module.m04.meta.storedZone')}
          </span>
          <span className="tree-workspace-pill">
            {t('module.m04.meta.linearIndex')}: k = {compressedIndex}
          </span>
        </div>

        <div className="storage-layout">
          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m04.view.matrix')}</strong>
              <span>{t('module.m04.view.matrixHint')}</span>
            </div>

            <div className="graph-matrix-scroll">
              <table className="graph-matrix storage-matrix-table">
                <thead>
                  <tr>
                    <th aria-label={t('module.g01.matrix.corner')} />
                    {preset.values[0]?.map((_, colIndex) => (
                      <th key={`m04-head-${colIndex}`}>j={colIndex}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preset.values.map((row, rowIndex) => (
                    <tr key={`m04-row-${rowIndex}`}>
                      <th>i={rowIndex}</th>
                      {row.map((value, colIndex) => {
                        const isSelected = rowIndex === selectedRow && colIndex === selectedCol;
                        const isStored = storedInfo.kind === 'stored' && rowIndex === storedInfo.row && colIndex === storedInfo.col;
                        const isStoredZone = isLowerStoredCell(rowIndex, colIndex);
                        const isConstantZone = !isStoredZone;
                        const isDiagonal = rowIndex === colIndex;
                        const displayValue = isConstantZone ? 'c' : value;
                        return (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className={`${isSelected ? ' storage-matrix-cell-target' : ''}${isStored ? ' storage-matrix-cell-stored' : ''}${
                              isStoredZone ? ' storage-matrix-cell-kept-half' : ''
                            }${isConstantZone ? ' storage-matrix-cell-zero-zone' : ''}${isDiagonal ? ' storage-matrix-cell-diagonal' : ''}${
                              isSelected && isConstantZone ? ' storage-matrix-cell-zero-target' : ''
                            } storage-matrix-cell-clickable`}
                          >
                            <button type="button" className="storage-matrix-cell-button" onClick={() => handleSelectCell(rowIndex, colIndex)}>
                              <span className="storage-matrix-value">{displayValue}</span>
                              <small>
                                [{rowIndex},{colIndex}]
                              </small>
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
              <strong>{t('module.m04.meta.formula')}</strong>
              <span>{t('module.m04.view.formulaHint')}</span>
            </div>

            <div className="storage-formula-stack">
              <div className="storage-formula-compact-grid">
                <div className="storage-formula-card">
                  <span>{t('module.m04.meta.target')}</span>
                  <strong>
                    a[{selectedRow}][{selectedCol}] = {selectedValue}
                  </strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m04.meta.storedCell')}</span>
                  <strong>
                    {isConstantZoneTarget ? t('module.m04.meta.constantCell') : `a[${selectedRow}][${selectedCol}] = ${selectedValue}`}
                  </strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m04.meta.zoneType')}</span>
                  <strong>{isConstantZoneTarget ? t('module.m04.meta.constantZone') : t('module.m04.meta.storedZone')}</strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m04.meta.linearIndex')}</span>
                  <strong>
                    {isConstantZoneTarget ? `${constantSlotIndex} = ${compressedIndex}` : `${preservedBeforeCount} + ${currentRowOffset} = ${compressedIndex}`}
                  </strong>
                </div>
              </div>

              <div className={`storage-formula-card${isConstantZoneTarget ? ' storage-formula-card-accent' : ''}`}>
                <span>{t('module.m04.meta.counting')}</span>
                <strong>{isConstantZoneTarget ? t('module.m04.meta.constantRule') : t('module.m04.meta.countingRule')}</strong>
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
              <strong>{t('module.m04.view.linear')}</strong>
              <span>{t('module.m04.view.linearHint')}</span>
            </div>

            <div className="storage-memory-table-wrap">
              <table className="storage-memory-table">
                <tbody>
                  {compressedValues.map((item, index) => {
                    const isSelected = index === compressedIndex;
                    const address = BASE_ADDRESS + index * ADDRESS_STEP;
                    return (
                      <tr key={`${index}-${item.label}`} className={isSelected ? 'storage-memory-row-active' : undefined}>
                        <td className="storage-memory-address-cell">{address}</td>
                        <td className={isSelected ? 'storage-memory-value-cell storage-memory-value-cell-active' : 'storage-memory-value-cell'}>
                          {item.value}
                        </td>
                        <td className="storage-memory-source-cell">{item.label}</td>
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
