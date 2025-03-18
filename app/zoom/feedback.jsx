"use client"
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/firebase/config';
import { ref, onValue, remove, set } from 'firebase/database';

const FeedbackHistory = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Reference to the feedback data in Firebase
    const feedbackRef = ref(db, 'meetingFeedback');
    
    // Set up a listener for changes to the feedback data
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      try {
        const data = snapshot.val();
        let parsedFeedback = [];
        
        if (data) {
          // Convert Firebase object to array with IDs
          parsedFeedback = Object.entries(data).map(([id, value]) => ({
            id,
            ...value
          }));
          
          // Sort by timestamp descending (newest first)
          parsedFeedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        
        setFeedbackList(parsedFeedback);
      } catch (error) {
        console.error('Error loading feedback:', error);
        setFeedbackList([]);
      } finally {
        setIsLoading(false);
      }
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  const handleDeleteFeedback = (id) => {
    try {
      // Reference to the specific feedback entry
      const feedbackItemRef = ref(db, `meetingFeedback/${id}`);
      
      // Remove the feedback from Firebase
      remove(feedbackItemRef);
      // Firebase listener will automatically update the state
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback. Please try again.');
    }
  };

  const handleClearAllFeedback = () => {
    if (window.confirm('Are you sure you want to delete all feedback records?')) {
      try {
        // Reference to all feedback data
        const feedbackRef = ref(db, 'meetingFeedback');
        
        // Clear all feedback by setting it to null
        set(feedbackRef, null);
        // Firebase listener will automatically update the state
      } catch (error) {
        console.error('Error clearing feedback:', error);
        alert('Error clearing feedback. Please try again.');
      }
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to get badge color based on sentiment score
  const getSentimentColor = (score) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-green-400';
    if (score >= 0.4) return 'bg-yellow-400';
    if (score >= 0.2) return 'bg-red-400';
    return 'bg-red-500';
  };

  // Filter feedback by sentiment category
  const getFilteredFeedback = () => {
    if (filter === 'all') return feedbackList;
    
    return feedbackList.filter(item => {
      const score = item.sentiment?.overall_sentiment || 0;
      if (filter === 'positive' && score >= 0.6) return true;
      if (filter === 'neutral' && score >= 0.4 && score < 0.6) return true;
      if (filter === 'negative' && score < 0.4) return true;
      return false;
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    if (feedbackList.length === 0) return { avg: 0, positive: 0, neutral: 0, negative: 0 };
    
    let totalSentiment = 0;
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    
    feedbackList.forEach(item => {
      const score = item.sentiment?.overall_sentiment || 0;
      totalSentiment += score;
      
      if (score >= 0.6) positive++;
      else if (score >= 0.4) neutral++;
      else negative++;
    });
    
    return {
      avg: totalSentiment / feedbackList.length,
      positive: (positive / feedbackList.length) * 100,
      neutral: (neutral / feedbackList.length) * 100,
      negative: (negative / feedbackList.length) * 100
    };
  };

  const stats = calculateStats();
  const filteredFeedback = getFilteredFeedback();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Feedback History</h1>
        </div>

        {/* Stats Summary */}
        {feedbackList.length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
            <h2 className="text-xl text-black font-semibold mb-4">Feedback Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">Average Sentiment</p>
                <p className="text-2xl font-bold text-black">{(stats.avg * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800">Positive Feedback</p>
                <p className="text-2xl font-bold text-black">{stats.positive.toFixed(1)}%</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-800">Neutral Feedback</p>
                <p className="text-2xl font-bold text-black">{stats.neutral.toFixed(1)}%</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-800">Negative Feedback</p>
                <p className="text-2xl font-bold text-black">{stats.negative.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="filter" className="font-medium">Filter by:</label>
            <select 
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded-lg text-black"
            >
              <option value="all">All Feedback</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          {feedbackList.length > 0 && (
            <button
              onClick={handleClearAllFeedback}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Clear All Feedback
            </button>
          )}
        </div>

        {/* Feedback List */}
        {filteredFeedback.length > 0 ? (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Meeting: {item.meetingId || 'Unknown'}</span>
                      {item.sentiment && (
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getSentimentColor(item.sentiment.overall_sentiment)}`}>
                          {item.sentiment.summary}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteFeedback(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700">Rating</p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            className={`text-xl ${star <= item.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700">Connection Quality</p>
                      <p className="capitalize mt-1 text-black">{item.quality || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {item.comments && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Comments</p>
                      <p className="mt-1 text-black">{item.comments}</p>
                    </div>
                  )}
                  
                  {item.sentiment && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700">Sentiment Analysis</p>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Overall</p>
                          <p className="font-medium text-black">{(item.sentiment.overall_sentiment * 100).toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Rating</p>
                          <p className="font-medium text-black">{(item.sentiment.numerical_sentiment * 100).toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Text</p>
                          <p className="font-medium text-black">{(item.sentiment.text_sentiment * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-md">
            <p className="text-lg text-gray-600">
              {feedbackList.length === 0 
                ? "No feedback records found. Submit meeting feedback to see it here."
                : "No feedback matches your current filter."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackHistory;