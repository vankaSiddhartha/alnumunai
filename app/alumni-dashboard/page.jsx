"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  Briefcase, 
  Plus, 
  Image,
  MessageSquare,
  Send,
  User,
  Bell
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { auth, db } from '@/firebase/config';
import { ref, push, set, onValue, remove } from 'firebase/database';

const AlumniDashboard = () => {
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    meetLink: '',
    bannerUrl: ''
  });

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    type: 'Full-time'
  });
    const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch all chats for the alumni
    const chatsRef = ref(db, 'chats');
    const chatsUnsubscribe = onValue(chatsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const chatsList = Object.entries(data)
            .filter(([chatId]) => chatId.includes(auth.currentUser.uid))
            .map(([id, chat]) => ({
              id,
              ...chat,
              unread: chat.lastMessage?.receiverId === auth.currentUser.uid && !chat.lastMessage?.read
            }));
          setChats(chatsList);
          setUnreadCount(chatsList.filter(chat => chat.unread).length);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load chats');
      }
    });

    return () => {
      chatsUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedChat || !auth.currentUser) return;

    // Fetch messages for selected chat
    const messagesRef = ref(db, `chats/${selectedChat.id}/messages`);
    const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const messagesList = Object.entries(data)
            .map(([id, message]) => ({
              id,
              ...message
            }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setMessages(messagesList);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    });

    // Mark messages as read
    if (selectedChat.unread) {
      const chatRef = ref(db, `chats/${selectedChat.id}/lastMessage`);
      set(chatRef, { ...selectedChat.lastMessage, read: true });
    }

    return () => messagesUnsubscribe();
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !auth.currentUser) return;

    try {
      const messagesRef = ref(db, `chats/${selectedChat.id}/messages`);
      const newMessageRef = push(messagesRef);
      const messageData = {
        content: newMessage.trim(),
        senderId: auth.currentUser.uid,
        receiverId: selectedChat.id.replace(auth.currentUser.uid, '').replace('-', ''),
        timestamp: new Date().toISOString()
      };

      await set(newMessageRef, messageData);
      
      // Update last message
      const chatRef = ref(db, `chats/${selectedChat.id}/lastMessage`);
      await set(chatRef, { ...messageData, read: false });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };


  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch events
    const eventsRef = ref(db, 'events');
    const eventsUnsubscribe = onValue(eventsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const eventsArray = Object.entries(data).map(([id, event]) => ({
            id,
            ...event
          }));
          setEvents(eventsArray);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      }
    });

    // Fetch jobs
    const jobsRef = ref(db, 'jobs');
    const jobsUnsubscribe = onValue(jobsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const jobsArray = Object.entries(data).map(([id, job]) => ({
            id,
            ...job
          }));
          setJobs(jobsArray);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
      }
    });

    setLoading(false);

    // Cleanup subscriptions
    return () => {
      eventsUnsubscribe();
      jobsUnsubscribe();
    };
  }, []);

  const handleAddEvent = async () => {
    try {
      const eventsRef = ref(db, 'events');
      const newEventRef = push(eventsRef);
      
      await set(newEventRef, {
        ...newEvent,
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      setNewEvent({
        name: '',
        description: '',
        date: '',
        time: '',
        meetLink: '',
        bannerUrl: ''
      });
    } catch (error) {
      console.error('Error adding event:', error);
      setError('Failed to add event');
    }
  };

  const handleAddJob = async () => {
    try {
      const jobsRef = ref(db, 'jobs');
      const newJobRef = push(jobsRef);
      
      await set(newJobRef, {
        ...newJob,
        postedBy: auth.currentUser.uid,
        postedAt: new Date().toISOString()
      });

      setNewJob({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        type: 'Full-time'
      });
    } catch (error) {
      console.error('Error adding job:', error);
      setError('Failed to add job');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventRef = ref(db, `events/${eventId}`);
      await remove(eventRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const jobRef = ref(db, `jobs/${jobId}`);
      await remove(jobRef);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Alumni Dashboard</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        <div className="relative m-4">
            <Bell className="w-6 h-6 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Messages Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Messages
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle><h1 className='text-white'>Recent Chats</h1></CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-4 cursor-pointer hover:bg-gray-800 rounded-lg mb-2 ${
                        selectedChat?.id === chat.id ? 'bg-gray-800' : ''
                      } ${chat.unread ? 'border-l-4 border-blue-500' : ''}`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-white">
                            {chat.studentName || 'Student'}
                            {chat.unread && (
                              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                New
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {chat.lastMessage?.content?.substring(0, 30)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className = "text-white">
                  {selectedChat ? `Chat with ${selectedChat.studentName || 'Student'}` : 'Select a chat'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedChat ? (
                  <>
                    <ScrollArea className="h-[400px] mb-4 p-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 flex ${
                            message.senderId === auth.currentUser?.uid
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div className="max-w-[70%]">
                            <div
                              className={`p-3 rounded-2xl ${
                                message.senderId === auth.currentUser?.uid
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-gray-800 text-white rounded-bl-none'
                              }`}
                            >
                              {message.content}
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${
                              message.senderId === auth.currentUser?.uid ? 'text-right' : 'text-left'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    <div className="flex gap-2 p-2 bg-gray-800 rounded-lg">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="bg-transparent border-none focus:ring-0 text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={sendMessage}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p>Select a chat to start messaging</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        {/* Events Section */}
        <div className="m-12 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Events</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 text-white">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Fill in the details for your new event
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Event Name</Label>
                    <Input
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Meet Link</Label>
                    <Input
                      value={newEvent.meetLink}
                      onChange={(e) => setNewEvent({...newEvent, meetLink: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Banner Image URL</Label>
                    <Input
                      value={newEvent.bannerUrl}
                      onChange={(e) => setNewEvent({...newEvent, bannerUrl: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Button onClick={handleAddEvent} className="w-full bg-blue-600 hover:bg-blue-700">
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  {event.bannerUrl && (
                    <img 
                      src={event.bannerUrl} 
                      alt={event.name} 
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardTitle className="text-xl font-semibold">{event.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    {event.meetLink && (
                      <div className="flex items-center text-blue-400">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        <a href={event.meetLink} target="_blank" rel="noopener noreferrer">
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                  {event.createdBy === auth.currentUser?.uid && (
                    <Button 
                      variant="destructive"
                      className="mt-4"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Jobs Section */}
        <div className="m-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Job Opportunities</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Job
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 text-white">
                <DialogHeader>
                  <DialogTitle>Post New Job</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Fill in the details for the job opportunity
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={newJob.company}
                      onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newJob.description}
                      onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Requirements</Label>
                    <Textarea
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Button onClick={handleAddJob} className="w-full bg-blue-600 hover:bg-blue-700">
                    Post Job
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{job.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-gray-300 mb-4">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{job.company}</span>
                  </div>
                  <p className="text-gray-400 mb-4">{job.description}</p>
                  <div className="text-sm text-gray-300">
                    <div className="mb-2">
                      <strong>Requirements:</strong>
                      <p>{job.requirements}</p>
                    </div>
                    <div className="mb-2">
                      <strong>Location:</strong> {job.location}
                    </div>
                    <div>
                      <strong>Type:</strong> {job.type}
                    </div>
                  </div>
                  {job.postedBy === auth.currentUser?.uid && (
                    <Button 
                      variant="destructive"
                      className="mt-4"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete Job
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;