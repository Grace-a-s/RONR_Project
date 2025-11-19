import React, { useState, useEffect } from 'react';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import sampleData from '../test_committee_data.json';

function MotionPage() {
  const { committeeId, motionId } = useParams();
  const navigate = useNavigate();
  const [motion, setMotion] = useState(null);
  const [showDebate, setShowDebate] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    const key = committeeId ? `motions_${committeeId}` : 'motions';
    const storedRaw = localStorage.getItem(key);
    if (storedRaw) {
      const stored = JSON.parse(storedRaw);
      const list = Array.isArray(stored) ? stored : stored.motion_list || [];
      const found = list.find((m) => String(m.id) === String(motionId));
      if (found) {
        setMotion(found);
        return;
      }
    }

    // fallback to sample data (read-only). Map sample motion to app shape.
    try {
      if (Array.isArray(sampleData)) {
        const commit = sampleData.find((c) => String(c.id) === String(committeeId));
        if (commit && Array.isArray(commit.motionList)) {
          const found = commit.motionList.find((m) => String(m.id) === String(motionId));
          if (found) {
            const mapped = {
              id: String(found.id),
              title: found.name || found.title || '',
              description: found.description || '',
              debate_list: [],
              timestamp: Date.now(),
              author: found.author || '',
              second: found.status === 'SECOND' || found.status === 'SECONDING',
            };
            setMotion(mapped);
            return;
          }
        }
      }
    } catch (e) {
      // ignore
    }
    // if not found, keep null (shows Loading...)
  }, [committeeId, motionId]);

  const updateData = (updatedMotion) => {
    const key = committeeId ? `motions_${committeeId}` : 'motions';
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    if (Array.isArray(stored)) {
      const idx = stored.findIndex((m) => String(m.id) === String(motionId));
      if (idx !== -1) stored[idx] = updatedMotion;
      else stored.push(updatedMotion);
      localStorage.setItem(key, JSON.stringify(stored));
    } else {
      const list = stored.motion_list || [];
      const idx = list.findIndex((m) => String(m.id) === String(motionId));
      if (idx !== -1) list[idx] = updatedMotion;
      else list.push(updatedMotion);
      localStorage.setItem(key, JSON.stringify({ ...stored, motion_list: list }));
    }
    setMotion(updatedMotion);
  };

  const handleSecond = () => {
    if (!motion) return;
    const updatedMotion = { ...motion, second: true };
    updateData(updatedMotion);
  };

  const handleDebateSubmit = () => {
    if (!motion) return;
    if (motion.second && textInput.trim()) {
      // include a timestamp for nicer comment UI and potential sorting
      const debateEntry = { content: textInput, timestamp: Date.now() };
      const updatedMotion = {
        ...motion,
        debate_list: Array.isArray(motion.debate_list) ? [...motion.debate_list, debateEntry] : [debateEntry]
      };
      updateData(updatedMotion);
      setTextInput('');
    }
  };

  const toggleDebate = () => setShowDebate((s) => !s);

  if (!motion) return <Container sx={{ py: 6 }}><Typography>Loading...</Typography></Container>;

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container sx={{ py: 4, flex: '1 1 auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper variant="outlined" sx={{ bgcolor: '#57CC99', p: 3, maxWidth: 900, width: '100%' }}>
              <Typography variant="h5" align="center">{motion.title}</Typography>
              <Box sx={{ bgcolor: 'white', borderRadius: 1, mt: 2, p: 2 }}>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{motion.description}</Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="outlined" onClick={handleSecond} disabled={!!motion.second}>
                  {motion.second ? 'Seconded' : 'Second'}
                </Button>

                <Button variant="contained" onClick={toggleDebate} disabled={!motion.second}>
                  View Debate
                </Button>
              </Box>
            </Paper>
          </Box>

          {showDebate && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Paper elevation={1} sx={{ p: 2, maxWidth: 900, width: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>Debate</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: { xs: '240px', md: '360px' }, overflow: 'auto', pr: 1, pb: { xs: '140px', md: '100px' } }}>
                  {(Array.isArray(motion.debate_list) ? motion.debate_list : []).map((entry, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main, width: 40, height: 40, flexShrink: 0 }}>
                        {entry.author ? String(entry.author)[0].toUpperCase() : 'M'}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {entry.author || 'Member'} · {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : `#${i + 1}`}
                        </Typography>

                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                          {entry.content}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
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

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="contained" endIcon={<SendIcon />} onClick={handleDebateSubmit} disabled={!motion.second || !textInput.trim()}>
                Send
              </Button>
              <Button variant="outlined">Propose Vote</Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default MotionPage;
