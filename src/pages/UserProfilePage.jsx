import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LoadingPage from './LoadingPage.jsx';
import { useUsersApi } from '../utils/usersApi';

const EMPTY_FORM = { username: '', firstName: '', lastName: '', pronouns: '', about: '' };

const normalizeFormValues = (values = {}) => ({
    username: values.username || '',
    firstName: values.firstName || '',
    lastName: values.lastName || '',
    pronouns: values.pronouns || '',
    about: values.about || '',
});

function UserProfilePage() {
    const { user: auth0User } = useAuth0();
    const navigate = useNavigate();
    const { getCurrentUser, upsertCurrentUser } = useUsersApi();

    const [formValues, setFormValues] = useState(EMPTY_FORM);
    const [initialValues, setInitialValues] = useState(EMPTY_FORM);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const displayName = useMemo(() => {
        const composed = `${formValues.firstName} ${formValues.lastName}`.trim();
        return composed || formValues.username || auth0User?.name || auth0User?.nickname || email || 'User';
    }, [auth0User?.name, auth0User?.nickname, email, formValues.firstName, formValues.lastName, formValues.username]);

    const avatarLetter = (displayName || 'U').charAt(0).toUpperCase();

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCurrentUser();
            const normalized = normalizeFormValues(data);
            setFormValues(normalized);
            setInitialValues(normalized);
            setEmail(data?.email || '');
        } catch (err) {
            setError(err.message || 'Failed to load profile information');
        } finally {
            setLoading(false);
        }
    }, [auth0User?.email, auth0User?.family_name, auth0User?.given_name, getCurrentUser]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleFieldChange = useCallback((field) => (event) => {
        const { value } = event.target;
        setFormValues((prev) => ({ ...prev, [field]: value }));
        setSuccessMessage('');
        setError(null);
    }, []);

    const isDirty = useMemo(() => (
        Object.keys(formValues).some((key) => (formValues[key] || '') !== (initialValues[key] || ''))
    ), [formValues, initialValues]);

    const handleReset = useCallback(() => {
        setFormValues(initialValues);
        setSuccessMessage('');
        setError(null);
    }, [initialValues]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage('');
        try {
            const payload = Object.fromEntries(
                Object.entries(formValues).map(([key, value]) => [key, (value || '').trim() || null])
            );
            const updated = await upsertCurrentUser(payload);
            const normalized = normalizeFormValues(updated);
            setFormValues(normalized);
            setInitialValues(normalized);
            setEmail(updated?.email || email || '');
            setSuccessMessage('Profile updated successfully');
        } catch (err) {
            const message = err?.payload?.error || err?.message || 'Failed to update profile';
            setError(message);
        } finally {
            setSaving(false);
        }
    }, [email, formValues, upsertCurrentUser]);

    if (loading) {
        return <LoadingPage message="Getting your profile…" />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, position: 'relative' }} elevation={1}>
                <IconButton
                    aria-label="exit user profile"
                    onClick={() => navigate(-1)}
                    size="small"
                    sx={{ position: 'absolute', top: 12, left: 12 }}
                >
                    <ArrowBackIcon />
                </IconButton>
                
                    <>
                        {error && (
                            <Alert
                                severity="error"
                                icon={<ErrorOutlineIcon fontSize="small" />}
                                sx={{ mb: 2 }}
                                onClose={() => setError(null)}
                            >
                                {error}
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert
                                severity="success"
                                icon={<CheckCircleIcon fontSize="small" />}
                                sx={{ mb: 2 }}
                                onClose={() => setSuccessMessage('')}
                            >
                                {successMessage}
                            </Alert>
                        )}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }}>
                                    {avatarLetter}
                                </Avatar>
                                <Typography variant="body2" color="text.secondary">
                                    {email || 'Email not available'}
                                </Typography>
                                {formValues.pronouns && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Pronouns: {formValues.pronouns}
                                    </Typography>
                                )}
                            </Grid>
                            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>My Profile</Typography>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Username"
                                        value={formValues.username}
                                        onChange={handleFieldChange('username')}
                                        placeholder="e.g. parliamentarian"
                                        helperText="Pick a unique username other members can search for."
                                        fullWidth
                                    />
                                    <TextField
                                        label="First Name"
                                        value={formValues.firstName}
                                        onChange={handleFieldChange('firstName')}
                                        placeholder="First name"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Last Name"
                                        value={formValues.lastName}
                                        onChange={handleFieldChange('lastName')}
                                        placeholder="Last name"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Pronouns"
                                        value={formValues.pronouns}
                                        onChange={handleFieldChange('pronouns')}
                                        placeholder="e.g. she/her"
                                        helperText="Optional"
                                        fullWidth
                                    />
                                    <TextField
                                        label="About Me"
                                        value={formValues.about}
                                        onChange={handleFieldChange('about')}
                                        placeholder="Tell others a bit about yourself"
                                        multiline
                                        minRows={4}
                                        inputProps={{ maxLength: 2000 }}
                                        helperText={`${(formValues.about || '').length}/2000 characters`}
                                        fullWidth
                                    />
                                </Stack>
                                <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} sx={{ mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<RestartAltIcon />}
                                        disabled={!isDirty || saving}
                                        onClick={handleReset}
                                    >
                                        Discard Changes
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                        disabled={!isDirty || saving}
                                        onClick={handleSave}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </>
                
            </Paper>
        </Box>
    );
}

export default UserProfilePage;