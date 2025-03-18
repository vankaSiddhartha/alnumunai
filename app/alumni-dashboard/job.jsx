"use client"
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import { ref, onValue } from 'firebase/database';

const ApplicantDashboard = () => {
  const [topApplicants, setTopApplicants] = useState([]);
  
  // Helper function to determine cover letter strength
  const determineCoverLetterStrength = (count) => {
    if (count > 10) return "Very Strong";
    if (count > 7) return "Strong";
    if (count > 4) return "Good";
    if (count > 2) return "Basic";
    return "Minimal";
  };
  
  useEffect(() => {
    const applicationsRef = ref(db, 'jobApplications');
    
    const fetchTopApplicants = () => {
      onValue(applicationsRef, (appSnapshot) => {
        const appData = appSnapshot.val();
        
        if (appData) {
          // Count applications and get status per user
          const applicantData = {};
          Object.values(appData).forEach(app => {
            if (!applicantData[app.userId]) {
              applicantData[app.userId] = {
                count: 0,
                status: app.userId || "Unknown Status"
              };
            }
            applicantData[app.userId].count += 1;
          });
          
          // Create scored applicants array
          const scoredApplicants = Object.entries(applicantData)
            .map(([userId, data]) => {
              return {
                userId,
                status: data.status,
                profilePic: 'https://srcwap.com/wp-content/uploads/2022/08/abstract-user-flat-4.png',
                coverLetterCount: data.count,
                coverLetterStrength: determineCoverLetterStrength(data.count),
                totalScore: data.count * 10 // Simple scoring based on cover letter count
              };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 5); // Top 5 applicants
            
          setTopApplicants(scoredApplicants);
        }
      });
    };
    
    fetchTopApplicants();
  }, []);

  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Top Applicants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topApplicants.map((applicant) => (
          <ApplicantCard key={applicant.userId} applicant={applicant} />
        ))}
      </div>
    </div>
  );
};

const ApplicantCard = ({ applicant }) => {
  // Function to determine background color based on cover letter strength
  const getStrengthColor = (strength) => {
    switch(strength) {
      case "Very Strong": return "from-purple-500 to-purple-700";
      case "Strong": return "from-blue-500 to-blue-700";
      case "Good": return "from-green-500 to-green-700";
      case "Basic": return "from-yellow-500 to-yellow-700";
      default: return "from-gray-500 to-gray-700";
    }
  };

  // Function to determine emoji based on strength
  const getStrengthEmoji = (strength) => {
    switch(strength) {
      case "Very Strong": return "🌟";
      case "Strong": return "💪";
      case "Good": return "👍";
      case "Basic": return "📝";
      default: return "🔍";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      <div className={`bg-gradient-to-r ${getStrengthColor(applicant.coverLetterStrength)} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={applicant.profilePic} 
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <h3 className="ml-3 font-bold text-white">{applicant.status}</h3>
          </div>
         
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
    
          <span className="text-sm font-semibold">{applicant.coverLetterStrength}</span>
        </div>
   
        <div className="mt-3 flex justify-between">
          <span className="text-xs text-gray-500">ID: {applicant.userId.slice(0, 8)}...</span>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;