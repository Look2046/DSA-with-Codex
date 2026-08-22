import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import {
  buildSparseMatrixRowChains,
  getSparseMatrixLinkedNodeInfo,
  getSparseMatrixLinkedPreset,
  getSparseMatrixLinkedPresetIds,
  isValidSparseMatrixLinkedTarget,
  type SparseMatrixLinkedPresetId,
} from '../../modules/storage/sparseMatrixLinked';

const DEFAULT_PRESET: SparseMatrixLinkedPresetId = 'sparse-5x6';
const DEFAULT_ROW = 1;
const DEFAULT_COL = 0;

function getPresetLabel(
  presetId: SparseMatrixLinkedPresetId,
  t: ReturnType<typeof useI18n>['t'],
): string {
  return presetId === 'sparse-5x6' ? t('module.m06.preset.5x6') : t('module.m06.preset.6x6');
}

export function SparseMatrixLinkedPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<SparseMatrixLinkedPresetId>(DEFAULT_PRESET);
  const [selectedRow, setSelectedRow] = useState(DEFAULT_ROW);
  const [selectedCol, setSelectedCol] = useState(DEFAULT_COL);

  const preset = useMemo(() => getSparseMatrixLinkedPreset(presetId), [presetId]);
  const presetOptions = useMemo(() => getSparseMatrixLinkedPresetIds(), []);
  const rowChains = useMemo(() => buildSparseMatrixRowChains(preset.values), [preset.values]);
  const selectedValue = preset.values[selectedRow]?.[selectedCol] ?? 0;
  const nodeInfo = getSparseMatrixLinkedNodeInfo(preset.values, selectedRow, selectedCol);
  const isStoredCell = nodeInfo.kind === 'stored';
  const activeRow = rowChains[selectedRow];
  const rowStatusText = activeRow?.nodes.length
    ? `${t('module.m06.meta.rowNodeCount')}: ${activeRow.nodes.length}`
    : t('module.m06.meta.emptyRow');

  const handleSelectCell = (rowIndex: number, colIndex: number) => {
    if (!isValidSparseMatrixLinkedTarget(preset, rowIndex, colIndex)) {
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
        <h2>{t('module.m06.title')}</h2>
        <p>{t('module.m06.body')}</p>
      </div>

      <section className="storage-workbench" aria-label={t('module.m06.stage')}>
        <div className="storage-toolbar">
          <label className="tree-workspace-field" htmlFor="m06-preset">
            <span>{t('module.m06.input.preset')}</span>
            <select
              id="m06-preset"
              value={presetId}
              onChange={(event) => {
                const nextPresetId = event.target.value as SparseMatrixLinkedPresetId;
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
            {t('module.m06.meta.shape')}: {preset.rowCount} x {preset.colCount}
          </span>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('module.m06.meta.target')}: a[{selectedRow}][{selectedCol}] = {selectedValue}
          </span>
          <span className={isStoredCell ? 'tree-workspace-pill' : 'tree-workspace-pill tree-workspace-pill-warning'}>
            {isStoredCell ? t('module.m06.meta.nonZero') : t('module.m06.meta.zero')}
          </span>
          <span className="tree-workspace-pill">{rowStatusText}</span>
        </div>

        <div className="storage-layout">
          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m06.view.matrix')}</strong>
              <span>{t('module.m06.view.matrixHint')}</span>
            </div>

            <div className="graph-matrix-scroll">
              <table className="graph-matrix storage-matrix-table">
                <thead>
                  <tr>
                    <th aria-label={t('module.g01.matrix.corner')} />
                    {preset.values[0]?.map((_, colIndex) => (
                      <th key={`m06-head-${colIndex}`}>j={colIndex}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preset.values.map((row, rowIndex) => (
                    <tr key={`m06-row-${rowIndex}`}>
                      <th>i={rowIndex}</th>
                      {row.map((value, colIndex) => {
                        const isSelected = rowIndex === selectedRow && colIndex === selectedCol;
                        const isNonZero = value !== 0;
                        return (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className={`${isSelected ? ' storage-matrix-cell-target' : ''}${
                              isNonZero ? ' storage-matrix-cell-stored' : ' storage-matrix-cell-sparse-zero'
                            }${isStoredCell && isSelected ? ' storage-matrix-cell-sparse-nonzero-target' : ''} storage-matrix-cell-clickable`}
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
              <strong>{t('module.m06.meta.rule')}</strong>
              <span>{t('module.m06.view.ruleHint')}</span>
            </div>

            <div className="storage-formula-stack">
              <div className="storage-formula-compact-grid">
                <div className="storage-formula-card">
                  <span>{t('module.m06.meta.target')}</span>
                  <strong>
                    a[{selectedRow}][{selectedCol}] = {selectedValue}
                  </strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m06.meta.rowHead')}</span>
                  <strong>r{selectedRow}</strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m06.meta.rowChain')}</span>
                  <strong>
                    {isStoredCell
                      ? `(${selectedRow}, ${selectedCol}, ${selectedValue})`
                      : t('module.m06.meta.notStored')}
                  </strong>
                </div>

                <div className="storage-formula-card">
                  <span>{t('module.m06.meta.next')}</span>
                  <strong>
                    {nodeInfo.kind === 'stored'
                      ? nodeInfo.next
                        ? `(${nodeInfo.next.row}, ${nodeInfo.next.col}, ${nodeInfo.next.value})`
                        : 'NULL'
                      : t('module.m06.meta.notStored')}
                  </strong>
                </div>
              </div>

              <div className={`storage-formula-card${isStoredCell ? '' : ' storage-formula-card-accent'}`}>
                <span>{t('module.m06.meta.rule')}</span>
                <strong>{isStoredCell ? t('module.m06.meta.storeRule') : t('module.m06.meta.skipRule')}</strong>
                <p className="storage-formula-explainer">
                  {isStoredCell
                    ? t('module.m06.explain.nonZero')
                    : t('module.m06.explain.zero')}
                </p>
              </div>

              <div className="storage-formula-main">
                <code>{`rowHead[${selectedRow}] -> ${activeRow?.nodes.length ? 'first node' : 'NULL'}`}</code>
                <code>
                  {nodeInfo.kind === 'stored'
                    ? `node = (${nodeInfo.row}, ${nodeInfo.col}, ${nodeInfo.value}, next)`
                    : '0-valued cells do not create linked nodes'}
                </code>
              </div>
            </div>
          </section>

          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m06.view.linked')}</strong>
              <span>{t('module.m06.view.linkedHint')}</span>
            </div>

            <div className="storage-linked-board">
              {rowChains.map((chain) => {
                const isActiveRow = chain.row === selectedRow;
                return (
                  <div
                    key={`row-chain-${chain.row}`}
                    className={`storage-linked-row${isActiveRow ? ' storage-linked-row-active' : ''}`}
                  >
                    <div className="storage-linked-head">
                      <span className="storage-linked-head-label">r{chain.row}</span>
                    </div>
                    <span className="storage-linked-arrow">→</span>
                    {chain.nodes.length === 0 ? (
                      <span className="storage-linked-null">NULL</span>
                    ) : (
                      <>
                        {chain.nodes.map((node, index) => {
                          const isNodeActive =
                            node.row === selectedRow && node.col === selectedCol && isStoredCell;
                          const isNextActive =
                            nodeInfo.kind === 'stored' &&
                            nodeInfo.next?.row === node.row &&
                            nodeInfo.next?.col === node.col;
                          return (
                            <div key={`${node.row}-${node.col}`} className="storage-linked-node-group">
                              <div
                                className={`storage-linked-node${
                                  isNodeActive ? ' storage-linked-node-active' : ''
                                }${isNextActive ? ' storage-linked-node-next' : ''}`}
                              >
                                ({node.row},{node.col},{node.value})
                              </div>
                              <span className="storage-linked-arrow">
                                {index === chain.nodes.length - 1 ? '→' : '→'}
                              </span>
                            </div>
                          );
                        })}
                        <span className="storage-linked-null">NULL</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}
