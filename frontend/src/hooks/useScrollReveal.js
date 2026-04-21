import { useEffect } from 'react';


export function useScrollReveal() {
    useEffect(() => {
        const revealEls = document.querySelectorAll('.reveal');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealEls.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}
