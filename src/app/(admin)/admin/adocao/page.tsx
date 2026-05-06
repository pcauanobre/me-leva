import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Avatar,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import PetsIcon from "@mui/icons-material/Pets";
import DescriptionIcon from "@mui/icons-material/Description";
import type { AdoptionFormRow, Animal } from "@/lib/supabase/types";
import { computeCurrentAge } from "@/lib/utils/computeAge";
import RevertAdoptionButton from "./RevertAdoptionButton";
import AdocaoTabsNav from "./AdocaoTabsNav";

export const metadata: Metadata = {
  title: "Adoções",
};

function formatPhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: "warning" | "success" | "error" | "default" }> = {
  pendente: { label: "Pendente", color: "warning" },
  aprovado: { label: "Aprovado", color: "success" },
  rejeitado: { label: "Rejeitado", color: "error" },
};

const SPECIES_LABELS: Record<string, string> = {
  cao: "Cão",
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

const SEX_LABELS: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
};

type AdoptedAnimal = Pick<
  Animal,
  | "id"
  | "name"
  | "slug"
  | "species"
  | "sex"
  | "age_months"
  | "cover_photo"
  | "photo_urls"
  | "adopted_at"
  | "created_at"
>;

interface LinkedForm {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  animal_id: string;
}

interface AdocaoPageProps {
  searchParams: Promise<{ tab?: string; status?: string }>;
}

