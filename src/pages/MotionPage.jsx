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
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useAuth0 } from "@auth0/auth0-react";
import VotingPanel from '../components/VotingPanel';
import LoadingPage from './LoadingPage.jsx';
import { openVoting, chairApproveMotion, challengeVeto } from '../lib/api';
import { useMotionsApi } from '../utils/motionsApi';
import { useMembershipsApi } from '../utils/membershipsApi';
import { useCommitteesApi } from '../utils/committeesApi';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useUsersApi } from "../utils/usersApi";
import { getChipSxForStatus } from '../utils/statusColors';

function MotionPage() {
  const { committeeId, motionId } = useParams();
  const navigate = useNavigate();

  const { user, getAccessTokenSilently } = useAuth0();
  const { getMotion, secondMotion, getDebates, createDebate, reproposeMotion, checkReproposeEligibility } = useMotionsApi();
  const { listMembers } = useMembershipsApi(committeeId);
  const { getCommittee } = useCommitteesApi();


  const [motion, setMotion] = useState(null);
  const [committee, setCommittee] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [approvingMotion, setApprovingMotion] = useState(false);
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDebate, setShowDebate] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [debatePosition, setDebatePosition] = useState('NEUTRAL');
  const [votingPanelOpen, setVotingPanelOpen] = useState(false);
  const [openingVote, setOpeningVote] = useState(false);
  const [seconding, setSeconding] = useState(false);
  const [submittingDebate, setSubmittingDebate] = useState(false);
  const { getUsernameById } = useUsersApi();
  const [author, setAuthor] = useState({ username: null });
  const [loadingAuthor, setAuthorLoading] = useState(false);
  const [debateUserMap, setDebateUserMap] = useState({}); // { [authorId]: { username, loading } }
  const inFlightRequestsRef = useRef({}); // { [id]: Promise }
  
  const [canRepropose, setCanRepropose] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [reproposing, setReproposing] = useState(false);
  const [originalMotion, setOriginalMotion] = useState(null);
  const [challengingVeto, setChallengingVeto] = useState(false);

  const polling_interval = 5000;  // 5 seconds - reduced polling frequency for better performance

  // Fetch motion data from backend (initial load only)
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

  // Fetch committee data
  useEffect(() => {
    const fetchCommittee = async () => {
      if (!committeeId) return;
      try {
        const committeeData = await getCommittee(committeeId);
        setCommittee(committeeData);
      } catch (error) {
        console.error('Failed to load committee:', error);
      }
    };

    fetchCommittee();
  }, [committeeId, getCommittee]);
  // Poll for motion updates after initial load
  useAutoRefresh(async () => {
    if (motionId) {
      try {
        const motionData = await getMotion(motionId);
        setMotion(motionData);
      } catch (error) {
        console.error('Failed to update motion:', error);
      }
    }
  }, polling_interval, [motionId, getMotion]);

  // Fetch user's role in the committee
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!committeeId || !user?.sub) return;
      try {
        const members = await listMembers();
        // userId may be populated as an object or be a string
        const currentUser = members.find(member => {
          const memberId = typeof member.userId === 'object' ? member.userId._id : member.userId;
          return memberId === user.sub;
        });
        setUserRole(currentUser?.role || null);
      } catch (error) {
        console.error('Failed to load user role:', error);
      }
    };

    fetchUserRole();
  }, [committeeId, user?.sub, listMembers]);

  // Fetch debates when showDebate is toggled on
  useAutoRefresh(async () => {
    if (showDebate && motionId) {
      try {
        const debatesData = await getDebates(motionId);
        setDebates(debatesData || []);
      } catch (error) {
        console.error('Failed to load debates:', error);
      }
    }
  }, polling_interval, [showDebate, motionId, getDebates]);

  //getting usernames, be in loading state until gets username (or fails)
  useEffect(() => {
    let mounted = true;
    if (!motion || !motion.author) {
      setAuthor({ username: null });
      return () => { mounted = false; };
      }
  
      (async () => {
        try {
          setAuthorLoading(true);
          const data = await getUsernameById(motion.author);
          if (!mounted) return;
          // data may be an object like { username } or an error payload
          if (data && typeof data === 'object' && 'username' in data) {
              setAuthor({ username: data.username });
              } else {
              setAuthor({ username: null });
              }
        } catch (err) {
            console.error('Failed to fetch username', err);
            if (mounted) setAuthor({ username: null });
        } finally {
            if (mounted) setAuthorLoading(false);
          }
    })();
  
    return () => { mounted = false; };
  }, [motion, getUsernameById]);

  // Resolve usernames for debate entries; cache results in debateUserMap
  useEffect(() => {
    let mounted = true;
    if (!debates || debates.length === 0) return;

    // collect unique ids that we don't yet have cached
    const idsToFetch = new Set();
    debates.forEach((entry) => {
      const rawId = entry.authorId;
      const id = rawId && typeof rawId === 'object' ? rawId._id : rawId;
      if (!id) return;
      if (!debateUserMap[id]) idsToFetch.add(id);
    });

    if (idsToFetch.size === 0) return;

    // mark them as loading in one update
    setDebateUserMap((prev) => {
      const next = { ...prev };
      idsToFetch.forEach((id) => {
        if (!next[id]) next[id] = { username: null, loading: true };
      });
      return next;
    });

    // fetch each id, deduplicating concurrent requests via inFlightRequestsRef
    idsToFetch.forEach((id) => {
      if (inFlightRequestsRef.current[id]) return; // already fetching

      const p = (async () => {
        try {
          const data = await getUsernameById(id);
          if (!mounted) return;
          const username = data && typeof data === 'object' && 'username' in data ? data.username : null;
          if (!mounted) return;
          setDebateUserMap((prev) => ({ ...prev, [id]: { username, loading: false } }));
        } catch (err) {
          console.error('Failed to fetch debate username for', id, err);
          if (!mounted) return;
          setDebateUserMap((prev) => ({ ...prev, [id]: { username: null, loading: false } }));
        } finally {
          delete inFlightRequestsRef.current[id];
        }
      })();

      inFlightRequestsRef.current[id] = p;
    });

    return () => { mounted = false; };
  }, [debates, getUsernameById]);
  // Check if current user can re-propose this rejected motion
  useEffect(() => {
    const checkEligibility = async () => {
      if (!motion || !user?.sub || motion.status !== 'REJECTED') {
        setCanRepropose(false);
        return;
      }

      try {
        setCheckingEligibility(true);
        const result = await checkReproposeEligibility(motionId);
        setCanRepropose(result.eligible === true);
      } catch (error) {
        console.error('Failed to check re-propose eligibility:', error);
        setCanRepropose(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [motion, user?.sub, motionId, checkReproposeEligibility]);

  // Fetch original motion if this is a re-proposed motion
  useEffect(() => {
    const fetchOriginalMotion = async () => {
      if (!motion?.originalMotionId) {
        setOriginalMotion(null);
        return;
      }

      try {
        const original = await getMotion(motion.originalMotionId);
        setOriginalMotion(original);
      } catch (error) {
        console.error('Failed to load original motion:', error);
        setOriginalMotion(null);
      }
    };

    fetchOriginalMotion();
  }, [motion?.originalMotionId, getMotion]);

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

  const handleChairApprove = async (action) => {
    try {
      setApprovingMotion(true);
      const token = await getAccessTokenSilently();
      const updatedMotion = await chairApproveMotion(motionId, action, token);
      setMotion(updatedMotion);
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} motion:`, error);
      alert(error.message || `Failed to ${action.toLowerCase()} motion. You may need CHAIR role.`);
    } finally {
      setApprovingMotion(false);
    }
  };

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

  const handleRepropose = async () => {
    if (!motion) return;

    try {
      setReproposing(true);
      const newMotion = await reproposeMotion(motionId);
      navigate(`/committee/${encodeURIComponent(committeeId)}/motion/${newMotion._id}`);
    } catch (error) {
      console.error('Failed to re-propose motion:', error);
      alert(error.message || 'Failed to re-propose motion.');
    } finally {
      setReproposing(false);
    }
  };

  const handleChallengeVeto = async () => {
    if (!motion) return;

    try {
      setChallengingVeto(true);
      const token = await getAccessTokenSilently();
      const updatedMotion = await challengeVeto(motionId, token);
      setMotion(updatedMotion);
    } catch (error) {
      console.error('Failed to challenge veto:', error);
      alert(error.message || 'Failed to challenge veto.');
    } finally {
      setChallengingVeto(false);
    }
  };

  // Check if motion has been seconded based on status
  const isSeconded = motion && motion.status !== 'PROPOSED';
  const isChair = userRole === 'CHAIR';
  const isSecondedStatus = motion && motion.status === 'SECONDED';
  const isDebateStatus = motion && motion.status === 'DEBATE';
  const isDebateOrLater = motion && ['DEBATE', 'VOTING', 'PASSED', 'REJECTED'].includes(motion.status);
  const isVotingOrLater = motion && ['VOTING', 'PASSED', 'REJECTED'].includes(motion.status);
  if (loading) 
    return <LoadingPage/>;
  const isVetoedStatus = motion && motion.status === 'VETOED';
  const isChallengingVeto = motion && motion.status === 'CHALLENGING_VETO';
  const isVetoConfirmed = motion && motion.status === 'VETO_CONFIRMED';

  // Determine whether the first N debate entries have resolved usernames
  const debateInitialBatchSize = Math.min(5, debates.length);
  const isInitialDebateBatchReady = debateInitialBatchSize === 0
    ? true
    : debates.slice(0, debateInitialBatchSize).every((entry) => {
        const rawId = entry.authorId;
        const id = rawId && typeof rawId === 'object' ? rawId._id : rawId;
        const mapEntry = id ? debateUserMap[id] : null;
        return mapEntry && mapEntry.loading === false;
      });
      
  if (!motion) return <Container sx={{ py: 6 }}><Typography>Motion not found</Typography></Container>;

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Container sx={{ py: 4, pb: '180px', flex: '1 1 auto' }}>
          <Box sx={{ position: 'absolute', left: 16, top: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              aria-label="back"
              onClick={() => {
                if (committeeId) navigate(`/committee/${encodeURIComponent(committeeId)}`);
                else navigate(-1);
              }}
              size="large"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" sx={{ cursor: 'pointer' }} onClick={() => { if (committeeId) navigate(`/committee/${encodeURIComponent(committeeId)}`); else navigate(-1); }}>
              To Motions List
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper variant="outlined" sx={{ bgcolor: '#57CC99', p: 3, maxWidth: 900, width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">{motion.title}</Typography>
                <Chip
                  label={motion.status || 'PROPOSED'}
                  {...getChipSxForStatus(motion.status || 'PROPOSED')}
                  sx={{ fontWeight: 600, ...(getChipSxForStatus(motion.status || 'PROPOSED')?.sx || {}) }}
                />
              </Box>
              <Box sx={{ bgcolor: 'white', borderRadius: 1, mt: 2, p: 2 }}>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{motion.description}</Typography>

                {originalMotion && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Re-proposed from:
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate(`/committee/${encodeURIComponent(committeeId)}/motion/${originalMotion._id}`)}
                      sx={{ textTransform: 'none' }}
                    >
                      View Original Motion: {originalMotion.title}
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {/* Chair sees Approve/Veto when motion is SECONDED */}
                  {isChair && isSecondedStatus ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleChairApprove('APPROVE')}
                        disabled={approvingMotion}
                      >
                        {approvingMotion ? <CircularProgress size={20} /> : 'Approve'}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleChairApprove('VETO')}
                        disabled={approvingMotion}
                      >
                        {approvingMotion ? <CircularProgress size={20} /> : 'Deny'}
                      </Button>
                    </>
                  ) : !isChair && isSecondedStatus ? (
                    /* Non-chair users see waiting banner when motion is SECONDED */
                    <Chip
                      icon={<HourglassEmptyIcon sx={{ color: 'white !important' }} />}
                      label="Waiting for chair response"
                      sx={{
                        fontWeight: 500,
                        bgcolor: '#FF57BB',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  ) : !isChair && isVetoedStatus && !motion.vetoChallengeConducted ? (
                    /* Non-chair members can challenge veto */
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleChallengeVeto}
                      disabled={challengingVeto}
                    >
                      {challengingVeto ? <CircularProgress size={20} /> : 'Move to Overrule Veto'}
                    </Button>
                  ) : isVetoedStatus || isVetoConfirmed ? (
                    /* Show status message for vetoed/veto confirmed */
                    <Chip
                      label={isVetoConfirmed ? "Veto Upheld" : "Vetoed by Chair"}
                      sx={{
                        fontWeight: 500,
                        bgcolor: '#FF57BB',
                        color: 'white'
                      }}
                    />
                  ) : isChallengingVeto ? (
                    /* Show active veto challenge status */
                    <Chip
                      icon={<HowToVoteIcon sx={{ color: 'white !important' }} />}
                      label="Veto Challenge Vote In Progress"
                      sx={{
                        fontWeight: 500,
                        bgcolor: '#FFA500',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  ) : motion.status === 'REJECTED' ? (
                    /* Show re-propose button for REJECTED motions if user voted OPPOSE */
                    <>
                      {canRepropose && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleRepropose}
                          disabled={reproposing || checkingEligibility}
                        >
                          {reproposing ? <CircularProgress size={20} /> : 'Re-Propose Motion'}
                        </Button>
                      )}
                      <Button variant="contained" onClick={toggleDebate}>
                        View Debate
                      </Button>
                    </>
                  ) : (
                    /* Show Second button for PROPOSED, or View Debate for DEBATE and later */
                    <>
                      <Button
                        variant="outlined"
                        onClick={handleSecond}
                        disabled={isSeconded || seconding}
                      >
                        {seconding ? <CircularProgress size={20} /> : isSeconded ? 'Seconded' : 'Second'}
                      </Button>

                      {isDebateOrLater && !isVetoedStatus && !isVetoConfirmed && (
                        <Button variant="contained" onClick={toggleDebate}>
                          View Debate
                        </Button>
                      )}
                    </>
                  )}
                </Box>

                {/* Show Voting button when motion is in VOTING, CHALLENGING_VETO, or later */}
                {(isVotingOrLater || isChallengingVeto) && (
                  <Button
                    variant="outlined"
                    onClick={() => setVotingPanelOpen(true)}
                    startIcon={<HowToVoteIcon />}
                  >
                    Voting
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>

          {showDebate && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Paper elevation={1} sx={{ p: 2, maxWidth: 900, width: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>Debate</Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: { xs: '240px', md: '360px' },
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    overscrollBehavior: 'contain',
                    pr: 1,
                    pb: { xs: '140px', md: '100px' },
                  }}
                >
                  {debates.length === 0 ? (
                    <Typography color="text.secondary" align="center">No debate entries yet.</Typography>
                  ) : (
                    debates.map((entry, i) => {
                      const rawId = entry.authorId;
                      const id = rawId && typeof rawId === 'object' ? rawId._id : rawId;
                      const mapEntry = id ? debateUserMap[id] : null;
                      const displayName = mapEntry?.loading ? 'Loading...' : mapEntry?.username || 'Member';

                      return (
                        <Paper key={entry._id || i} variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main, width: 40, height: 40, flexShrink: 0 }}>
                            {id ? String(id)[0].toUpperCase() : 'M'}
                          </Avatar>

                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {displayName} · {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : `#${i + 1}`}
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
                      );
                    })
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </Container>

        {/* Only show debate input footer when motion is in DEBATE status */}
        {isDebateStatus && (
          <Box component="footer" sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (theme) => theme.zIndex.drawer + 1, py: 0 }}>
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
                {isChair && (
                  <Button
                    variant="outlined"
                    onClick={handleProposeVote}
                    disabled={openingVote}
                    startIcon={openingVote ? <CircularProgress size={20} /> : null}
                  >
                    {openingVote ? 'Opening...' : 'Open Voting'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>

      <VotingPanel
        open={votingPanelOpen}
        onClose={() => setVotingPanelOpen(false)}
        motion={motion}
        committee={committee}
        onVoteSuccess={handleVoteSuccess}
      />
    </>
  );
}

export default MotionPage;
