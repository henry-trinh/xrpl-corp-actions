"use client"

import { useState } from "react"
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

const demoCredentials = [
  {
    role: "Issuer",
    email: "issuer@democo.com",
    password: "demo123",
    description: "Full access to create and manage corporate actions",
  },
  {
    role: "Investor",
    email: "investor@example.com",
    password: "demo123",
    description: "View holdings and payout history",
  },
]

export default function LoginPage() {
  const [showDemo, setShowDemo] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    // TODO: Replace with Firebase Auth
    console.log("Login attempt:", data)

    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to dashboard
    router.push("/dashboard")
  }

  const handleDemoLogin = (credentials: (typeof demoCredentials)[0]) => {
    setValue("email", credentials.email)
    setValue("password", credentials.password)
    setShowDemo(false)
    // Auto-submit after setting values
    setTimeout(() => {
      handleSubmit(onSubmit)()
    }, 100)
  }

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
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                {...register("email")}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
              />

              <TextField
                {...register("password")}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
              />

              <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting} sx={{ mt: 2 }}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Demo Access
            </Typography>
          </Divider>

          <Stack spacing={2}>
            <Button variant="outlined" fullWidth onClick={() => setShowDemo(true)}>
              View Demo Credentials
            </Button>

            <Stack direction="row" spacing={2}>
              <Button variant="text" fullWidth onClick={() => handleDemoLogin(demoCredentials[0])}>
                Continue as Issuer
              </Button>
              <Button variant="text" fullWidth onClick={() => handleDemoLogin(demoCredentials[1])}>
                Continue as Investor
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Dialog open={showDemo} onClose={() => setShowDemo(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Demo Credentials</DialogTitle>
          <DialogContent>
            <List>
              {demoCredentials.map((cred, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleDemoLogin(cred)}>
                    <ListItemText
                      primary={`${cred.role} - ${cred.email}`}
                      secondary={`Password: ${cred.password} • ${cred.description}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDemo(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
