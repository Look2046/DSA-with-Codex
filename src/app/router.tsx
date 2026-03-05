import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { AboutPage } from '../pages/AboutPage';
import { HomePage } from '../pages/HomePage';
import { ModulesPage } from '../pages/ModulesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SortingOverviewPage } from '../pages/SortingOverviewPage';
import { ArrayPage } from '../pages/modules/ArrayPage';
import { BubbleSortPage } from '../pages/modules/BubbleSortPage';
import { LinkedListPage } from '../pages/modules/LinkedListPage';
import { SelectionSortPage } from '../pages/modules/SelectionSortPage';
import { StackPage } from '../pages/modules/StackPage';
import { QueuePage } from '../pages/modules/QueuePage';

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
      { path: 'modules/array', element: <ArrayPage /> },
      { path: 'modules/linked-list', element: <LinkedListPage /> },
      { path: 'modules/stack', element: <StackPage /> },
      { path: 'modules/queue', element: <QueuePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
