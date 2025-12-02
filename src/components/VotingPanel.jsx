import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getVotes, castVote } from '../lib/api';

function VotingPanel({ open, onClose, motion, committeeId, user }) {
  // State management
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [showIndividualVotes, setShowIndividualVotes] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voteTally, setVoteTally] = useState({
    supportCount: 0,
    opposeCount: 0,
    totalVotes: 0,
    supportPercent: 0,
    opposePercent: 0
  });

  // Fetch votes when panel opens
  useEffect(() => {
    const fetchVoteData = async () => {
      if (!open || !motion?.id) {
        return;
      }

      setLoading(true);
      try {
        const votesData = await getVotes(motion.id);
        setVotes(votesData || []);

        // Calculate tally
        const supportVotes = votesData.filter(v => v.position === 'SUPPORT').length;
        const opposeVotes = votesData.filter(v => v.position === 'OPPOSE').length;
        const totalVotes = supportVotes + opposeVotes;
        const supportPercent = totalVotes > 0 ? (supportVotes / totalVotes) * 100 : 0;
        const opposePercent = totalVotes > 0 ? (opposeVotes / totalVotes) * 100 : 0;

        setVoteTally({
          supportCount: supportVotes,
          opposeCount: opposeVotes,
          totalVotes,
          supportPercent,
          opposePercent
        });

        // Check if current user has voted
        if (user && user.sub) {
          const currentUserVote = votesData.find(v => v.authorId === user.sub);
          setUserVote(currentUserVote || null);
        }
      } catch (error) {
        console.error('Failed to fetch votes:', error);
        // Reset to empty state on error
        setVotes([]);
        setVoteTally({
          supportCount: 0,
          opposeCount: 0,
          totalVotes: 0,
          supportPercent: 0,
          opposePercent: 0
        });
        setUserVote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVoteData();
  }, [open, motion?.id, user]);

  // Vote submission handler
  const handleVote = async (position) => {
    if (!motion?.id || !user) {
      console.error('Cannot vote: missing motion ID or user');
      return;
    }

    setVotingInProgress(true);
    try {
      // Submit the vote
      const result = await castVote(motion.id, position);

      // Immediately refetch votes to update the display
      const votesData = await getVotes(motion.id);
      setVotes(votesData || []);

      // Recalculate tally
      const supportVotes = votesData.filter(v => v.position === 'SUPPORT').length;
      const opposeVotes = votesData.filter(v => v.position === 'OPPOSE').length;
      const totalVotes = supportVotes + opposeVotes;
      const supportPercent = totalVotes > 0 ? (supportVotes / totalVotes) * 100 : 0;
      const opposePercent = totalVotes > 0 ? (opposeVotes / totalVotes) * 100 : 0;

      setVoteTally({
        supportCount: supportVotes,
        opposeCount: opposeVotes,
        totalVotes,
        supportPercent,
        opposePercent
      });

      // Update user's vote
      if (user.sub) {
        const currentUserVote = votesData.find(v => v.authorId === user.sub);
        setUserVote(currentUserVote || null);
      }

      // If the backend returned an updated motion status (threshold reached), handle it
      if (result.motion) {
        // The backend auto-updates motion status when threshold is reached
        // Could add a notification here or update parent component
        console.log('Motion status updated:', result.motion.status);
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
      // Could add error toast/snackbar here
      alert(`Failed to submit vote: ${error.message}`);
    } finally {
      setVotingInProgress(false);
    }
  };

  // Toggle individual votes visibility
  const toggleIndividualVotes = () => {
    setShowIndividualVotes(!showIndividualVotes);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'VOTING':
        return 'primary';
      case 'PASSED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!motion) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#57CC99' }}>
          <Typography variant="h6" sx={{ flex: 1, pr: 2, color: 'white' }}>
            {motion.title}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Status Badge */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Chip
            label={motion.status || 'UNKNOWN'}
            color={getStatusColor(motion.status)}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Divider />

        {/* Vote Tally Section */}
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Vote Tally
              </Typography>

          {/* Support Votes */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                Support
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                {voteTally.supportCount} ({voteTally.supportPercent.toFixed(1)}%)
              </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={voteTally.supportPercent}
                color="success"
                sx={{ height: 10, borderRadius: 1 }}
              />
              {/* 2/3 Threshold Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '66.67%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: 'warning.main',
                  zIndex: 1,
                }}
              />
            </Box>
          </Box>

          {/* Oppose Votes */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
                Oppose
              </Typography>
              <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
                {voteTally.opposeCount} ({voteTally.opposePercent.toFixed(1)}%)
              </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={voteTally.opposePercent}
                color="error"
                sx={{ height: 10, borderRadius: 1 }}
              />
              {/* 2/3 Threshold Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '66.67%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: 'warning.main',
                  zIndex: 1,
                }}
              />
            </Box>
          </Box>

          {/* 2/3 Threshold Info */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: voteTally.supportPercent >= 66.67 ? 'success.light' : voteTally.opposePercent >= 66.67 ? 'error.light' : 'grey.100',
              borderRadius: 1,
              border: (voteTally.supportPercent >= 66.67 || voteTally.opposePercent >= 66.67) ? 2 : 0,
              borderColor: voteTally.supportPercent >= 66.67 ? 'success.main' : 'error.main'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ width: 2, height: 12, bgcolor: 'warning.main' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                2/3 Threshold: 66.7%
              </Typography>
            </Box>
            <Typography variant="caption" display="block" color="text.secondary">
              Total Votes: {voteTally.totalVotes}
            </Typography>
            {voteTally.supportPercent >= 66.67 && (
              <Typography variant="caption" display="block" color="success.dark" sx={{ fontWeight: 'bold', mt: 1 }}>
                ✓ Support threshold reached!
              </Typography>
            )}
            {voteTally.opposePercent >= 66.67 && (
              <Typography variant="caption" display="block" color="error.dark" sx={{ fontWeight: 'bold', mt: 1 }}>
                ✓ Oppose threshold reached!
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Voting Buttons Section */}
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Cast Your Vote
          </Typography>

          {userVote ? (
            <Box sx={{ p: 2, mb: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                You voted: <strong>{userVote.position}</strong>
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={votingInProgress ? <CircularProgress size={20} color="inherit" /> : <ThumbUpIcon />}
                fullWidth
                disabled={motion.status !== 'VOTING' || votingInProgress}
                onClick={() => handleVote('SUPPORT')}
              >
                {votingInProgress ? 'Voting...' : 'Support'}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={votingInProgress ? <CircularProgress size={20} color="inherit" /> : <ThumbDownIcon />}
                fullWidth
                disabled={motion.status !== 'VOTING' || votingInProgress}
                onClick={() => handleVote('OPPOSE')}
              >
                {votingInProgress ? 'Voting...' : 'Oppose'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Individual Votes Section */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Individual Votes
            </Typography>

            <Button
              onClick={toggleIndividualVotes}
              endIcon={showIndividualVotes ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              fullWidth
              variant="outlined"
              sx={{ justifyContent: 'space-between', mb: 1 }}
            >
              {showIndividualVotes ? 'Hide' : 'Show'} All Votes ({votes.length})
            </Button>

            <Collapse in={showIndividualVotes}>
              <Box sx={{ mt: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
                  {votes.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="No votes cast yet"
                        primaryTypographyProps={{ color: 'text.secondary', variant: 'body2', align: 'center' }}
                      />
                    </ListItem>
                  ) : (
                    votes.map((vote, index) => (
                      <ListItem
                        key={vote._id || index}
                        divider={index < votes.length - 1}
                        sx={{
                          bgcolor: vote.authorId === user?.sub ? 'action.selected' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <Box sx={{
                          width: 4,
                          height: 40,
                          bgcolor: vote.position === 'SUPPORT' ? 'success.main' : 'error.main',
                          borderRadius: 1,
                          mr: 2,
                          flexShrink: 0
                        }} />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: vote.authorId === user?.sub ? 'bold' : 'normal' }}>
                                {vote.authorId}
                              </Typography>
                              {vote.authorId === user?.sub && (
                                <Chip label="You" size="small" color="primary" sx={{ height: 20 }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: vote.position === 'SUPPORT' ? 'success.main' : 'error.main'
                                }}
                              >
                                {vote.position === 'SUPPORT' ? '✓ Support' : '✗ Oppose'}
                              </Typography>
                              {vote.createdAt && (
                                <Typography component="span" variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                  {new Date(vote.createdAt).toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            </Collapse>
          </Box>
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

export default VotingPanel;
