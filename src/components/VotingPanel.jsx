import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { castVote, getVotes, getCommitteeMemberCount } from '../lib/api';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

function VotingPanel({ open, onClose, motion, committee, onVoteSuccess }) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [votes, setVotes] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [casting, setCasting] = useState(false);
  const [showVotes, setShowVotes] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [opposeCount, setOpposeCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isAnonymous, setIsAnonymous] = useState(false);

  const committeeThreshold = committee?.votingThreshold || 'MAJORITY';

   const polling_interval = 3000; 

  useAutoRefresh(() => {
    if (open && motion) {
      fetchVotes();
      fetchMemberCount();
    }
  }, polling_interval, [open, motion]);

  const fetchVotes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const votesData = await getVotes(motion._id, token);

      // Ensure votesData is an array
      const validVotes = Array.isArray(votesData) ? votesData : [];
      setVotes(validVotes);

      const support = validVotes.filter(v => v.position === 'SUPPORT').length;
      const oppose = validVotes.filter(v => v.position === 'OPPOSE').length;
      setSupportCount(support);
      setOpposeCount(oppose);

      const myVote = validVotes.find(v => v.authorId === user.sub);
      setUserVote(myVote);

      // Check if anonymous mode is enabled (based on whether timestamps are present)
      // If first vote has no createdAt, we're in anonymous mode
      setIsAnonymous(validVotes.length > 0 && !validVotes[0].createdAt);
    } catch (error) {
      // On error, reset to empty state
      setVotes([]);
      setSupportCount(0);
      setOpposeCount(0);
      setUserVote(null);
      setIsAnonymous(false);
      console.error('Failed to fetch votes:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to fetch votes', severity: 'error' });
    }
  };

  const fetchMemberCount = async () => {
    try {
      const token = await getAccessTokenSilently();
      const memberships = await getCommitteeMemberCount(motion.committeeId, token);
      setTotalMembers(Array.isArray(memberships) ? memberships.length : 0);
    } catch (error) {
      console.error('Failed to fetch member count:', error);
    }
  };

  const handleVote = async (position) => {
    try {
      setCasting(true);
      const token = await getAccessTokenSilently();
      const result = await castVote(motion._id, position, token);

      setSnackbar({ open: true, message: `Vote cast: ${position}`, severity: 'success' });

      await fetchVotes();

      if (onVoteSuccess) {
        onVoteSuccess(result);
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to cast vote', severity: 'error' });
    } finally {
      setCasting(false);
    }
  };

  const threshold = committeeThreshold === "SUPERMAJORITY"
    ? Math.ceil((totalMembers * 2) / 3)
    : Math.floor(totalMembers / 2) + 1;
  const thresholdText = committeeThreshold === "SUPERMAJORITY" ? "2/3" : "majority";
  const thresholdDescription = committeeThreshold === "SUPERMAJORITY" ? "2/3" : "majority";

  const supportProgress = totalMembers > 0 ? (supportCount / threshold) * 100 : 0;
  const opposeProgress = totalMembers > 0 ? (opposeCount / threshold) * 100 : 0;
  const totalVotesCast = supportCount + opposeCount;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            maxWidth: '100vw',
          },
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Vote on Motion</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {motion?.title}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Vote Progress
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Bars show progress toward {thresholdText} threshold • Percentages show vote distribution
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Support
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {supportCount} ({totalVotesCast > 0 ? Math.round((supportCount / totalVotesCast) * 100) : 0}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(supportProgress, 100)}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#57CC99',
                  }
                }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Oppose
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {opposeCount} ({totalVotesCast > 0 ? Math.round((opposeCount / totalVotesCast) * 100) : 0}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(opposeProgress, 100)}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#FF57BB',
                  }
                }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Total members: {totalMembers} • Need {threshold} votes ({thresholdDescription}) to pass
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {userVote ? (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                You voted: {userVote.position}
              </Typography>
              {!isAnonymous && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(userVote.createdAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          ) : motion?.status === 'VOTING' ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Cast Your Vote
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={casting ? <CircularProgress size={20} color="inherit" /> : <ThumbUpIcon />}
                  disabled={casting}
                  onClick={() => handleVote('SUPPORT')}
                  sx={{
                    bgcolor: '#57CC99',
                    '&:hover': { bgcolor: '#45a87d' },
                  }}
                >
                  Support
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={casting ? <CircularProgress size={20} color="inherit" /> : <ThumbDownIcon />}
                  disabled={casting}
                  onClick={() => handleVote('OPPOSE')}
                  sx={{
                    bgcolor: '#FF57BB',
                    '&:hover': { bgcolor: '#e040a0' },
                  }}
                >
                  Oppose
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Voting is not open for this motion yet.
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Button
              fullWidth
              variant="outlined"
              endIcon={showVotes ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowVotes(!showVotes)}
              disabled={isAnonymous}
              sx={{ mb: 2 }}
            >
              {isAnonymous
                ? `Votes Hidden (${votes.length})`
                : (showVotes ? 'Hide Votes' : 'Show Votes') + ` (${votes.length})`}
            </Button>

            {showVotes && !isAnonymous && (
              <List>
                {votes.map((vote, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {vote.authorId.substring(0, 8)}... voted{' '}
                          <span style={{
                            fontWeight: 600,
                            color: vote.position === 'SUPPORT' ? '#57CC99' : '#FF57BB'
                          }}>
                            {vote.position}
                          </span>
                        </Typography>
                      }
                      secondary={new Date(vote.createdAt).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default VotingPanel;
