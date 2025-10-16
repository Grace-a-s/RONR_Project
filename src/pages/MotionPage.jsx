import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function MotionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [motion, setMotion] = useState(null);
  const [showDebate, setShowDebate] = useState(false);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    const transferData = JSON.parse(localStorage.getItem('data'));
    if (transferData && transferData.motion_list) {
      const foundMotion = transferData.motion_list[id];
      setMotion(foundMotion);
    }
  }, [id]);

  const updateData = (updatedMotion) => {
    const transferData = JSON.parse(localStorage.getItem('data'));
    transferData.motion_list[id] = updatedMotion;
    localStorage.setItem('data', JSON.stringify(transferData));
    setMotion(updatedMotion);
  };

  const handleSecond = () => {
    const updatedMotion = { ...motion, second: true };
    updateData(updatedMotion);
  };

  const handleDebateSubmit = () => {
    if (motion.second && textInput.trim()) {
      const debateEntry = { content: textInput };
      const updatedMotion = {
        ...motion,
        debate_list: [...motion.debate_list, debateEntry]
      };
      updateData(updatedMotion);
      setTextInput('');
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
        <button id="back_button" onClick={() => navigate('/')}>
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
