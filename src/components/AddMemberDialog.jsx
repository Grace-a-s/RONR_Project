import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

const ROLE_OPTIONS = ['OWNER', 'CHAIR', 'MEMBER'];

function AddMemberDialog({ open, onClose, onSubmit, getUserByUsername }) {
  const [username, setUsername] = React.useState('');
  const [role, setRole] = React.useState('MEMBER');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleReset = () => {
    setUsername('');
    setRole('MEMBER');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const userRecord = await getUserByUsername(username.trim());
      
      if (!userRecord || !userRecord._id) {
        setError('User does not exist');
        setLoading(false);
        return;
      }
      
      onSubmit(username.trim(), role);
      handleReset();
    } catch (err) {
      setError('User does not exist');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: 'background.default', borderRadius: 2, overflowX: 'hidden' } }}
    >
      <DialogTitle sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Add Member</Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 1, overflowX: 'hidden' }}>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter username"
            variant="outlined"
            autoFocus
            error={!!error}
            sx={{
              backgroundColor: 'white',
              flex: 2
            }}
          />

          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Role"
              sx={{
                backgroundColor: 'white'
              }}
            >
              {ROLE_OPTIONS.map((roleOption) => (
                <MenuItem key={roleOption} value={roleOption}>
                  {roleOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit" disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={!username.trim() || loading}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMemberDialog;
