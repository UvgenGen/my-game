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
            const response = await fetch(`http://localhost:8000/game/api/join/${id}`, {
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
      <>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl mb-8 text-white">Join game</h1>
            { errorMessage && (
                <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                    <span className="font-medium">{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                </div>
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
            </form>

          </div>
        </div>
      </>
    )
}

export async function getServerSideProps({ params }) {
    return { props: params }
}