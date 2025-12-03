import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { useAuth0 } from "@auth0/auth0-react";
import VotingPanel from '../components/VotingPanel';
import { openVoting } from '../lib/api';
import { useMotionsApi } from '../utils/motionsApi';

function MotionPage() {
  const { committeeId, motionId } = useParams();
  const navigate = useNavigate();

  const { user, getAccessTokenSilently } = useAuth0();
  const { getMotion, secondMotion, getDebates, createDebate } = useMotionsApi();

  const [motion, setMotion] = useState(null);
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDebate, setShowDebate] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [debatePosition, setDebatePosition] = useState('NEUTRAL');
  const [votingPanelOpen, setVotingPanelOpen] = useState(false);
  const [openingVote, setOpeningVote] = useState(false);
  const [seconding, setSeconding] = useState(false);
  const [submittingDebate, setSubmittingDebate] = useState(false);

  // Fetch motion data from backend
  useEffect(() => {
    const fetchMotion = async () => {
      try {
        setLoading(true);
        const motionData = await getMotion(motionId);
        setMotion(motionData);
      } catch (error) {
        console.error('Failed to load motion:', error);
      } finally {
        setLoading(false);
      }
    };

    if (motionId) {
      fetchMotion();
    }
  }, [motionId, getMotion]);

  // Fetch debates when showDebate is toggled on
  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const debatesData = await getDebates(motionId);
        setDebates(debatesData || []);
      } catch (error) {
        console.error('Failed to load debates:', error);
      }
    };

    if (showDebate && motionId) {
      fetchDebates();
    }
  }, [showDebate, motionId, getDebates]);

  const handleSecond = async () => {
    if (!motion) return;
    try {
      setSeconding(true);
      const updatedMotion = await secondMotion(motionId);
      setMotion(updatedMotion);
    } catch (error) {
      console.error('Failed to second motion:', error);
      alert(error.message || 'Failed to second motion.');
    } finally {
      setSeconding(false);
    }
  };

  const handleDebateSubmit = async () => {
    if (!motion || !textInput.trim()) return;
    
    // Motion must be in DEBATE status (seconded and approved)
    if (motion.status !== 'DEBATE') {
      alert('Debate is only available when motion is in DEBATE status.');
      return;
    }

    try {
      setSubmittingDebate(true);
      const newDebate = await createDebate(motionId, {
        content: textInput,
        position: debatePosition,
      });
      setDebates((prev) => [newDebate, ...prev]);
      setTextInput('');
    } catch (error) {
      console.error('Failed to submit debate:', error);
      alert(error.message || 'Failed to submit debate.');
    } finally {
      setSubmittingDebate(false);
    }
  };

  const toggleDebate = () => setShowDebate((s) => !s);

  const handleProposeVote = async () => {
    try {
      setOpeningVote(true);
      const token = await getAccessTokenSilently();
      const updatedMotion = await openVoting(motionId, token);
      setMotion(updatedMotion);
    } catch (error) {
      console.error('Failed to open voting:', error);
      alert(error.message || 'Failed to open voting. You may need CHAIR role.');
    } finally {
      setOpeningVote(false);
    }
  };

  const handleVoteSuccess = (result) => {
    if (result && result.motion) {
      setMotion(result.motion);

      if (result.motion.status === 'PASSED' || result.motion.status === 'REJECTED') {
        setVotingPanelOpen(false);
      }
    }
  };

  // Check if motion has been seconded based on status
  const isSeconded = motion && motion.status !== 'PROPOSED';

  if (loading) return <Container sx={{ py: 6 }}><Typography>Loading...</Typography></Container>;
  if (!motion) return <Container sx={{ py: 6 }}><Typography>Motion not found</Typography></Container>;

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container sx={{ py: 4, flex: '1 1 auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper variant="outlined" sx={{ bgcolor: '#57CC99', p: 3, maxWidth: 900, width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">{motion.title}</Typography>
                <Chip
                  label={motion.status || 'PROPOSED'}
                  color={
                    motion.status === 'VOTING' ? 'primary' :
                    motion.status === 'PASSED' ? 'success' :
                    motion.status === 'REJECTED' ? 'error' :
                    motion.status === 'DEBATE' ? 'warning' :
                    'default'
                  }
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box sx={{ bgcolor: 'white', borderRadius: 1, mt: 2, p: 2 }}>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{motion.description}</Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleSecond} 
                    disabled={isSeconded || seconding}
                  >
                    {seconding ? <CircularProgress size={20} /> : isSeconded ? 'Seconded' : 'Second'}
                  </Button>

                  <Button variant="contained" onClick={toggleDebate} disabled={!isSeconded}>
                    View Debate
                  </Button>
                </Box>

                <Button
                  variant="outlined"
                  onClick={() => setVotingPanelOpen(true)}
                  startIcon={<HowToVoteIcon />}
                >
                  Voting
                </Button>
              </Box>
            </Paper>
          </Box>

          {showDebate && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Paper elevation={1} sx={{ p: 2, maxWidth: 900, width: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>Debate</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: { xs: '240px', md: '360px' }, overflow: 'auto', pr: 1, pb: { xs: '140px', md: '100px' } }}>
                  {debates.map((entry, i) => (
                    <Paper key={entry._id || i} variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main, width: 40, height: 40, flexShrink: 0 }}>
                        {entry.authorId ? String(entry.authorId)[0].toUpperCase() : 'M'}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {entry.authorId || 'Member'} · {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : `#${i + 1}`}
                          {entry.position && (
                            <Chip 
                              label={entry.position} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color={
                                entry.position === 'SUPPORT' ? 'success' :
                                entry.position === 'OPPOSE' ? 'error' :
                                'default'
                              }
                            />
                          )}
                        </Typography>

                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                          {entry.content}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                  {debates.length === 0 && (
                    <Typography color="text.secondary" align="center">No debate entries yet.</Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </Container>

        <Box component="footer" sx={{bottom: 16, left: { xs: 16, md: 24 }, right: { xs: 16, md: 24 }, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', maxWidth: 'calc(100% - 48px)', margin: '0 auto' }}>
            <TextField
              placeholder="Type here"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
              <TextField
                select
                size="small"
                value={debatePosition}
                onChange={(e) => setDebatePosition(e.target.value)}
                sx={{ minWidth: 120 }}
                SelectProps={{ native: true }}
              >
                <option value="NEUTRAL">Neutral</option>
                <option value="SUPPORT">Support</option>
                <option value="OPPOSE">Oppose</option>
              </TextField>

              <Button 
                variant="contained" 
                endIcon={submittingDebate ? <CircularProgress size={20} /> : <SendIcon />} 
                onClick={handleDebateSubmit} 
                disabled={motion.status !== 'DEBATE' || !textInput.trim() || submittingDebate}
              >
                Send
              </Button>
              {motion.status === 'DEBATE' && (
                <Button
                  variant="outlined"
                  onClick={handleProposeVote}
                  disabled={openingVote}
                  startIcon={openingVote ? <CircularProgress size={20} /> : null}
                >
                  {openingVote ? 'Opening...' : 'Propose Vote'}
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      <VotingPanel
        open={votingPanelOpen}
        onClose={() => setVotingPanelOpen(false)}
        motion={motion}
        onVoteSuccess={handleVoteSuccess}
      />
    </>
  );
}

export default MotionPage;
