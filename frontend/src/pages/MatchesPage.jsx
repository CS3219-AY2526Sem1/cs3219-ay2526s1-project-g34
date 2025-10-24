import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const MatchesPage = (user) => {
    
    const [matches, setMatches] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchMatches()
    }, [])

    const fetchMatches = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/matches')
            if (!response.ok) {
                throw new Error('Failed to get matches')
            }

            const data = await response.json();
            console.log('this is the data', data)
            setMatches(data);
        } catch (err) {
            setError(err.message)
        }
    }
  
    return (
        <div>
        <h1>All Matches</h1>
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Match ID</th>
              <th>Status</th>
              <th>Participants</th>
              <th>buttons</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan="5">No matches found</td>
              </tr>
            ) : (
              matches.map(match => (
                <tr key={match.id}>
                  <td>{match.id}</td>
                  <td>{match.status}</td>
                  <td>
                    <ul>
                        {match.participants.map(p=>(
                        <li key={p.userId}>{p.userId}</li>
                        ))}
                    </ul>
                  </td>
                  <td><Link to={`/match/${match.id}`}>join match</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
}