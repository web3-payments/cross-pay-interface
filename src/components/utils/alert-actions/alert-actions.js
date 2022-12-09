import * as React from 'react';
import { Alert, AlertTitle, Collapse, Stack, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AlertAction = ({ severity, title, message, strongMessage, open, setOpen }) => {
    return (
        <Stack sx={{ width: '100%' }} spacing={2}>
            <Collapse in={open}>
                <Alert severity={severity} action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setOpen(false);
                        }}>
                        <CloseIcon fontSize="inherit" />
                    </IconButton>}
                    sx={{ mb: 2 }}>
                    <AlertTitle>{title}</AlertTitle>
                    {message} {strongMessage && <>- <strong>{strongMessage}</strong></>}
                </Alert>
            </Collapse>
        </Stack>
    )
};
export default AlertAction;