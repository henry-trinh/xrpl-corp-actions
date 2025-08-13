"use client";

import {
  Grid, Card, CardContent, Typography, Box, Button, Stack, List,
  ListItem, ListItemText, ListItemIcon, Chip,
} from "@mui/material";
import { CameraAlt, Payment, AccountBalance, Add, Announcement, CheckCircle } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function DashboardContent() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const r = await fetch("/api/dashboard");
      if (!r.ok) throw new Error("Failed to load dashboard");
      return r.json();
    },
  });

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError)   return <Typography color="error">Failed to load dashboard</Typography>;

  const { kpis, timeline } = data as {
    kpis: {
      announcementsPosted: number;
      snapshotsTaken: number;
      payoutsCompleted: number;
      totalXrpDistributed: number;
    };
    timeline: Array<{
      id: string;
      type: "announcement" | "snapshot" | "payout";
      company?: string;
      token?: string;
      description: string;
      timestamp: string;
    }>;
  };

  const kpiCards = [
    { title: "Announcements Posted", value: String(kpis.announcementsPosted), icon: Announcement, color: "#1976d2" },
    { title: "Snapshots Taken",      value: String(kpis.snapshotsTaken),      icon: CameraAlt,   color: "#2e7d32" },
    { title: "Payouts Completed",    value: String(kpis.payoutsCompleted),    icon: Payment,     color: "#ed6c02" },
    { title: "Total Testnet XRP Distributed", value: kpis.totalXrpDistributed.toLocaleString(), icon: AccountBalance, color: "#9c27b0" },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
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
                      {event.type === "snapshot"     && <CameraAlt   color="success" />}
                      {event.type === "payout"       && <Payment     color="warning" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.description}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          {(event.company || event.token) && (
                            <Chip label={`${event.company ?? ""}${event.company && event.token ? " • " : ""}${event.token ?? ""}`} size="small" variant="outlined" />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  </ListItem>
                ))}
                {timeline.length === 0 && (
                  <Typography color="text.secondary" sx={{ px: 2, py: 1 }}>
                    No activity yet — create an action to get started.
                  </Typography>
                )}
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
  );
}
