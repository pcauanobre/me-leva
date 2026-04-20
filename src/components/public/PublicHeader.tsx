"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "@/app/login/actions";

import FavoriteIcon from "@mui/icons-material/Favorite";

const NAV_LINKS = [
  { label: "Início", href: "/", icon: <HomeIcon /> },
  { label: "Animais", href: "/animais", icon: <SearchIcon /> },
  { label: "Adotar", href: "/adotar", icon: <VolunteerActivismIcon /> },
  { label: "Quero Doar", href: "/quero-doar", icon: <FavoriteIcon /> },
  { label: "Sobre", href: "/sobre", icon: <InfoIcon /> },
];

interface Props {
  user?: { name: string; isAdmin: boolean } | null;
}

export default function PublicHeader({ user }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const dashboardHref = user?.isAdmin ? "/admin" : "/minha-conta";
  const initial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: 6 }}>
            <img src="/logo.svg" alt="Me Leva!" width={32} height={32} />
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                color: "primary.main",
                display: { xs: "none", md: "block" },
              }}
            >
              Me Leva!
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {isMobile ? (
            <>
              {/* Mobile: auth quick action */}
              {user && (
                <Link href={dashboardHref} style={{ textDecoration: "none" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {initial}
                  </Avatar>
                </Link>
              )}

              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "text.primary" }}>
                <MenuIcon />
              </IconButton>

              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Box sx={{ width: { xs: "85vw", sm: 320 }, maxWidth: 320, display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Drawer header */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <img src="/logo.svg" alt="Me Leva!" width={28} height={28} />
                      <Typography fontWeight={700} color="primary.main">Me Leva!</Typography>
                    </Stack>
                    <IconButton onClick={() => setDrawerOpen(false)} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Divider />

                  {/* User section */}
                  {user && (
                    <>
                      <Box sx={{ px: 2, py: 2.5, bgcolor: "primary.50" }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "primary.main",
                              fontWeight: 700,
                            }}
                          >
                            {initial}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600} variant="body2">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.isAdmin ? "Administradora" : "Voluntário(a)"}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      <Divider />
                    </>
                  )}

                  {/* Nav links */}
                  <List sx={{ flex: 1, px: 1, py: 1 }}>
                    {NAV_LINKS.map((link) => (
                      <ListItemButton
                        key={link.href}
                        component={Link}
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        sx={{ borderRadius: 2, mb: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                          {link.icon}
                        </ListItemIcon>
                        <ListItemText primary={link.label} />
                      </ListItemButton>
                    ))}
                  </List>

                  <Divider />

                  {/* Auth actions */}
                  <List sx={{ px: 1, py: 1 }}>
                    {user ? (
                      <>
                        <ListItemButton
                          component={Link}
                          href={dashboardHref}
                          onClick={() => setDrawerOpen(false)}
                          sx={{ borderRadius: 2, mb: 0.5, bgcolor: "primary.50" }}
                        >
                          <ListItemIcon sx={{ minWidth: 36, color: "primary.main" }}>
                            <DashboardIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Meu Painel"
                            primaryTypographyProps={{ fontWeight: 600, color: "primary.main" }}
                          />
                        </ListItemButton>
                        <form action={logout}>
                          <ListItemButton
                            component="button"
                            type="submit"
                            sx={{ borderRadius: 2, width: "100%" }}
                          >
                            <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                              <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Sair" />
                          </ListItemButton>
                        </form>
                      </>
                    ) : (
                      <ListItemButton
                        component={Link}
                        href="/login"
                        onClick={() => setDrawerOpen(false)}
                        sx={{ borderRadius: 2, bgcolor: "primary.50" }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: "primary.main" }}>
                          <LoginIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Entrar"
                          primaryTypographyProps={{ fontWeight: 600, color: "primary.main" }}
                        />
                      </ListItemButton>
                    )}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            /* Desktop */
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={{ color: "text.primary", fontWeight: 500 }}
                >
                  {link.label}
                </Button>
              ))}

              {user ? (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1 }}>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Link href={dashboardHref} style={{ textDecoration: "none" }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DashboardIcon />}
                      sx={{ fontWeight: 600, px: 2 }}
                    >
                      Meu Painel
                    </Button>
                  </Link>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.light",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {initial}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} color="text.primary" noWrap sx={{ maxWidth: 120 }}>
                      {user.name}
                    </Typography>
                  </Stack>
                  <form action={logout}>
                    <IconButton type="submit" size="small" sx={{ color: "text.secondary" }}>
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </form>
                </Stack>
              ) : (
                <Link href="/login" style={{ textDecoration: "none", marginLeft: 8 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<LoginIcon />}
                    sx={{ fontWeight: 600, px: 2 }}
                  >
                    Entrar
                  </Button>
                </Link>
              )}
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
