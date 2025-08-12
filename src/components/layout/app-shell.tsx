"use client"

import type React from "react"

import { useState } from "react"
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
  Menu,
  MenuItem,
  InputBase,
  alpha,
  Alert,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  Business,
  CameraAlt,
  Payment,
  AccountBalance,
  Settings,
  Search as SearchIcon,
  Brightness4,
  Brightness7,
  AccountCircle,
} from "@mui/icons-material"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "@/components/providers/theme-provider"

const drawerWidth = 240

const navigationItems = [
  { text: "Dashboard", icon: Dashboard, path: "/dashboard" },
  { text: "Corporate Actions", icon: Business, path: "/actions" },
  { text: "Snapshots", icon: CameraAlt, path: "/snapshots" },
  { text: "Payouts", icon: Payment, path: "/payouts" },
  { text: "Holdings", icon: AccountBalance, path: "/holdings" },
  { text: "Settings", icon: Settings, path: "/settings" },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const muiTheme = useMuiTheme()
  const { darkMode, toggleTheme } = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          XRPL Actions
        </Typography>
      </Toolbar>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => {
                router.push(item.path)
                if (isMobile) setMobileOpen(false)
              }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            XRPL Corporate Actions Tracker
          </Typography>

          <Box
            sx={{
              position: "relative",
              borderRadius: 1,
              backgroundColor: alpha(muiTheme.palette.common.white, 0.15),
              "&:hover": {
                backgroundColor: alpha(muiTheme.palette.common.white, 0.25),
              },
              marginRight: 2,
              marginLeft: 0,
              width: "100%",
              maxWidth: 300,
              display: { xs: "none", sm: "block" },
            }}
          >
            <Box
              sx={{
                padding: muiTheme.spacing(0, 2),
                height: "100%",
                position: "absolute",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Search actions..."
              inputProps={{ "aria-label": "search" }}
              sx={{
                color: "inherit",
                "& .MuiInputBase-input": {
                  padding: muiTheme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${muiTheme.spacing(4)})`,
                  width: "100%",
                },
              }}
            />
          </Box>

          <IconButton color="inherit" onClick={toggleTheme}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>My account</MenuItem>
        <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
      </Menu>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="navigation">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: muiTheme.palette.background.default,
        }}
      >
        <Toolbar />

        <Alert severity="info" sx={{ mb: 2 }} variant="outlined">
          <strong>Demo only.</strong> Simulated tokens (e.g., DIS.Share) and testnet XRP payouts. Not real stocks.
        </Alert>

        {children}
      </Box>
    </Box>
  )
}
