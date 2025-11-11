import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [data, setData] = useState({ motion_list: [] });
  const [showDialog, setShowDialog] = useState(false);
  const [motionTitle, setMotionTitle] = useState('Sample motion');
  const [motionDescription, setMotionDescription] = useState('A quick description of the motion');
  const navigate = useNavigate();

  // Fetch motions from API on mount
  useEffect(() => {
    const fetchMotions = async () => {
      try {
        const response = await fetch('/.netlify/functions/motionAPI');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result && Array.isArray(result.motion_list)) {
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch motions:', error);
        // Fallback to empty list on error
        setData({ motion_list: [] });
      }
    };
    
    fetchMotions();
  }, []);

  const createMotion = (id, title, description, timestamp, author) => {
    return {
      id: id,
      title: title,
      description: description,
      debate_list: [],
      timestamp: timestamp,
      author: author,
      second: false,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch('/.netlify/functions/motionAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: motionTitle,
          description: motionDescription,
          author: sessionStorage.getItem('currentUser') || 'Anonymous'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newMotion = await response.json();
      
      // Update local state with new motion
      const updatedData = {
        ...data,
        motion_list: [...data.motion_list, newMotion]
      };
      
      setData(updatedData);
      setShowDialog(false);
      
      // Reset form
      setMotionTitle('Sample motion');
      setMotionDescription('A quick description of the motion');
    } catch (error) {
      console.error('Failed to create motion:', error);
      alert('Failed to create motion. Please try again.');
    }
  };

  const handleMotionClick = (motionId) => {
    navigate(`/motion/${motionId}`);
  };

  return (
    <div className="landing_page">
      <div className="landing_page_navbar">
        <span><h2>Robert's Rule of Order</h2></span>
      </div>

      <div className="landing_page_current_motion_display">
        <div 
          className="landing_page_motion_card" 
          id="create_motion"
          onClick={() => setShowDialog(true)}
        >
          <span>New Motion</span>
        </div>
      </div>

      <div className="landing_page_motion_history_card_display">
        <span><h2>Motion History</h2></span>

        <input className="search_bar" type="text" placeholder="Search" />

        <div className="landing_page_motion_card_grid">
          {data.motion_list.length === 0 ? (
            <div className="landing_page_motion_card_detailed">
              <span>No motions yet</span>
            </div>
          ) : (
            data.motion_list.map((motion) => (
              <div
                key={motion.id}
                className="landing_page_motion_card_detailed"
                onClick={() => handleMotionClick(motion.id)}
                style={{ cursor: 'pointer' }}
              >
                <span>{motion.title}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {showDialog && (
        <dialog className="dialog_box" open>
          <span className="dialog_top_bar"><h2>Create Motion</h2></span>
          <div className="dialog_box_body">
            <form onSubmit={handleSubmit}>
              <div className="dialog_box_input">
                <label htmlFor="motion_title">Title</label>
                <br />
                <input
                  className="dialog_box_textbox"
                  type="text"
                  id="motion_title"
                  value={motionTitle}
                  onChange={(e) => setMotionTitle(e.target.value)}
                />
              </div>
              <div className="dialog_box_input">
                <label htmlFor="motion_description">Description</label>
                <br />
                <input
                  className="dialog_box_large_textbox"
                  type="text"
                  id="motion_description"
                  value={motionDescription}
                  onChange={(e) => setMotionDescription(e.target.value)}
                />
              </div>

              <div className="dialog_box_footer">
                <input className="dialog_box_button" type="submit" value="Submit" />
                <button
                  className="dialog_box_button"
                  type="button"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default LandingPage;
