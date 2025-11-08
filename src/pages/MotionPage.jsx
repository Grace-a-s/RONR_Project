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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

function MotionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [motion, setMotion] = useState(null);
  const [showDebate, setShowDebate] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('motions'));
    if (stored) {
      const list = Array.isArray(stored) ? stored : stored.motion_list || [];
      const found = list.find((m) => String(m.id) === String(id));
      if (found) {
        setMotion(found);
        return;
      }
    }
    // if not found, keep null (shows Loading...)
  }, [id]);

  const updateData = (updatedMotion) => {
    const stored = JSON.parse(localStorage.getItem('motions')) || [];
    if (Array.isArray(stored)) {
      const idx = stored.findIndex((m) => String(m.id) === String(id));
      if (idx !== -1) stored[idx] = updatedMotion;
      else stored.push(updatedMotion);
      localStorage.setItem('motions', JSON.stringify(stored));
    } else {
      const list = stored.motion_list || [];
      const idx = list.findIndex((m) => String(m.id) === String(id));
      if (idx !== -1) list[idx] = updatedMotion;
      else list.push(updatedMotion);
      localStorage.setItem('motions', JSON.stringify({ ...stored, motion_list: list }));
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
      const debateEntry = { content: textInput };
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
      <Container sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>{motion.title}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{motion.description}</Typography>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={toggleDebate} disabled={!motion.second}>Debate</Button>
                {!motion.second && (
                  <Button variant="outlined" onClick={handleSecond}>Second</Button>
                )}
              </Box>

              {showDebate && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Debate</Typography>
                  <List sx={{ maxHeight: 240, overflow: 'auto' }}>
                    {(Array.isArray(motion.debate_list) ? motion.debate_list : []).map((entry, i) => (
                      <ListItem key={i} divider>
                        <ListItemText primary={entry.content} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                placeholder="Type here"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleDebateSubmit}
                  disabled={!motion.second || !textInput.trim()}
                >
                  Send
                </Button>
                <Button variant="outlined">Propose Vote</Button>
                <Button variant="outlined">Checkbox</Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default MotionPage;
