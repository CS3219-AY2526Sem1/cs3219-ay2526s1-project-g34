import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CreateMatchPage = () => {
    const navigate = useNavigate();
  
    const handleSubmit = async e => {
      e.preventDefault();
  
      const response = await fetch('http://localhost:3001/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (response.ok) {
        navigate('/collaborate');
      }
    };
  
    return (
        <form onSubmit={handleSubmit}>
        <button type="submit">create match</button>
      </form>
    )
}