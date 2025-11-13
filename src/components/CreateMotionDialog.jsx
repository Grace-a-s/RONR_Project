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
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: '90%',
            backgroundColor: '#C7F9CC',
            border: '1px solid black',
          }}}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#D9D9D9',
          textAlign: 'center',
          padding: '16px',
        }}
      >
        <Typography variant="h5" component="div">
          Create Motion
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: '#C7F9CC', padding: '16px' }}>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography component="label" htmlFor="motion_title" sx={{ mb: 1 }}>
              Title
            </Typography>
            <TextField
              fullWidth
              id="motion_title"
              value={motionTitle}
              onChange={(e) => setMotionTitle(e.target.value)}
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography component="label" htmlFor="motion_description" sx={{ mb: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              id="motion_description"
              multiline
              rows={4}
              value={motionDescription}
              onChange={(e) => setMotionDescription(e.target.value)}
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: '#C7F9CC',
          padding: '8px 16px',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          onClick={onSubmit}
          sx={{
            backgroundColor: '#57CC99',
            borderRadius: '10px',
            width: 70,
            height: 30,
            color: 'black',
            '&:hover': {
              backgroundColor: '#4ab885',
            },
          }}
        >
          Submit
        </Button>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#57CC99',
            borderRadius: '10px',
            width: 70,
            height: 30,
            color: 'black',
            '&:hover': {
              backgroundColor: '#4ab885',
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateMotionDialog;