import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function MotionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [motion, setMotion] = useState(null);
  const [showDebate, setShowDebate] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Fetch motion data from API on mount
  useEffect(() => {
    const fetchMotion = async () => {
      try {
        const response = await fetch(`/.netlify/functions/motionAPI/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const foundMotion = await response.json();
        setMotion(foundMotion);
      } catch (error) {
        console.error('Failed to fetch motion:', error);
        // Could redirect to landing page or show error
      }
    };
    
    if (id) {
      fetchMotion();
    }
  }, [id]);

  // Update motion via API
  const updateMotion = async (updatedFields) => {
    try {
      const response = await fetch(`/.netlify/functions/motionAPI/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedMotion = await response.json();
      setMotion(updatedMotion);
      return updatedMotion;
    } catch (error) {
      console.error('Failed to update motion:', error);
      alert('Failed to update motion. Please try again.');
      return null;
    }
  };

  const handleSecond = async () => {
    await updateMotion({ second: true });
  };

  const handleDebateSubmit = async () => {
    if (motion.second && textInput.trim()) {
      const debateEntry = { 
        content: textInput,
        author: sessionStorage.getItem('currentUser') || 'Anonymous',
        timestamp: Date.now()
      };
      const updatedDebateList = [...motion.debate_list, debateEntry];
      const result = await updateMotion({ debate_list: updatedDebateList });
      if (result) {
        setTextInput('');
      }
    }
  };

  const toggleDebate = () => {
    setShowDebate(!showDebate);
  };

  if (!motion) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="top_bar">
        <button id="back_button" onClick={() => navigate('/landing')}>
          <img src="/images/Arrow left.svg" alt="back arrow" />
        </button>
        <div>title</div>
        <div className="right_buttons">
          <div className="circle_button">S</div>
          <div className="circle_button">P</div>
        </div>
      </div>
      <div className="main_body">
        <div className="motion_zone">
          <div className="motion_box">
            <div id="motion_title">{motion.title}</div>
            <div id="motion_contents">{motion.description}</div>
            <div className="bottom_motion">
              <button
                type="button"
                className="button"
                id="debate_button"
                disabled={!motion.second}
                onClick={toggleDebate}
              >
                debate
              </button>
              {!motion.second && (
                <button
                  type="button"
                  className="button"
                  id="second"
                  onClick={handleSecond}
                >
                  second
                </button>
              )}
            </div>
          </div>
          <div
            id="debate_box"
            style={{ display: showDebate ? 'block' : 'none' }}
          >
            {motion.debate_list.map((entry, index) => (
              <div key={index} className="debate_element">
                {entry.content}
              </div>
            ))}
          </div>
        </div>
        <div className="user_bar">
          <input
            type="text"
            placeholder="type here"
            id="text_input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <div className="button" id="send_button" onClick={handleDebateSubmit}>
            <img src="/images/Arrow up.svg" alt="up arrow" />
          </div>
          <div className="button" id="prop_vote_button">
            propose vote
          </div>
          <div id="checkbox">checkbox</div>
        </div>
      </div>
    </>
  );
}

export default MotionPage;
