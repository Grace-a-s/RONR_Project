import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';


function UserProfilePage() {
    const user = {name: 'Comfy', email: 'email'};
    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3 }} elevation={1}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }}>{user.name ? user.name[0].toUpperCase() : 'U'}</Avatar>
                        <Button variant="contained" sx={{ display: 'block', mx: 'auto' }}>Change Profile Photo</Button>
                    </Grid>
                    <Divider orientation="vertical" flexItem />
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6">My Profile</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">Display Name</Typography>
                                <Typography variant="body2">{user.name}</Typography>
                            </Box>
                            <IconButton size="small" aria-label="edit-display-name">
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">Email</Typography>
                                <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            <IconButton size="small" aria-label="edit-email">
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Button variant="contained">Change Password</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default UserProfilePage;