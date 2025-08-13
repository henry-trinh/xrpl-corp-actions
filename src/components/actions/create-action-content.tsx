"use client"

import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
  Stack,
} from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { useMutation } from "@tanstack/react-query"

const createActionSchema = z
  .object({
    company: z.string().min(1, "Company is required"),
    token: z.string().min(1, "Token symbol is required"),
    type: z.enum(["dividend", "split"]),
    recordAt: z.string().min(1, "Record date is required"),
    payableAt: z.string().min(1, "Payable date is required"),
    payoutPerShare: z.number().optional(),
    splitRatio: z.string().optional(),
    attachmentUrl: z.string().url().optional().or(z.literal("")),
    attachmentHash: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "dividend" && !data.payoutPerShare) {
        return false
      }
      if (data.type === "split" && !data.splitRatio) {
        return false
      }
      return true
    },
    {
      message: "Required fields for selected action type are missing",
    },
  )

type CreateActionForm = z.infer<typeof createActionSchema>

export function CreateActionContent() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateActionForm>({
    resolver: zodResolver(createActionSchema),
    defaultValues: {
      type: "dividend",
      company: "DemoCo",
      token: "DIS.Share",
    },
  })

  const actionType = watch("type")
  const formData = watch()

  const createActionMutation = useMutation({
    mutationFn: async (data: CreateActionForm) => {
      // constructing memoJson to send and preview new corporate actions
      const memoJson = {
        event: data.type,
        token: data.token,
        recordAt: data.recordAt,
        payableAt: data.payableAt,
        ...(data.type === "dividend" && { payoutPerShare: data.payoutPerShare }),
        ...(data.type === "split" && { splitRatio: data.splitRatio }),
        ...(data.attachmentUrl && { attachmentUrl: data.attachmentUrl }),
        ...(data.attachmentHash && { attachmentHash: data.attachmentHash }),
      };

      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          memoJson,
          createdBy: "issuer@democo.com", // TODO: Get from auth context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create action")
      }

      return response.json()
    },
    onSuccess: (data) => {
      enqueueSnackbar("Corporate action created successfully", { variant: "success" })
      router.push(`/actions?open=${data.id}`)
    },
    onError: () => {
      enqueueSnackbar("Failed to create corporate action", { variant: "error" })
    },
  })

  const onSubmit = (data: CreateActionForm) => {
    createActionMutation.mutate(data)
  }

  // Generate preview memo JSON
  const previewMemo = {
    event: formData.type,
    token: formData.token || "",
    recordAt: formData.recordAt || "",
    payableAt: formData.payableAt || "",
    ...(formData.type === "dividend" && formData.payoutPerShare && { payoutPerShare: formData.payoutPerShare }),
    ...(formData.type === "split" && formData.splitRatio && { splitRatio: formData.splitRatio }),
    ...(formData.attachmentUrl && { attachmentUrl: formData.attachmentUrl }),
    ...(formData.attachmentHash && { attachmentHash: formData.attachmentHash }),
  };  

  const previewHex = Buffer.from(JSON.stringify(previewMemo)).toString("hex")

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Corporate Action
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      {...register("company")}
                      label="Company"
                      fullWidth
                      error={!!errors.company}
                      helperText={errors.company?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      {...register("token")}
                      label="Token Symbol"
                      fullWidth
                      error={!!errors.token}
                      helperText={errors.token?.message}
                      placeholder="e.g., DEMO.Share"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControl component="fieldset" error={!!errors.type}>
                      <FormLabel component="legend">Event Type</FormLabel>
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup {...field} row>
                            <FormControlLabel value="dividend" control={<Radio />} label="Dividend" />
                            <FormControlLabel value="split" control={<Radio />} label="Stock Split" />
                          </RadioGroup>
                        )}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register("recordAt")}
                      label="Record Date/Time (UTC)"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.recordAt}
                      helperText={errors.recordAt?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register("payableAt")}
                      label="Payable Date/Time (UTC)"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.payableAt}
                      helperText={errors.payableAt?.message}
                    />
                  </Grid>

                  {actionType === "dividend" && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        {...register("payoutPerShare", { valueAsNumber: true })}
                        label="Payout per Share (XRP)"
                        type="number"
                        fullWidth
                        error={!!errors.payoutPerShare}
                        helperText={errors.payoutPerShare?.message}
                        inputProps={{ step: 0.000001, min: 0 }}
                      />
                    </Grid>
                  )}

                  {actionType === "split" && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        {...register("splitRatio")}
                        label="Split Ratio"
                        fullWidth
                        error={!!errors.splitRatio}
                        helperText={errors.splitRatio?.message}
                        placeholder="e.g., 2:1"
                      />
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register("attachmentUrl")}
                      label="Attachment URL (Optional)"
                      fullWidth
                      error={!!errors.attachmentUrl}
                      helperText={errors.attachmentUrl?.message}
                      placeholder="https://example.com/terms.pdf"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register("attachmentHash")}
                      label="SHA-256 Hash (Optional)"
                      fullWidth
                      error={!!errors.attachmentHash}
                      helperText={errors.attachmentHash?.message}
                      placeholder="Document hash for verification"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2}>
                      <Button type="submit" variant="contained" disabled={createActionMutation.isPending}>
                        {createActionMutation.isPending ? "Creating..." : "Create Action"}
                      </Button>
                      <Button variant="outlined" onClick={() => router.back()}>
                        Cancel
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Memo JSON:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  mb: 2,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                <pre>{JSON.stringify(previewMemo, null, 2)}</pre>
              </Paper>

              <Typography variant="subtitle2" gutterBottom>
                Hex Encoding Preview:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                  maxHeight: 100,
                  overflow: "auto",
                }}
              >
                {previewHex}
              </Paper>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                This preview shows the JSON memo and hex encoding that would be included in the XRPL transaction.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
