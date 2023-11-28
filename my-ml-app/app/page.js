"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./styles/Home.module.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: e.target.prompt.value,
        }),
      });

      // Check if the response status is not in the range [200, 299] (i.e., not a successful response)
      if (!response.ok) {
        const errorData = await response.json(); // Assuming the error response is in JSON format
        setError(errorData.detail); // Adjust this based on the actual error response structure
        return;
      }

      // Assuming the successful response contains JSON data
      let prediction = await response.json();

      setPrediction(prediction);

      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed"
      ) {
        await sleep(1000);

        const statusResponse = await fetch("/api/predictions/" + prediction.id);

        // Check if the status response status is not in the range [200, 299]
        if (!statusResponse.ok) {
          const errorData = await statusResponse.json(); // Adjust this based on the actual error response structure
          setError(errorData.detail);
          return;
        }

        prediction = await statusResponse.json();
        console.log({ prediction });
        setPrediction(prediction);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("An unexpected error occurred. Please try again."); // Provide a generic error message
    }
  };

  return (
    <main className={styles.form}>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Dream something with{" "}
          <a
            href="https://replicate.com/stability-ai/stable-diffusion"
            previewlistener="true"
          >
            SDXL
          </a>
          :
        </p>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="prompt"
            placeholder="Enter a prompt to display an image"
            style={{ width: "100%" }}
          />
          <button type="submit">Go!</button>
        </form>

        {error && <div>{error}</div>}

        {prediction && (
          <div>
            {prediction.output && (
              <div className={styles.imageWrapper}>
                <Image
                fill
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes='100vw'
              />
              </div>
            )}
            <p>status: {prediction.status}</p>
          </div>
        )}
      </div>
    </main>
  );
}
