import Cookies from 'js-cookie';
import {useRouter} from 'next/router'
import React, { useState } from 'react';

const GameForm = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [userCount, setUserCount] = useState(2);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('max_player_count', userCount);
    formData.append('password', password);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/game/api/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken')
        },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        // Keep the loading state on — we're navigating away to the new game.
        router.push(`/game/${data.id}`);
      } else {
        const detail = await response.json().catch(() => null);
        const message = detail && typeof detail === 'object'
          ? Object.entries(detail)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
              .join('  ')
          : (response.statusText || 'Could not create the game.');
        setError(message);
        setLoading(false);
      }
    } catch (err) {
      setError('Network error — could not reach the server.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center min-h-[80vh] pt-16">
        <h1 className="font-display text-4xl font-bold mb-8 text-ink">Create Game</h1>
        <form onSubmit={handleSubmit} className="card p-8 w-full max-w-md">
          <div className="mb-5">
            <label htmlFor="title" className="block text-sm font-medium text-muted mb-1">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
          </div>
          <div className="mb-5">
            <label htmlFor="file" className="block text-sm font-medium text-muted mb-1">Pack file (.siq)</label>
            <input type="file" id="file" onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan/15 file:text-cyan hover:file:bg-cyan hover:file:text-night file:cursor-pointer" />
          </div>
          <div className="mb-5">
            <label htmlFor="userCount" className="block text-sm font-medium text-muted mb-1">Player count</label>
            <div className="flex items-center gap-3">
              <input type="range" id="userCount" min="2" max="8" value={userCount}
                onChange={(e) => setUserCount(parseInt(e.target.value))}
                className="w-full h-2 appearance-none rounded-full bg-surface-2 accent-cyan outline-none" />
              <div className="w-8 text-center font-display font-bold text-cyan">{userCount}</div>
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-muted mb-1">Room password</label>
            <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          </div>
          {error && (
            <div className="mb-4 p-3 text-sm rounded-lg bg-incorrect/15 text-incorrect border border-incorrect/40" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 mr-2 align-[-2px] rounded-full border-2 border-current border-t-transparent animate-spin" />
                Creating game… this can take a moment
              </>
            ) : 'Create Game'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameForm;
