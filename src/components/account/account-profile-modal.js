import FileUpload from 'react-material-file-upload';
import { Box, Grid, Card, CardContent, CardHeader, TextField, Divider, MenuItem, Select, FormControl, InputLabel} from '@mui/material';

const AccountProfileModal = ({file, setFile}) => {

    return (
        <Box component="main" sx={{ display: 'flex', flex: '1 1 auto' }}>
            <Grid container sx={{ flex: '1 1 auto' }}>
                <Card sx={{ boxShadow: 'none' }}>
                    <CardHeader
                        subheader="Provide your account image"
                        title="Account Image"
                    />
                    <Divider />
                    <CardContent>
                        <Grid item md={12} xs={12}>
                            <FileUpload value={file} onChange={setFile} maxSize="2000000"/>
                        </Grid>
                    </CardContent>
                    <Divider />
                </Card>
            </Grid>
        </Box>
    )

}

export default AccountProfileModal;