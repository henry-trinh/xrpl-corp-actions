"use client"

import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material"
import { useTheme } from "@/components/providers/theme-provider"
import { useState } from "react"
import { useSnackbar } from "notistack"

const mockUsers = [
  {
    id: "1",
    email: "issuer@democo.com",
    role: "issuer",
    lastActive: "2024-01-10T10:00:00.000Z",
  },
  {
    id: "2",
    email: "viewer@democo.com",
    role: "viewer",
    lastActive: "2024-01-09T15:30:00.000Z",
  },
]

export function SettingsContent() {
  const { darkMode, toggleTheme } = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [orgProfile, setOrgProfile] = useState({
    companyName: "DemoCo",
    issuerAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  })

  const handleSaveProfile = () => {
    // TODO: Save to Firebase
    enqueueSnackbar("Profile updated successfully", { variant: "success" })
  }

  const handleResetData = () => {
    // TODO: Reset demo data
    setResetDialogOpen(false)
    enqueueSnackbar("Demo data reset successfully", { variant: "success" })
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization Profile
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  label="Company Name"
                  value={orgProfile.companyName}
                  onChange={(e) => setOrgProfile({ ...orgProfile, companyName: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Issuer XRPL Address"
                  value={orgProfile.issuerAddress}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Read-only for security"
                />
                <Button variant="contained" onClick={handleSaveProfile} sx={{ mt: 2 }}>
                  Save Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={toggleTheme} />}
                label="Dark Mode"
                sx={{ mt: 1 }}
              />
              <Box sx={{ mt: 3 }}>
                <Button variant="outlined" color="error" onClick={() => setResetDialogOpen(true)}>
                  Reset Demo Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role Management
              </Typography>
              <List>
                {mockUsers.map((user) => (
                  <ListItem key={user.id}>
                    <ListItemText
                      primary={user.email}
                      secondary={`Last active: ${new Date(user.lastActive).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={user.role} size="small" color={user.role === "issuer" ? "primary" : "default"} />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Demo Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reset all demo data including corporate actions, snapshots, and payouts. This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetData} color="error" variant="contained">
            Reset Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
