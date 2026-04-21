import { useEffect } from 'react';
import './PlaceholderPage.css';

/**
 * Generic placeholder for pages under construction.
 * Replace with actual content as each page is developed.
 */
export default function PlaceholderPage({ title, emoji, description }) {
    useEffect(() => {
        document.title = `${title} – Dopaless`;
    }, [title]);

    return (
        <main className="placeholder-page">
            <div className="placeholder-content">
                <div className="placeholder-emoji">{emoji || '🚧'}</div>
                <h1>{title}</h1>
                <p>{description || 'Trang này đang được phát triển. Vui lòng quay lại sau!'}</p>
                <a href="/" className="placeholder-back">← Về trang chủ</a>
            </div>
        </main>
    );
}
