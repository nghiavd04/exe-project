import { useState, useEffect } from 'react';
import './TestPage.css';

const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "Bạn có thường xuyên kiểm tra điện thoại ngay khi vừa thức dậy?",
        description: "Thói quen này ảnh hưởng trực tiếp đến nhịp độ tiết dopamine của não bộ ngay từ đầu ngày.",
        options: [
            { text: "Luôn luôn (Mỗi sáng)", score: 3 },
            { text: "Thường xuyên", score: 2 },
            { text: "Thỉnh thoảng", score: 1 },
            { text: "Hiếm khi hoặc không bao giờ", score: 0 }
        ]
    },
    {
        id: 2,
        question: "Bạn cảm thấy thế nào nếu để quên điện thoại ở nhà khi đi làm/đi học?",
        description: "Mức độ bồn chồn cho thấy mức độ phụ thuộc của trung tâm phần thưởng trong não.",
        options: [
            { text: "Hoảng loạn, không thể tập trung", score: 3 },
            { text: "Rất bồn chồn, luôn nghĩ về nó", score: 2 },
            { text: "Hơi khó chịu nhưng vẫn ổn", score: 1 },
            { text: "Bình thường, coi như được nghỉ ngơi", score: 0 }
        ]
    },
    {
        id: 3,
        question: "Khi đang làm việc hoặc học tập, bạn có hay mở tab mạng xã hội không?",
        description: "Sự phân tâm liên tục làm giảm khả năng duy trì Deep Work (làm việc sâu).",
        options: [
            { text: "Cứ 10-15 phút một lần", score: 3 },
            { text: "Mỗi 30 phút - 1 tiếng", score: 2 },
            { text: "Chỉ khi nghỉ giải lao", score: 1 },
            { text: "Gần như không bao giờ mở", score: 0 }
        ]
    },
    {
        id: 4,
        question: "Bạn có cảm thấy khó khăn khi tận hưởng một hoạt động đơn giản (như đi dạo, đọc sách) mà không có điện thoại?",
        description: "Não bộ quen với cường độ kích thích quá cao sẽ thấy các hoạt động bình thường trở nên nhàm chán.",
        options: [
            { text: "Rất khó, tôi luôn cần nghe nhạc/podcast", score: 3 },
            { text: "Hơi chán nếu không có điện thoại", score: 2 },
            { text: "Thỉnh thoảng thấy trống trải", score: 1 },
            { text: "Tôi hoàn toàn tận hưởng được", score: 0 }
        ]
    }
];

export default function TestPage() {
    const [isStarted, setIsStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        document.title = 'Bài Test Dopamine – Dopaless';
        window.scrollTo(0, 0);
    }, []);

    const handleStart = () => {
        setIsFading(true);
        setTimeout(() => {
            setIsStarted(true);
            setIsFading(false);
        }, 400); // match CSS transition
    };

    const handleSelectAnswer = (questionId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleNext = () => {
        if (currentStep < QUIZ_QUESTIONS.length - 1) {
            setIsFading(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsFading(false);
            }, 400);
        } else {
            // Submit logic could go here
            alert("Chúc mừng bạn đã hoàn thành bài test! (Tính năng hiển thị kết quả đang hoàn thiện)");
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setIsFading(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsFading(false);
            }, 400);
        }
    };

    if (!isStarted) {
        return (
            <main className={`test-intro-page ${isFading ? 'fading-out' : ''}`}>
                <div className="test-intro-bg" />
                <div className="test-intro-overlay" />

                <div className="test-intro-content">
                    <div className="badge-wrapper">
                        <span className="pulse-dot"></span>
                        Khoa học & Tâm lý học
                    </div>
                    <h1>Bài Test: Mức độ lệ thuộc<br /><span>Dopamine</span></h1>
                    <p className="intro-desc">
                        Hãy dành ra 3 phút để đo lường mức độ ảnh hưởng của kỹ thuật số đến khả năng tập trung
                        và động lực nội tại của bạn. Kết quả dựa trên các nghiên cứu khoa học hiện đại.
                    </p>

                    <div className="test-stats-mini">
                        <div className="stat-item">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-text">
                                <strong>3 Phút</strong>
                                <span>Thời gian làm bài</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-text">
                                <strong>Khoa học</strong>
                                <span>Độ chính xác cao</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon">🔒</div>
                            <div className="stat-text">
                                <strong>Bảo mật</strong>
                                <span>Ẩn danh 100%</span>
                            </div>
                        </div>
                    </div>

                    <button className="btn-start-test" onClick={handleStart}>
                        Bắt đầu kiểm tra ngay
                    </button>
                </div>
            </main>
        );
    }

    const currentQ = QUIZ_QUESTIONS[currentStep];
    const progressPerc = Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100);
    const hasAnsweredCurrent = answers[currentQ.id] !== undefined;

    return (
        <main className={`quiz-page ${isFading ? 'fading-out' : ''}`}>
            <div className="quiz-container">

                {/* Progress Header */}
                <div className="quiz-header">
                    <div className="progress-top">
                        <div className="progress-title">
                            <span className="label">Tiến trình</span>
                            <h3>Câu hỏi {currentStep + 1} / {QUIZ_QUESTIONS.length}</h3>
                        </div>
                        <div className="progress-perc">{progressPerc}%</div>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPerc}%` }}></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="quiz-card">
                    {/* Left Graphic Area */}
                    <div className="quiz-graphic">
                        <div className="graphic-content">
                            <span className="step-number">{currentStep + 1}</span>
                            <div className="graphic-illustration">
                                {/* Using SVG icon as illustration placeholder */}
                                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9">
                                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right Question Area */}
                    <div className="quiz-content">
                        <span className="q-badge">CÂU HỎI SỐ {currentStep + 1}</span>
                        <h2 className="q-text">{currentQ.question}</h2>
                        <p className="q-desc">{currentQ.description}</p>

                        <div className="q-options">
                            {currentQ.options.map((opt, idx) => {
                                const isSelected = answers[currentQ.id] === idx;
                                return (
                                    <button
                                        key={idx}
                                        className={`opt-btn ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectAnswer(currentQ.id, idx)}
                                    >
                                        <div className="opt-circle">
                                            {/* Checkmark inside circle */}
                                            <span className="opt-check">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </span>
                                        </div>
                                        <span className="opt-text">{opt.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="quiz-footer">
                    <button
                        className={`btn-prev ${currentStep === 0 ? 'hidden' : ''}`}
                        onClick={handlePrev}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Quay lại
                    </button>

                    <button
                        className="btn-next"
                        onClick={handleNext}
                        disabled={!hasAnsweredCurrent}
                    >
                        {currentStep === QUIZ_QUESTIONS.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>

            </div>
        </main>
    );
}
