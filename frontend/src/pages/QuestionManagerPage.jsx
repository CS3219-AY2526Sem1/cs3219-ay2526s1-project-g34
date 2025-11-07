import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export const QuestionManagerPage = ({ user }) => {
    const [newQuestion, setNewQuestion] = useState({ title:"", description:"", difficulty:"easy", topics:"" });
    const [questions, setQuestions] = useState([]);

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!newQuestion.title || !newQuestion.description || !newQuestion.difficulty || !newQuestion.topics) {
            alert("Please fill in all fields");
            return;
        }

        const response = await fetch('http://localhost:3002/questions', {
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
            const res = await fetch('http://localhost:3002/questions');
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
        const res = await fetch(`http://localhost:3002/questions/${id}`, {
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
        const res = await fetch(`http://localhost:3002/questions/${editing.id}`, {
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
        <div>
            <h1>Question Admin</h1>

            <form onSubmit={onSubmit}>
                <input placeholder="Title" value={newQuestion.title} onChange={(e) => setNewQuestion(q=>({...q, title: e.target.value}))} />
                <textarea placeholder="Description" value={newQuestion.description} onChange={e => setNewQuestion(q => ({ ...q, description: e.target.value }))} />
                <select value={newQuestion.difficulty} onChange={e=>setNewQuestion(q=>({...q, difficulty:e.target.value}))}>
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                </select>
                <input placeholder="topics (comma-separated)" value={newQuestion.topics} onChange={e=>setNewQuestion(q=>({...q,topics:e.target.value}))} />
                <button type="submit">Create</button>
            </form>

            <h2>Question Bank</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
            {questions.map(q => (
                <li key={q.id} style={{ border: "1px solid #ccc", borderRadius: 8, margin: "8px 0", padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{q.title}</strong>
                    <span>{q.difficulty}</span>
                </div>
                <div>{q.description}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Topics: {(q.topics || []).join(", ")}
                </div>
                    <button type="button" onClick={() => openEdit(q)}>Edit</button>
                    <button type="button" onClick={() => deleteQuestion(q.id)}>Delete</button>
                </li>
            ))}
            </ul>


        {editing && editForm && (
        <div
            onClick={closeEdit}
            style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.45)',
            zIndex: 9999, display:'grid', placeItems:'center'
            }}
            aria-modal="true" role="dialog"
        >
            <div
            onClick={(e)=>e.stopPropagation()} // don't close when clicking inside
            style={{ background:'#fff', borderRadius:12, padding:20, width:'min(600px, 92vw)' }}
            >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h3 style={{ margin:0 }}>Edit Question (ID {editing.id})</h3>
                <button type="button" onClick={closeEdit}>✕</button>
            </div>

            <form onSubmit={saveEdit} style={{ display:'grid', gap:8 }}>
                <input
                value={editForm.title}
                onChange={e=>setEditForm(f=>({...f, title: e.target.value}))}
                required
                />
                <textarea
                value={editForm.description}
                onChange={e=>setEditForm(f=>({...f, description: e.target.value}))}
                rows={4}
                required
                />
                <select
                value={editForm.difficulty}
                onChange={e=>setEditForm(f=>({...f, difficulty: e.target.value}))}
                >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
                </select>
                <input
                value={editForm.topics}
                onChange={e=>setEditForm(f=>({...f, topics: e.target.value}))}
                placeholder="topics, comma-separated"
                />

                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
                <button type="button" onClick={closeEdit}>Cancel</button>
                <button type="submit">Save</button>
                </div>
            </form>
            </div>
        </div>
        )}


        </div>
    );

}