import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [data, setData] = useState({ motion_list: [] });
  const [showDialog, setShowDialog] = useState(false);
  const [motionTitle, setMotionTitle] = useState('Sample motion');
  const [motionDescription, setMotionDescription] = useState('A quick description of the motion');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.motion_list)) {
          setData(parsed);
        } else if (Array.isArray(parsed)) {
          setData({ motion_list: parsed });
        }
      } catch (e) {
        console.warn('Failed to parse saved data', e);
      }
    }
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

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const id = data.motion_list.length
      ? Math.max(...data.motion_list.map((m) => m.id)) + 1
      : 0;
    
    const timestamp = Date.now();
    const author = 'Author';
    
    const newMotion = createMotion(id, motionTitle, motionDescription, timestamp, author);
    const updatedData = {
      ...data,
      motion_list: [...data.motion_list, newMotion]
    };
    
    setData(updatedData);
    localStorage.setItem('data', JSON.stringify(updatedData));
    setShowDialog(false);
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
