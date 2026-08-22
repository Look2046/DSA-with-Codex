import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import {
  flattenMatrixByOrder,
  getLinearIndexByOrder,
  getPrefixCountByOrder,
  getTwoDimensionalArrayPreset,
  getTwoDimensionalArrayPresetIds,
  isValidTarget,
  type TwoDimensionalArrayPresetId,
  type TwoDimensionalArrayStorageOrder,
} from '../../modules/storage/twoDimensionalArray';

const DEFAULT_PRESET: TwoDimensionalArrayPresetId = 'matrix-3x4';
const DEFAULT_ROW = 1;
const DEFAULT_COL = 2;
const BASE_ADDRESS = 1000;
const ADDRESS_STEP = 4;

function getPresetLabel(presetId: TwoDimensionalArrayPresetId, t: ReturnType<typeof useI18n>['t']): string {
  return presetId === 'matrix-3x4' ? t('module.m01.preset.3x4') : t('module.m01.preset.4x4');
}

export function TwoDimensionalArrayPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<TwoDimensionalArrayPresetId>(DEFAULT_PRESET);
  const [selectedRow, setSelectedRow] = useState(DEFAULT_ROW);
  const [selectedCol, setSelectedCol] = useState(DEFAULT_COL);
  const [storageOrder, setStorageOrder] = useState<TwoDimensionalArrayStorageOrder>('row-major');

  const preset = useMemo(() => getTwoDimensionalArrayPreset(presetId), [presetId]);
  const presetOptions = useMemo(() => getTwoDimensionalArrayPresetIds(), []);

  const linearValues = useMemo(() => flattenMatrixByOrder(preset.values, storageOrder), [preset.values, storageOrder]);
  const linearIndex = getLinearIndexByOrder(
    selectedRow,
    selectedCol,
    preset.rowCount,
    preset.colCount,
    storageOrder,
  );
  const selectedValue = preset.values[selectedRow]?.[selectedCol] ?? '-';
  const prefixCount = getPrefixCountByOrder(selectedRow, selectedCol, preset.rowCount, preset.colCount, storageOrder);
  const outerFactor = storageOrder === 'row-major' ? preset.colCount : preset.rowCount;
  const leadingDimensionLabel = storageOrder === 'row-major' ? t('module.m01.meta.rowPrefix') : t('module.m01.meta.colPrefix');
  const trailingDimensionLabel = storageOrder === 'row-major' ? t('module.m01.meta.colOffset') : t('module.m01.meta.rowOffset');
  const leadingValue = storageOrder === 'row-major' ? selectedRow : selectedCol;
  const trailingValue = storageOrder === 'row-major' ? selectedCol : selectedRow;
  const storageRuleText = storageOrder === 'row-major' ? t('module.m01.sample.rowMajor') : t('module.m01.sample.columnMajor');
  const formulaText = storageOrder === 'row-major' ? 'k = i * cols + j' : 'k = j * rows + i';
  const expansionText = `k = ${leadingValue} * ${outerFactor} + ${trailingValue} = ${linearIndex}`;

  const handleSelectCell = (rowIndex: number, colIndex: number) => {
    if (!isValidTarget(preset, rowIndex, colIndex)) {
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
        <h2>{t('module.m01.title')}</h2>
        <p>{t('module.m01.body')}</p>
      </div>

      <section className="storage-workbench" aria-label={t('module.m01.stage')}>
        <div className="storage-toolbar">
          <label className="tree-workspace-field" htmlFor="m01-preset">
            <span>{t('module.m01.input.preset')}</span>
            <select
              id="m01-preset"
              value={presetId}
              onChange={(event) => {
                const nextPresetId = event.target.value as TwoDimensionalArrayPresetId;
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
            <span>{t('module.m01.input.order')}</span>
            <div className="tree-workspace-toggle-row">
              <button
                type="button"
                className={`tree-workspace-toggle${storageOrder === 'row-major' ? ' tree-workspace-toggle-active' : ''}`}
                onClick={() => setStorageOrder('row-major')}
              >
                {t('module.m01.order.rowMajor')}
              </button>
              <button
                type="button"
                className={`tree-workspace-toggle${storageOrder === 'column-major' ? ' tree-workspace-toggle-active' : ''}`}
                onClick={() => setStorageOrder('column-major')}
              >
                {t('module.m01.order.columnMajor')}
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
            {t('module.m01.meta.shape')}: {preset.rowCount} x {preset.colCount}
          </span>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('module.m01.meta.target')}: a[{selectedRow}][{selectedCol}] = {selectedValue}
          </span>
          <span className="tree-workspace-pill">{storageOrder === 'row-major' ? t('module.m01.order.rowMajor') : t('module.m01.order.columnMajor')}</span>
          <span className="tree-workspace-pill">
            {t('module.m01.meta.linearIndex')}: k = {linearIndex}
          </span>
        </div>

        <div className="storage-layout">
          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m01.view.matrix')}</strong>
              <span>{t('module.m01.view.matrixHint')}</span>
            </div>

            <div className="graph-matrix-scroll">
              <table className="graph-matrix storage-matrix-table">
                <thead>
                  <tr>
                    <th aria-label={t('module.g01.matrix.corner')} />
                    {preset.values[0]?.map((_, colIndex) => (
                      <th key={`head-${colIndex}`}>j={colIndex}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preset.values.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      <th>i={rowIndex}</th>
                      {row.map((value, colIndex) => {
                        const isSelected = rowIndex === selectedRow && colIndex === selectedCol;
                        return (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className={isSelected ? 'storage-matrix-cell-target storage-matrix-cell-clickable' : 'storage-matrix-cell-clickable'}
                          >
                            <button type="button" className="storage-matrix-cell-button" onClick={() => handleSelectCell(rowIndex, colIndex)}>
                              <span className="storage-matrix-value">{value}</span>
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
              <strong>{t('module.m01.meta.formula')}</strong>
              <span>{storageRuleText}</span>
            </div>

            <div className="storage-formula-stack">
              <div className="storage-formula-card">
                <span>{t('module.m01.meta.target')}</span>
                <strong>
                  a[{selectedRow}][{selectedCol}] = {selectedValue}
                </strong>
              </div>

              <div className="storage-formula-card">
                <span>{leadingDimensionLabel}</span>
                <strong>
                  {leadingValue} x {outerFactor} = {leadingValue * outerFactor}
                </strong>
              </div>

              <div className="storage-formula-card">
                <span>{trailingDimensionLabel}</span>
                <strong>
                  {prefixCount - trailingValue} + {trailingValue} = {linearIndex}
                </strong>
              </div>

              <div className="storage-formula-main">
                <code>{formulaText}</code>
                <code>{expansionText}</code>
              </div>

              <ol className="storage-formula-steps">
                <li>{t('module.m01.code.line1')}</li>
                <li>{t('module.m01.code.line2')}</li>
                <li>{storageOrder === 'row-major' ? t('module.m01.code.rowMajor.line3') : t('module.m01.code.columnMajor.line3')}</li>
                <li>{storageOrder === 'row-major' ? t('module.m01.code.rowMajor.line4') : t('module.m01.code.columnMajor.line4')}</li>
                <li>{t('module.m01.code.line5')}</li>
              </ol>
            </div>
          </section>

          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m01.view.linear')}</strong>
              <span>{t('module.m01.view.linearHint')}</span>
            </div>

            <div className="storage-memory-table-wrap">
              <table className="storage-memory-table">
                <tbody>
                  {linearValues.map((value, index) => {
                    const isSelected = index === linearIndex;
                    const address = BASE_ADDRESS + index * ADDRESS_STEP;
                    return (
                      <tr key={`${index}-${value}`} className={isSelected ? 'storage-memory-row-active' : undefined}>
                        <td className="storage-memory-address-cell">{address}</td>
                        <td className={isSelected ? 'storage-memory-value-cell storage-memory-value-cell-active' : 'storage-memory-value-cell'}>
                          {value}
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