export default async function AdocaoPage({ searchParams }: AdocaoPageProps) {
  const params = await searchParams;
  const tab = params.tab === "concluidas" ? "concluidas" : "candidatos";
  const statusFilter = params.status || "todos";
  const supabase = await createServerClient();

  let typedForms: AdoptionFormRow[] = [];
  let adoptedList: AdoptedAnimal[] = [];
  let formByAnimal = new Map<string, LinkedForm>();

  if (tab === "candidatos") {
    let query = supabase
      .from("adoption_forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "todos") {
      query = query.eq("status", statusFilter);
    }

    const { data: forms } = await query;
    typedForms = (forms || []) as AdoptionFormRow[];
  } else {
    const { data: adopted } = await supabase
      .from("animals")
      .select(
        "id, name, slug, species, sex, age_months, cover_photo, photo_urls, adopted_at, created_at",
      )
      .eq("status", "adotado")
      .order("adopted_at", { ascending: false });

    adoptedList = (adopted || []) as AdoptedAnimal[];
    const animalIds = adoptedList.map((a) => a.id);

    if (animalIds.length > 0) {
      const { data: linkedForms } = await supabase
        .from("adoption_forms")
        .select("id, full_name, email, whatsapp, animal_id")
        .in("animal_id", animalIds)
        .eq("status", "aprovado");

      const arr = (linkedForms || []) as LinkedForm[];
      formByAnimal = new Map(
        arr
          .filter((f) => !!f.animal_id)
          .map((f) => [f.animal_id, f]),
      );
    }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Adoções
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie candidatos a adoção e visualize as adoções concluídas com
        sucesso.
      </Typography>

      <AdocaoTabsNav
        value={tab}
        tabs={[
          { value: "candidatos", label: "Candidatos", href: "/admin/adocao" },
          {
            value: "concluidas",
            label: "Adoções concluídas",
            href: "/admin/adocao?tab=concluidas",
          },
        ]}
      />

      {tab === "candidatos" ? (
        <Box>
          <AdocaoTabsNav
            value={statusFilter}
            tabs={[
              { value: "todos", label: "Todos", href: "/admin/adocao" },
              {
                value: "pendente",
                label: "Pendentes",
                href: "/admin/adocao?status=pendente",
              },
              {
                value: "aprovado",
                label: "Aprovados",
                href: "/admin/adocao?status=aprovado",
              },
              {
                value: "rejeitado",
                label: "Rejeitados",
                href: "/admin/adocao?status=rejeitado",
              },
            ]}
          />

          {typedForms.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <InboxIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary">
                Nenhum formulário de adoção recebido ainda.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Desktop Table */}
              <TableContainer
                component={Paper}
                sx={{ display: { xs: "none", md: "block" } }}
              >
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidato(a)</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>WhatsApp</TableCell>
                      <TableCell>Espécie</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {typedForms.map((form) => {
                      const statusCfg =
                        STATUS_CONFIG[form.status] || {
                          label: form.status || "—",
                          color: "default" as const,
                        };
                      return (
                        <TableRow key={form.id} hover>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {form.full_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {form.profession}
                            </Typography>
                          </TableCell>
                          <TableCell>{form.email}</TableCell>
                          <TableCell>{form.whatsapp}</TableCell>
                          <TableCell>
                            {SPECIES_LABELS[form.animal_species] ||
                              form.animal_species}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusCfg.label}
                              color={statusCfg.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(form.created_at)}</TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="flex-end"
                            >
                              <Link href={`/admin/adocao/${form.id}`}>
                                <IconButton size="small" color="primary">
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Link>
                              <IconButton
                                size="small"
                                color="success"
                                component="a"
                                href={`https://wa.me/${formatPhone(form.whatsapp)}?text=${encodeURIComponent(`Oi ${form.full_name}! Vi seu formulário de adoção. Vamos conversar?`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <WhatsAppIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Mobile Cards */}
              <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
                {typedForms.map((form) => {
                  const statusCfg =
                    STATUS_CONFIG[form.status] || {
                      label: form.status || "—",
                      color: "default" as const,
                    };
                  return (
                    <Paper key={form.id} sx={{ p: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Box>
                          <Typography fontWeight={600}>
                            {form.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {form.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={statusCfg.label}
                          color={statusCfg.color}
                          size="small"
                        />
                      </Stack>

                      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {SPECIES_LABELS[form.animal_species] ||
                            form.animal_species}{" "}
                          &middot; {form.profession}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(form.created_at)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Link href={`/admin/adocao/${form.id}`}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                          >
                            Ver detalhes
                          </Button>
                        </Link>
                        <IconButton
                          size="small"
                          color="success"
                          component="a"
                          href={`https://wa.me/${formatPhone(form.whatsapp)}?text=${encodeURIComponent(`Oi ${form.full_name}! Vi seu formulário de adoção. Vamos conversar?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </>
          )}
        </Box>
      ) : (
        <Box>
          {adoptedList.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <PetsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary">
                Nenhuma adoção concluída ainda.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Quando você aprovar um candidato e vincular a um animal, ele
                aparece aqui.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Desktop Table */}
              <TableContainer
                component={Paper}
                sx={{ display: { xs: "none", md: "block" } }}
              >
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Animal</TableCell>
                      <TableCell>Idade</TableCell>
                      <TableCell>Adotante</TableCell>
                      <TableCell>Adotado em</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adoptedList.map((animal) => {
                      const linkedForm = formByAnimal.get(animal.id);
                      const photo =
                        animal.cover_photo ||
                        (animal.photo_urls && animal.photo_urls[0]) ||
                        null;
                      return (
                        <TableRow key={animal.id} hover>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              {photo ? (
                                <Avatar
                                  src={photo}
                                  sx={{ width: 48, height: 48 }}
                                />
                              ) : (
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: "primary.light",
                                  }}
                                >
                                  <PetsIcon />
                                </Avatar>
                              )}
                              <Box>
                                <Link
                                  href={`/animais/${animal.slug}`}
                                  style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                  }}
                                >
                                  <Typography fontWeight={600}>
                                    {animal.name}
                                  </Typography>
                                </Link>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {SPECIES_LABELS[animal.species] ||
                                    animal.species}{" "}
                                  &middot;{" "}
                                  {SEX_LABELS[animal.sex] || animal.sex}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {computeCurrentAge(
                              animal.age_months,
                              animal.created_at,
                            )}
                          </TableCell>
                          <TableCell>
                            {linkedForm ? (
                              <Box>
                                <Typography fontWeight={600}>
                                  {linkedForm.full_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {linkedForm.email}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Sem formulário vinculado
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(animal.adopted_at)}</TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                              alignItems="center"
                            >
                              {linkedForm && (
                                <Link
                                  href={`/admin/adocao/${linkedForm.id}`}
                                >
                                  <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<DescriptionIcon />}
                                  >
                                    Formulário
                                  </Button>
                                </Link>
                              )}
                              {linkedForm && (
                                <IconButton
                                  size="small"
                                  color="success"
                                  component="a"
                                  href={`https://wa.me/${formatPhone(linkedForm.whatsapp)}?text=${encodeURIComponent(`Oi ${linkedForm.full_name}! Tudo bem com ${animal.name}?`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              )}
                              <RevertAdoptionButton
                                animalId={animal.id}
                                animalName={animal.name}
                                hasLinkedForm={!!linkedForm}
                              />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Mobile Cards */}
              <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
                {adoptedList.map((animal) => {
                  const linkedForm = formByAnimal.get(animal.id);
                  const photo =
                    animal.cover_photo ||
                    (animal.photo_urls && animal.photo_urls[0]) ||
                    null;
                  return (
                    <Paper key={animal.id} sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                        {photo ? (
                          <Avatar src={photo} sx={{ width: 56, height: 56 }} />
                        ) : (
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: "primary.light",
                            }}
                          >
                            <PetsIcon />
                          </Avatar>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Link
                            href={`/animais/${animal.slug}`}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            <Typography fontWeight={600}>
                              {animal.name}
                            </Typography>
                          </Link>
                          <Typography variant="caption" color="text.secondary">
                            {SPECIES_LABELS[animal.species] || animal.species}{" "}
                            &middot; {SEX_LABELS[animal.sex] || animal.sex}{" "}
                            &middot;{" "}
                            {computeCurrentAge(
                              animal.age_months,
                              animal.created_at,
                            )}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Adotante:{" "}
                          <strong>
                            {linkedForm?.full_name || "Sem formulário vinculado"}
                          </strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Adotado em {formatDate(animal.adopted_at)}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        alignItems="center"
                      >
                        {linkedForm && (
                          <Link href={`/admin/adocao/${linkedForm.id}`}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DescriptionIcon />}
                            >
                              Ver formulário
                            </Button>
                          </Link>
                        )}
                        {linkedForm && (
                          <IconButton
                            size="small"
                            color="success"
                            component="a"
                            href={`https://wa.me/${formatPhone(linkedForm.whatsapp)}?text=${encodeURIComponent(`Oi ${linkedForm.full_name}! Tudo bem com ${animal.name}?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        )}
                        <RevertAdoptionButton
                          animalId={animal.id}
                          animalName={animal.name}
                          hasLinkedForm={!!linkedForm}
                        />
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
