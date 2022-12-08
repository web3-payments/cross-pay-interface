import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
} from "@mui/material";
import { config } from "../../config";
import axios from "axios";

export const AccountProfileDetails = ({user, updateUser, fetchUserData, triggerAlert}) => {
  const handleChange = (event) => {
    updateUser({...user,[event.target.name]: event.target.value});
  };

  const updateUserData = async (event) => {
    event.preventDefault();
    updateUser(user);
    await axios
      .put(`${config.contextRoot}/user/${user.signerAddress}`,user)
      .then(function (response) {
        if(response.status === 200){
          console.log("Done");
          fetchUserData();
          triggerAlert("success", "Success", "Account information updated", null)
        }
      }).catch(function (error) {
          console.error(error)
          triggerAlert("error", "Error", "Failed to update account information", error.message)
      });
  };

  return (
    <>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                onChange={handleChange}
                value={user?.companyName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}></Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="First name"
                name="firstName"
                onChange={handleChange}
                value={user?.firstName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Last name"
                name="lastName"
                onChange={handleChange}
                value={user?.lastName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                onChange={handleChange}
                value={user?.email || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                onChange={handleChange}
                type="number"
                value={user?.phone || ""}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button onClick={updateUserData} color="primary" variant="contained">
            Save details
          </Button>
        </Box>
      </Card>
    </>
  );
};
