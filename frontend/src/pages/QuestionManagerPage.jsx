import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const gatewayUrl = 'http://localhost:3000/api';

export const QuestionManagerPage = ({ user }) => {
    const [newQuestion, setNewQuestion] = useState({ title:"", description:"", difficulty:"easy", topics:"" });
    const [questions, setQuestions] = useState([]);

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!newQuestion.title || !newQuestion.description || !newQuestion.difficulty || !newQuestion.topics) {
            alert("Please fill in all fields");
            return;
        }

        const response = await fetch(`${gatewayUrl}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: newQuestion.title,
                description: newQuestion.description,
                difficulty: newQuestion.difficulty,
                topics: newQuestion.topics.split(",").map(t=>t.trim()).filter(t=>t.length>0),
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            alert('Error creating question: ' + (errorData.error || 'Unknown error'));
            return;
        }
        const createdQuestion = await response.json();
        alert('Question created with ID: ' + createdQuestion.id);
        setNewQuestion({ title:"", description:"", difficulty:"easy", topics:"" });
        fetchQuestions();
    };

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`${gatewayUrl}/questions`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setQuestions(data.data || []);  // backend returns { data: [...] }
        } catch (err) {
            console.error(err);
            alert('Failed to fetch questions');
        }
    };
    useEffect(() => {
        fetchQuestions();
    }, []);

    // deleting question
    const deleteQuestion = async (id) => {
        if (!confirm('Delete this question?')) return;
        const res = await fetch(`${gatewayUrl}/questions/${id}`, {
            method: 'DELETE',
        });

        if (res.status === 204) {
            setQuestions(prev => prev.filter(q => q.id !== id));
            if (editing?.id === id) closeEdit();
            return;
        }
        const err = await res.json().catch(() => ({}));
        alert(err.error || `Delete failed (HTTP ${res.status})`);
        fetchQuestions();
    };


    // Editing questions
    const [editing, setEditing] = useState(null);          // the question object being edited (or null)
    const [editForm, setEditForm] = useState(null);        // { title, description, difficulty, topics (string) }

    const openEdit = (q) => {
        setEditing(q);
        setEditForm({
            title: q.title,
            description: q.description,
            difficulty: q.difficulty,
            topics: (q.topics || []).join(', ')
        });
    };

    const closeEdit = () => {
        setEditing(null);
        setEditForm(null);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${gatewayUrl}/questions/${editing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            title: editForm.title,
            description: editForm.description,
            difficulty: editForm.difficulty,
            topics: editForm.topics.split(',').map(s=>s.trim()).filter(Boolean),
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.error || `Update failed (HTTP ${res.status})`);
            return;
        }
        closeEdit();
        fetchQuestions();
    };


    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📚 Question Manager</h1>
                <p style={styles.subtitle}>Create and manage coding questions</p>
            </div>

            <div style={styles.createCard}>
                <h2 style={styles.sectionTitle}>➕ Create New Question</h2>
                <form onSubmit={onSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title *</label>
                        <input 
                            style={styles.input}
                            placeholder="Enter question title" 
                            value={newQuestion.title} 
                            onChange={(e) => setNewQuestion(q=>({...q, title: e.target.value}))} 
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description *</label>
                        <textarea 
                            style={styles.textarea}
                            placeholder="Enter question description" 
                            value={newQuestion.description} 
                            onChange={e => setNewQuestion(q => ({ ...q, description: e.target.value }))}
                            rows={4}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Difficulty *</label>
                            <select 
                                style={styles.select}
                                value={newQuestion.difficulty} 
                                onChange={e=>setNewQuestion(q=>({...q, difficulty:e.target.value}))}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Topics *</label>
                            <input 
                                style={styles.input}
                                placeholder="e.g., arrays, strings, sorting" 
                                value={newQuestion.topics} 
                                onChange={e=>setNewQuestion(q=>({...q,topics:e.target.value}))} 
                            />
                        </div>
                    </div>

                    <button type="submit" style={styles.createButton}>
                        ✨ Create Question
                    </button>
                </form>
            </div>

            <div style={styles.bankSection}>
                <h2 style={styles.sectionTitle}>📋 Question Bank ({questions.length})</h2>
                
                {questions.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyText}>No questions yet. Create your first question above!</p>
                    </div>
                ) : (
                    <div style={styles.questionList}>
                        {questions.map(q => (
                            <div key={q.id} style={styles.questionCard}>
                                <div style={styles.questionHeader}>
                                    <h3 style={styles.questionTitle}>{q.title}</h3>
                                    <span style={{
                                        ...styles.difficultyBadge,
                                        ...(q.difficulty === 'easy' ? styles.badgeEasy : 
                                            q.difficulty === 'medium' ? styles.badgeMedium : 
                                            styles.badgeHard)
                                    }}>
                                        {q.difficulty}
                                    </span>
                                </div>
                                
                                <p style={styles.questionDescription}>{q.description}</p>
                                
                                <div style={styles.topicsContainer}>
                                    <span style={styles.topicsLabel}>Topics:</span>
                                    <div style={styles.topicTags}>
                                        {(q.topics || []).map((topic, idx) => (
                                            <span key={idx} style={styles.topicTag}>{topic}</span>
                                        ))}
                                    </div>
                                </div>

                                <div style={styles.actionButtons}>
                                    <button 
                                        type="button" 
                                        onClick={() => openEdit(q)}
                                        style={styles.editButton}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => deleteQuestion(q.id)}
                                        style={styles.deleteButton}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        {editing && editForm && (
        <div
            onClick={closeEdit}
            style={styles.modalOverlay}
            aria-modal="true" role="dialog"
        >
            <div
            onClick={(e)=>e.stopPropagation()}
            style={styles.modalContent}
            >
            <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>✏️ Edit Question (ID: {editing.id})</h3>
                <button type="button" onClick={closeEdit} style={styles.closeButton}>✕</button>
            </div>

            <form onSubmit={saveEdit} style={styles.modalForm}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Title</label>
                    <input
                        style={styles.input}
                        value={editForm.title}
                        onChange={e=>setEditForm(f=>({...f, title: e.target.value}))}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                        style={styles.textarea}
                        value={editForm.description}
                        onChange={e=>setEditForm(f=>({...f, description: e.target.value}))}
                        rows={4}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Difficulty</label>
                    <select
                        style={styles.select}
                        value={editForm.difficulty}
                        onChange={e=>setEditForm(f=>({...f, difficulty: e.target.value}))}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Topics</label>
                    <input
                        style={styles.input}
                        value={editForm.topics}
                        onChange={e=>setEditForm(f=>({...f, topics: e.target.value}))}
                        placeholder="topics, comma-separated"
                    />
                </div>

                <div style={styles.modalActions}>
                    <button type="button" onClick={closeEdit} style={styles.cancelButton}>
                        Cancel
                    </button>
                    <button type="submit" style={styles.saveButton}>
                        💾 Save Changes
                    </button>
                </div>
            </form>
            </div>
        </div>
        )}


        </div>
    );

}

const styles = {
    container: {
        minHeight: '100vh',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#64748b',
    },
    createCard: {
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '1.5rem',
        marginTop: '0',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
    },
    label: {
        fontWeight: '600',
        color: '#475569',
        fontSize: '0.95rem',
    },
    input: {
        padding: '0.875rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        outline: 'none',
    },
    textarea: {
        padding: '0.875rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    select: {
        padding: '0.875rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    createButton: {
        background: '#4f46e5',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        marginTop: '0.5rem',
    },
    bankSection: {
        marginTop: '2rem',
    },
    emptyState: {
        background: 'white',
        borderRadius: '1rem',
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    emptyText: {
        color: '#64748b',
        fontSize: '1.1rem',
    },
    questionList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    questionCard: {
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        border: '1px solid #e2e8f0',
    },
    questionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '1rem',
    },
    questionTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0',
    },
    difficultyBadge: {
        padding: '0.375rem 0.875rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '600',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
    },
    badgeEasy: {
        background: '#d1fae5',
        color: '#065f46',
    },
    badgeMedium: {
        background: '#fef3c7',
        color: '#92400e',
    },
    badgeHard: {
        background: '#fee2e2',
        color: '#991b1b',
    },
    questionDescription: {
        color: '#475569',
        fontSize: '1rem',
        lineHeight: '1.6',
        marginBottom: '1rem',
    },
    topicsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
    },
    topicsLabel: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#64748b',
    },
    topicTags: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    topicTag: {
        background: '#f1f5f9',
        color: '#475569',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0',
    },
    editButton: {
        background: '#f1f5f9',
        color: '#475569',
        padding: '0.625rem 1.25rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    deleteButton: {
        background: '#fee2e2',
        color: '#991b1b',
        padding: '0.625rem 1.25rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
    },
    modalContent: {
        background: '#fff',
        borderRadius: '1rem',
        padding: '2rem',
        width: 'min(600px, 95vw)',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1e293b',
    },
    closeButton: {
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#64748b',
        padding: '0.25rem',
        lineHeight: 1,
        transition: 'color 0.3s ease',
    },
    modalForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    modalActions: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0',
    },
    cancelButton: {
        background: '#f1f5f9',
        color: '#475569',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    saveButton: {
        background: '#4f46e5',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
};