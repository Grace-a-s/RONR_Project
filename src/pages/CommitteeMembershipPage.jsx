import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoadingPage from './LoadingPage.jsx';
import { useAuth0 } from '@auth0/auth0-react';
import { useMembershipsApi } from '../utils/membershipsApi';
import { useUsersApi } from '../utils/usersApi';
import { useCommitteesApi } from '../utils/committeesApi';
import ConfirmDialog from '../components/ConfirmDialog';
import AddMemberDialog from '../components/AddMemberDialog';

function CommitteeMembershipPage() {
    const { committeeId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth0();
    const { listMembers, addMember, removeMember, updateMemberRole } = useMembershipsApi(committeeId);
    const { getUserByUsername } = useUsersApi();
    const { getCommittee, updateVotingThreshold, updateAnonymousVoting } = useCommitteesApi();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [hasChair, setHasChair] = useState(true);
    const [isChair, setIsChair] = useState(false);
    const [votingThreshold, setVotingThreshold] = useState('MAJORITY');
    const [anonymousVoting, setAnonymousVoting] = useState(false);
    const [thresholdMenuAnchor, setThresholdMenuAnchor] = useState(null);

    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: 'Confirm', message: '', onConfirm: null });
    const [addMemberDialog, setAddMemberDialog] = useState({ open: false });

    const mapMembers = useCallback((members = []) => (
        members.map((membership) => {
            const userInfo = (membership && typeof membership.userId === 'object') ? membership.userId : { _id: membership?.userId };
            const userId = userInfo?._id || membership?.userId;
            return {
                id: membership?._id || `${membership?.committeeId}-${userId}`,
                membershipId: membership?._id || null,
                userId,
                name: userInfo.username,
                email: userInfo?.email || '—',
                role: membership?.role || 'MEMBER',
            };
        })
    ), []);

    const refreshMembers = useCallback(async () => {
        if (!committeeId) {
            setRows([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await listMembers();
            const normalized = mapMembers(Array.isArray(data) ? data : []);
            setRows(normalized);
            const currentUserId = user?.sub;
            setIsOwner(normalized.some((member) => member.userId === currentUserId && member.role === 'OWNER'));
            setHasChair(normalized.some((member) => member.role === 'CHAIR'));
            setIsChair(normalized.some((member) => member.userId === currentUserId && member.role === 'CHAIR'));
        } catch (err) {
            console.error(err.message || 'Failed to load committee members');
        } finally {
            setLoading(false);
        }
    }, [committeeId, listMembers, mapMembers, user?.sub]);

    useEffect(() => {
        refreshMembers();
    }, [refreshMembers]);

    useEffect(() => {
        const fetchCommittee = async () => {
            if (!committeeId) return;
            try {
                const committeeData = await getCommittee(committeeId);
                setVotingThreshold(committeeData?.votingThreshold || 'MAJORITY');
                setAnonymousVoting(committeeData?.anonymousVoting || false);
            } catch (err) {
                console.error('Failed to load committee:', err);
            }
        };

        fetchCommittee();
    }, [committeeId, getCommittee]);

    useEffect(() => {
        const fetchCommittee = async () => {
            if (!committeeId) return;
            try {
                const committeeData = await getCommittee(committeeId);
                setVotingThreshold(committeeData?.votingThreshold || 'MAJORITY');
                setAnonymousVoting(committeeData?.anonymousVoting || false);
            } catch (err) {
                console.error('Failed to load committee:', err);
            }
        };

        fetchCommittee();
    }, [committeeId, getCommittee]);

    const handleRoleChange = useCallback(async (userId, newRole, oldRole) => {
        if (newRole === oldRole) return;
        try {
            await updateMemberRole({ userId, role: newRole });
            await refreshMembers();
        } catch (err) {
            console.err("Failed to update role", err.message);
        }
    }, [refreshMembers, updateMemberRole]);

    const handleRemove = useCallback(async (row) => {
        setConfirmDialog({
            open: true,
            title: 'Remove Member',
            message: (
                <span>
                    Are you sure you want to remove <strong>{row.name}</strong> from this committee?
                </span>
            ),
            cancelLabel: 'Cancel',
            confirmLabel: 'Remove',
            isDangerous: true,
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                try {
                    await removeMember({ userId: row.userId });
                    await refreshMembers();
                } catch (err) {
                    console.error('Failed to remove member', err);
                }
            }
        });
    }, [refreshMembers, removeMember, confirmDialog]);

    const handleAddMember = useCallback(() => {
        setAddMemberDialog({ open: true });
    }, []);

    const handleAddMemberSubmit = useCallback(async (username, role) => {
        setAddMemberDialog({ open: false });
        
        let userRecord;
        try {
            userRecord = await getUserByUsername(username);
        } catch (err) {
            console.error("Failed to add member", err.message);
            return;
        }

        if (!userRecord || !userRecord._id) {
            console.error("Failed to add member", err.message);
            return;
        }

        try {
            await addMember({ userId: userRecord._id, role });
            await refreshMembers();
        } catch (err) {
            console.error("Failed to add member", err.message);
        }
    }, [addMember, getUserByUsername, refreshMembers]);

    const handleThresholdChange = useCallback(async (newThreshold) => {
        try {
            await updateVotingThreshold(committeeId, newThreshold);
            setVotingThreshold(newThreshold);
            setThresholdMenuAnchor(null);
        } catch (err) {
            console.error('Failed to update voting threshold:', err);
            window.alert('Failed to update voting threshold. You may need CHAIR role.');
        }
    }, [committeeId, updateVotingThreshold]);

    const handleAnonymousVotingChange = useCallback(async (newValue) => {
        try {
            await updateAnonymousVoting(committeeId, newValue);
            setAnonymousVoting(newValue);
            setThresholdMenuAnchor(null);
        } catch (err) {
            console.error('Failed to update anonymous voting:', err);
            window.alert('Failed to update anonymous voting setting. You may need CHAIR role.');
        }
    }, [committeeId, updateAnonymousVoting]);

    const ROLE_OPTIONS = ['OWNER', 'CHAIR', 'MEMBER'];

    const columns = useMemo(() => {
        const baseColumns = [
            { field: 'name', headerName: 'Username', flex: 1, minWidth: 150 },
            { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
            {
                field: 'role',
                headerName: 'Role',
                width: 140,
                editable: isOwner,
                type: 'singleSelect',
                valueOptions: ROLE_OPTIONS,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{params.value}</span>
                        {isOwner && <ArrowDropDownIcon fontSize="small" color="action" />}
                    </Box>
                ),
            },
        ];

        if (!isOwner) 
            return baseColumns;

        return [
            ...baseColumns,
            {
                field: 'actions',
                headerName: '',
                width: 80,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => (
                    <Box>
                        <IconButton size="small" onClick={() => handleRemove(params.row)} aria-label="remove member">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ),
            },
        ];
    }, [handleRemove, isOwner]);

    if (loading) {
        return <LoadingPage/>;
    }

    return (
        <Paper sx={{ m: 5, p: 3 }}>
            {!hasChair && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    WARNING: This committee currently doesn't have a presiding chair
                </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        aria-label="back to committee"
                        onClick={() => {
                                if (committeeId) navigate(`/committee/${encodeURIComponent(committeeId)}`);
                                else navigate(-1);
                                }}
                        size="small"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">Membership</Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isChair && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<HowToVoteIcon />}
                                onClick={(e) => setThresholdMenuAnchor(e.currentTarget)}
                            >
                                Voting Settings
                            </Button>
                            <Menu
                                anchorEl={thresholdMenuAnchor}
                                open={Boolean(thresholdMenuAnchor)}
                                onClose={() => setThresholdMenuAnchor(null)}
                            >
                                <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                                    VOTING THRESHOLD
                                </Typography>
                                <MenuItem
                                    onClick={() => handleThresholdChange('MAJORITY')}
                                    selected={votingThreshold === 'MAJORITY'}
                                >
                                    Majority (50% + 1)
                                </MenuItem>
                                <MenuItem
                                    onClick={() => handleThresholdChange('SUPERMAJORITY')}
                                    selected={votingThreshold === 'SUPERMAJORITY'}
                                >
                                    Supermajority (2/3)
                                </MenuItem>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                                    VOTE VISIBILITY
                                </Typography>
                                <MenuItem
                                    onClick={() => handleAnonymousVotingChange(false)}
                                    selected={!anonymousVoting}
                                >
                                    Public Votes
                                </MenuItem>
                                <MenuItem
                                    onClick={() => handleAnonymousVotingChange(true)}
                                    selected={anonymousVoting}
                                >
                                    Anonymous Votes
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                    {isOwner && (
                        <Button variant="contained" startIcon={<PersonAddAltIcon />} onClick={handleAddMember}>
                            Add Member
                        </Button>
                    )}
                </Box>

            </Box>

            <div style={{ width: '100%' }}>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        sx={{ border: 0 }}
                        loading={loading}
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10]}
                        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                        processRowUpdate={async (newRow, oldRow) => {
                            if (newRow.role !== oldRow.role) {
                                await handleRoleChange(newRow.userId, newRow.role, oldRow.role);
                            }
                            return newRow;
                        }}
                        onProcessRowUpdateError={(error) => {
                            console.error('Failed to update role:', error);
                        }}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                onConfirm={confirmDialog.onConfirm || (() => {})}
                title={confirmDialog.title}
                message={confirmDialog.message}
                cancelLabel={confirmDialog.cancelLabel}
                confirmLabel={confirmDialog.confirmLabel}
                isDangerous={confirmDialog.isDangerous}
            />

            <AddMemberDialog
                open={addMemberDialog.open}
                onClose={() => setAddMemberDialog({ open: false })}
                onSubmit={handleAddMemberSubmit}
                getUserByUsername={getUserByUsername}
            />
        </Paper>
    );
}

export default CommitteeMembershipPage;