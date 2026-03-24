import Link from "next/link";
import { Box, Container, Typography, Stack } from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";

export default function PublicFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "grey.50",
        borderTop: "1px solid",
        borderColor: "divider",
        py: { xs: 3, sm: 4 },
        mt: { xs: 4, sm: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 1.5, sm: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <img src="/logo.svg" alt="Me Leva!" width={24} height={24} />
            <Typography fontWeight={700} color="primary.main" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Me Leva!
            </Typography>
          </Stack>

          <Stack direction="row" spacing={{ xs: 2, sm: 3 }}>
            <Link
              href="/sobre"
              style={{ textDecoration: "none" }}
            >
              <Typography sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                Sobre
              </Typography>
            </Link>
            <Link
              href="/privacidade"
              style={{ textDecoration: "none" }}
            >
              <Typography sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                Privacidade
              </Typography>
            </Link>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Feito com <FavoriteIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: "secondary.main" }} /> em Fortaleza
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
