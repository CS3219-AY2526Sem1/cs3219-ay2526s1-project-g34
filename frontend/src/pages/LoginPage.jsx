import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = ({ setUser }) => {
  const [data, setData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  
  const handleSubmit = async e => {
    e.preventDefault();

    const response = await fetch('http://localhost:3001/api/auth/login', {
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
      <button type="submit">Submit</button>
    </form>
  );
}
