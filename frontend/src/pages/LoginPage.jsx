import React, { useState } from 'react';

export const LoginPage = () => {
  const [data, setData] = useState({ username: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();

    console.log('handle submit')
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
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
