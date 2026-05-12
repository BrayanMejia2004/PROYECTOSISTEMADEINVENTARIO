import { Outlet } from 'react-router-dom';

export const TabletLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};
