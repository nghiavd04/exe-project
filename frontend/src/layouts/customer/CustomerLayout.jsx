import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AiChatWidget from '../../components/chat/AiChatWidget';

export default function CustomerLayout() {
  return (
    <>
      <Header />
      <main className="customer-shell">
        <Outlet />
      </main>
      <Footer />
      <AiChatWidget />
    </>
  );
}

