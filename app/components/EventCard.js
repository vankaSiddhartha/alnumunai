import { useState, useEffect } from "react";

export default function EventCard({ event }) {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Check if user previously clicked "Join Meeting"
    if (localStorage.getItem("meetJoined") === "true") {
      setShowFeedback(true);
      localStorage.removeItem("meetJoined"); // Remove flag after showing the form
    }
  }, []);

  const handleJoinClick = () => {
    localStorage.setItem("meetJoined", "true"); // Store the flag
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={event.imageUrl || "/api/placeholder/400/200"}
        alt={event.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
        <p className="text-gray-600 mb-4">{event.description}</p>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2z"
            />
          </svg>
          <span>{event.date}</span>
        </div>

        <div className="flex gap-2">
          <a
            href={event.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleJoinClick}
          >
            Join Meeting
          </a>
        </div>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Feedback</h2>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="How was the meeting?"
            />
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setShowFeedback(false)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
