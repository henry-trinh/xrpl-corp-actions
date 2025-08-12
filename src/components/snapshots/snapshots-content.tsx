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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import { Visibility, Download } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { mockSnapshots } from "@/lib/mock-data"

export function SnapshotsContent() {
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null)

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["snapshots"],
    queryFn: async () => {
      // TODO: Replace with API call
      return mockSnapshots
    },
  })

  const handleExportCSV = (snapshot: any) => {
    const csvContent = [
      ["Address", "Balance", "Entitlement XRP"].join(","),
      ...snapshot.holders.map((h: any) => [h.address, h.balance, h.entitlementXrp || 0].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `snapshot-${snapshot.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Snapshots
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Snapshot ID</TableCell>
                <TableCell>Action ID</TableCell>
                <TableCell>When</TableCell>
                <TableCell>Holders Count</TableCell>
                <TableCell>Total Shares</TableCell>
                <TableCell>Entitled XRP</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {snapshots.map((snapshot: any) => (
                <TableRow key={snapshot.id} hover>
                  <TableCell>{snapshot.id}</TableCell>
                  <TableCell>{snapshot.actionId}</TableCell>
                  <TableCell>{new Date(snapshot.takenAt).toLocaleString()}</TableCell>
                  <TableCell>{snapshot.totalHolders}</TableCell>
                  <TableCell>{snapshot.totalShares.toLocaleString()}</TableCell>
                  <TableCell>{snapshot.totalEntitlementXrp?.toLocaleString() || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => setSelectedSnapshot(snapshot)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={!!selectedSnapshot} onClose={() => setSelectedSnapshot(null)} maxWidth="md" fullWidth>
        <DialogTitle>Snapshot Details - {selectedSnapshot?.id}</DialogTitle>
        <DialogContent>
          {selectedSnapshot && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Holders ({selectedSnapshot.totalHolders})
              </Typography>
              <List>
                {selectedSnapshot.holders.map((holder: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={holder.address}
                      secondary={`Balance: ${holder.balance} shares • Entitlement: ${holder.entitlementXrp || 0} XRP`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => selectedSnapshot && handleExportCSV(selectedSnapshot)} startIcon={<Download />}>
            Export CSV
          </Button>
          <Button onClick={() => setSelectedSnapshot(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
