import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { useAuth0 } from '@auth0/auth0-react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { useUsersApi } from '../utils/usersApi';
import { useCommitteesApi } from '../utils/committeesApi';
import { useMotionsApi } from '../utils/motionsApi';


function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [committees, setCommittees] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingCommittees, setLoadingCommittees] = useState(true);
  const [savingCommittee, setSavingCommittee] = useState(false);
  const [motionStats, setMotionStats] = useState({ total: 0, proposed: 0, debate: 0, voting: 0 });
  const syncedUserIdRef = useRef(null);
  const { listCommittees, createCommittee } = useCommitteesApi();
  const { listMotions } = useMotionsApi();

  const normalizeCommittee = useCallback((committee) => ({
    id: committee?._id ? String(committee._id) : String(committee?.id || Date.now()),
    name: committee?.name || 'Untitled Committee',
    description: committee?.description || '',
    members: committee?.members || committee?.memberList || [],
    membersCount: committee?.membersCount ?? 0,
    motionsCount: committee?.motionsCount ?? 0,
    createdAt: committee?.createdAt || committee?.updatedAt || Date.now(),
  }), []);

  const fetchCommittees = useCallback(async () => {
    setLoadingCommittees(true);
    try {
      const data = await listCommittees();
      const normalized = (Array.isArray(data) ? data : []).map(normalizeCommittee);
      setCommittees(normalized);
      
      // Fetch motions for all committees to calculate statistics
      const stats = { total: 0, proposed: 0, debate: 0, voting: 0 };
      await Promise.all(
        normalized.map(async (committee) => {
          try {
            const motions = await listMotions(committee.id);
            const motionList = Array.isArray(motions) ? motions : [];
            motionList.forEach((motion) => {
              stats.total++;
              const status = String(motion.status || '').toUpperCase();
              if (status === 'PROPOSED') stats.proposed++;
              else if (status === 'DEBATE') stats.debate++;
              else if (status === 'VOTING') stats.voting++;
            });
          } catch (err) {
            console.error(`Failed to load motions for committee ${committee.id}`, err.message);
          }
        })
      );
      setMotionStats(stats);
    } catch (err) {
      console.error('Failed to load committees', err.message);
    } finally {
      setLoadingCommittees(false);
    }
  }, [listCommittees, listMotions, normalizeCommittee]);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSavingCommittee(true);
    try {
      const created = await createCommittee({
        name: trimmedName,
        description: description.trim() || undefined,
      });
      const normalized = normalizeCommittee(created);
      setCommittees((prev) => [...prev, normalized]);
      setName('');
      setDescription('');
      setOpen(false);
    } catch (err) {
      console.error('Failed to create committee', err.message);
    } finally {
      setSavingCommittee(false);
    }
  };

  const { user, isAuthenticated, isLoading } = useAuth0();
  const { getCurrentUser, upsertCurrentUser } = useUsersApi();
  const userId = user?.sub || null;
  const userEmail = user?.email || null;

  useEffect(() => {
    if (isLoading || !isAuthenticated || !userId) return;
    if (syncedUserIdRef.current === userId) return;

    let cancelled = false;
    const usernameFromEmail = userEmail ? userEmail.split('@')[0] : null;

    const syncUser = async () => {
      try {
        let usernameToUse = usernameFromEmail;
        try {
          const existingUser = await getCurrentUser();
          if (existingUser) {
            if (existingUser.username) {
              usernameToUse = existingUser.username;
            }
            if (!cancelled) {
              setProfile(existingUser);
            }
          }
        } catch (lookupErr) {
          if (lookupErr?.status !== 404) {
            console.error('Failed to load existing user profile', lookupErr);
          }
        }

        const updated = await upsertCurrentUser({
          auth0Id: userId,
          email: userEmail,
          username: usernameToUse,
        });
        if (!cancelled) {
          syncedUserIdRef.current = userId;
          setProfile((prev) => prev || updated || null);
        }
      } catch (err) {
        console.error('Failed to sync user profile', err);
      }
    };

    syncUser();

    return () => {
      cancelled = true;
    };
  }, [getCurrentUser, isAuthenticated, isLoading, upsertCurrentUser, userEmail, userId]);

  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const openCommittee = (c) => {
    // navigate to committee page (id encoded)
    navigate(`/committee/${encodeURIComponent(c.id)}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h1" sx={{ lineHeight: 1, fontWeight: 400, color: '#133449ff' }}>
          Welcome, {profile?.username || user?.name || 'User'}!
        </Typography>
      </Box>

      {/* Full-bleed banner */}
      <Box sx={{ position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', width: '100vw', py: 3, background: 'linear-gradient(90deg, #22577A 0%, #38A3A5 50%)', color: 'common.white', mb: 5 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" component="h2" sx={{ mt: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                You have {motionStats.total} total motions across {committees.length} committees
              </Typography>

              {/* Motion Status Cards */}
              <Stack direction="row" spacing={2} sx={{ mt: 3, maxWidth: '80%' }}>
                <Paper sx={{ 
                  flex: 1, 
                  p: 3, 
                  bgcolor: '#85d4d5b2', 
                  backdropFilter: 'blur(10px)', 
                  color: 'common.white',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    bgcolor: '#6fc4c5'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AssignmentIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {motionStats.proposed}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                    Proposed Motions
                  </Typography>
                </Paper>

                <Paper sx={{ 
                  flex: 1, 
                  p: 3, 
                  bgcolor: '#FF57BB', 
                  backdropFilter: 'blur(10px)', 
                  color: 'common.white',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    bgcolor: '#ff3da8'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ForumIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {motionStats.debate}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                    Debated Motions
                  </Typography>
                </Paper>

                <Paper sx={{ 
                  flex: 1, 
                  p: 3, 
                  bgcolor: '#22577A', 
                  backdropFilter: 'blur(10px)', 
                  color: 'common.white',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    bgcolor: '#1a4259'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <HowToVoteIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {motionStats.voting}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                    Voting Motions
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Button onClick={handleOpen} startIcon={<AddIcon />} sx={{ 
                bgcolor: '#E8F4F8', 
                color: '#22577A', 
                p: 1.5, 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#d4eaf2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.25)'
                }
              }}>
                Create Committee
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box>
        {loadingCommittees ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 500 }}>Your Committees</Typography>

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
          </>
        )}
      </Box>

      <CreateCommitteeDialog
        open={open}
        onClose={handleClose}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        onSubmit={handleCreate}
        submitting={savingCommittee}
      />
    </Container>
  );
}

export default LandingPage;
