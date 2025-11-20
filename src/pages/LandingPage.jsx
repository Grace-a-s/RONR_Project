import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CreateCommitteeDialog from '../components/CreateCommitteeDialog';
import CommitteeCard from '../components/CommitteeCard';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import { useAuth0 } from '@auth0/auth0-react';
import sampleData from '../test_committee_data.json';


function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    let mounted = true;
    import('../lib/api').then(({ fetchJson }) => {        
      fetchJson('/.netlify/functions/committees', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        }).then((data) => {
          console.log("Data", data);
          console.log("Committes list", data.committees);
          if (!mounted) return;
          if (data ) setCommittees(data.committees);
        })
        .catch((e) => console.warn('Failed to load committees from API', e));
    });
    return () => { mounted = false };
  }, []);

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
    console.log('Creating committee (client):', newCommittee);
    import('../lib/api').then(({ fetchJson }) => {
      fetchJson('/.netlify/functions/committees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCommittee.name, description: newCommittee.description }),
      })
        .then((data) => {
          console.log('Create committee response:', data);
          if (data && data.committee) setCommittees((c) => [...c, data.committee]);
        })
        .catch((e) => console.warn('Failed to create committee', e));
    });
    setName('');
    setDescription('');
    setOpen(false);
    console.log("Current committees", committees);
  };

  const { user, isAuthenticated, isLoading } = useAuth0();

  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const openCommittee = (c) => {
    // navigate to committee page (id encoded)
    navigate(`/committee/${encodeURIComponent(c.id)}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 10, gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <Typography variant="h2" component="h1" sx={{ lineHeight: 1, fontWeight: 400 }}>Welcome back, {user?.name || 'User'}!</Typography>
          <Typography variant="h6" component="h2" sx={{ mt: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            You have [#] motions across [#] committees
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={handleOpen} startIcon={<AddIcon />} sx={{ bgcolor: '#0ba179ff', color: 'common.white', p: 1.5, borderRadius: '10px' }}>
            Create Committee
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Your Committees</Typography>

        {committees.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No committees yet! Create one to get started.</Typography>
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
