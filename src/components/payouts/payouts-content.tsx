"use client";

import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, List, ListItem, ListItemText, Stack,
} from "@mui/material";
import { Visibility, OpenInNew, Refresh } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type PayoutStatus = "pending" | "sent" | "failed";

type PayoutRow = {
  id: string;
  actionId: string;
  address: string;
  amountXrp: number;
  status: PayoutStatus;
  txHash?: string;
  createdAt: string;
};

const statusColors = {
  pending: "warning",
  sent: "success",
  failed: "error",
} as const;

export function PayoutsContent() {
  const qc = useQueryClient();
  const [selectedActionPayouts, setSelectedActionPayouts] = useState<PayoutRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: payouts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<PayoutRow[]>({
    queryKey: ["payouts"],
    queryFn: async () => {
      const r = await fetch("/api/payouts");
      if (!r.ok) throw new Error("Failed to load payouts");
      return r.json();
    },
    // optional: auto-refresh every 15s if you're demoing live payouts
    // refetchInterval: 15000,
  });

  const payoutsByAction = useMemo(() => {
    const map: Record<string, PayoutRow[]> = {};
    for (const p of payouts) {
      (map[p.actionId] ||= []).push(p);
    }
    return map;
  }, [payouts]);

  const actionSummaries = useMemo(() => {
    return Object.entries(payoutsByAction).map(([actionId, rows]) => {
      const total = rows.length;
      const sent = rows.filter((p) => p.status === "sent").length;
      const failed = rows.filter((p) => p.status === "failed").length;
      const pending = rows.filter((p) => p.status === "pending").length;
      const totalAmount = rows.reduce((sum, p) => sum + (Number(p.amountXrp) || 0), 0);
      return { actionId, total, sent, failed, pending, totalAmount, payouts: rows };
    });
  }, [payoutsByAction]);

  const handleViewDetails = (rows: PayoutRow[]) => {
    setSelectedActionPayouts(rows);
    setDialogOpen(true);
  };

  const handleRetryPayout = async (payoutId: string) => {
    // Optional: implement a /api/payouts/retry route if you want
    console.log("Retrying payout:", payoutId);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">Payouts</Typography>
        <Button onClick={() => refetch()} startIcon={<Refresh />}>Refresh</Button>
      </Stack>

      {isLoading && <Typography>Loading…</Typography>}
      {isError && <Typography color="error">Failed to load payouts</Typography>}

      {!isLoading && !isError && (
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
                {actionSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="text.secondary">No payouts yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  actionSummaries.map((summary) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Payout Details</DialogTitle>
        <DialogContent>
          <List>
            {selectedActionPayouts.map((payout) => (
              <ListItem key={payout.id}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" fontFamily="monospace">{payout.address}</Typography>
                      <Chip label={payout.status} size="small" color={statusColors[payout.status]} />
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
  );
}
