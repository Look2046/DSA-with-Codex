import { useMemo, useState } from 'react';
import { StaticWorkbenchShell } from '../../components/StaticWorkbenchShell';
import { useStagePan } from '../../hooks/useStagePan';
import { useI18n } from '../../i18n/useI18n';
import {
  createTreeDefinitionSample,
  getChildIndexes,
  getLeafCount,
  getNodeDegree,
  getNodeLevel,
  getNodeRole,
  getParentIndex,
  getSiblingIndexes,
  getTreeHeight,
  type TreeDefinitionKind,
} from '../../modules/tree/treeDefinition';

type Copy = {
  title: string;
  body: string;
  stage: string;
  graphCanvas: string;
  info: string;
  relationTitle: string;
  general: string;
  binary: string;
  complete: string;
  full: string;
  shape: string;
  generateRandom: string;
  nodeCount: string;
  edgeCount: string;
  height: string;
  leafCount: string;
  selectedNode: string;
  parent: string;
  children: string;
  siblings: string;
  level: string;
  degree: string;
  role: string;
  root: string;
  leaf: string;
  internal: string;
  none: string;
  definitions: string[];
  binaryDefinitions: string[];
  generalDefinitions: string[];
};

const COPY: Record<'zh' | 'en', Copy> = {
  zh: {
    title: 'T-01 树的定义与基本关系',
    body: '本页先讲树的定义、父子兄弟关系、层次与度，不进入遍历或其他算法过程。',
    stage: '树定义教学画布',
    graphCanvas: '树形样本',
    info: '定义与说明',
    relationTitle: '当前节点关系',
    general: '普通树',
    binary: '二叉树',
    complete: '完全二叉树',
    full: '满二叉树',
    shape: '形态',
    generateRandom: '随机生成',
    nodeCount: '结点数',
    edgeCount: '边数',
    height: '层数',
    leafCount: '叶子数',
    selectedNode: '当前结点',
    parent: '双亲',
    children: '孩子',
    siblings: '兄弟',
    level: '层次',
    degree: '度',
    role: '类型',
    root: '根结点',
    leaf: '叶子结点',
    internal: '分支结点',
    none: '无',
    definitions: [
      '树是 n 个结点的有限集合。当 n = 0 时称为空树；当 n > 0 时，树由一个根结点和若干棵互不相交的子树组成。',
      '根结点没有双亲，根以外的每个结点有且仅有一个双亲。这个限制让树不会出现回路，也不会让一个结点同时归属于两个父结点。',
      '从某个结点直接向下连接的结点叫它的孩子；同一双亲下的孩子互称兄弟。观察当前结点时，双亲、孩子、兄弟是最基本的局部关系。',
      '没有孩子的结点叫叶子结点，也称终端结点；至少有一个孩子的结点叫分支结点，也称非终端结点。',
      '结点的度是它拥有的孩子个数；树的度是所有结点度的最大值。普通树的结点度不固定，二叉树的结点度最大为 2。',
      '结点的层次从根开始计为第 1 层，孩子结点层次比双亲多 1。树的层数等于所有结点层次中的最大值。',
      '从根到某个结点经过的边构成路径，路径上边的条数常称为路径长度。树中任意两个结点之间只有一条简单路径。',
      '森林是若干棵互不相交的树的集合。删去一棵树的根结点后，根的每一棵子树就组成一个森林。',
      '树适合表示具有层级归属关系的数据，例如目录、组织结构、表达式语法树和各种索引结构。',
    ],
    generalDefinitions: [
      '普通树中，一个结点的孩子个数不固定，可以是 0 个、1 个或多个；本页的“随机生成”会在普通树范围内生成新的样本。',
    ],
    binaryDefinitions: [
      '二叉树中，每个结点最多只有两个孩子，通常明确区分左孩子和右孩子；只有一个孩子时，也要说明它是左孩子还是右孩子。',
      '满二叉树要求每个分支结点都有两个孩子；完全二叉树要求除最后一层外其余层都满，最后一层从左到右连续排列。',
      '二叉树是树的一种特殊情形，后续遍历、堆、二叉搜索树、AVL 树等模块都会建立在它之上。',
    ],
  },
  en: {
    title: 'T-01 Tree Definition and Basic Relations',
    body: 'This page introduces tree definition, parent/child/sibling relations, levels, and degree before any traversal or algorithm playback.',
    stage: 'Tree-definition teaching stage',
    graphCanvas: 'Tree sample',
    info: 'Definition & Notes',
    relationTitle: 'Current Node Relations',
    general: 'General Tree',
    binary: 'Binary Tree',
    complete: 'Complete Binary Tree',
    full: 'Full Binary Tree',
    shape: 'Shape',
    generateRandom: 'Randomize',
    nodeCount: 'Nodes',
    edgeCount: 'Edges',
    height: 'Levels',
    leafCount: 'Leaves',
    selectedNode: 'Selected node',
    parent: 'Parent',
    children: 'Children',
    siblings: 'Siblings',
    level: 'Level',
    degree: 'Degree',
    role: 'Role',
    root: 'Root',
    leaf: 'Leaf',
    internal: 'Internal',
    none: 'None',
    definitions: [
      'A tree is a finite set of nodes. When n = 0 it is empty; when n > 0 it consists of one root and several disjoint subtrees.',
      'The root has no parent, and every non-root node has exactly one parent. This prevents cycles and shared parent ownership.',
      'Direct descendants are children, and nodes with the same parent are siblings. These local relations are the first thing to inspect around a selected node.',
      'A node without children is a leaf; a node with at least one child is an internal node.',
      'The degree of a node is its number of children; the degree of a tree is the maximum node degree. General trees do not fix this degree in advance.',
      'Levels start from the root as level 1, and each child is one level below its parent. The largest level shown by any node is the tree height on this page.',
      'The edges from the root to a node form a path. In a tree, any two nodes are connected by exactly one simple path.',
      'A forest is a set of disjoint trees. Removing the root of a non-empty tree leaves a forest of the root subtrees.',
      'Trees are used for hierarchical data such as folders, organizations, expression trees, and indexes.',
    ],
    generalDefinitions: ['In a general tree, a node may have zero, one, or many children; Randomize generates another general-tree sample.'],
    binaryDefinitions: [
      'In a binary tree, each node has at most two children, usually distinguished as left and right.',
      'A full binary tree gives every internal node exactly two children; a complete binary tree fills all levels except possibly the last, and the last level is filled from left to right.',
      'Binary trees are a special case of trees and support later modules such as traversal, heaps, BST, and AVL.',
    ],
  },
};

