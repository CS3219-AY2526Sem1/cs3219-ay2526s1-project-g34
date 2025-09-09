import React, { useState } from 'react';

export const SimpleForm = () => {
  const [data, setData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    console.log('handle submit')
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    console.log(response)

    console.log(await response.json());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Email"
        onChange={(e) => setData({...data, email: e.target.value})}
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
