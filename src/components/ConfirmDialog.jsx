import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm', message = '', cancelLabel = 'Cancel', confirmLabel = 'Confirm', isDangerous = false }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: 'background.default', borderRadius: 2, overflowX: 'hidden' } }}
    >
      <DialogTitle sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
      </DialogTitle>

      {message && (
        <DialogContent sx={{ px: 3, pt: 0, overflowX: 'hidden' }}>
          <Typography variant="body2" sx={{ mt: 1 }}>{message}</Typography>
        </DialogContent>
      )}

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2, pt: message ? 0 : 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={isDangerous ? 'error' : 'secondary'}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
