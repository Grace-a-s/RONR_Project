import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function CreateCommitteeDialog({ open, onClose, name, setName, description, setDescription, onSubmit }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 600, maxWidth: '90%', backgroundColor: '#C7F9CC', border: '1px solid black' } }}
    >
      <DialogTitle sx={{ backgroundColor: '#D9D9D9', textAlign: 'center', padding: '16px' }}>
        <Typography variant="h5" component="div">Create Committee</Typography>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: '#C7F9CC', padding: '16px' }}>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography component="label" htmlFor="committee_name" sx={{ mb: 1 }}>
              Name
            </Typography>
            <TextField
              fullWidth
              id="committee_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography component="label" htmlFor="committee_description" sx={{ mb: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              id="committee_description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: '#C7CC9C', padding: '8px 16px', justifyContent: 'flex-end' }}>
        <Button onClick={(e) => { e.preventDefault(); onSubmit(e); }} sx={{ backgroundColor: '#57CC99', borderRadius: '10px', width: 70, height: 30, color: 'black' }}>Submit</Button>
        <Button onClick={onClose} sx={{ backgroundColor: '#57CC99', borderRadius: '10px', width: 70, height: 30, color: 'black' }}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateCommitteeDialog;
