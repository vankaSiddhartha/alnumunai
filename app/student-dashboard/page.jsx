"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  MessageSquare,
  Briefcase,
  User,
  Send,
  Search,
  MapPin,
  Clock,
  Building,
  Hash,
  Link as LinkIcon,
  FileText,
  Code,
  Brain,
  Database,
  Network,
  Cpu
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { auth, db } from '@/firebase/config';
import { ref, push, set, onValue } from 'firebase/database';

const DOMAINS = [
  { id: 'ai', name: 'AI & Machine Learning', icon: Brain },
  { id: 'web', name: 'Web Development', icon: Code },
  { id: 'data', name: 'Data Science', icon: Database },
  { id: 'cloud', name: 'Cloud Computing', icon: Network },
  { id: 'systems', name: 'Systems Design', icon: Cpu }
];

const StudentDashboard = () => {
  // State management
  const [interestedDomains, setInterestedDomains] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ai');
  const [domainMessages, setDomainMessages] = useState([]);
  const [newDomainMessage, setNewDomainMessage] = useState('');
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null
  });
// Add this useEffect after the existing ones
useEffect(() => {
  if (!auth.currentUser) return;

  const fetchStudentInterests = async () => {
    try {
      const usersRef = ref(db, 'users');
      const interests = [];
      
      const snapshot = await get(usersRef);
      const data = snapshot.val();

      if (data) {
        Object.values(data).forEach(user => {
          if (user.userType === 'student' && user.interestDomain) {
            interests.push(user.interestDomain);
          }
        });
        
        // Remove duplicates and sort alphabetically
        const uniqueInterests = [...new Set(interests)].sort();
        setInterestedDomains(uniqueInterests);
      }
    } catch (err) {
      console.error('Error fetching student interests:', err);
      setError('Failed to load student interests');
    }
  };

 /// fetchStudentInterests();
}, []);
  // Firebase data fetching
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchData = async () => {
      setSelectedDomain(localStorage.getItem("in"))
      // Fetch alumni users
      const alumniRef = ref(db, 'users');
      const alumniUnsubscribe = onValue(alumniRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const alumniList = Object.entries(data)
              .map(([id, user]) => ({ id, ...user }))
              .filter(user => user.userType === 'alumni');
            setAlumni(alumniList);
          }
        } catch (err) {
          console.error('Error fetching alumni:', err);
          setError('Failed to load alumni');
        }
      });

      // Fetch events
      const eventsRef = ref(db, 'events');
      const eventsUnsubscribe = onValue(eventsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const eventsList = Object.entries(data)
              .map(([id, event]) => ({ id, ...event }))
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            setEvents(eventsList);
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
            const jobsList = Object.entries(data)
              .map(([id, job]) => ({ id, ...job }))
              .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
            setJobs(jobsList);
          }
        } catch (err) {
          console.error('Error fetching jobs:', err);
          setError('Failed to load jobs');
        }
      });

      setLoading(false);

      return () => {
        alumniUnsubscribe();
        eventsUnsubscribe();
        jobsUnsubscribe();
      };
    };

    fetchData();
  }, []);

  // Domain chat messages fetching
  useEffect(() => {
    if (!selectedDomain || !auth.currentUser) return;

    const domainMessagesRef = ref(db, `domainChats/${selectedDomain}`);
    const unsubscribe = onValue(domainMessagesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const messagesList = Object.entries(data)
            .map(([id, message]) => ({ id, ...message }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setDomainMessages(messagesList);
        } else {
          setDomainMessages([]);
        }
      } catch (err) {
        console.error('Error fetching domain messages:', err);
        setError('Failed to load domain messages');
      }
    });

    return () => unsubscribe();
  }, [selectedDomain]);

  // Personal chat messages fetching
  useEffect(() => {
    if (!selectedAlumni || !auth.currentUser) return;

    const chatId = [auth.currentUser.uid, selectedAlumni.id].sort().join('-');
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const messagesList = Object.entries(data)
            .map(([id, message]) => ({ id, ...message }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setMessages(messagesList);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      }
    });

    return () => unsubscribe();
  }, [selectedAlumni]);

  // Handle domain selection
  const handleDomainSelect = (domainId) => {
    if (selectedDomain === domainId) {
      setSelectedDomain(''); // Deselect if clicking the same domain
    } else {
      
      setSelectedDomain(localStorage.getItem("in"));
    }
  };

  // Message sending functions
  const sendPersonalMessage = async () => {
    if (!newMessage.trim() || !selectedAlumni || !auth.currentUser) return;

    try {
      const chatId = [auth.currentUser.uid, selectedAlumni.id].sort().join('-');
      const messagesRef = ref(db, `chats/${chatId}/messages`);
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        content: newMessage.trim(),
        senderId: auth.currentUser.uid,
        receiverId: selectedAlumni.id,
        timestamp: new Date().toISOString()
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const sendDomainMessage = async () => {
    function getNameFromEmail(email) {
    if (!email.includes("@")) return null; // Validate email format
    return email.split("@")[0]; // Extract part before '@'
}


    if (!newDomainMessage.trim() || !selectedDomain || !auth.currentUser) return;

    try {
      const domainMessagesRef = ref(db, `domainChats/${selectedDomain}`);
      const newMessageRef = push(domainMessagesRef);

      await set(newMessageRef, {
        content: newDomainMessage.trim(),
        senderId: auth.currentUser.uid,
        senderName: getNameFromEmail(auth.currentUser.email),
        timestamp: new Date().toISOString()
      });

      setNewDomainMessage('');
    } catch (err) {
      console.error('Error sending domain message:', err);
      setError('Failed to send message');
    }
  };

  // Job application handler
  const handleJobApplication = async (jobId) => {
    if (!auth.currentUser) return;

    try {
      const applicationRef = ref(db, `jobApplications/${jobId}`);
      await set(applicationRef, {
        ...applicationData,
        userId: auth.currentUser.email,
        jobId,
        status: auth.currentUser.email,
        timestamp: new Date().toISOString()
      });

      setApplicationData({ coverLetter: '', resume: null });
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application');
    }
  };

  // Filtering functions
  const filteredAlumni = alumni.filter(alum => {
    const searchFields = [
      alum.name,
      alum.company,
      alum.department,
      alum.designation,
      alum.domains?.join(' ')
    ].filter(Boolean).map(field => field.toLowerCase());
    
    const matchesSearch = searchTerm === '' || searchFields.some(field => 
      field.includes(searchTerm.toLowerCase())
    );

    const matchesDomain = !selectedDomain || 
      alum.domains?.includes(selectedDomain) ||
      (alum.domain === selectedDomain) ||
      (alum.interestDomain === selectedDomain);

    return matchesSearch && (!selectedDomain || matchesDomain);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 animate-fade-in">
            {error}
          </div>
        )}

      <div className="mb-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-400" />
                Domain Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {DOMAINS.map(domain => {
                  const DomainIcon = domain.icon;
                  return (
                    <Button 
                      key={domain.id}
                      className={`w-full justify-start gap-2 ${
                        selectedDomain === domain.id ? 'bg-blue-600' : 'bg-gray-800'
                      }`}
                      onClick={() => handleDomainSelect(domain.id)}
                    >
                      <DomainIcon className="w-4 h-4" />
                      {domain.name}
                    </Button>
                  );
                })}
              </div>

              {selectedDomain && (
                <div className="mt-4">
                  <ScrollArea className="h-[300px] pr-4">
                    {domainMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-4 flex ${
                          message.senderId === auth.currentUser?.uid
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div className="max-w-[70%]">
                          <div className="text-xs text-gray-400 mb-1">
                            {message.senderName}
                          </div>
                          <div
                            className={`p-3 rounded-2xl ${
                              message.senderId === auth.currentUser?.uid
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-800 text-white rounded-bl-none'
                            }`}
                          >
                            {message.content}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                  
                  <div className="flex gap-2 mt-4 p-2 bg-gray-800/50 rounded-lg">
                    <Input
                      value={newDomainMessage}
                      onChange={(e) => setNewDomainMessage(e.target.value)}
                      placeholder={`Message #${selectedDomain}...`}
                      className="bg-transparent border-none focus:ring-0 placeholder-gray-500 text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendDomainMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={sendDomainMessage}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alumni and Chat Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Alumni List */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                <h1 className='text-white'>Alumni Network</h1>
              </CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white" />
                <Input
                  placeholder="Search alumni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-800/50 border-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {alumni.map((alum) => (
                  <div
                    key={alum.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-800/70 rounded-lg mb-2 ${
                      selectedAlumni?.id === alum.id ? 'bg-blue-600/20 border border-blue-500/50' : ''
                    }`}
                    onClick={() => setSelectedAlumni(alum)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{alum.name}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {alum.company} - {alum.designation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            {/* [Previous Chat Window content remains the same...] */}
            <CardHeader className="border-b border-gray-800">
              {selectedAlumni ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="w-7 h-7 text-gray-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">{selectedAlumni.name}</CardTitle>
                    <p className="text-sm text-gray-400">{selectedAlumni.designation} at {selectedAlumni.company}</p>
                  </div>
                </div>
              ) : (
                <CardTitle className="text-xl font-semibold text-white">Select an alumni to chat</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {selectedAlumni ? (
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
                  <div className="flex gap-2 p-2 bg-gray-800/50 rounded-lg">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-transparent border-none focus:ring-0 placeholder-gray-500 text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendPersonalMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={sendPersonalMessage}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                  <MessageSquare className="w-16 h-16 mb-4 text-gray-600" />
                  <p className="text-lg">Select an alumni from the list to start chatting</p>
                </div>
              )}
            </CardContent>
       
          </Card>
        </div>

        {/* Events and Jobs Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Window */}
          
        </div>

        {/* Events and Jobs Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Events Section */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h1 className='text-white'>Upcoming Events</h1>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {events.map((event) => (
                  <div key={event.id} className="mb-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                    <h3 className="font-medium text-lg mb-2">{event.name}</h3>
                    <p className="text-gray-400 mb-3">{event.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2 text-purple-400" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    {event.meetLink && (
                      <Button
                        variant="link"
                        className="text-purple-400 hover:text-purple-300 p-0 mt-2"
                        onClick={() => window.open(event.meetLink, '_blank')}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Jobs Section */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-400" />
                <h1 className='text-white'>Job Opportunities</h1>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {jobs.map((job) => (
                  <div key={job.id} className="mb-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                    <h3 className="font-medium text-lg mb-2 text-white">{job.title}</h3>
                    <div className="flex items-center text-gray-300 mb-2">
                      <Building className="w-4 h-4 mr-2 text-green-400" />
                      <span className="text-white">{job.company}</span>
                    </div>
                    <p className="text-gray-200 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div className="flex items-center text-white">
                        <MapPin className="w-4 h-4 mr-2 text-green-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-white">
                        <Clock className="w-4 h-4 mr-2 text-green-400" />
                        {job.type}
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 transition-colors">
                          <FileText className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 text-white border-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold mb-4">
                            Apply for {job.title} at {job.company}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Cover Letter</label>
                            <Textarea
                              value={applicationData.coverLetter}
                              onChange={(e) => setApplicationData({
                                ...applicationData,
                                coverLetter: e.target.value
                              })}
                              placeholder="Write your cover letter here..."
                              className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Resume</label>
                            <Input
                              type="file"
                              onChange={(e) => setApplicationData({
                                ...applicationData,
                                resume: e.target.files[0]
                              })}
                              className="bg-gray-800 border-gray-700 text-white"
                              accept=".pdf,.doc,.docx"
                            />
                          </div>
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 transition-colors"
                            onClick={() => handleJobApplication(job.id)}
                          >
                            Submit Application
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;