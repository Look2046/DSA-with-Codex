import { Suspense, lazy, type ComponentType, type ReactElement } from 'react';
import { createHashRouter } from 'react-router-dom';
import { Layout } from './layout/Layout';

function lazyNamedPage<TModule extends Record<string, unknown>, TExportName extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TExportName,
): ReactElement {
  const LazyComponent = lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });

  return (
    <Suspense fallback={<div className="app-loading-state" role="status" aria-live="polite">Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: lazyNamedPage(() => import('../pages/HomePage'), 'HomePage') },
      { path: 'modules', element: lazyNamedPage(() => import('../pages/HomePage'), 'HomePage') },
      {
        path: 'modules/sorting',
        element: lazyNamedPage(() => import('../pages/SortingOverviewPage'), 'SortingOverviewPage'),
      },
      {
        path: 'modules/bubble-sort',
        element: lazyNamedPage(() => import('../pages/modules/BubbleSortPage'), 'BubbleSortPage'),
      },
      {
        path: 'modules/selection-sort',
        element: lazyNamedPage(() => import('../pages/modules/SelectionSortPage'), 'SelectionSortPage'),
      },
      {
        path: 'modules/insertion-sort',
        element: lazyNamedPage(() => import('../pages/modules/InsertionSortPage'), 'InsertionSortPage'),
      },
      {
        path: 'modules/shell-sort',
        element: lazyNamedPage(() => import('../pages/modules/ShellSortPage'), 'ShellSortPage'),
      },
      {
        path: 'modules/quick-sort',
        element: lazyNamedPage(() => import('../pages/modules/QuickSortPage'), 'QuickSortPage'),
      },
      {
        path: 'modules/merge-sort',
        element: lazyNamedPage(() => import('../pages/modules/MergeSortPage'), 'MergeSortPage'),
      },
      {
        path: 'modules/heap-sort',
        element: lazyNamedPage(() => import('../pages/modules/HeapSortPage'), 'HeapSortPage'),
      },
      {
        path: 'modules/counting-sort',
        element: lazyNamedPage(() => import('../pages/modules/CountingSortPage'), 'CountingSortPage'),
      },
      {
        path: 'modules/radix-sort',
        element: lazyNamedPage(() => import('../pages/modules/RadixSortPage'), 'RadixSortPage'),
      },
      {
        path: 'modules/bucket-sort',
        element: lazyNamedPage(() => import('../pages/modules/BucketSortPage'), 'BucketSortPage'),
      },
      {
        path: 'modules/sorting-race',
        element: lazyNamedPage(() => import('../pages/modules/SortingRacePage'), 'SortingRacePage'),
      },
      {
        path: 'modules/linear-search',
        element: lazyNamedPage(() => import('../pages/modules/LinearSearchPage'), 'LinearSearchPage'),
      },
      {
        path: 'modules/binary-search',
        element: lazyNamedPage(() => import('../pages/modules/BinarySearchPage'), 'BinarySearchPage'),
      },
      { path: 'modules/array', element: lazyNamedPage(() => import('../pages/modules/ArrayPage'), 'ArrayPage') },
      {
        path: 'modules/dynamic-array',
        element: lazyNamedPage(() => import('../pages/modules/DynamicArrayPage'), 'DynamicArrayPage'),
      },
      {
        path: 'modules/linked-list',
        element: lazyNamedPage(() => import('../pages/modules/LinkedListPage'), 'LinkedListPage'),
      },
      {
        path: 'modules/doubly-linked-list',
        element: lazyNamedPage(() => import('../pages/modules/LinkedListPage'), 'DoublyLinkedListPage'),
      },
      {
        path: 'modules/circular-linked-list',
        element: lazyNamedPage(() => import('../pages/modules/LinkedListPage'), 'CircularLinkedListPage'),
      },
      { path: 'modules/stack', element: lazyNamedPage(() => import('../pages/modules/StackPage'), 'StackPage') },
      {
        path: 'modules/sequential-stack',
        element: lazyNamedPage(() => import('../pages/modules/StackPage'), 'SequentialStackPage'),
      },
      {
        path: 'modules/linked-stack',
        element: lazyNamedPage(() => import('../pages/modules/StackPage'), 'LinkedStackPage'),
      },
      { path: 'modules/queue', element: lazyNamedPage(() => import('../pages/modules/QueuePage'), 'QueuePage') },
      {
        path: 'modules/sequential-queue',
        element: lazyNamedPage(() => import('../pages/modules/QueuePage'), 'SequentialQueuePage'),
      },
      {
        path: 'modules/linked-queue',
        element: lazyNamedPage(() => import('../pages/modules/QueuePage'), 'LinkedQueuePage'),
      },
      {
        path: 'modules/circular-queue',
        element: lazyNamedPage(() => import('../pages/modules/QueuePage'), 'CircularQueuePage'),
      },
      {
        path: 'modules/two-dimensional-array',
        element: lazyNamedPage(() => import('../pages/modules/TwoDimensionalArrayPage'), 'TwoDimensionalArrayPage'),
      },
      {
        path: 'modules/symmetric-matrix',
        element: lazyNamedPage(() => import('../pages/modules/SymmetricMatrixPage'), 'SymmetricMatrixPage'),
      },
      {
        path: 'modules/upper-triangular-matrix',
        element: lazyNamedPage(() => import('../pages/modules/UpperTriangularMatrixPage'), 'UpperTriangularMatrixPage'),
      },
      {
        path: 'modules/lower-triangular-matrix',
        element: lazyNamedPage(() => import('../pages/modules/LowerTriangularMatrixPage'), 'LowerTriangularMatrixPage'),
      },
      {
        path: 'modules/sparse-matrix-triples',
        element: lazyNamedPage(() => import('../pages/modules/SparseMatrixTriplesPage'), 'SparseMatrixTriplesPage'),
      },
      {
        path: 'modules/sparse-matrix-linked',
        element: lazyNamedPage(() => import('../pages/modules/SparseMatrixLinkedPage'), 'SparseMatrixLinkedPage'),
      },
      {
        path: 'modules/generalized-list-head-tail',
        element: lazyNamedPage(
          () => import('../pages/modules/GeneralizedListHeadTailPage'),
          'GeneralizedListHeadTailPage',
        ),
      },
      {
        path: 'modules/tree-definition',
        element: lazyNamedPage(() => import('../pages/modules/TreeDefinitionPage'), 'TreeDefinitionPage'),
      },
      {
        path: 'modules/binary-tree',
        element: lazyNamedPage(() => import('../pages/modules/BinaryTreeTraversalPage'), 'BinaryTreeTraversalPage'),
      },
      { path: 'modules/bst', element: lazyNamedPage(() => import('../pages/modules/BstPage'), 'BstPage') },
      {
        path: 'modules/avl-tree',
        element: lazyNamedPage(() => import('../pages/modules/AvlTreePage'), 'AvlTreePage'),
      },
      { path: 'modules/heap', element: lazyNamedPage(() => import('../pages/modules/HeapPage'), 'HeapPage') },
      {
        path: 'modules/huffman-tree',
        element: lazyNamedPage(() => import('../pages/modules/HuffmanTreePage'), 'HuffmanTreePage'),
      },
      { path: 'modules/btree', element: lazyNamedPage(() => import('../pages/modules/BTreePage'), 'BTreePage') },
      {
        path: 'modules/bplus-tree',
        element: lazyNamedPage(() => import('../pages/modules/BTreePage'), 'BPlusTreePage'),
      },
      { path: 'modules/trie', element: lazyNamedPage(() => import('../pages/modules/TriePage'), 'TriePage') },
      {
        path: 'modules/graph-representation',
        element: lazyNamedPage(() => import('../pages/modules/GraphRepresentationPage'), 'GraphRepresentationPage'),
      },
      {
        path: 'modules/graph-adjacency-matrix',
        element: lazyNamedPage(
          () => import('../pages/modules/GraphAdjacencyMatrixPage'),
          'GraphAdjacencyMatrixPage',
        ),
      },
      {
        path: 'modules/graph-adjacency-list',
        element: lazyNamedPage(() => import('../pages/modules/GraphAdjacencyListPage'), 'GraphAdjacencyListPage'),
      },
      { path: 'modules/dfs', element: lazyNamedPage(() => import('../pages/modules/DfsPage'), 'DfsPage') },
      { path: 'modules/bfs', element: lazyNamedPage(() => import('../pages/modules/BfsPage'), 'BfsPage') },
      {
        path: 'modules/dijkstra',
        element: lazyNamedPage(() => import('../pages/modules/DijkstraPage'), 'DijkstraPage'),
      },
      {
        path: 'modules/bellman-ford',
        element: lazyNamedPage(() => import('../pages/modules/BellmanFordPage'), 'BellmanFordPage'),
      },
      {
        path: 'modules/floyd-warshall',
        element: lazyNamedPage(() => import('../pages/modules/FloydWarshallPage'), 'FloydWarshallPage'),
      },
      {
        path: 'modules/kruskal',
        element: lazyNamedPage(() => import('../pages/modules/KruskalPage'), 'KruskalPage'),
      },
      { path: 'modules/prim', element: lazyNamedPage(() => import('../pages/modules/PrimPage'), 'PrimPage') },
      {
        path: 'modules/topological-sort',
        element: lazyNamedPage(() => import('../pages/modules/TopologicalSortPage'), 'TopologicalSortPage'),
      },
      {
        path: 'modules/hash-chaining',
        element: lazyNamedPage(() => import('../pages/modules/HashChainingPage'), 'HashChainingPage'),
      },
      {
        path: 'modules/hash-open-addressing',
        element: lazyNamedPage(() => import('../pages/modules/HashOpenAddressingPage'), 'HashOpenAddressingPage'),
      },
      { path: 'modules/kmp', element: lazyNamedPage(() => import('../pages/modules/KmpPage'), 'KmpPage') },
      {
        path: 'modules/rabin-karp',
        element: lazyNamedPage(() => import('../pages/modules/RabinKarpPage'), 'RabinKarpPage'),
      },
      {
        path: 'modules/divide-conquer',
        element: lazyNamedPage(() => import('../pages/modules/DivideConquerPage'), 'DivideConquerPage'),
      },
      {
        path: 'modules/dynamic-programming',
        element: lazyNamedPage(() => import('../pages/modules/DynamicProgrammingPage'), 'DynamicProgrammingPage'),
      },
      {
        path: 'modules/greedy',
        element: lazyNamedPage(() => import('../pages/modules/GreedyPage'), 'GreedyPage'),
      },
      {
        path: 'modules/backtracking',
        element: lazyNamedPage(() => import('../pages/modules/BacktrackingPage'), 'BacktrackingPage'),
      },
      {
        path: 'modules/union-find',
        element: lazyNamedPage(() => import('../pages/modules/UnionFindPage'), 'UnionFindPage'),
      },
      {
        path: 'playground/binary-tree-canvas',
        element: lazyNamedPage(
          () => import('../pages/modules/BinaryTreeCanvasPlaygroundPage'),
          'BinaryTreeCanvasPlaygroundPage',
        ),
      },
      { path: 'about', element: lazyNamedPage(() => import('../pages/AboutPage'), 'AboutPage') },
      { path: '*', element: lazyNamedPage(() => import('../pages/NotFoundPage'), 'NotFoundPage') },
    ],
  },
]);
