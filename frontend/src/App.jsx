import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000, // Hiển thị trong 4 giây
          style: {
            marginTop: '80px', // Đẩy xuống thấp hơn một chút
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }} 
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
