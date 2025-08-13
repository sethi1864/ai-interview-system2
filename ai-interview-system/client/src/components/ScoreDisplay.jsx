import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Star, Award, Target } from 'lucide-react';

const ScoreDisplay = ({ score = 7.5, maxScore = 10, feedback = [], isDemo = false }) => {
  const percentage = (score / maxScore) * 100;
  
  // Demo feedback
  const demoFeedback = [
    {
      category: 'Communication',
      score: 8.2,
      trend: 'up',
      comment: 'Excellent verbal communication skills'
    },
    {
      category: 'Technical Knowledge',
      score: 7.8,
      trend: 'up',
      comment: 'Strong understanding of core concepts'
    },
    {
      category: 'Problem Solving',
      score: 7.1,
      trend: 'stable',
      comment: 'Good analytical thinking demonstrated'
    },
    {
      category: 'Experience',
      score: 6.9,
      trend: 'down',
      comment: 'Could benefit from more hands-on experience'
    }
  ];

  const feedbackData = isDemo ? demoFeedback : feedback;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-success-600';
    if (score >= 6) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-success-100';
    if (score >= 6) return 'bg-warning-100';
    return 'bg-error-100';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-error-500" />;
      default:
        return <Minus className="w-4 h-4 text-secondary-500" />;
    }
  };

  const getOverallRating = (score) => {
    if (score >= 9) return { label: 'Outstanding', icon: '🏆' };
    if (score >= 8) return { label: 'Excellent', icon: '⭐' };
    if (score >= 7) return { label: 'Good', icon: '👍' };
    if (score >= 6) return { label: 'Fair', icon: '🤔' };
    return { label: 'Needs Improvement', icon: '📝' };
  };

  const overallRating = getOverallRating(score);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">Interview Score</h3>
        {isDemo && (
          <span className="badge badge-warning">Demo Data</span>
        )}
      </div>

      {/* Overall Score */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-secondary-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
              className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score.toFixed(1)}
              </div>
              <div className="text-sm text-secondary-600">/ {maxScore}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">{overallRating.icon}</span>
            <h4 className="text-xl font-semibold text-secondary-900">
              {overallRating.label}
            </h4>
          </div>
          <p className="text-secondary-600">
            {percentage >= 80 ? 'Strong candidate for the position' :
             percentage >= 60 ? 'Good potential with some areas for improvement' :
             'Consider additional training or experience'}
          </p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="space-y-4">
        <h4 className="font-semibold text-secondary-900 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Category Breakdown
        </h4>
        
        {feedbackData.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getScoreBgColor(item.score)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-secondary-900">
                  {item.category}
                </span>
                {getTrendIcon(item.trend)}
              </div>
              <div className={`font-bold ${getScoreColor(item.score)}`}>
                {item.score.toFixed(1)}
              </div>
            </div>
            
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                  getScoreColor(item.score).replace('text-', 'bg-')
                }`}
                style={{ width: `${(item.score / maxScore) * 100}%` }}
              />
            </div>
            
            <p className="text-sm text-secondary-600 mt-2">
              {item.comment}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-primary-50 rounded-lg">
        <h4 className="font-semibold text-primary-900 flex items-center mb-2">
          <Award className="w-4 h-4 mr-2" />
          Recommendations
        </h4>
        <ul className="text-sm text-primary-800 space-y-1">
          {score >= 8 ? (
            <>
              <li>• Strong candidate - consider moving to next round</li>
              <li>• Excellent communication and technical skills</li>
              <li>• Good cultural fit potential</li>
            </>
          ) : score >= 6 ? (
            <>
              <li>• Consider for position with additional training</li>
              <li>• Address specific areas of improvement</li>
              <li>• Schedule follow-up interview if needed</li>
            </>
          ) : (
            <>
              <li>• Consider additional experience or training</li>
              <li>• May not be the right fit for this position</li>
              <li>• Provide constructive feedback</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ScoreDisplay;