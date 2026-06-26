import Cookies from 'js-cookie';
import {useRouter} from 'next/router'
import React, { useState } from 'react';


export default function JoinGame(context) {
    const { id } = context;
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Perform form submission or API call with the form data
        // For example:
        const formData = {
            password: password,
        };
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/game/api/join/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Cookies.get('csrftoken')
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                // Request was successful
                router.push(`/game/${id}`);
            } else {
                // Request failed
                const data = await response.json();
                setErrorMessage(data.error);
            }
        } catch (error) {
            setErrorMessage(response.statusText);
        }
        console.log(formData);
    };

    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center min-h-[80vh] pt-16">
          <h1 className="font-display text-4xl font-bold mb-8 text-ink">Join Game</h1>
          {errorMessage && (
            <div className="p-4 mb-4 text-sm rounded-lg bg-incorrect/15 text-incorrect border border-incorrect/40" role="alert">
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="card p-8 w-full max-w-md">
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-muted mb-1">Room password</label>
              <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} className="input" required />
            </div>
            <button type="submit" className="btn-primary w-full py-3">Join</button>
          </form>
        </div>
      </div>
    )
}

export async function getServerSideProps({ params }) {
    return { props: params }
}