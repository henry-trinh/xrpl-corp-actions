"use client";

import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Stack, TextField,
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions  // <-- add these
} from "@mui/material";
import { Add, Visibility, CameraAlt, Payment, OpenInNew } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import type { ActionStatus, ActionType } from "@/types";

const statusColors = {
  draft: "default",
  announced: "info",
  snapshotted: "warning",
  paid: "success",
} as const;

const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_XRPL_EXPLORER_BASE ||
  "https://testnet.xrpl.org/transactions/";

function openTx(hash: string) {
  const url = hash?.startsWith?.("http") ? hash : `${EXPLORER_BASE}${hash}`;
  if (hash) window.open(url, "_blank");
}

async function snapshotAction(id: string) {
  const r = await fetch(`/api/actions/${id}/snapshot`, { method: "POST" });
  if (!r.ok) throw new Error("snapshot failed");
  return r.json();
}

async function payoutAction(id: string) {
  const r = await fetch(`/api/actions/${id}/payout`, { method: "POST" });
  if (!r.ok) throw new Error("payout failed");
  return r.json();
}

export function ActionsContent() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ActionType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const snapMut = useMutation({
    mutationFn: snapshotAction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["actions"] });
      qc.invalidateQueries({ queryKey: ["snapshots"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  
  const payMut = useMutation({
    mutationFn: payoutAction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["actions"] });
      qc.invalidateQueries({ queryKey: ["payouts"] });
    //   qc.invalidateQueries({ queryKey: ["holdings"] });    // for refreshing investor views
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["actions"],
    queryFn: async () => {
      const response = await fetch("/api/actions");
      if (!response.ok) throw new Error("Failed to load actions");
      return response.json();
    },
  });

  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId || !actions?.length || dialogOpen || selectedAction) return;
  
    const found = actions.find((a: any) => a.id === openId);
    if (found) {
      setSelectedAction(found);
      setDialogOpen(true);
  
      const url = new URL(window.location.href);
      url.searchParams.delete("open");
      window.history.replaceState(null, "", url.toString());
    }
  }, [searchParams, actions, dialogOpen, selectedAction]);
  
  const filteredActions = useMemo(() => {
    return actions.filter((action: any) => {
      const matchesStatus = statusFilter === "all" || action.status === statusFilter;
      const matchesType = typeFilter === "all" || action.type === typeFilter;
      const matchesSearch =
        action.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.company.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [actions, statusFilter, typeFilter, searchTerm]);

  if (isLoading) return <Typography>Loading...</Typography>;

  const handleOpen = (action: any) => {
    setSelectedAction(action);
    setDialogOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
    setSelectedAction(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Corporate Actions</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => router.push("/actions/new")}>
          Create Action
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Search by token or company"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as ActionStatus | "all")}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="announced">Announced</MenuItem>
                <MenuItem value="snapshotted">Snapshotted</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value as ActionType | "all")}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="dividend">Dividend</MenuItem>
                <MenuItem value="split">Split</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event ID</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Token</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Record Date</TableCell>
                <TableCell>Payable Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>XRPL Tx</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActions.map((action: any) => (
                <TableRow key={action.id} hover>
                  <TableCell>{action.id}</TableCell>
                  <TableCell>{action.company}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">{action.token}</Typography>
                  </TableCell>
                  <TableCell><Chip label={action.type} size="small" variant="outlined" /></TableCell>
                  <TableCell>{new Date(action.recordAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(action.payableAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={action.status} size="small" color={statusColors[action.status as ActionStatus]} />
                  </TableCell>
                  <TableCell>
                    {action.xrplAnnounceTx && (
                      <IconButton size="small" onClick={() => openTx(action.xrplAnnounceTx)}>
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {/* 👁️ Open details modal instead of pushing route */}
                      <IconButton size="small" onClick={() => handleOpen(action)}>
                        <Visibility fontSize="small" />
                      </IconButton>

                      {action.status === "announced" && (
                        <IconButton
                          size="small"
                          onClick={() => snapMut.mutate(action.id)}
                          disabled={snapMut.isPending}
                          title="Take snapshot"
                        >
                          <CameraAlt fontSize="small" />
                        </IconButton>
                      )}
                      {action.status === "snapshotted" && (
                        <IconButton
                          size="small"
                          onClick={() => payMut.mutate(action.id)}
                          disabled={payMut.isPending}
                          title="Run payouts"
                        >
                          <Payment fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Corporate Action Details</DialogTitle>
        <DialogContent dividers>
          {selectedAction && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography><b>Event ID:</b> {selectedAction.id}</Typography>
              <Typography><b>Company:</b> {selectedAction.company}</Typography>
              <Typography><b>Token:</b> <span style={{ fontFamily: "monospace" }}>{selectedAction.token}</span></Typography>
              <Typography><b>Type:</b> {selectedAction.type}</Typography>
              <Typography><b>Status:</b> {selectedAction.status}</Typography>
              <Typography><b>Record At:</b> {new Date(selectedAction.recordAt).toLocaleString()}</Typography>
              <Typography><b>Payable At:</b> {new Date(selectedAction.payableAt).toLocaleString()}</Typography>
              {"payoutPerShare" in selectedAction && selectedAction.payoutPerShare != null && (
                <Typography><b>Payout per Share:</b> {selectedAction.payoutPerShare} XRP</Typography>
              )}
              {selectedAction.xrplAnnounceTx && (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<OpenInNew fontSize="small" />}
                  onClick={() => openTx(selectedAction.xrplAnnounceTx)}
                  sx={{ alignSelf: "flex-start", mt: 1 }}
                >
                  View XRPL Announcement
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {/* Contextual quick actions */}
          {selectedAction?.status === "announced" && (
            <Button
              onClick={() => selectedAction && snapMut.mutate(selectedAction.id)}
              disabled={snapMut.isPending}
              variant="contained"
            >
              {snapMut.isPending ? "Snapshotting..." : "Take Snapshot"}
            </Button>
          )}
          {selectedAction?.status === "snapshotted" && (
            <Button
              onClick={() => selectedAction && payMut.mutate(selectedAction.id)}
              disabled={payMut.isPending}
              variant="contained"
            >
              {payMut.isPending ? "Paying..." : "Run Payouts"}
            </Button>
          )}
          <Button onClick={handleClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
