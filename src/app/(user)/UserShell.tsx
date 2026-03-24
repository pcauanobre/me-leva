"use client";

import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Stack,
  Avatar,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "@/app/login/actions";

export default function UserShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                gap: 8,
              }}
            >
              <img src="/logo.svg" alt="Me Leva!" width={32} height={32} />
              <Typography
                variant="h6"
                fontWeight={800}
                color="primary.main"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Me Leva!
              </Typography>
            </Link>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.light",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {userName[0]?.toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.primary"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {userName}
              </Typography>
              <form action={logout}>
                <Button
                  type="submit"
                  size="small"
                  color="inherit"
                  sx={{ minWidth: "auto", color: "text.secondary" }}
                >
                  <LogoutIcon fontSize="small" />
                </Button>
              </form>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}
