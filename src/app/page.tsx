"use client";

import Head from "next/head";
import { FormEvent, useState, useEffect } from "react";
import useSWR from "swr";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LinkInvalid from "./component/LinkInvalid";
import LinkSuccess from "./component/LinkSuccess";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DataType {
  urlMusic: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const { data, error } = useSWR<DataType>(
    url ? `http://localhost:3000/api/playlist?url=${url}` : null,
    fetcher
  );

  const [showSuccess, setShowSuccess] = useState(false);
  const [isUrlSubmitted, setIsUrlSubmitted] = useState(false);

  const notifyError = () => toast.error("Link invalid or try again.");
  const notifySuccess = () =>
    toast.success("Link has been linked to playlist.");

  useEffect(() => {
    if (data?.urlMusic && !audioUrls.includes(data.urlMusic) && isUrlSubmitted) {
      setAudioUrls((prevUrls) => [...prevUrls, data.urlMusic]);
      notifySuccess();
      setShowSuccess(true);

      // Reset isUrlSubmitted to false after processing
      setIsUrlSubmitted(false);

      // Hide success message after 6 seconds
      const timer = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [data, audioUrls, isUrlSubmitted]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUrl(e.currentTarget.url.value);

    // Indicate that a URL has been submitted
    setIsUrlSubmitted(true);
  };

  const handleAudioEnd = () => {
    setCurrentAudioIndex((prevIndex) => (prevIndex + 1) % audioUrls.length);
  };

  useEffect(() => {
    if (error) {
      notifyError();
    }
  }, [error]);

  useEffect(() => {
    if (audioUrls.length > 1 && currentAudioIndex !== 0) {
      const audioElement = document.getElementById(
        "audioElement"
      ) as HTMLAudioElement;
      if (audioElement) {
        audioElement.play();
      }
    }
  }, [currentAudioIndex, audioUrls.length]);

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
            placeholder="Digite a URL da API"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Adicionar
          </button>
        </form>

        {error && <LinkInvalid />}

        {showSuccess && <LinkSuccess />}

        {audioUrls.length > 0 && (
          <audio
            id="audioElement"
            controls
            autoPlay
            onEnded={handleAudioEnd}
            className="mt-6"
            src={audioUrls[currentAudioIndex]}
          >
            Seu navegador não suporta o elemento de áudio.
          </audio>
        )}
      </div>
    </main>
  );
}
