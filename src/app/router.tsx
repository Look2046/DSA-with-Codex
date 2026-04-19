import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { AboutPage } from '../pages/AboutPage';
import { HomePage } from '../pages/HomePage';
import { ModulesPage } from '../pages/ModulesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SortingOverviewPage } from '../pages/SortingOverviewPage';
import { ArrayPage } from '../pages/modules/ArrayPage';
import { BubbleSortPage } from '../pages/modules/BubbleSortPage';
import { DynamicArrayPage } from '../pages/modules/DynamicArrayPage';
import { LinkedListPage } from '../pages/modules/LinkedListPage';
import { SelectionSortPage } from '../pages/modules/SelectionSortPage';
import { InsertionSortPage } from '../pages/modules/InsertionSortPage';
import { ShellSortPage } from '../pages/modules/ShellSortPage';
import { QuickSortPage } from '../pages/modules/QuickSortPage';
import { MergeSortPage } from '../pages/modules/MergeSortPage';
import { HeapSortPage } from '../pages/modules/HeapSortPage';
import { CountingSortPage } from '../pages/modules/CountingSortPage';
import { RadixSortPage } from '../pages/modules/RadixSortPage';
import { BucketSortPage } from '../pages/modules/BucketSortPage';
import { SortingRacePage } from '../pages/modules/SortingRacePage';
import { BinarySearchPage } from '../pages/modules/BinarySearchPage';
import { LinearSearchPage } from '../pages/modules/LinearSearchPage';
import { StackPage } from '../pages/modules/StackPage';
import { QueuePage } from '../pages/modules/QueuePage';
import { BinaryTreeTraversalPage } from '../pages/modules/BinaryTreeTraversalPage';
import { BstPage } from '../pages/modules/BstPage';
import { AvlTreePage } from '../pages/modules/AvlTreePage';
import { HeapPage } from '../pages/modules/HeapPage';
import { BTreePage } from '../pages/modules/BTreePage';
import { TriePage } from '../pages/modules/TriePage';
import { GraphRepresentationPage } from '../pages/modules/GraphRepresentationPage';
import { DfsPage } from '../pages/modules/DfsPage';
import { BfsPage } from '../pages/modules/BfsPage';
import { DijkstraPage } from '../pages/modules/DijkstraPage';
import { BellmanFordPage } from '../pages/modules/BellmanFordPage';
import { FloydWarshallPage } from '../pages/modules/FloydWarshallPage';
import { KruskalPage } from '../pages/modules/KruskalPage';
import { PrimPage } from '../pages/modules/PrimPage';
import { TopologicalSortPage } from '../pages/modules/TopologicalSortPage';
import { HashChainingPage } from '../pages/modules/HashChainingPage';
import { HashOpenAddressingPage } from '../pages/modules/HashOpenAddressingPage';
import { KmpPage } from '../pages/modules/KmpPage';
import { RabinKarpPage } from '../pages/modules/RabinKarpPage';
import { DivideConquerPage } from '../pages/modules/DivideConquerPage';
import { DynamicProgrammingPage } from '../pages/modules/DynamicProgrammingPage';
import { GreedyPage } from '../pages/modules/GreedyPage';
import { BacktrackingPage } from '../pages/modules/BacktrackingPage';
import { UnionFindPage } from '../pages/modules/UnionFindPage';
import { BinaryTreeCanvasPlaygroundPage } from '../pages/modules/BinaryTreeCanvasPlaygroundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'modules', element: <ModulesPage /> },
      { path: 'modules/sorting', element: <SortingOverviewPage /> },
      { path: 'modules/bubble-sort', element: <BubbleSortPage /> },
      { path: 'modules/selection-sort', element: <SelectionSortPage /> },
      { path: 'modules/insertion-sort', element: <InsertionSortPage /> },
      { path: 'modules/shell-sort', element: <ShellSortPage /> },
      { path: 'modules/quick-sort', element: <QuickSortPage /> },
      { path: 'modules/merge-sort', element: <MergeSortPage /> },
      { path: 'modules/heap-sort', element: <HeapSortPage /> },
      { path: 'modules/counting-sort', element: <CountingSortPage /> },
      { path: 'modules/radix-sort', element: <RadixSortPage /> },
      { path: 'modules/bucket-sort', element: <BucketSortPage /> },
      { path: 'modules/sorting-race', element: <SortingRacePage /> },
      { path: 'modules/linear-search', element: <LinearSearchPage /> },
      { path: 'modules/binary-search', element: <BinarySearchPage /> },
      { path: 'modules/array', element: <ArrayPage /> },
      { path: 'modules/dynamic-array', element: <DynamicArrayPage /> },
      { path: 'modules/linked-list', element: <LinkedListPage /> },
      { path: 'modules/stack', element: <StackPage /> },
      { path: 'modules/queue', element: <QueuePage /> },
      { path: 'modules/binary-tree', element: <BinaryTreeTraversalPage /> },
      { path: 'modules/bst', element: <BstPage /> },
      { path: 'modules/avl-tree', element: <AvlTreePage /> },
      { path: 'modules/heap', element: <HeapPage /> },
      { path: 'modules/btree', element: <BTreePage /> },
      { path: 'modules/trie', element: <TriePage /> },
      { path: 'modules/graph-representation', element: <GraphRepresentationPage /> },
      { path: 'modules/dfs', element: <DfsPage /> },
      { path: 'modules/bfs', element: <BfsPage /> },
      { path: 'modules/dijkstra', element: <DijkstraPage /> },
      { path: 'modules/bellman-ford', element: <BellmanFordPage /> },
      { path: 'modules/floyd-warshall', element: <FloydWarshallPage /> },
      { path: 'modules/kruskal', element: <KruskalPage /> },
      { path: 'modules/prim', element: <PrimPage /> },
      { path: 'modules/topological-sort', element: <TopologicalSortPage /> },
      { path: 'modules/hash-chaining', element: <HashChainingPage /> },
      { path: 'modules/hash-open-addressing', element: <HashOpenAddressingPage /> },
      { path: 'modules/kmp', element: <KmpPage /> },
      { path: 'modules/rabin-karp', element: <RabinKarpPage /> },
      { path: 'modules/divide-conquer', element: <DivideConquerPage /> },
      { path: 'modules/dynamic-programming', element: <DynamicProgrammingPage /> },
      { path: 'modules/greedy', element: <GreedyPage /> },
      { path: 'modules/backtracking', element: <BacktrackingPage /> },
      { path: 'modules/union-find', element: <UnionFindPage /> },
      { path: 'playground/binary-tree-canvas', element: <BinaryTreeCanvasPlaygroundPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
