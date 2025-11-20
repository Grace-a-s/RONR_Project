import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CreateCommitteeCard from '../components/CreateCommitteeCard';
import CreateCommitteeDialog from '../components/CreateCommitteeDialog';
import CommitteeCard from '../components/CommitteeCard';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [committees, setCommittees] = useState([]);
  const skipPersist = useRef(true);

  useEffect(() => {
    // Try API first, fall back to localStorage
    let mounted = true;
    fetch('/.netlify/functions/committees')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data && Array.isArray(data.committees)) setCommittees(data.committees);
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem('committees');
          if (raw) setCommittees(JSON.parse(raw));
        } catch (e) {
          console.warn('Failed to load committees', e);
        }
      });
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    // Persist to API; if API fails, fall back to localStorage
    (async () => {
      try {
        // Here we simply replace client-side persistence with server call on create only.
        // Keep localStorage fallback for offline/dev.
        localStorage.setItem('committees', JSON.stringify(committees));
      } catch (e) {
        console.warn('Failed to save committees', e);
      }
    })();
  }, [committees]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = String(Date.now());
    const newCommittee = {
      id,
      name: name.trim(),
      description: description.trim(),
      createdAt: Date.now(),
    };
    // Try to create on server, fall back locally
    fetch('/.netlify/functions/committees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCommittee.name, description: newCommittee.description }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.committee) setCommittees((c) => [...c, data.committee]);
        else setCommittees((c) => [...c, newCommittee]);
      })
      .catch(() => setCommittees((c) => [...c, newCommittee]));
    setName('');
    setDescription('');
    setOpen(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const openCommittee = (c) => {
    // navigate to committee page (id encoded)
    navigate(`/committee/${encodeURIComponent(c.id)}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Committees</Typography>
      </Box>

      <Box sx={{ mb: 3, p: 2, bgcolor: '#f7f7f7', borderRadius: 1 }}>
        <Typography variant="body1">Create or select a committee to view motions and manage members.</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <CreateCommitteeCard onOpen={handleOpen} />
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Your Committees</Typography>

        {committees.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No committees yet. Create one to get started.</Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {committees.map((c) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
                <CommitteeCard committee={c} onClick={() => openCommittee(c)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <CreateCommitteeDialog open={open} onClose={handleClose} name={name} setName={setName} description={description} setDescription={setDescription} onSubmit={handleCreate} />
    </Container>
  );
}

export default LandingPage;
