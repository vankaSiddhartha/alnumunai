"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User } from 'lucide-react';
import { auth, db } from '@/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'student',
    graduationYear: '',
    department: '',
    company: '',
    designation: '',
    interestDomain: '',
    expertiseDomain: '',
    workingDomain: ''
  });

  const graduationYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveUserToDatabase = async (userId) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      
      const userData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: userId,
      };
      
      delete userData.password;
      
      await set(userRef, userData);
      
      if (formData.userType === 'alumni') {
        router.push('/alumni-dashboard');
      } else if (formData.userType === 'teacher') {
        router.push('/teacher-dashboard');
      } else {
        router.push('/student-dashboard');
      }
    } catch (err) {
      setError('Failed to save user data: ' + err.message);
      console.error('Error saving user data:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        
        const userRef = ref(db, `users/${userCredential.user.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.userType === 'alumni') {
            router.push('/alumni-dashboard');
          } else if (userData.userType === 'teacher') {
            router.push('/teacher-dashboard');
          } else {
            router.push('/student-dashboard');
          }
        } else {
          setError('User data not found');
        }
      } else {
        // Validate required fields for registration
        if (!formData.name) {
          setError('Name is required');
          setLoading(false);
          return;
        }

        if (!formData.department) {
          setError('Department is required');
          setLoading(false);
          return;
        }

        if (formData.userType === 'student' && !formData.interestDomain) {
          setError('Interest domain is required');
          setLoading(false);
          return;
        }else{
          localStorage.setItem("in",formData.interestDomain)
        }

        if (formData.userType === 'alumni') {
          if (!formData.company || !formData.designation || !formData.workingDomain || !formData.expertiseDomain) {
            setError('All alumni fields are required');
            setLoading(false);
            return;
          }else{
          
          localStorage.setItem("in",formData.interestDomain)
        

          }
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        await saveUserToDatabase(userCredential.user.uid);
      }
    } catch (err) {
      let errorMessage = 'Authentication failed';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Register for a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input 
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9 bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label className="text-white">User Type</Label>
                  <Select 
                    name="userType" 
                    value={formData.userType} 
                    onValueChange={(value) => handleSelectChange('userType', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="alumni">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Department</Label>
                  <Select 
                    name="department" 
                    value={formData.department} 
                    onValueChange={(value) => handleSelectChange('department', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="ee">Electrical Engineering</SelectItem>
                      <SelectItem value="me">Mechanical Engineering</SelectItem>
                      <SelectItem value="ce">Civil Engineering</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.userType === 'student' && (
                  <div className="space-y-2">
                    <Label className="text-white">Interest Domain</Label>
                    <Select 
                      name="interestDomain" 
                      value={formData.interestDomain} 
                      onValueChange={(value) => handleSelectChange('interestDomain', value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select interest domain" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="ai">Artificial Intelligence</SelectItem>
                        <SelectItem value="ml">Machine Learning</SelectItem>
                        <SelectItem value="data">Data Science</SelectItem>
                        <SelectItem value="web">Web Development</SelectItem>
                        <SelectItem value="mobile">Mobile Development</SelectItem>
                        <SelectItem value="cloud">Cloud Computing</SelectItem>
                        <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="robotics">Robotics</SelectItem>
                        <SelectItem value="iot">Internet of Things</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.userType === 'alumni' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white">Current Company</Label>
                      <Input 
                        name="company"
                        placeholder="Company Name"
                        value={formData.company}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Designation</Label>
                      <Input 
                        name="designation"
                        placeholder="Current Role"
                        value={formData.designation}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Working Domain</Label>
                      <Select 
                        name="workingDomain" 
                        value={formData.workingDomain} 
                        onValueChange={(value) => handleSelectChange('workingDomain', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select working domain" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="software">Software Development</SelectItem>
                          <SelectItem value="data">Data Engineering</SelectItem>
                          <SelectItem value="devops">DevOps</SelectItem>
                          <SelectItem value="cloud">Cloud Architecture</SelectItem>
                          <SelectItem value="security">Information Security</SelectItem>
                          <SelectItem value="product">Product Management</SelectItem>
                          <SelectItem value="consulting">IT Consulting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Expertise Domain</Label>
                      <Select 
                        name="expertiseDomain" 
                        value={formData.expertiseDomain} 
                        onValueChange={(value) => handleSelectChange('expertiseDomain', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select expertise domain" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="ai">AI/ML</SelectItem>
                          <SelectItem value="frontend">Frontend Development</SelectItem>
                          <SelectItem value="backend">Backend Development</SelectItem>
                          <SelectItem value="fullstack">Full Stack Development</SelectItem>
                          <SelectItem value="mobile">Mobile Development</SelectItem>
                          <SelectItem value="data">Data Science</SelectItem>
                          <SelectItem value="cloud">Cloud Computing</SelectItem>
                          <SelectItem value="security">Cybersecurity</SelectItem>
                          <SelectItem value="architecture">System Architecture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" 
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            variant="link" 
            className="w-full text-blue-400 hover:text-blue-300"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                email: '',
                password: '',
                name: '',
                userType: 'student',
                graduationYear: '',
                department: '',
                company: '',
                designation: '',
                interestDomain: '',
                expertiseDomain: '',
                workingDomain: ''
              });
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
