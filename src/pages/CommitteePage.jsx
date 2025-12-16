import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CreateMotionDialog from '../components/CreateMotionDialog';
import MotionDetailsCard from '../components/MotionDetailsCard';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LoadingPage from './LoadingPage.jsx';
import { useCommitteesApi } from '../utils/committeesApi';
import { useMotionsApi } from '../utils/motionsApi';
import { useMembershipsApi } from '../utils/membershipsApi';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

function CommitteePage() {
  const navigate = useNavigate();
  const { committeeId } = useParams();
  const [openDialog, setOpenDialog] = useState(false);
  const [motionTitle, setMotionTitle] = useState('');
  const [motionDescription, setMotionDescription] = useState('');
  const [motions, setMotions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [committee, setCommittee] = useState(null);
  const [committeeLoading, setCommitteeLoading] = useState(true);
  const [motionsLoading, setMotionsLoading] = useState(true);
  const [motionsError, setMotionsError] = useState(null);
  const [creatingMotion, setCreatingMotion] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(null);
  const { getCommittee } = useCommitteesApi();
  const { listMotions, createMotion } = useMotionsApi();
  const { listMembers } = useMembershipsApi(committeeId);

  const polling_interval = 30000; // 30 sec

  const mapMotion = useCallback((motion = {}) => ({
    id: String(motion._id),
    title: motion.title || '',
    description: motion.description || '',
    timestamp: motion.createdAt || motion.updatedAt || Date.now(),
    author: motion.authorId || 'Unknown',
    status: motion.status || 'PROPOSED',
    second: motion.status ? ['SECONDED', 'DEBATE', 'VOTING', 'PASSED'].includes(motion.status) : false,
  }), []);

  const refreshCommittee = useCallback(async () => {
    if (!committeeId) return;
    setCommitteeLoading(true);
    try {
      const data = await getCommittee(committeeId);
      setCommittee(data || null);
    } catch (err) {
      console.error('Failed to load committee', err.message);
    } finally {
      setCommitteeLoading(false);
    }
  }, [committeeId, getCommittee]);

  const refreshMotions = useCallback(async () => {
    if (!committeeId) return;
    setMotionsLoading(true);
    setMotionsError(null);
    try {
      const data = await listMotions(committeeId);
      const normalized = (Array.isArray(data) ? data : []).map(mapMotion);
      setMotions(normalized);
    } catch (err) {
      console.error('Failed to load motions', err.message);
      setMotionsError(err.message || 'Failed to load motions');
    } finally {
      setMotionsLoading(false);
    }
  }, [committeeId, listMotions, mapMotion]);

  useEffect(() => {
    refreshCommittee();
  }, [refreshCommittee]);

  useAutoRefresh(() => {
    refreshMotions();
  }, polling_interval,[refreshMotions]);

  const refreshMembersCount = useCallback(async () => {
    if (!committeeId) return;
    setMembersLoading(true);
    setMembersError(null);
    try {
      const data = await listMembers();
      setMembersCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setMembersError(err.message || 'Failed to load committee members');
      setMembersCount(0);
    } finally {
      setMembersLoading(false);
    }
  }, [committeeId, listMembers]);

  useAutoRefresh(() => {
    refreshMembersCount();
  }, polling_interval, [refreshMembersCount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = motionTitle.trim();
    const trimmedDescription = motionDescription.trim();
    if (!trimmedTitle || !trimmedDescription || !committeeId) return;
    setCreatingMotion(true);
    setMotionsError(null);
    (async () => {
      try {
        const created = await createMotion(committeeId, {
          title: trimmedTitle,
          description: trimmedDescription,
        });
        setMotions((prev) => [mapMotion(created), ...prev]);
        setOpenDialog(false);
        setMotionTitle('');
        setMotionDescription('');
      } catch (err) {
        console.error('Failed to create motion', err.message);
        setMotionsError(err.message || 'Failed to create motion');
      } finally {
        setCreatingMotion(false);
      }
    })();
  };

  const handleOpenCreate = () => setOpenDialog(true);

  const handleCardClick = (motion) => {
    // navigate to motion within this committee
    navigate(`/committee/${encodeURIComponent(committeeId)}/motion/${encodeURIComponent(motion.id)}`);
  };


  const motionsCount = motions.length;

  const filteredMotions = useMemo(() => {
    const lowered = searchQuery.trim().toLowerCase();
    return motions.filter((motion) => {
      const title = (motion.title || '').toLowerCase();
      const description = (motion.description || '').toLowerCase();
      const matchesText = !lowered || title.includes(lowered) || description.includes(lowered);
      if (!statusFilter) return matchesText;
      // statusFilter stores upper-case status keys like 'PROPOSED'
      return matchesText && String(motion.status || '').toUpperCase() === statusFilter;
    });
  }, [motions, searchQuery, statusFilter]);

  const pageLoading = committeeLoading || motionsLoading || membersLoading;

  if (pageLoading) {
    return <LoadingPage/>;
  }

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 2 }}>
        <Box
          onClick={() => navigate('/')}
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
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{committee?.name || `Committee ${committeeId}`}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.9)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {committee?.description || 'Committee description goes here.'}
                  </Typography>

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
                </>
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

      {membersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {membersError}
        </Alert>
      )}
      {motionsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {motionsError}
        </Alert>
      )}

      
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
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="status-filter-label" sx={{ color: '#FF57BB' }}>Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                bgcolor: 'white',
                borderRadius: '10px',
                px: 1,
                border: '2px solid #FF57BB',
                color: '#FF57BB',
                '& .MuiSelect-icon': { color: '#FF57BB' },
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PROPOSED">Proposed</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="SECONDED">Seconded</MenuItem>
              <MenuItem value="VETOED">Vetoed</MenuItem>
              <MenuItem value="DEBATE">Debate</MenuItem>
              <MenuItem value="VOTING">Voting</MenuItem>
              <MenuItem value="PASSED">Passed</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>

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
          {motionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : filteredMotions.length === 0 ? (
              <Typography>
                {searchQuery.trim()
                  ? 'No motions match your search.'
                  : 'No motions yet! Be the first to propose!'}
              </Typography>
          ) : (
            filteredMotions.map((motion) => (
                <MotionDetailsCard key={motion.id} motion={motion} onClick={() => handleCardClick(motion)} />
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
        submitting={creatingMotion}
      />
    </Container>
  );
}

export default CommitteePage;
