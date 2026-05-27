import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './hooks/AuthContext';

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000, // Hiển thị trong 4 giây
          style: {
            marginTop: '80px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }} 
      />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
