"use client"
import React, { useEffect, useState, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const MeetingRoom = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    quality: '',
    comments: ''
  });
  const [sentimentResults, setSentimentResults] = useState(null);
  const apiRef = useRef(null);
  const scriptRef = useRef(null);

  // Sentiment analysis function
  const analyzeSentiment = (feedbackData) => {
    const { rating, quality, comments } = feedbackData;
    
    // Convert rating to sentiment score (1-5 to 0-1)
    const numericalSentiment = rating / 5;
    
    // Analyze text sentiment
    const qualityScores = {
      excellent: 1,
      good: 0.75,
      fair: 0.5,
      poor: 0.25
    };
    
    // Get sentiment from comments
    const positiveWords = ["awesome", "great", "fantastic", "love", "super", "cool", "amazing", "happy", "excellent"];
    const negativeWords = ["bad", "awful", "terrible", "hate", "trash", "horrible", "disgusting", "worst"];
    
    const words = comments.toLowerCase().split(/\s+/);
    let textScore = 0;
    let wordCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        textScore += 1;
        wordCount++;
      }
      if (negativeWords.includes(word)) {
        textScore -= 1;
        wordCount++;
      }
    });
    
    // Calculate text sentiment (normalize to 0-1)
    const textSentiment = wordCount > 0 
      ? (textScore / wordCount + 1) / 2 
      : 0.5;
    
    // Calculate quality sentiment
    const qualitySentiment = qualityScores[quality] || 0.5;
    
    // Calculate overall sentiment
    const overallSentiment = (numericalSentiment + textSentiment + qualitySentiment) / 3;
    
    // Generate summary based on overall sentiment
    let summary = "";
    if (overallSentiment >= 0.8) {
      summary = "Extremely positive feedback!";
    } else if (overallSentiment >= 0.6) {
      summary = "Generally positive feedback";
    } else if (overallSentiment >= 0.4) {
      summary = "Neutral feedback";
    } else if (overallSentiment >= 0.2) {
      summary = "Somewhat negative feedback";
    } else {
      summary = "Very negative feedback";
    }
    
    return {
      overall_sentiment: overallSentiment,
      numerical_sentiment: numericalSentiment,
      text_sentiment: textSentiment,
      quality_sentiment: qualitySentiment,
      summary
    };
  };

  // Jitsi initialization
  useEffect(() => {
    if (scriptRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    scriptRef.current = script;
    
    const initializeJitsi = () => {
      if (apiRef.current) return;

      const domain = 'meet.jit.si';
      const options = {
        roomName: 'NextJSGroupMeeting',
        width: '100%',
        height: 700,
        parentNode: document.querySelector('#meet'),
        userInfo: {
          displayName: 'NextJS User'
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 
            'fullscreen', 'fodeviceselection', 'hangup', 'profile',
            'recording', 'livestreaming', 'etherpad', 'sharedvideo',
            'settings', 'raisehand', 'videoquality', 'filmstrip',
            'feedback', 'stats', 'shortcuts', 'tileview', 'chat',
            'security', 'invite', 'mute-everyone', 'e2ee'
          ]
        }
      };
      
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      
      apiRef.current.addEventListeners({
        readyToClose: () => {
          setShowFeedback(true);
          console.log("Meeting closed");
        },
        participantJoined: (participant) => {
          console.log("Participant joined:", participant);
        },
        participantLeft: (participant) => {
          console.log("Participant left:", participant);
        }
      });
    };
    
    script.onload = initializeJitsi;
    document.body.appendChild(script);
    
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    
    // Validation
    if (feedback.rating === 0 || !feedback.quality) {
      alert('Please provide a rating and connection quality');
      return;
    }

    try {
      // Perform local sentiment analysis
      const result = analyzeSentiment(feedback);
      setSentimentResults(result);
      
      // Create feedback object with timestamp and analysis
      const feedbackEntry = {
        ...feedback,
        sentiment: result,
        timestamp: new Date().toISOString(),
        meetingId: 'NextJSGroupMeeting'
      };
      
      // Save to localStorage (with proper error handling)
      try {
        // Get existing feedback from localStorage
        let existingFeedback = [];
        const storedFeedback = localStorage.getItem('meetingFeedback');
        
        if (storedFeedback) {
          existingFeedback = JSON.parse(storedFeedback);
          // Ensure it's an array
          if (!Array.isArray(existingFeedback)) {
            existingFeedback = [];
          }
        }
        
        // Add new feedback
        existingFeedback.push(feedbackEntry);
        
        // Save back to localStorage
        localStorage.setItem('meetingFeedback', JSON.stringify(existingFeedback));
        console.log('Feedback saved successfully:', feedbackEntry);
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        // Still show the analysis but inform about storage error
        alert('Analysis completed, but there was an error saving your feedback.');
      }
      
      // Don't reset the form immediately so user can see the results
      setTimeout(() => {
        setFeedback({ rating: 0, quality: '', comments: '' });
        setShowFeedback(false);
        setSentimentResults(null);
      }, 5000); // Close after 5 seconds
      
    } catch (error) {
      console.error('Error processing feedback:', error);
      alert('There was an error processing your feedback. Please try again.');
    }
  };

  // Function to get color based on sentiment score
  const getSentimentColor = (score) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-green-400';
    if (score >= 0.4) return 'bg-yellow-400';
    if (score >= 0.2) return 'bg-red-400';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Group Meeting Room</h1>
          <div className="flex gap-3">
            <Link href="/feedback-history">
              <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                View Feedback History
              </button>
            </Link>
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <MessageSquare size={20} />
              Provide Feedback
            </button>
          </div>
        </div>
        <div id="meet" className="rounded-lg overflow-hidden shadow-lg"></div>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Meeting Feedback</h2>
              <button 
                onClick={() => {
                  setShowFeedback(false);
                  setSentimentResults(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-6">
                <label className="block text-lg mb-2">How would you rate this meeting?</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFeedback({...feedback, rating: value})}
                      className={`w-12 h-12 rounded-full ${
                        feedback.rating === value 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-2">How was the connection quality?</label>
                <select
                  value={feedback.quality}
                  onChange={(e) => setFeedback({...feedback, quality: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select an option</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-2">Additional comments</label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
                  className="w-full p-2 border rounded-lg h-32"
                  placeholder="Share your thoughts about the meeting..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit Feedback
              </button>
            </form>

            {sentimentResults && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Feedback Analysis</h3>
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg text-white ${getSentimentColor(sentimentResults.overall_sentiment)}`}>
                    <p className="text-lg font-medium">{sentimentResults.summary}</p>
                    <p className="text-sm opacity-90">
                      Overall Sentiment Score: {(sentimentResults.overall_sentiment * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="font-medium">Rating Sentiment</p>
                      <p className="text-sm">{(sentimentResults.numerical_sentiment * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="font-medium">Text Sentiment</p>
                      <p className="text-sm">{(sentimentResults.text_sentiment * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;