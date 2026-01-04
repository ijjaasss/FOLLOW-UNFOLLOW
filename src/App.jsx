import { useEffect, useMemo, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'followers', 'following', 'notFollowingMe', 'notFollowing'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/insta/followers_1.json');
        const res2 = await axios.get('/insta/following.json');
        setFollowers(res.data);
        setFollowing(res2.data.relationships_following);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const displayList = useMemo(() => {
    // Extract unique usernames for followers and following
    const followerUsernames = new Set(followers.map(f => f.string_list_data[0]?.value).filter(Boolean));
    const followingUsernames = new Set(following.map(f => f.title).filter(Boolean));

    let list = [];

    switch (activeTab) {
      case 'all':
        list = Array.from(new Set([...followerUsernames, ...followingUsernames]));
        break;
      case 'followers':
        list = Array.from(followerUsernames);
        break;
      case 'following':
        list = Array.from(followingUsernames);
        break;
      case 'notFollowingMe': // Those who don't follow me back (following - followers)
        list = Array.from(followingUsernames).filter(u => !followerUsernames.has(u));
        break;
      case 'notFollowing': // Those I don't follow (followers - following)
        list = Array.from(followerUsernames).filter(u => !followingUsernames.has(u));
        break;
      default:
        list = [];
    }

    return list;
  }, [followers, following, activeTab]);

  const getProfilePic = (username) => {
    // Generate local SVG avatar with initials for reliability
    const initial = username.charAt(0).toUpperCase() || '?';
    const svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#0a0a0a" stroke="#00ff00" stroke-width="2"/>
      <text x="32" y="40" font-family="monospace" font-size="24" fill="#00ff00" text-anchor="middle" font-weight="bold">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  const tabs = [
    { key: 'all', label: 'ALL' },
    { key: 'followers', label: 'FOLLOWERS' },
    { key: 'following', label: 'FOLLOWING' },
    { key: 'notFollowingMe', label: 'NOT FOLLOWING ME' },
    { key: 'notFollowing', label: 'NOT FOLLOWING' }
  ];

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">INSTAGRAM ANALYZER </h1>
        <p className="subtitle">Scanning social matrix... Initiated.</p>
      </div>
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            [{tab.label}]
          </button>
        ))}
      </div>
      <div className="stats">
        <span>Total Nodes: {displayList.length}</span>
        <span>Scan Complete: {new Date().toLocaleString()}</span>
      </div>
      <div className="list-container">
        <ul className="user-list">
          {displayList.length === 0 ? (
            <li className="no-data">NO TARGETS DETECTED. ACCESS DENIED?</li>
          ) : (
            displayList.map(username => (
              <li key={username} className="user-item">
                <img 
                  src={getProfilePic(username)} 
                  alt={username} 
                  className="profile-pic"
                />
                <span className="username">{username}</span>
                <a className="status" href={`https://www.instagram.com/${username}`} target="_blank" rel="noopener noreferrer">Go to Acc</a>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="footer">
        <p>End of transmission. Ctrl+C to exit.</p>
      </div>
    </div>
  );
}

export default App;