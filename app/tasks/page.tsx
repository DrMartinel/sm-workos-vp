import { Suspense } from 'react';
import TasksPageContent from './tasks-page-content';

export default function TasksPage() {
  return (
    <Suspense>
      <TasksPageContent />
    </Suspense>
  );
}
