import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Divider from '@mui/material/Divider';

function UserRolesPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, position: 'relative' }} elevation={1}>
                <IconButton
                    aria-label="go back"
                    onClick={() => navigate(-1)}
                    size="small"
                    sx={{ position: 'absolute', top: 12, left: 12 }}
                >
                    <ArrowBackIcon />
                </IconButton>

                <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                    User Roles
                </Typography>

                <Typography variant="body1" sx={{ mb: 4 }}>
                    In this system, each committee member is assigned one of three roles that determine their
                    permissions and responsibilities. Understanding these roles will help you navigate the
                    committee's governance structure and know what actions you can take.
                </Typography>

                {/* OWNER Role */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Owner
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        The Owner has complete administrative control over the committee. This role is
                        typically assigned to the person who created the committee and is responsible for
                        its overall management and configuration.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Permissions:
                    </Typography>
                    <Box component="ul" sx={{ mt: 0, pl: 3 }}>
                        <Typography component="li" variant="body2">Create and delete the committee</Typography>
                        <Typography component="li" variant="body2">Add and remove members</Typography>
                        <Typography component="li" variant="body2">Change member roles (assign/remove CHAIR status)</Typography>
                        <Typography component="li" variant="body2">Configure all voting settings (threshold, anonymous voting)</Typography>
                        <Typography component="li" variant="body2">All CHAIR permissions</Typography>
                        <Typography component="li" variant="body2">All MEMBER permissions</Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* CHAIR Role */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Chair
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        The Chair (or presiding officer) manages the governance and procedural aspects of
                        the committee. This role ensures proper parliamentary procedure and controls the
                        flow of business during meetings.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Permissions:
                    </Typography>
                    <Box component="ul" sx={{ mt: 0, pl: 3 }}>
                        <Typography component="li" variant="body2">Approve or veto motions</Typography>
                        <Typography component="li" variant="body2">Open voting on motions</Typography>
                        <Typography component="li" variant="body2">Manage voting threshold settings (majority vs. supermajority)</Typography>
                        <Typography component="li" variant="body2">Control anonymous voting settings</Typography>
                        <Typography component="li" variant="body2">Manage and moderate debates</Typography>
                        <Typography component="li" variant="body2">All MEMBER permissions</Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* MEMBER Role */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Member
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Members are the standard participants in the committee who can fully participate in
                        the deliberative process. This is the default role for most committee participants.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Permissions:
                    </Typography>
                    <Box component="ul" sx={{ mt: 0, pl: 3 }}>
                        <Typography component="li" variant="body2">Propose new motions</Typography>
                        <Typography component="li" variant="body2">Second motions proposed by others</Typography>
                        <Typography component="li" variant="body2">Participate in debates and discussions</Typography>
                        <Typography component="li" variant="body2">Cast votes on open motions</Typography>
                        <Typography component="li" variant="body2">Challenge vetoes</Typography>
                        <Typography component="li" variant="body2">View committee information and motion history</Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default UserRolesPage;
