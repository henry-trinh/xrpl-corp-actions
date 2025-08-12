"use client"

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material"
import { CameraAlt, Payment, AccountBalance, Add, Announcement, CheckCircle } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { mockTimelineEvents } from "@/lib/mock-data"

const kpiData = [
  {
    title: "Announcements Posted",
    value: "2",
    icon: Announcement,
    color: "#1976d2",
  },
  {
    title: "Snapshots Taken",
    value: "1",
    icon: CameraAlt,
    color: "#2e7d32",
  },
  {
    title: "Payouts Completed",
    value: "2",
    icon: Payment,
    color: "#ed6c02",
  },
  {
    title: "Total Testnet XRP Distributed",
    value: "1,750",
    icon: AccountBalance,
    color: "#9c27b0",
  },
]

export function DashboardContent() {
  const router = useRouter()

  const { data: timeline = [] } = useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      // TODO: Replace with API call
      return mockTimelineEvents
    },
  })

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {kpi.value}
                    </Typography>
                  </Box>
                  <kpi.icon sx={{ fontSize: 40, color: kpi.color }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {timeline.slice(0, 10).map((event) => (
                  <ListItem key={event.id}>
                    <ListItemIcon>
                      {event.type === "announcement" && <Announcement color="primary" />}
                      {event.type === "snapshot" && <CameraAlt color="success" />}
                      {event.type === "payout" && <Payment color="warning" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.description}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Chip label={`${event.company} • ${event.token}`} size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: "div" }}   // ← make the wrapper a <div>, not <p>
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button variant="contained" startIcon={<Add />} fullWidth onClick={() => router.push("/actions/new")}>
                  Create Dividend
                </Button>
                <Button variant="outlined" startIcon={<Add />} fullWidth onClick={() => router.push("/actions/new")}>
                  Create Stock Split
                </Button>
                <Button variant="text" startIcon={<CheckCircle />} fullWidth onClick={() => router.push("/actions")}>
                  View All Actions
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
