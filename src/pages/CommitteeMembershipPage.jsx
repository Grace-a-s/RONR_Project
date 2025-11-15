import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function CommitteeMembershipPage() {
    const initialMembers = [
        { id: 1, name: 'Comfy', email: 'comfyemail@email.com', role: 'admin' },
        { id: 2, name: 'Chinwe', email: 'omg@email.com', role: 'chair' },
        { id: 3, name: 'Ellen', email: 'helen@email.com', role: 'member' },
    ];

    const [rows, setRows] = useState(initialMembers);

    const handleEdit = (id) => {
        const member = rows.find((r) => r.id === id);
        // placeholder - open edit dialog or inline edit in future
        // keep simple for now
        // eslint-disable-next-line no-alert
        alert(`Edit member: ${member?.name || id}`);
    };

    const handleRemove = (id) => {
        // eslint-disable-next-line no-restricted-globals
        if (window.confirm('Remove this member?')) {
            setRows((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        { field: 'role', headerName: 'Role', width: 120 },
        {
            field: 'actions',
            headerName: '',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEdit(params.row.id)} aria-label="edit">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemove(params.row.id)} aria-label="delete">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Paper sx={{ m: 5, p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Membership</Typography>
            <div style={{ width: '100%' }}>
                <div style={{ height: 360, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        sx={{ border: 0 }}
                        disableSelectionOnClick
                        pageSizeOptions={[5, 10]}
                    />
                </div>
            </div>
        </Paper>
    );
}

export default CommitteeMembershipPage;