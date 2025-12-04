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
import { useAuth0 } from '@auth0/auth0-react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useUsersApi } from '../utils/usersApi';
import { useCommitteesApi } from '../utils/committeesApi';


function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [committees, setCommittees] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingCommittees, setLoadingCommittees] = useState(true);
  const [savingCommittee, setSavingCommittee] = useState(false);
  const syncedUserIdRef = useRef(null);
  const { listCommittees, createCommittee } = useCommitteesApi();

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
    } catch (err) {
      console.error('Failed to load committees', err.message);
    } finally {
      setLoadingCommittees(false);
    }
  }, [listCommittees, normalizeCommittee]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 10, gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <Typography variant="h2" component="h1" sx={{ lineHeight: 1, fontWeight: 400 }}>Welcome, {profile?.username || user?.name || 'User'}!</Typography>
          {/* <Typography variant="h6" component="h2" sx={{ mt: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            You have [#] motions across [#] committees
          </Typography> */}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={handleOpen} startIcon={<AddIcon />} sx={{ bgcolor: '#0ba179ff', color: 'common.white', p: 1.5, borderRadius: '10px' }}>
            Create Committee
          </Button>
        </Box>
      </Box>

      <Box>
        {loadingCommittees ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
