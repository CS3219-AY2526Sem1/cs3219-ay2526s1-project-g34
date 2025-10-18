import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export const QuestionManagerPage = ({ setUser }) => {
    const [newQuestion, setNewQuestion] = useState({ title:"", description:"", difficulty:"easy", topics:"" });
    const [questions, setQuestions] = useState([]);

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!newQuestion.title || !newQuestion.description || !newQuestion.difficulty || !newQuestion.topics) {
            alert("Please fill in all fields");
            return;
        }

        const response = await fetch('http://localhost:3001/api/questions', {
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
            const res = await fetch('http://localhost:3001/api/questions');
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
                </li>
            ))}
            </ul>

        </div>
    );

}