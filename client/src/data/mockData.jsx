import {
    User,
    MessageSquare,
    Heart,
    Share2,
    Leaf,
    Users,
    Award,
  } from 'lucide-react'
  
  export const currentUser = {
    id: 'u1',
    name: 'David Chen',
    role: 'Farmer',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    bio: 'Organic vegetable farmer passionate about sustainable agriculture.',
    followers: 1240,
    following: 85,
    posts: 42,
  }
  
  export const posts = [
    {
      id: 'p1',
      author: {
        name: 'Sarah Miller',
        role: 'Expert',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      },
      title: 'Best practices for drought-resistant crops',
      description:
        'With the changing climate, it is essential to adapt our farming techniques. Here are my top 5 tips for maintaining yield during dry spells...',
      image:
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      likes: 342,
      comments: 56,
      timeAgo: '2h ago',
      tags: ['Sustainability', 'Tips'],
    },
    {
      id: 'p2',
      author: {
        name: 'James Wilson',
        role: 'Farmer',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      },
      title: 'My first harvest of the season!',
      description:
        'Look at these beautiful tomatoes. The new organic fertilizer mix is working wonders. #OrganicFarming #Harvest',
      image:
        'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      likes: 890,
      comments: 124,
      timeAgo: '5h ago',
      tags: ['Harvest', 'Organic'],
    },
    {
      id: 'p3',
      author: {
        name: 'Dr. Emily Green',
        role: 'Expert',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      },
      title: 'Understanding soil pH levels',
      description:
        'Soil pH directly affects nutrient availability. Before planting your next crop, ensure you test your soil...',
      image:
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      likes: 567,
      comments: 89,
      timeAgo: '1d ago',
      tags: ['Soil Health', 'Science'],
    },
  ]
  
  export const experts = [
    {
      id: 'e1',
      name: 'Dr. Alan Grant',
      specialty: 'Crop Pathology',
      followers: '5.2k',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'e2',
      name: 'Maria Rodriguez',
      specialty: 'Sustainable Irrigation',
      followers: '3.8k',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'e3',
      name: 'Green Valley Co-op',
      specialty: 'Community Group',
      followers: '12k',
      avatar:
        'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    },
  ]
  
  export const messages = [
    {
      id: 'm1',
      sender: {
        name: 'Sarah Miller',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      },
      lastMessage: 'The soil test results look promising!',
      time: '10:30 AM',
      unread: 2,
    },
    {
      id: 'm2',
      sender: {
        name: 'James Wilson',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      },
      lastMessage: 'Can you share that fertilizer brand?',
      time: 'Yesterday',
      unread: 0,
    },
  ]
  
  export const comments = [
    {
      id: 'c1',
      author: 'Alice Cooper',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      text: 'This is incredibly helpful, thank you!',
      timeAgo: '1h ago',
    },
    {
      id: 'c2',
      author: 'Bob Smith',
      avatar:
        'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      text: 'I tried this last season and saw a 20% increase in yield.',
      timeAgo: '30m ago',
    },
  ]
  