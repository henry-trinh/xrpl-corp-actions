"use client"

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { Add, Visibility, CameraAlt, Payment, OpenInNew } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { ActionStatus, ActionType } from "@/types"

const statusColors = {
  draft: "default",
  announced: "info",
  snapshotted: "warning",
  paid: "success",
} as const

export function ActionsContent() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<ActionType | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["actions"],
    queryFn: async () => {
      // TODO: Replace with API call to /api/actions
      const response = await fetch("/api/actions")
      return response.json()
    },
  })

  const filteredActions = actions.filter((action: any) => {
    const matchesStatus = statusFilter === "all" || action.status === statusFilter
    const matchesType = typeFilter === "all" || action.type === typeFilter
    const matchesSearch =
      action.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.company.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Corporate Actions
        </Typography>
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
                    <Typography variant="body2" fontFamily="monospace">
                      {action.token}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={action.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{new Date(action.recordAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(action.payableAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={action.status} size="small" color={statusColors[action.status as ActionStatus]} />
                  </TableCell>
                  <TableCell>
                    {action.xrplAnnounceTx && (
                      <IconButton size="small" onClick={() => window.open(action.xrplAnnounceTx, "_blank")}>
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => router.push(`/actions/${action.id}`)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                      {action.status === "announced" && (
                        <IconButton size="small">
                          <CameraAlt fontSize="small" />
                        </IconButton>
                      )}
                      {action.status === "snapshotted" && (
                        <IconButton size="small">
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
    </Box>
  )
}
