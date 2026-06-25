import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, CirclePlus, RefreshCw, Save, Search, Send, ShieldCheck, Sparkles, Target, Trash2, Users, Layers3 } from 'lucide-react';
import { examsAPI } from '../../services/api';

const createQuestion = () => ({
  type: 'mcq',
  category: 'coding',
  question: '',
  options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  correctAnswer: 0,
  allowedProgrammingLanguages: ['JavaScript', 'Python'],
  starterCode: '',
  sampleInput: '',
  sampleOutput: '',
  explanation: '',
  maxMarks: 10
});

export default function ExamManager() {
  const [activeTab, setActiveTab] = useState('builder');
  const [loading, setLoading] = useState(true);
  const [savingExam, setSavingExam] = useState(false);
  const [reviewingSubmissionId, setReviewingSubmissionId] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviewForm, setReviewForm] = useState({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMinutes: 60,
    status: 'draft',
    questions: [createQuestion()]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, submissionsRes] = await Promise.all([
        examsAPI.getAll(),
        examsAPI.getAllSubmissions()
      ]);
      setExams(examsRes?.data?.exams || []);
      setSubmissions(submissionsRes?.data?.submissions || []);
    } catch (error) {
      console.error('Failed to load exam desk data:', error);
      setExams([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const examId = submission.exam?._id || submission.exam;
      const matchesExam = selectedExamFilter === 'all' || examId === selectedExamFilter;
      const searchable = `${submission.studentUser?.name || ''} ${submission.studentUser?.email || ''} ${submission.exam?.title || ''}`.toLowerCase();
      const matchesSearch = !searchTerm || searchable.includes(searchTerm.toLowerCase());
      return matchesExam && matchesSearch;
    });
  }, [searchTerm, selectedExamFilter, submissions]);

  const updateQuestion = (questionIndex, key, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[questionIndex] = { ...questions[questionIndex], [key]: value };
      return { ...prev, questions };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[questionIndex] };
      const options = [...(question.options || [])];
      options[optionIndex] = value;
      question.options = options;
      questions[questionIndex] = question;
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({ ...prev, questions: [...prev.questions, createQuestion()] }));
  };

  const removeQuestion = (questionIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.length > 1 ? prev.questions.filter((_, index) => index !== questionIndex) : prev.questions
    }));
  };

  const addOption = (questionIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[questionIndex] };
      question.options = [...(question.options || []), `Option ${(question.options || []).length + 1}`];
      questions[questionIndex] = question;
      return { ...prev, questions };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[questionIndex] };
      const nextOptions = (question.options || []).filter((_, index) => index !== optionIndex);
      question.options = nextOptions.length >= 2 ? nextOptions : ['Option 1', 'Option 2'];
      question.correctAnswer = 0;
      questions[questionIndex] = question;
      return { ...prev, questions };
    });
  };

  const updateLanguages = (questionIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[questionIndex] = {
        ...questions[questionIndex],
        allowedProgrammingLanguages: value.split(',').map((item) => item.trim()).filter(Boolean)
      };
      return { ...prev, questions };
    });
  };

  const handleCreateExam = async () => {
    const questions = form.questions
      .filter((question) => question.question.trim())
      .map((question) => ({
        type: question.type,
        category: question.category || 'coding',
        question: question.question.trim(),
        options: question.type === 'mcq' ? (question.options || []).filter((option) => option.trim()) : [],
        correctAnswer: question.type === 'mcq' ? Number(question.correctAnswer || 0) : question.correctAnswer || '',
        allowedProgrammingLanguages: question.type === 'coding' ? question.allowedProgrammingLanguages : [],
        starterCode: question.type === 'coding' ? question.starterCode : '',
        sampleInput: question.type === 'coding' ? question.sampleInput : '',
        sampleOutput: question.type === 'coding' ? question.sampleOutput : '',
        explanation: question.explanation || '',
        maxMarks: Number(question.maxMarks || 10)
      }));

    if (!form.title.trim() || !questions.length) {
      setMessage('Add an exam title and at least one question.');
      return;
    }

    setSavingExam(true);
    try {
      await examsAPI.create({
        title: form.title.trim(),
        description: form.description.trim(),
        durationMinutes: Number(form.durationMinutes || 60),
        status: form.status,
        questions
      });
      setForm({
        title: '',
        description: '',
        durationMinutes: 60,
        status: 'draft',
        questions: [createQuestion()]
      });
      setMessage('Exam created successfully.');
      await fetchData();
    } catch (error) {
      console.error('Create exam failed:', error);
      setMessage(error.response?.data?.message || 'Failed to create exam.');
    } finally {
      setSavingExam(false);
    }
  };

  const setReviewState = (submissionId, key, value) => {
    setReviewForm((prev) => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] || {}),
        [key]: value
      }
    }));
  };

  const handleReviewSubmission = async (submissionId) => {
    const review = reviewForm[submissionId];
    setReviewingSubmissionId(submissionId);
    try {
      await examsAPI.reviewSubmission(submissionId, {
        score: Number(review?.score || 0),
        result: review?.result || 'pending',
        feedback: review?.feedback || ''
      });
      setMessage('Submission reviewed successfully.');
      await fetchData();
    } catch (error) {
      console.error('Review submission failed:', error);
      setMessage(error.response?.data?.message || 'Failed to review submission.');
    } finally {
      setReviewingSubmissionId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950/80 p-6 text-gray-900 dark:text-white shadow-2xl shadow-indigo-950/20">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.35em] text-indigo-300">
              <Sparkles size={14} /> Exam Studio
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Exam Preparation & Conduct</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-slate-300">
              Create MCQ and coding assessments, let students select answers or languages, and review submissions with score, result, and feedback.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Exams', value: exams.length, icon: BookOpen },
              { label: 'Submissions', value: submissions.length, icon: Users },
              { label: 'Pending', value: filteredSubmissions.filter((item) => item.result === 'pending').length, icon: Target },
              { label: 'Published', value: exams.filter((exam) => exam.status === 'published').length, icon: ShieldCheck }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">
                  <item.icon size={14} /> {item.label}
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { id: 'builder', label: 'Question Builder', icon: CirclePlus },
          { id: 'reviews', label: 'Submissions & Results', icon: CheckCircle2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
          {message}
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950/70 p-6 text-gray-900 dark:text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">Create Exam</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Add options for MCQs and programming languages for coding questions.</p>
              </div>
              <button onClick={addQuestion} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white hover:bg-indigo-500">
                <CirclePlus size={14} /> Add Question
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Exam Title</span>
                <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" placeholder="Core Java Placement Test" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Duration Minutes</span>
                <input type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Description</span>
                <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows="3" className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" placeholder="Describe the assessment and what it evaluates." />
              </label>
              <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Status</span>
                      <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <div key={index} className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-indigo-300">
                      <Layers3 size={14} /> Question {index + 1}
                    </div>
                    <button onClick={() => removeQuestion(index)} className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/20">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Question Type</span>
                      <select value={question.type} onChange={(e) => updateQuestion(index, 'type', e.target.value)} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400">
                        <option value="mcq">MCQ / Option Selection</option>
                        <option value="coding">Coding</option>
                        <option value="short-answer">Short Answer</option>
                        <option value="descriptive">Descriptive</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Question Category</span>
                      <select value={question.category || 'coding'} onChange={(e) => updateQuestion(index, 'category', e.target.value)} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400">
                        <option value="coding">Coding</option>
                        <option value="aptitude">Aptitude</option>
                        <option value="reasoning">Reasoning</option>
                        <option value="english">English (Language)</option>
                        <option value="telugu">Telugu (Language)</option>
                        <option value="hindi">Hindi (Language)</option>
                        <option value="spanish">Spanish (Language)</option>
                        <option value="german">German (Language)</option>
                        <option value="french">French (Language)</option>
                        <option value="japanese">Japanese (Language)</option>
                        <option value="other-languages">Other World Languages</option>
                      </select>
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Question Prompt</span>
                      <textarea value={question.question} onChange={(e) => updateQuestion(index, 'question', e.target.value)} rows="3" className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" placeholder="Write the question here" />
                    </label>

                    {question.type === 'mcq' && (
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Options</span>
                          <button onClick={() => addOption(index)} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">+ Add Option</button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {(question.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-slate-500">Option {optionIndex + 1}</span>
                                {(question.options || []).length > 2 && (
                                  <button onClick={() => removeOption(index, optionIndex)} className="text-xs font-bold text-red-600 hover:text-red-500">Remove</button>
                                )}
                              </div>
                              <input value={option} onChange={(e) => updateOption(index, optionIndex, e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-indigo-400" />
                            </div>
                          ))}
                        </div>
                        <label className="space-y-2 block">
                          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Correct Option</span>
                          <select value={question.correctAnswer} onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400">
                            {(question.options || []).map((_, optionIndex) => (
                              <option key={optionIndex} value={optionIndex}>Option {optionIndex + 1}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}

                    {question.type === 'coding' && (
                      <div className="md:col-span-2 space-y-4 rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-4">
                        <label className="space-y-2 block">
                          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Allowed Languages</span>
                          <input value={(question.allowedProgrammingLanguages || []).join(', ')} onChange={(e) => updateLanguages(index, e.target.value)} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" placeholder="JavaScript, Python, Java" />
                        </label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 md:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Starter Code</span>
                            <textarea value={question.starterCode} onChange={(e) => updateQuestion(index, 'starterCode', e.target.value)} rows="4" className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" placeholder="Optional starter template for students" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Sample Input</span>
                            <textarea value={question.sampleInput} onChange={(e) => updateQuestion(index, 'sampleInput', e.target.value)} rows="3" className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Sample Output</span>
                            <textarea value={question.sampleOutput} onChange={(e) => updateQuestion(index, 'sampleOutput', e.target.value)} rows="3" className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" />
                          </label>
                        </div>
                      </div>
                    )}

                    {question.type !== 'mcq' && question.type !== 'coding' && (
                      <div className="md:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/60 p-4 text-sm text-gray-700 dark:text-slate-300">
                        Free-form answer question. Students can type a response and you can review it manually.
                      </div>
                    )}

                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Max Marks</span>
                      <input type="number" min="1" value={question.maxMarks} onChange={(e) => updateQuestion(index, 'maxMarks', e.target.value)} className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-slate-400">Explanation / Reviewer Note</span>
                      <textarea value={question.explanation} onChange={(e) => updateQuestion(index, 'explanation', e.target.value)} rows="3" className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" placeholder="Optional explanation shown after review" />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleCreateExam} disabled={savingExam} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-white hover:bg-emerald-500 disabled:opacity-60">
              <Save size={16} /> {savingExam ? 'Saving...' : 'Save Exam'}
            </button>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 text-white shadow-xl">
            <h3 className="text-xl font-black">Current Exams</h3>
            {loading ? (
              <p className="text-sm text-slate-400">Loading exams...</p>
            ) : (
              <div className="space-y-3">
                {exams.length ? exams.map((exam) => (
                  <div key={exam._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{exam.title}</p>
                        <p className="text-xs text-slate-400">{exam.questions?.length || 0} questions • {exam.durationMinutes} mins</p>
                        {exam.questions && exam.questions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {[...new Set(exam.questions.map(q => q.category).filter(Boolean))].map(cat => (
                              <span key={cat} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">{exam.status}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">No exams created yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-xl font-black">Submissions & Results</h3>
              <p className="text-sm text-slate-400">Assign scores, pass/fail status, and feedback after students submit.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search student or exam" className="rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white outline-none focus:border-indigo-400" />
              </div>
              <select value={selectedExamFilter} onChange={(e) => setSelectedExamFilter(e.target.value)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400">
                <option value="all">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>{exam.title}</option>
                ))}
              </select>
              <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredSubmissions.length ? filteredSubmissions.map((submission) => {
              const reviewState = reviewForm[submission._id] || {
                score: submission.score ?? '',
                result: submission.result || 'pending',
                feedback: submission.feedback || ''
              };

              return (
                <div key={submission._id} className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-black text-gray-900 dark:text-white">{submission.studentUser?.name || 'Student'}</p>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${submission.result === 'pass' ? 'bg-emerald-500/15 text-emerald-500' : submission.result === 'fail' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'}`}>
                          {submission.result || 'pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{submission.studentUser?.email || 'No email'} • {submission.exam?.title || 'Unknown exam'}</p>
                      <p className="text-xs text-slate-500">Submitted on {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 dark:text-slate-500">Score</p>
                        <input type="number" value={reviewState.score} onChange={(e) => setReviewState(submission._id, 'score', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-gray-900 dark:text-white outline-none" />
                      </div>
                      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 dark:text-slate-500">Result</p>
                        <select value={reviewState.result} onChange={(e) => setReviewState(submission._id, 'result', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-gray-900 dark:text-white outline-none">
                          <option value="pending">Pending</option>
                          <option value="pass">Pass</option>
                          <option value="fail">Fail</option>
                        </select>
                      </div>
                      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 dark:text-slate-500">Action</p>
                        <button onClick={() => handleReviewSubmission(submission._id)} disabled={reviewingSubmissionId === submission._id} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-white hover:bg-indigo-500 disabled:opacity-60">
                          <Send size={14} /> {reviewingSubmissionId === submission._id ? 'Saving...' : 'Save Review'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gray-600 dark:text-slate-500">Answers</p>
                      <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
                        {(submission.answers || []).map((answer, index) => (
                          <div key={index} className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
                            <p className="font-bold text-gray-900 dark:text-white">Question {Number.isFinite(Number(answer.questionIndex)) ? Number(answer.questionIndex) + 1 : index + 1}</p>
                            <p className="mt-1 text-gray-700 dark:text-slate-300">{answer.selectedOption !== undefined ? `Selected option: ${Number(answer.selectedOption) + 1}` : `Answer: ${answer.answer || 'No answer'}`}</p>
                            {answer.language && <p className="mt-1 text-slate-400">Language: {answer.language}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gray-600 dark:text-slate-500">Review Notes</p>
                      <textarea value={reviewState.feedback} onChange={(e) => setReviewState(submission._id, 'feedback', e.target.value)} rows="8" className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-400" placeholder="Add feedback for the student" />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
                No submissions found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
