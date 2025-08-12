import { Box, Container, Typography, Button, Card, CardContent, Grid, Stack } from "@mui/material"
import { Announcement, CameraAlt, Payment } from "@mui/icons-material"
import Link from "next/link"

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "white",
              mb: 2,
            }}
          >
            XRPL Corporate Actions Tracker
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mb: 4,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Manage tokenized corporate actions on XRPL testnet with automated snapshots and XRP payouts
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              component={Link}
              href="/login"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Try Demo
            </Button>
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              View Dashboard
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                bgcolor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Announcement
                  sx={{
                    fontSize: 48,
                    color: "primary.main",
                    mb: 2,
                  }}
                />
                <Typography variant="h5" component="h3" gutterBottom>
                  Announce
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create and announce corporate actions like dividends and stock splits with XRPL memo fields
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                bgcolor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <CameraAlt
                  sx={{
                    fontSize: 48,
                    color: "primary.main",
                    mb: 2,
                  }}
                />
                <Typography variant="h5" component="h3" gutterBottom>
                  Snapshot
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Take automated snapshots of token holders at record dates to determine entitlements
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                bgcolor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Payment
                  sx={{
                    fontSize: 48,
                    color: "primary.main",
                    mb: 2,
                  }}
                />
                <Typography variant="h5" component="h3" gutterBottom>
                  Payout
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Execute automated XRP payouts to eligible token holders on XRPL testnet
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
