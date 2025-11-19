import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function CreateMotionDialog({ 
  open, 
  onClose, 
  motionTitle, 
  setMotionTitle, 
  motionDescription, 
  setMotionDescription, 
  onSubmit 
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: 'background.default', borderRadius: 2, overflowX: 'hidden' } }}
    >
      <DialogTitle sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Create Motion</Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0, overflowX: 'hidden' }}>
        <Box component="form" id="create-motion-form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography component="label" htmlFor="motion_title" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>
              Title
            </Typography>
            <TextField
              fullWidth
              id="motion_title"
              value={motionTitle}
              onChange={(e) => setMotionTitle(e.target.value)}
              placeholder="Short, descriptive title"
              variant="outlined"
              size="small"
              autoFocus
              sx={{
                backgroundColor: 'white'
              }}
            />
          </Box>

          <Box sx={{ mb: 1, width: '100%', boxSizing: 'border-box' }}>
            <Typography component="label" htmlFor="motion_description" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              id="motion_description"
              multiline
              rows={4}
              value={motionDescription}
              onChange={(e) => setMotionDescription(e.target.value)}
              placeholder='Explain the motion in a few sentences (e.g., "I move that...")'
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: 'white'
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button type="submit" form="create-motion-form" variant="contained" color="secondary">Create</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateMotionDialog;