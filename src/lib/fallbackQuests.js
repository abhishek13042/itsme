const FALLBACK_QUEST_CLUSTERS = [
  {
    cluster_name: 'DSA Daily',
    domain: 'SDE',
    theme: 'Keep the algorithm brain sharp',
    color: '#1A1A2E',
    icon: '💻',
    why_today: 'Consistency beats intensity in DSA preparation.',
    quests: [
      {
        title: 'Solve 2 LeetCode medium problems',
        description: 'Focus on arrays or sliding window patterns',
        xp_reward: 100,
        difficulty: 'Medium',
        time_estimate: '45 min'
      },
      {
        title: 'Review yesterday\'s solution approach',
        description: 'Write down what pattern you used and why',
        xp_reward: 50,
        difficulty: 'Easy',
        time_estimate: '15 min'
      }
    ],
    total_xp: 150
  },
  {
    cluster_name: 'Health Protocol',
    domain: 'Health',
    theme: 'Non-negotiable daily habits',
    color: '#1A6B4A',
    icon: '💪',
    why_today: 'Discipline is the bridge between goals and achievement.',
    quests: [
      {
        title: 'Complete morning hygiene routine',
        description: 'Bath, teeth, skincare AM — all 3',
        xp_reward: 50,
        difficulty: 'Easy',
        time_estimate: '20 min'
      },
      {
        title: 'Hit protein target for today',
        description: 'Eggs + paneer + dal — track it',
        xp_reward: 75,
        difficulty: 'Easy',
        time_estimate: 'Throughout day'
      },
      {
        title: 'Sleep before midnight',
        description: 'Set alarm for 6:30 AM now',
        xp_reward: 75,
        difficulty: 'Easy',
        time_estimate: 'Night'
      }
    ],
    total_xp: 200
  },
  {
    cluster_name: 'AI Track Study',
    domain: 'SDE',
    theme: 'Advance the 14-month roadmap',
    color: '#1A6B4A',
    icon: '🤖',
    why_today: 'Every day you study is a day closer to the job.',
    quests: [
      {
        title: 'Watch 3 CampusX AI track videos',
        description: 'Take notes on key concepts',
        xp_reward: 100,
        difficulty: 'Medium',
        time_estimate: '60 min'
      },
      {
        title: 'Log progress in AI Track page',
        description: 'Mark topics as explored or studied',
        xp_reward: 50,
        difficulty: 'Easy',
        time_estimate: '10 min'
      }
    ],
    total_xp: 150
  },
  {
    cluster_name: 'PLAYER ONE Build',
    domain: 'General',
    theme: 'Advance the project',
    color: '#E07B39',
    icon: '🎮',
    why_today: 'This project IS your portfolio. Treat it seriously.',
    quests: [
      {
        title: 'Make 1 GitHub commit to PLAYER ONE',
        description: 'Any improvement, bug fix, or feature',
        xp_reward: 100,
        difficulty: 'Medium',
        time_estimate: '30-60 min'
      },
      {
        title: 'Write a LinkedIn post about what you built',
        description: 'Document your progress publicly',
        xp_reward: 75,
        difficulty: 'Easy',
        time_estimate: '15 min'
      }
    ],
    total_xp: 175
  },
  {
    cluster_name: 'Mental Clarity',
    domain: 'General',
    theme: 'Keep the explorer mind alive',
    color: '#7C3AED',
    icon: '🧠',
    why_today: 'A sharp mind needs regular exploration.',
    quests: [
      {
        title: 'Read one Explorer concept in PLAYER ONE',
        description: 'Go to Explorer page and read current topic',
        xp_reward: 75,
        difficulty: 'Easy',
        time_estimate: '20 min'
      },
      {
        title: 'Log a brain drop insight',
        description: 'One thought that hit you today',
        xp_reward: 50,
        difficulty: 'Easy',
        time_estimate: '5 min'
      }
    ],
    total_xp: 125
  }
]

export function getFallbackClusters() {
  // Return shuffled subset of 5 clusters
  return [...FALLBACK_QUEST_CLUSTERS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
}

export { FALLBACK_QUEST_CLUSTERS }
