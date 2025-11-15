import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from "@mui/material/Card";
import Typography from '@mui/material/Typography';
import CreateMotionCard from '../components/CreateMotionCard';
import CreateMotionDialog from '../components/CreateMotionDialog';
import MotionDetailsCard from '../components/MotionDetailsCard';

function CommitteePage() {
  const navigate = useNavigate();
  const { committeeId } = useParams();
  const [openDialog, setOpenDialog] = useState(false);
  const [motionTitle, setMotionTitle] = useState('');
  const [motionDescription, setMotionDescription] = useState('');
  const [motions, setMotions] = useState([]);
  const initialPersistSkip = useRef(true);
  // key for per-committee motions in localStorage
  const storageKey = committeeId ? `motions_${committeeId}` : 'motions';


  // load saved motions for this committee from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setMotions(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to parse saved motions', e);
    }
  }, [storageKey]);

  // persist motions for this committee
  useEffect(() => {
    if (initialPersistSkip.current) {
      initialPersistSkip.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(motions));
    } catch (e) {
      console.warn('Failed to save motions', e);
    }
  }, [motions, storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (motionTitle && motionDescription) {
      const timestamp = Date.now();

      const newMotion = {
        id: String(Date.now()) + Math.floor(Math.random() * 1000),
        title: motionTitle,
        description: motionDescription,
        debate_list: [],
        timestamp: timestamp,
        author: "fakeauthor",
        second: false,
      };
      setMotions((prev) => [...prev, newMotion]);
      setOpenDialog(false);
      setMotionTitle('');
      setMotionDescription('');
    }
  };

  const handleOpenCreate = () => setOpenDialog(true);

  const handleCardClick = (motion) => {
    // navigate to motion within this committee
    navigate(`/committee/${encodeURIComponent(committeeId)}/motion/${encodeURIComponent(motion.id)}`);
  };

  return (
    <Container maxWidth="xl" sx={{marginTop: 4 }}>
      <Box justifyContent="center">
        <Typography variant='h4' component="h2" sx={{justifyContent:"center", marginBottom: 4}}>
          Committee Motions
        </Typography>
      </Box>

      <Box sx={{ padding: '20px 50px', backgroundColor:"#57cc99"}}>
        <CreateMotionCard onOpen={handleOpenCreate}/>
      </Box>

      <Box
        sx={{
          padding:"20px"
        }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Motion History
        </Typography>
      <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '200px',
            justifyItems: 'center'
          }}
        >
          {motions.length === 0 ? (
            <Card
              sx={{
                height: 200,
                width: 200,
                border: '1px solid black',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography>No motions yet!</Typography>
            </Card>
          ) : (
            motions
              .map((motion) => (
                <MotionDetailsCard
                  key={motion.id}
                  motion={motion}
                  onClick={() => handleCardClick(motion)}
                />
              ))
          )}
        </Box>
      </Box>
      <CreateMotionDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        motionTitle={motionTitle}
        setMotionTitle={setMotionTitle}
        motionDescription={motionDescription}
        setMotionDescription={setMotionDescription}
        onSubmit={handleSubmit}
      />
    </Container>
  );
}

export default CommitteePage;
