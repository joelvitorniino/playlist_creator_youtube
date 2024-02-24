'use client';

import Head from 'next/head';
import { FormEvent, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [inputUrl, setInputUrl] = useState('');
  const [jsonUrls, setJsonUrls] = useState('');
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const notifyError = (message = 'Error processing input.') => toast.error(message);
  const notifySuccess = (message = 'URL(s) added to the playlist.') => toast.success(message);

  const fetchAudioUrl = async (url: string) => {
    try {
      const currentUrl = window.location.href;

      const response = await fetch(`${currentUrl}/api/playlist?url=${url}`);
      const data = await response.json();
      if (data?.urlMusic && !audioUrls.includes(data.urlMusic)) {
        setAudioUrls((prevUrls) => [...prevUrls, data.urlMusic]);
        notifySuccess('API URL added to the playlist.');
      }
    } catch (error) {
      notifyError();
    }
  };

  const handleAudioEnd = () => {
    setCurrentAudioIndex((prevIndex) => (prevIndex + 1) % audioUrls.length);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (jsonUrls.trim()) {
      try {
        const parsedUrls = JSON.parse(jsonUrls);
        if (Array.isArray(parsedUrls)) {
          for (const item of parsedUrls) {
            await fetchAudioUrl(item.url); // Process each URL through the API
          }
        }
      } catch (error) {
        notifyError('Error processing JSON.');
      }
    } else if (inputUrl.trim()) {
      await fetchAudioUrl(inputUrl); // Process the single URL through the API
    } else {
      notifyError();
    }

    // Clear fields after submission
    setInputUrl('');
    setJsonUrls('');
  };

  return (
    <main className="flex min-h-screen justify-center items-center bg-gray-100">
      <Head>
        <title>Playlist Creator</title>
      </Head>

      <div className="max-w-md mx-auto p-8 bg-white rounded shadow-md">
        <h1 className="text-3xl font-semibold text-center mb-6 text-blue-500">
          Playlist Creator
        </h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            name="url"
            placeholder="Enter the music or API URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-black mb-4"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <textarea
            name="jsonUrls"
            placeholder="Paste JSON here"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-black"
            value={jsonUrls}
            onChange={(e) => setJsonUrls(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Add to Playlist
          </button>
        </form>

        <ToastContainer />

        {audioUrls.length > 0 && (
          <audio
            controls
            autoPlay
            onEnded={handleAudioEnd}
            src={audioUrls[currentAudioIndex]}
          >
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </main>
  );
}
