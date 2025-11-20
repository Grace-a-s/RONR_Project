import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from "@mui/material/Card";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CreateMotionCard from '../components/CreateMotionCard';
import CreateMotionDialog from '../components/CreateMotionDialog';
import MotionDetailsCard from '../components/MotionDetailsCard';
import sampleData from '../test_committee_data.json';

function CommitteePage() {
  const navigate = useNavigate();
  const { committeeId } = useParams();
  const [openDialog, setOpenDialog] = useState(false);
  const [motionTitle, setMotionTitle] = useState('');
  const [motionDescription, setMotionDescription] = useState('');
  const [motions, setMotions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const initialPersistSkip = useRef(true);
  // key for per-committee motions in localStorage
  const storageKey = committeeId ? `motions_${committeeId}` : 'motions';
  const [committee, setCommittee] = useState(null);


  // load saved motions for this committee from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMotions(JSON.parse(saved));
      } else if (Array.isArray(sampleData)) {
        // find committee in sample data and map motions to app shape
        const found = sampleData.find((c) => String(c.id) === String(committeeId));
        if (found && Array.isArray(found.motionList)) {
          const mapped = found.motionList.map((m) => ({
            id: String(m.id),
            title: m.name || m.title || '',
            description: m.description || '',
            debate_list: [],
            timestamp: Date.now(),
            author: m.author || '',
            second: m.status === 'SECOND' || m.status === 'SECONDING',
          }));
          setMotions(mapped);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved motions', e);
    }
  }, [storageKey]);

  // load committee metadata (name, description, members) from stored committees
  useEffect(() => {
    try {
      const raw = localStorage.getItem('committees');
      if (!raw) return;
      const list = JSON.parse(raw);
      const found = list.find((c) => String(c.id) === String(committeeId));
      if (found) setCommittee(found);
    } catch (err) {
      // ignore
    }
  }, [committeeId]);

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


  const membersCount = committee?.members?.length ?? 3;
  const motionsCount = motions.length;

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 2 }}>
        <Box
          onClick={() => navigate('/home')}
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: 'text.primary' }}
          aria-label="Back to main page"
        >
          <ArrowBackIcon fontSize="small" />
          <Typography variant="body2">Back to Main Page</Typography>
        </Box>
      </Box>
      {/* Full-bleed banner */}
      <Box sx={{ position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', width: '100vw', py: 3, background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, rgba(255,87,187,0.10) 100%)`, color: 'common.white', mb: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{committee?.name || `Committee ${committeeId}`}</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.9)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{committee?.description || 'Committee description goes here.'}</Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)' }}>Members • {membersCount}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GavelIcon />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)' }}>Active motions • {motionsCount}</Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/committee/${encodeURIComponent(committeeId)}/membership`)}
                sx={{
                  backgroundColor: 'common.white',
                  color: (theme) => theme.palette.primary.main,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' },
                }}
              >
                Manage / View Membership
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      
      <Box
        sx={{
          pt: "15px",
          pb: "15px",
          pl: "5px",
          pr: "5px"
        }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search motions by title or description"
            sx={{ width: { xs: '100%', sm: 400}, backgroundColor: 'white', borderRadius: '10px' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />

          <Button 
            sx={{ 
                bgcolor: '#FF57BB', 
                color: 'common.white', 
                p: 1.5, 
                borderRadius: '10px', 
                border: '1px solid rgba(0,0,0,0.12)',
                '&:hover': { boxShadow: 6} 
              }}
          >
            <FilterAltIcon/>
          </Button>

          <Button 
            onClick={handleOpenCreate} 
            startIcon={<AddIcon />} 
            sx={{ 
              bgcolor: '#0ba179ff', 
              color: 'common.white', 
              p: 1.5, 
              borderRadius: '10px', 
              border: '1px solid rgba(0,0,0,0.12)',
              '&:hover': { boxShadow: 6} 
            }}
          >
            Propose a new motion
          </Button>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 3,
            justifyItems: 'center',
          }}
        >
          {motions.length === 0 ? (
              <Typography>No motions yet! Be the first to propose!</Typography>
          ) : (
            motions.map((motion) => (
                <MotionDetailsCard motion={motion} onClick={() => handleCardClick(motion)} />
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
