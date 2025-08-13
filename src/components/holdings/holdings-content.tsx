"use client"

import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
} from "@mui/material"
import { Search, OpenInNew } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export function HoldingsContent() {
  const [address, setAddress] = useState("rJ27Xoga8FuEL5oeGmMLcWaJwF7YcZh4WP") // testnet address; can be 

  const {
    data: holdings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["holdings", address],
    queryFn: async () => {
      if (!address) return null
      // TODO: Replace with API call
      const response = await fetch(`/api/holdings?address=${address}`)
      return response.json()
    },
    enabled: !!address,
  })

  const handleLoadHoldings = () => {
    refetch()
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Holdings (Investor View)
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Wallet Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              placeholder="Enter XRPL address"
              variant="outlined"
            />
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleLoadHoldings}
              disabled={!address || isLoading}
            >
              Load Holdings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {holdings && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Token Balances
                  </Typography>
                  {holdings.tokens.map((token: any) => (
                    <Box key={token.symbol} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                      <Typography variant="body1" fontFamily="monospace">
                        {token.symbol}
                      </Typography>
                      <Typography variant="h6">{token.balance.toLocaleString()}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Actions
                  </Typography>
                  {holdings.upcomingActions.length === 0 ? (
                    <Typography color="text.secondary">No upcoming actions</Typography>
                  ) : (
                    holdings.upcomingActions.map((action: any) => (
                      <Box key={action.id} py={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={action.type} size="small" variant="outlined" />
                          <Typography variant="body2">
                            {action.company} • {action.token}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Record: {new Date(action.recordAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payout History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Action ID</TableCell>
                      <TableCell>Amount (XRP)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Transaction</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holdings.payoutHistory.map((payout: any) => (
                      <TableRow key={payout.id}>
                        <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{payout.actionId}</TableCell>
                        <TableCell>{payout.amountXrp.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={payout.status}
                            size="small"
                            color={payout.status === "sent" ? "success" : "error"}
                          />
                        </TableCell>
                        <TableCell>
                          {payout.txHash && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                window.open(`https://testnet.xrpl.org/transactions/${payout.txHash}`, "_blank")
                              }
                            >
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}
