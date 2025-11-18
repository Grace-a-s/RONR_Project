import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import theme from '../theme';

function CreateCommitteeDialog({ open, onClose, name, setName, description, setDescription, onSubmit }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: 'background.default', borderRadius: 2, overflowX: 'hidden' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>New Committee</Typography>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ px: 3, pt: 0, overflowX: 'hidden' }}>
        <Box component="form" id="create-committee-form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography component="label" htmlFor="committee_name" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>
              Name
            </Typography>
            <TextField
              fullWidth
              id="committee_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance Committee"
              variant="outlined"
              size="small"
              autoFocus
              sx={{
                backgroundColor: 'white'
              }}
            />
          </Box>

          <Box sx={{ mb: 1, width: '100%', boxSizing: 'border-box' }}>
            <Typography component="label" htmlFor="committee_description" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>
              Short Description
            </Typography>
            <TextField
              fullWidth
              id="committee_description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief summary of the committee's purpose (optional)"
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: 'white'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This description appears on the committee card.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button type="submit" form="create-committee-form" variant="contained" color="secondary">Create</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateCommitteeDialog;
