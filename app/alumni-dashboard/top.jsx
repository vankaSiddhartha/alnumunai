import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Trophy, 
  Star, 
  Award, 
  User as UserIcon 
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/firebase/config';

const TopApplicantsProfile = () => {
  const [topApplicants, setTopApplicants] = useState([]);


// In the existing code, replace 'Anonymous' with:

  useEffect(() => {
    const applicationsRef = ref(db, 'jobApplications');
    const usersRef = ref(db, 'users');

    const fetchTopApplicants = () => {
      onValue(applicationsRef, (appSnapshot) => {
        const appData = appSnapshot.val();
        
        onValue(usersRef, (userSnapshot) => {
          const userData = userSnapshot.val();
          
          if (appData && userData) {
            // Count applications per user
            const applicationCounts = {};
            Object.values(appData).forEach(app => {
              applicationCounts[app.userId] = 
                (applicationCounts[app.userId] || 0) + 1;
            });

            // Calculate scores with multiple factors
            const scoredApplicants = Object.entries(applicationCounts)
              .map(([userId, applicationCount]) => {
                const user = Object.values(userData).find(u => u.uid === userId);
                return {
                  userId,
                  name: user?.displayName ||generateName(),
                  profilePic: user?.photoURL || 'https://srcwap.com/wp-content/uploads/2022/08/abstract-user-flat-4.png',
                  applicationCount,
                  // Additional scoring metrics
                  domainExpertise: calculateDomainExpertise(user),
                  skills: user?.skills || [],
                  totalScore: calculateTotalScore(applicationCount, user)
                };
              })
              .sort((a, b) => b.totalScore - a.totalScore)
              .slice(0, 5); // Top 5 applicants

            setTopApplicants(scoredApplicants);
          }
        });
      });
    };

    fetchTopApplicants();
  }, []);

  const calculateDomainExpertise = (user) => {
    const domainWeights = {
      'AI': 5,
      'Web Development': 4,
      'Data Science': 4,
      'Cloud Computing': 3,
      'Systems Design': 3
    };


    return user?.domains?.reduce((score, domain) => 
      score + (domainWeights[domain] || 1), 0) || 0;
  };
const firstNames = [
  'Pavan'
];

const lastNames = [
  'Balla'
];

const generateName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};
  const calculateTotalScore = (applicationCount, user) => {
    const baseScore = applicationCount * 10;
    const expertiseBonus = calculateDomainExpertise(user) * 2;
    const skillsBonus = (user?.skills?.length || 0) * 3;

    return baseScore + expertiseBonus + skillsBonus;
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="mr-2 text-yellow-500" />
          Top Applicants Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topApplicants.map((applicant, index) => (
          <div 
            key={applicant.userId} 
            className="flex items-center bg-gray-800 p-4 rounded-lg mb-3"
          >
            <div className="flex items-center mr-4">
              {index === 0 && <Star className="text-yellow-400 mr-2" />}
              {index === 1 && <Award className="text-silver mr-2" />}
              {index === 2 && <UserIcon className="text-bronze mr-2" />}
              <span className="font-bold text-xl mr-2">{index + 1}</span>
            </div>
            <img 
              src={applicant.profilePic} 
              alt={applicant.name} 
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h3 className="text-white font-semibold">{applicant.name}</h3>
              <div className="text-gray-400 text-sm">
                Applications: {applicant.applicationCount}
                <span className="ml-2">
                  Skills: {applicant.skills.join(', ')}
                </span>
              </div>
            </div>
            <div className="ml-auto text-green-400 font-bold">
              Score: {applicant.totalScore}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopApplicantsProfile;