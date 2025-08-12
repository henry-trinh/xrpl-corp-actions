"use client"

import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material"
import { Visibility, OpenInNew, Refresh } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { mockPayouts } from "@/lib/mock-data"
import type { PayoutStatus } from "@/types"

const statusColors = {
  pending: "warning",
  sent: "success",
  failed: "error",
} as const

export function PayoutsContent() {
  const [selectedActionPayouts, setSelectedActionPayouts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["payouts"],
    queryFn: async () => {
      // TODO: Replace with API call
      return mockPayouts
    },
  })

  // Group payouts by action
  const payoutsByAction = payouts.reduce((acc: any, payout: any) => {
    if (!acc[payout.actionId]) {
      acc[payout.actionId] = []
    }
    acc[payout.actionId].push(payout)
    return acc
  }, {})

  const actionSummaries = Object.entries(payoutsByAction).map(([actionId, actionPayouts]: [string, any]) => {
    const total = actionPayouts.length
    const sent = actionPayouts.filter((p: any) => p.status === "sent").length
    const failed = actionPayouts.filter((p: any) => p.status === "failed").length
    const pending = actionPayouts.filter((p: any) => p.status === "pending").length
    const totalAmount = actionPayouts.reduce((sum: number, p: any) => sum + p.amountXrp, 0)

    return {
      actionId,
      total,
      sent,
      failed,
      pending,
      totalAmount,
      payouts: actionPayouts,
    }
  })

  const handleViewDetails = (payouts: any[]) => {
    setSelectedActionPayouts(payouts)
    setDialogOpen(true)
  }

  const handleRetryPayout = async (payoutId: string) => {
    // TODO: Implement retry logic
    console.log("Retrying payout:", payoutId)
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Payouts
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action ID</TableCell>
                <TableCell>Total Payouts</TableCell>
                <TableCell>Sent</TableCell>
                <TableCell>Failed</TableCell>
                <TableCell>Pending</TableCell>
                <TableCell>Total Amount (XRP)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actionSummaries.map((summary) => (
                <TableRow key={summary.actionId} hover>
                  <TableCell>{summary.actionId}</TableCell>
                  <TableCell>{summary.total}</TableCell>
                  <TableCell>
                    <Chip label={summary.sent} size="small" color="success" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={summary.failed} size="small" color="error" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={summary.pending} size="small" color="warning" variant="outlined" />
                  </TableCell>
                  <TableCell>{summary.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewDetails(summary.payouts)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Payout Details</DialogTitle>
        <DialogContent>
          <List>
            {selectedActionPayouts.map((payout) => (
              <ListItem key={payout.id}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" fontFamily="monospace">
                        {payout.address}
                      </Typography>
                      <Chip label={payout.status} size="small" color={statusColors[payout.status as PayoutStatus]} />
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
                      {payout.status === "failed" && (
                        <IconButton size="small" onClick={() => handleRetryPayout(payout.id)}>
                          <Refresh fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  }
                  secondary={`Amount: ${payout.amountXrp} XRP • ${new Date(payout.createdAt).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
