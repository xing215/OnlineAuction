import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, ChevronUp, User, Store, ShieldCheck, Clock } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { useUser } from '../../context/useUser';
import { formatDate } from '../../utilities/FormatDate';
import type { ProductQuestion } from '../../types';
import toast from 'react-hot-toast';

interface QnABoxProps {
  productId: string;
  sellerId?: string;
}

export const QnABox: React.FC<QnABoxProps> = ({ productId, sellerId }) => {
  const { user, token } = useUser();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerForms, setAnswerForms] = useState<{ [key: string]: string }>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  // Fetch Q&A list
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl(`/api/products/${productId}/questions`));
      const data = await res.json();
      
      if (data.success) {
        setQuestions(data.data);
      }
    } catch {
      console.error('Lỗi khi tải câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Submit new question
  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error('Vui lòng nhập câu hỏi!');
      return;
    }

    if (!token) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(apiUrl(`/api/products/${productId}/questions`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: newQuestion.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Đã gửi câu hỏi thành công!');
        setNewQuestion('');
        setShowAskForm(false);
        fetchQuestions(); // Reload
      } else {
        toast.error(data.message || 'Không thể gửi câu hỏi');
      }
    } catch {
      toast.error('Lỗi khi gửi câu hỏi!');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit answer 
  const handleAnswer = async (questionId: string) => {
    const answer = answerForms[questionId];
    
    if (!answer || !answer.trim()) {
      toast.error('Vui lòng nhập câu trả lời!');
      return;
    }

    if (!token) {
      toast.error('Vui lòng đăng nhập!');
      return;
    }

    try {
      setAnsweringId(questionId);
      const res = await fetch(apiUrl(`/api/questions/${questionId}/answer`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answer: answer.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Đã trả lời thành công!');
        setAnswerForms(prev => {
          const newForms = { ...prev };
          delete newForms[questionId];
          return newForms;
        });
        fetchQuestions(); // Reload
      } else {
        toast.error(data.message || 'Không thể trả lời');
      }
    } catch {
      toast.error('Lỗi khi trả lời câu hỏi!');
    } finally {
      setAnsweringId(null);
    }
  };

  // Check if current user is seller
  const isSeller = user && sellerId && user.id === sellerId;

  // Get display name for asker
  const getAskerName = (question: ProductQuestion): string => {
    if (question.masked_asker_name) {
      return question.masked_asker_name;
    }
    
    if (question.asker && typeof question.asker === 'object' && 'full_name' in question.asker) {
      const name = question.asker.full_name?.trim();
      if (name) {
        const parts = name.split(' ');
        const lastName = parts[parts.length - 1];
        return `****${lastName}`;
      }
    }
    
    // Fallback
    return '****User';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <MessageSquare className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Hỏi đáp về sản phẩm
              {questions.length > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {questions.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Thảo luận chi tiết về sản phẩm này</p>
          </div>
        </div>

        {/* Toggle Button */}
        {!isSeller && (
          <button
            onClick={() => setShowAskForm(!showAskForm)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
              showAskForm 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-md hover:shadow-lg'
            }`}
          >
            {showAskForm ? 'Đóng' : 'Đặt câu hỏi'}
            {showAskForm ? <ChevronUp className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ASK FORM */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAskForm && !isSeller ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ví dụ: Sản phẩm này có bảo hành chính hãng không?"
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none text-gray-700 placeholder-gray-400 transition-all shadow-sm"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400 font-medium">
                  {newQuestion.length}/500 ký tự
                </span>
                <button
                  onClick={handleAskQuestion}
                  disabled={submitting || !newQuestion.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Gửi câu hỏi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-yellow-100 border-t-yellow-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3 font-medium">Đang tải...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-gray-800 font-medium text-lg">Chưa có câu hỏi nào</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            Nếu bạn có thắc mắc về sản phẩm, đừng ngại đặt câu hỏi cho người bán nhé!
          </p>
        </div>
      )}

      {/* QUESTIONS LIST */}
      {!loading && questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((q) => {
            const questionId = typeof q.id === 'string' ? q.id : String(q.id);
            const hasAnswer = q.answer && q.answer.trim() !== '';
            const showAnswerInput = isSeller && !hasAnswer;

            return (
              <div key={questionId} className="group transition-all">
                <div className="flex gap-4">
                  {/* Avatar User */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-300 shadow-sm">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Content Container */}
                  <div className="flex-1">
                    {/* User Name & Time */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800 text-sm">
                        {getAskerName(q)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(q.asked_at)}
                      </span>
                    </div>

                    {/* Question Text */}
                    <div className="bg-gray-50 rounded-r-xl rounded-bl-xl p-3.5 inline-block text-gray-700 leading-relaxed border border-transparent group-hover:border-gray-200 transition-colors">
                      {q.question}
                    </div>

                    {/* ANSWER SECTION */}
                    {(hasAnswer || showAnswerInput) && (
                      <div className="mt-4 pl-4 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 -ml-2 h-full rounded-full"></div>

                        {/* Existing Answer */}
                        {hasAnswer && (
                          <div className="flex gap-3 mt-2">
                             <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-200">
                                  <Store className="w-4 h-4 text-yellow-600" />
                                </div>
                             </div>
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-yellow-400 text-sm flex items-center gap-1">
                                    Người bán <ShieldCheck className="w-3 h-3" />
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(q.answered_at)}
                                  </span>
                                </div>
                                <div className="text-gray-700 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100 text-sm leading-relaxed">
                                  {q.answer}
                                </div>
                             </div>
                          </div>
                        )}

                        {/* Seller Answer Form */}
                        {showAnswerInput && (
                          <div className="mt-3 animate-fade-in">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Store className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div className="flex-1">
                                <div className="relative">
                                  <textarea
                                    value={answerForms[questionId] || ''}
                                    onChange={(e) =>
                                      setAnswerForms((prev) => ({
                                        ...prev,
                                        [questionId]: e.target.value,
                                      }))
                                    }
                                    placeholder="Nhập câu trả lời của bạn"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 resize-none"
                                    rows={3}
                                    maxLength={1000}
                                  />
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-400">
                                      {(answerForms[questionId] || '').length}/1000
                                    </span>
                                    <button
                                      onClick={() => handleAnswer(questionId)}
                                      disabled={answeringId === questionId || !answerForms[questionId]?.trim()}
                                      className="flex items-center gap-1.5 px-4 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 transition-colors font-medium shadow-sm"
                                    >
                                      {answeringId === questionId ? 'Đang gửi...' : 'Trả lời ngay'}
                                      {!answeringId && <Send className="w-3 h-3" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!hasAnswer && !isSeller && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-full w-fit">
                            <Clock className="w-3 h-3" /> Đang chờ phản hồi từ người bán
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QnABox;
