import { useMemo, useState } from 'react';
import { StaticWorkbenchShell } from '../../components/StaticWorkbenchShell';
import { useI18n } from '../../i18n/useI18n';
import {
  flattenSparseMatrixTriples,
  getSparseMatrixNonZeroCount,
  getSparseMatrixTripleIndex,
  getSparseMatrixTriplesPreset,
  getSparseMatrixTriplesPresetIds,
  isValidSparseMatrixTarget,
  type SparseMatrixTriplesPresetId,
} from '../../modules/storage/sparseMatrixTriples';

const DEFAULT_PRESET: SparseMatrixTriplesPresetId = 'sparse-5x6';
const DEFAULT_ROW = 2;
const DEFAULT_COL = 3;

function getPresetLabel(
  presetId: SparseMatrixTriplesPresetId,
  t: ReturnType<typeof useI18n>['t'],
): string {
  return presetId === 'sparse-5x6' ? t('module.m05.preset.5x6') : t('module.m05.preset.6x6');
}

export function SparseMatrixTriplesPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<SparseMatrixTriplesPresetId>(DEFAULT_PRESET);
  const [selectedRow, setSelectedRow] = useState(DEFAULT_ROW);
  const [selectedCol, setSelectedCol] = useState(DEFAULT_COL);

  const preset = useMemo(() => getSparseMatrixTriplesPreset(presetId), [presetId]);
  const presetOptions = useMemo(() => getSparseMatrixTriplesPresetIds(), []);
  const triples = useMemo(() => flattenSparseMatrixTriples(preset.values), [preset.values]);
  const nonZeroCount = getSparseMatrixNonZeroCount(preset.values);
  const selectedValue = preset.values[selectedRow]?.[selectedCol] ?? 0;
  const tripleIndex = getSparseMatrixTripleIndex(preset.values, selectedRow, selectedCol);
  const isStoredCell = tripleIndex >= 0;
  const headerText = `(${preset.rowCount}, ${preset.colCount}, ${nonZeroCount})`;
  const statusText = isStoredCell ? t('module.m05.meta.nonZero') : t('module.m05.meta.zero');
  const tripletText = isStoredCell
    ? `(${selectedRow}, ${selectedCol}, ${selectedValue})`
    : t('module.m05.meta.notStored');
  const explanationText = isStoredCell
    ? t('module.m05.explain.nonZero')
    : t('module.m05.explain.zero');

  const handleSelectCell = (rowIndex: number, colIndex: number) => {
    if (!isValidSparseMatrixTarget(preset, rowIndex, colIndex)) {
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
    <StaticWorkbenchShell
      title={t('module.m05.title')}
      description={t('module.m05.body')}
      stageAriaLabel={t('module.m05.stage')}
      pageClassName="array-page tree-page storage-page"
      shellClassName="storage-workbench-shell"
      controlsContent={
        <div className="storage-toolbar">
          <label className="tree-workspace-field" htmlFor="m05-preset">
            <span>{t('module.m05.input.preset')}</span>
            <select
              id="m05-preset"
              value={presetId}
              onChange={(event) => {
                const nextPresetId = event.target.value as SparseMatrixTriplesPresetId;
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
      }
      stageMeta={
        <div className="storage-summary-strip">
          <span className="tree-workspace-pill">
            {t('module.m05.meta.shape')}: {preset.rowCount} x {preset.colCount}
          </span>
          <span className="tree-workspace-pill">
            {t('module.m05.meta.header')}: {headerText}
          </span>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('module.m05.meta.target')}: a[{selectedRow}][{selectedCol}] = {selectedValue}
          </span>
          <span className={isStoredCell ? 'tree-workspace-pill' : 'tree-workspace-pill tree-workspace-pill-warning'}>
            {statusText}
          </span>
        </div>
      }
      stageContent={
        <div className="storage-layout">
          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m05.view.matrix')}</strong>
              <span>{t('module.m05.view.matrixHint')}</span>
            </div>

            <div className="graph-matrix-scroll">
              <table className="graph-matrix storage-matrix-table">
                <thead>
                  <tr>
                    <th aria-label={t('module.g01.matrix.corner')} />
                    {preset.values[0]?.map((_, colIndex) => (
                      <th key={`m05-head-${colIndex}`}>j={colIndex}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preset.values.map((row, rowIndex) => (
                    <tr key={`m05-row-${rowIndex}`}>
                      <th>i={rowIndex}</th>
                      {row.map((value, colIndex) => {
                        const isSelected = rowIndex === selectedRow && colIndex === selectedCol;
                        const isNonZero = value !== 0;
                        const isTripleTarget = isStoredCell && rowIndex === selectedRow && colIndex === selectedCol;
                        return (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className={`${isSelected ? ' storage-matrix-cell-target' : ''}${
                              isNonZero ? ' storage-matrix-cell-stored' : ' storage-matrix-cell-sparse-zero'
                            }${isTripleTarget ? ' storage-matrix-cell-sparse-nonzero-target' : ''} storage-matrix-cell-clickable`}
                          >
                            <button
                              type="button"
                              className="storage-matrix-cell-button"
                              onClick={() => handleSelectCell(rowIndex, colIndex)}
                            >
                              <span className="storage-matrix-value">{value}</span>
                              <small>[{rowIndex},{colIndex}]</small>
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
              <strong>{t('module.m05.meta.rule')}</strong>
              <span>{t('module.m05.view.ruleHint')}</span>
            </div>

            <div className="storage-formula-stack">
              <div className="storage-formula-compact-grid">
                <div className="storage-formula-card">
                  <span>{t('module.m05.meta.target')}</span>
                  <strong>
                    a[{selectedRow}][{selectedCol}] = {selectedValue}
                  </strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m05.meta.valueType')}</span>
                  <strong>{statusText}</strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m05.meta.triple')}</span>
                  <strong>{tripletText}</strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m05.meta.header')}</span>
                  <strong>{headerText}</strong>
                </div>
              </div>

              <div className={`storage-formula-card${isStoredCell ? '' : ' storage-formula-card-accent'}`}>
                <span>{t('module.m05.meta.rule')}</span>
                <strong>{isStoredCell ? t('module.m05.meta.storeRule') : t('module.m05.meta.skipRule')}</strong>
                <p className="storage-formula-explainer">{explanationText}</p>
              </div>

              <div className="storage-formula-main">
                <code>{t('module.m05.meta.header')}: {headerText}</code>
                <code>{isStoredCell ? `data = (${selectedRow}, ${selectedCol}, ${selectedValue})` : '0-valued cells do not enter data[]'}</code>
              </div>
            </div>
          </section>

          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m05.view.linear')}</strong>
              <span>{t('module.m05.view.linearHint')}</span>
            </div>

            <div className="storage-memory-table-wrap">
              <table className="storage-memory-table">
                <tbody>
                  {triples.map((item, index) => {
                    const isActive = index === tripleIndex;
                    return (
                      <tr key={`${index}-${item.row}-${item.col}`} className={isActive ? 'storage-memory-row-active' : undefined}>
                        <td className={isActive ? 'storage-memory-value-cell storage-memory-value-cell-active' : 'storage-memory-value-cell'}>
                          ({item.row}, {item.col}, {item.value})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      }
    />
  );
}