function renderNodeList(indexes: number[], labels: string[]) {
  if (indexes.length === 0) {
    return '∅';
  }

  return indexes.map((index) => labels[index] ?? '').join(', ');
}

export function TreeDefinitionPage() {
  const { language } = useI18n();
  const copy = COPY[language];
  const [kind, setKind] = useState<TreeDefinitionKind>('general');
  const [randomSeed, setRandomSeed] = useState(1);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);
  const samplePan = useStagePan();

  const sample = useMemo(() => createTreeDefinitionSample(kind, randomSeed), [kind, randomSeed]);
  const kindOptions = useMemo(
    () =>
      [
        { value: 'general', label: copy.general },
        { value: 'binary', label: copy.binary },
        { value: 'complete', label: copy.complete },
        { value: 'full', label: copy.full },
      ] satisfies Array<{ value: TreeDefinitionKind; label: string }>,
    [copy.binary, copy.complete, copy.full, copy.general],
  );
  const nodeLabels = useMemo(() => sample.nodes.map((node) => node.id), [sample.nodes]);
  const selectedNode = sample.nodes[selectedNodeIndex] ?? sample.nodes[0];
  const parentIndex = getParentIndex(sample, selectedNode.index);
  const childIndexes = getChildIndexes(sample, selectedNode.index);
  const siblingIndexes = getSiblingIndexes(sample, selectedNode.index);
  const nodeLevel = getNodeLevel(sample, selectedNode.index);
  const nodeDegree = getNodeDegree(sample, selectedNode.index);
  const nodeRole = getNodeRole(sample, selectedNode.index);
  const noteItems = useMemo(
    () => [...copy.definitions, ...(kind === 'binary' || kind === 'complete' || kind === 'full' ? copy.binaryDefinitions : copy.generalDefinitions)],
    [copy.binaryDefinitions, copy.definitions, copy.generalDefinitions, kind],
  );
  const highlightedEdgeIds = useMemo(() => {
    const edgeIds = new Set<string>();
    sample.edges.forEach((edge) => {
      if (edge.from === selectedNode.index || edge.to === selectedNode.index) {
        edgeIds.add(edge.id);
      }
    });
    return edgeIds;
  }, [sample.edges, selectedNode.index]);

  const roleLabel =
    nodeRole === 'root' ? copy.root : nodeRole === 'leaf' ? copy.leaf : nodeRole === 'internal' ? copy.internal : copy.none;
  const handleKindChange = (nextKind: TreeDefinitionKind) => {
    setKind(nextKind);
    setSelectedNodeIndex(0);
    if (nextKind !== 'general') {
      setRandomSeed(1);
    }
  };

  const handleRandomize = () => {
    setSelectedNodeIndex(0);
    setRandomSeed((previous) => previous + 1);
  };

  return (
    <StaticWorkbenchShell
      title={copy.title}
      description={copy.body}
      stageAriaLabel={copy.stage}
      pageClassName="array-page tree-page storage-page tree-definition-page"
      shellClassName="tree-definition-workbench-shell"
      enableStagePan={false}
      controlsContent={
        <div className="tree-definition-toolbar">
          <div className="tree-definition-toolbar-row">
            <label className="tree-workspace-field tree-definition-kind-field" htmlFor="tree-definition-kind">
              <select
                id="tree-definition-kind"
                value={kind}
                aria-label={copy.shape}
                onChange={(event) => handleKindChange(event.target.value as TreeDefinitionKind)}
              >
                {kindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" className="tree-workspace-ghost-button tree-definition-random-button" onClick={handleRandomize}>
              {copy.generateRandom}
            </button>

            <div className="tree-definition-control-summary">
              <span className="tree-workspace-pill">
                {copy.nodeCount}: {sample.nodes.length}
              </span>
              <span className="tree-workspace-pill">
                {copy.edgeCount}: {sample.edges.length}
              </span>
              <span className="tree-workspace-pill">
                {copy.height}: {getTreeHeight(sample)}
              </span>
              <span className="tree-workspace-pill">
                {copy.leafCount}: {getLeafCount(sample)}
              </span>
            </div>
          </div>
        </div>
      }
      stageContent={
        <div className="tree-definition-layout">
          <section className="graph-stage-view-card tree-definition-stage-panel">
            <div className="graph-stage-view-head">
              <strong>{copy.graphCanvas}</strong>
            </div>

            <div className="tree-definition-stage" data-sample-panning={samplePan.isPanning ? 'true' : 'false'} {...samplePan.panHandlers}>
              <div className="tree-definition-pan-layer" style={samplePan.panStyle}>
                <svg className="tree-definition-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={copy.graphCanvas}>
                  {sample.edges.map((edge) => {
                    const from = sample.nodes[edge.from];
                    const to = sample.nodes[edge.to];
                    const isHighlighted = highlightedEdgeIds.has(edge.id);
                    return (
                      <path
                        key={edge.id}
                        d={`M ${from?.x ?? 0} ${from?.y ?? 0} L ${to?.x ?? 0} ${to?.y ?? 0}`}
                        className={`tree-definition-edge${isHighlighted ? ' tree-definition-edge-highlighted' : ''}`}
                      />
                    );
                  })}
                </svg>

                <div className="graph-concept-node-layer">
                  {sample.nodes.map((node) => {
                    const isSelected = selectedNode.index === node.index;
                    const isRelated =
                      childIndexes.includes(node.index) || siblingIndexes.includes(node.index) || parentIndex === node.index;

                    return (
                      <button
                        key={node.id}
                        type="button"
                        className={`graph-concept-node tree-definition-node${isSelected ? ' graph-concept-node-selected' : ''}${
                          isRelated ? ' tree-definition-node-related' : ''
                        }`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onClick={() => setSelectedNodeIndex(node.index)}
                        onMouseEnter={() => setHoveredNodeIndex(node.index)}
                        onMouseLeave={() => setHoveredNodeIndex((previous) => (previous === node.index ? null : previous))}
                      >
                        <span className="graph-concept-node-id">{node.id}</span>
                        <span className="graph-concept-node-index">{node.index}</span>
                        {isSelected && hoveredNodeIndex === node.index ? (
                          <span className="tree-definition-tooltip">
                            <strong>{node.id}</strong>
                            <span>
                              {copy.role}: {roleLabel}
                            </span>
                            <span>
                              {copy.level}: {nodeLevel}
                            </span>
                            <span>
                              {copy.degree}: {nodeDegree}
                            </span>
                            <span>
                              {copy.parent}: {parentIndex === null ? copy.none : nodeLabels[parentIndex]}
                            </span>
                            <span>
                              {copy.children}: {renderNodeList(childIndexes, nodeLabels)}
                            </span>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="tree-definition-right">
            <section className="graph-stage-view-card tree-definition-relation-panel">
              <div className="graph-stage-view-head">
                <strong>{copy.relationTitle}</strong>
              </div>

              <dl className="tree-definition-kv">
                <div>
                  <dt>{copy.selectedNode}</dt>
                  <dd>{selectedNode.id}</dd>
                </div>
                <div>
                  <dt>{copy.role}</dt>
                  <dd>{roleLabel}</dd>
                </div>
                <div>
                  <dt>{copy.parent}</dt>
                  <dd>{parentIndex === null ? copy.none : nodeLabels[parentIndex]}</dd>
                </div>
                <div>
                  <dt>{copy.children}</dt>
                  <dd>{renderNodeList(childIndexes, nodeLabels)}</dd>
                </div>
                <div>
                  <dt>{copy.siblings}</dt>
                  <dd>{renderNodeList(siblingIndexes, nodeLabels)}</dd>
                </div>
                <div>
                  <dt>{copy.level}</dt>
                  <dd>{nodeLevel}</dd>
                </div>
                <div>
                  <dt>{copy.degree}</dt>
                  <dd>{nodeDegree}</dd>
                </div>
              </dl>
            </section>

            <section className="graph-stage-view-card tree-definition-info-panel">
              <div className="graph-stage-view-head">
                <strong>{copy.info}</strong>
              </div>

              <div className="tree-definition-info-stack">
                <div className="tree-definition-copy-columns">
                  {noteItems.map((item, itemIndex) => {
                    const order = itemIndex + 1;
                    return (
                      <p
                        key={item}
                        className={`tree-definition-paragraph${
                          order % 2 === 1 ? ' tree-definition-paragraph-odd' : ' tree-definition-paragraph-even'
                        }`}
                      >
                        <span className="tree-definition-paragraph-number">{order}.</span>
                        <span>{item}</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>
      }
    />
  );
}
