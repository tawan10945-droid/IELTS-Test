import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Flag } from 'lucide-react';
import axios from 'axios';

const TestInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [answerKey, setAnswerKey] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch Questions
        const qRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/test/questions`, config);
        setQuestions(qRes.data);

        // Fetch Answers Key
        const aRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/test/answers`, config);
        setAnswerKey(aRes.data);

      } catch (err) {
        console.error('Failed to load test data', err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndAnswers();
  }, [navigate]);

  const handleSelectOption = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentIdx]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    const submitData = [];
    for (let i = 0; i < questions.length; i++) {
      submitData.push(answers[i] !== undefined ? answers[i] : -1);
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/test/submit`,
        { answers: submitData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
    } catch (err) {
      console.error('Failed to submit test', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.5rem', color: 'var(--primary-color)' }}>Loading Mock Test...</div>;
  }

  // Answer Review View
  if (showReview && answerKey.length > 0) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '800px' }}>
        <div className="test-header" style={{ marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={24} color="var(--success-color)" />
            Answer Key Review
          </h2>
          <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>

        <div className="card-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {questions.map((q, idx) => {
            const userAns = answers[idx] !== undefined ? answers[idx] : -1;
            const correctAns = answerKey.find(a => a.id === q.id)?.correctAnswer;
            const isCorrect = userAns === correctAns;

            return (
              <div key={q.id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${isCorrect ? 'var(--success-color)' : 'var(--error-color)'}`,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>
                  {idx + 1}. {q.text}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, optIdx) => {
                    let optionStyle = { padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' };

                    if (optIdx === correctAns) {
                      optionStyle.background = 'rgba(16, 185, 129, 0.1)';
                      optionStyle.border = '1px solid var(--success-color)';
                      optionStyle.color = 'var(--success-color)';
                      optionStyle.fontWeight = 600;
                    } else if (optIdx === userAns && !isCorrect) {
                      optionStyle.background = 'rgba(239, 68, 68, 0.1)';
                      optionStyle.border = '1px solid var(--error-color)';
                      optionStyle.color = 'var(--error-color)';
                    } else {
                      optionStyle.opacity = 0.7;
                    }

                    return (
                      <div key={optIdx} style={optionStyle}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '0.75rem', fontSize: '0.8rem', flexShrink: 0 }}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        {opt}
                        {optIdx === correctAns && <CheckCircle size={16} style={{ marginLeft: 'auto' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Result View
  if (result) {
    return (
      <div className="dashboard-container result-container">
        <h1 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Test Completed!</h1>
        <p style={{ marginBottom: '3rem', color: 'var(--text-secondary)' }}>Based on your answers, here is your estimated score.</p>

        <div className="score-circle">
          <div className="score-text">{result.bandScore.toFixed(1)}</div>
          <div className="score-label">IELTS Band</div>
        </div>

        <div style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>
          Raw Score: <strong style={{ color: 'var(--primary-color)' }}>{result.score}</strong> / {result.total}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ maxWidth: '300px' }} onClick={() => setShowReview(true)}>
            <Flag size={20} style={{ marginRight: '0.25rem' }} />
            View Answers
          </button>
          <button className="btn-primary" style={{ maxWidth: '300px', margin: '0 auto' }} onClick={() => navigate('/dashboard')}>
            <CheckCircle size={20} />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const progressPercentage = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      <div className="test-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flag size={24} color="var(--primary-color)" />
          Mock IELTS Test
        </h2>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Question {currentIdx + 1} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>of {questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--primary-color)', width: `${progressPercentage}%`, transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="question-card" key={currentIdx}>
        <div className="question-text">
          {currentIdx + 1}. {question.text}
        </div>

        <div className="options-container">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${answers[currentIdx] === i ? 'selected' : ''}`}
              onClick={() => handleSelectOption(i)}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                border: '1px solid currentColor', display: 'flex',
                justifyContent: 'center', alignItems: 'center',
                marginRight: '1rem', flexShrink: 0
              }}>
                {String.fromCharCode(65 + i)}
              </div>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="test-controls">
        <button className="btn-secondary" onClick={handlePrev} disabled={currentIdx === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronLeft size={20} />
          Previous
        </button>

        {!isLastQuestion ? (
          <button className="btn-primary" onClick={handleNext} style={{ width: 'auto', padding: '0.875rem 2rem' }}>
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ width: 'auto', padding: '0.875rem 2rem', background: 'var(--success-color)' }}>
            {submitting ? 'Submitting...' : 'Submit Test'}
            <CheckCircle size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TestInterface;
