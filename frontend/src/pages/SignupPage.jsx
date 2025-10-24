import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SignupPage = ({ setUser }) => {
    const [data, setData] = useState({ username: '', password: '', role: 'user' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();

        if (data.password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('jwt_token', result.token);
            setUser(result.user);
            navigate('/home');
        }
    };

    const [isAdmin, setIsAdmin] = useState(false); // Initialize state to false (off)

const handleToggle = () => {
        const newRole = data.role === 'user' ? 'admin' : 'user';
        setData({ ...data, role: newRole });
    };


  return (
    <form onSubmit={handleSubmit}>
        <input 
            placeholder="Username"
            onChange={(e) => setData({...data, username: e.target.value})}
        />
        <input 
            type="password"
            placeholder="Password" 
            onChange={(e) => setData({...data, password: e.target.value})}
        />
        <input 
            type="password"
            placeholder="Confirm Password" 
            onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="button" onClick={handleToggle}>
            {data.role === 'user' ? 'User' : 'Admin'}
        </button>
        <button type="submit">Submit</button>
        <button type="button" onClick={() => navigate('/')}>Already have an account? Click here to log in</button>
    </form>
  );

}