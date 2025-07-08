import { Suspense } from 'react';
import TasksPageContent from './tasks-page-content';
import TasksPageLoading from './loading';

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksPageLoading />}>
      <TasksPageContent />
    </Suspense>
  );
}
