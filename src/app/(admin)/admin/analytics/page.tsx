import type { Metadata } from "next";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimerIcon from "@mui/icons-material/Timer";
import { createServerClient } from "@/lib/supabase/server";
import type { AnalyticsEvent, AnalyticsSession, Animal } from "@/lib/supabase/types";
import DateRangeFilter from "./DateRangeFilter";
import LiveSessions from "./LiveSessions";
import {
  FunnelChart,
  StepDropoffChart,
  AvgStepTimeChart,
  CategoryPie,
  HourHeatmap,
  type FunnelDatum,
  type StepDatum,
  type PieDatum,
  type HourCell,
} from "./AnalyticsCharts";
import SessionTimelineDialog from "./SessionTimelineDialog";
import RecentSessionsTable, {
  type RecentSession,
} from "./RecentSessionsTable";
import AbandonedFormsList, { type AbandonedRow } from "./AbandonedFormsList";
import SignupAttemptsList, { type SignupAttempt } from "./SignupAttemptsList";

const TOTAL_FORM_STEPS = 4;
const TOTAL_DONATION_STEPS = 4;

export const metadata: Metadata = {
  title: "Análises",
};

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string;
  to?: string;
  session?: string;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function startOfDayUtc(iso: string): string {
  return `${iso}T00:00:00.000Z`;
}

function endOfDayUtc(iso: string): string {
  return `${iso}T23:59:59.999Z`;
}

function formatMinutes(ms: number): string {
  if (!ms || ms <= 0) return "—";
  const min = ms / 60000;
  if (min < 1) return `${Math.round(ms / 1000)}s`;
  if (min < 60) return `${min.toFixed(1)}min`;
  return `${(min / 60).toFixed(1)}h`;
}

function deviceLabel(value: string | null): string {
  if (!value) return "Desconhecido";
  switch (value) {
    case "mobile":
      return "Celular";
    case "tablet":
      return "Tablet";
    case "desktop":
      return "Desktop";
    case "bot":
      return "Bot";
    default:
      return value;
  }
}

async function fetchLiveCount(
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<number> {
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("analytics_sessions")
    .select("id", { count: "exact", head: true })
    .gte("last_seen_at", twoMinAgo)
    .is("ended_at", null);
  return count ?? 0;
}

function referrerHost(ref: string | null): string {
  if (!ref) return "Direto";
  try {
    const u = new URL(ref);
    return u.hostname || "Direto";
  } catch {
    return ref;
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createServerClient();
  const params = await searchParams;
  const fromIso = params.from || daysAgoIso(30);
  const toIso = params.to || todayIso();
  const fromTs = startOfDayUtc(fromIso);
  const toTs = endOfDayUtc(toIso);
  const focusSessionId = params.session;

  const [adoptionsRes, sessionsRes, eventsRes, animalsRes] = await Promise.all([
    supabase
      .from("animals")
      .select("id", { count: "exact", head: true })
      .eq("status", "adotado")
      .gte("adopted_at", fromTs)
      .lte("adopted_at", toTs),
    supabase
      .from("analytics_sessions")
      .select("*")
      .gte("first_seen_at", fromTs)
      .lte("first_seen_at", toTs)
      .order("last_seen_at", { ascending: false })
      .limit(2000),
    supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", fromTs)
      .lte("created_at", toTs)
      .limit(20000),
    supabase
      .from("animals")
      .select("id, name, slug, cover_photo")
      .limit(2000),
  ]);

  const sessions = (sessionsRes.data ?? []) as AnalyticsSession[];
  const events = (eventsRes.data ?? []) as AnalyticsEvent[];
  const animals = (animalsRes.data ?? []) as Pick<
    Animal,
    "id" | "name" | "slug" | "cover_photo"
  >[];
  const animalById = new Map(animals.map((a) => [a.id, a]));

  // KPI 1
  const totalAdoptions = adoptionsRes.count ?? 0;

  // KPI 2
  const totalSessions = sessions.length;

  // KPI 3 + funnel + step charts
  const sessionIdSet = new Set(sessions.map((s) => s.id));
  const eventsInScope = events.filter((e) =>
    e.session_id ? sessionIdSet.has(e.session_id) || true : false
  );

  const sessionByEventType = new Map<string, Set<string>>();
  const eventsByType = new Map<string, AnalyticsEvent[]>();
  for (const e of eventsInScope) {
    if (!sessionByEventType.has(e.event_type)) {
      sessionByEventType.set(e.event_type, new Set());
    }
    sessionByEventType.get(e.event_type)!.add(e.session_id);
    if (!eventsByType.has(e.event_type)) eventsByType.set(e.event_type, []);
    eventsByType.get(e.event_type)!.push(e);
  }

  const sessionsWithFormOpen =
    sessionByEventType.get("adoption_form_open")?.size ?? 0;
  const sessionsWithFormSubmit =
    sessionByEventType.get("adoption_form_submit")?.size ?? 0;
  const completionRate =
    sessionsWithFormOpen > 0
      ? (sessionsWithFormSubmit / sessionsWithFormOpen) * 100
      : 0;

  // KPI 4 — avg time-to-submit
  const submitEvents = eventsByType.get("adoption_form_submit") ?? [];
  const submitDurations = submitEvents
    .map((e) => e.duration_ms ?? 0)
    .filter((d) => d > 0);
  const avgTimeToSubmitMs =
    submitDurations.length > 0
      ? submitDurations.reduce((a, b) => a + b, 0) / submitDurations.length
      : 0;

  // Funnel
  const sessionsWithPageView =
    sessionByEventType.get("page_view")?.size ?? totalSessions;
  const sessionsWithPetClick =
    sessionByEventType.get("pet_click")?.size ?? 0;

  const approvedRes = await supabase
    .from("adoption_forms")
    .select("id", { count: "exact", head: true })
    .eq("status", "aprovado")
    .gte("created_at", fromTs)
    .lte("created_at", toTs);
  const approvedAdoptionForms = approvedRes.count ?? 0;

  const funnel: FunnelDatum[] = [
    { label: "Visitas", value: sessionsWithPageView },
    { label: "Cliques em pet", value: sessionsWithPetClick },
    { label: "Abriu formulário", value: sessionsWithFormOpen },
    { label: "Enviou formulário", value: sessionsWithFormSubmit },
    { label: "Adoção aprovada", value: approvedAdoptionForms },
  ];

  // Step drop-off + avg time per step
  const stepEvents = eventsByType.get("adoption_form_step") ?? [];
  const stepStats = new Map<number, { sessions: Set<string>; durations: number[] }>();
  for (const e of stepEvents) {
    if (!e.form_step) continue;
    if (!stepStats.has(e.form_step)) {
      stepStats.set(e.form_step, { sessions: new Set(), durations: [] });
    }
    const s = stepStats.get(e.form_step)!;
    s.sessions.add(e.session_id);
    if (e.duration_ms && e.duration_ms > 0) s.durations.push(e.duration_ms);
  }
  // Step 1 = form open
  const step1Sessions = sessionByEventType.get("adoption_form_open") ?? new Set();
  const stepData: StepDatum[] = [];
  stepData.push({
    step: 1,
    sessions: step1Sessions.size,
    avgDurationMs: 0,
  });
  const sortedSteps = Array.from(stepStats.keys()).sort((a, b) => a - b);
  for (const step of sortedSteps) {
    const s = stepStats.get(step)!;
    const avg =
      s.durations.length > 0
        ? s.durations.reduce((a, b) => a + b, 0) / s.durations.length
        : 0;
    stepData.push({
      step,
      sessions: s.sessions.size,
      avgDurationMs: avg,
    });
  }

  // Top pets
  const petClicks = new Map<string, number>();
  for (const e of eventsInScope) {
    if (e.event_type === "pet_click" && e.animal_id) {
      petClicks.set(e.animal_id, (petClicks.get(e.animal_id) ?? 0) + 1);
    }
  }
  const topPets = Array.from(petClicks.entries())
    .map(([animalId, clicks]) => ({
      animal: animalById.get(animalId) ?? null,
      animalId,
      clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Device + browser pies
  const deviceCounts = new Map<string, number>();
  const browserCounts = new Map<string, number>();
  for (const s of sessions) {
    if (s.device_type === "bot") continue;
    const d = deviceLabel(s.device_type);
    deviceCounts.set(d, (deviceCounts.get(d) ?? 0) + 1);
    const b = s.browser ?? "Desconhecido";
    browserCounts.set(b, (browserCounts.get(b) ?? 0) + 1);
  }
  const devicePie: PieDatum[] = Array.from(deviceCounts.entries()).map(
    ([label, value], i) => ({ id: i, label, value })
  );
  const browserPie: PieDatum[] = Array.from(browserCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({ id: i, label, value }));

  // Hour heatmap (page_view events)
  const hourCells = new Map<string, HourCell>();
  for (const e of eventsByType.get("page_view") ?? []) {
    const d = new Date(e.created_at);
    const weekday = d.getDay();
    const hour = d.getHours();
    const key = `${weekday}-${hour}`;
    const cell = hourCells.get(key) ?? { weekday, hour, count: 0 };
    cell.count++;
    hourCells.set(key, cell);
  }
  const heatmap: HourCell[] = Array.from(hourCells.values());

  // New vs returning
  let newCount = 0;
  let returningCount = 0;
  for (const s of sessions) {
    if (s.first_seen_at === s.last_seen_at) newCount++;
    else returningCount++;
  }
  const newReturningPie: PieDatum[] = [
    { id: 0, label: "Novos", value: newCount },
    { id: 1, label: "Recorrentes", value: returningCount },
  ];

  // Referrer breakdown
  const referrerCounts = new Map<string, number>();
  for (const s of sessions) {
    const host = referrerHost(s.referrer);
    referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
  }
  const topReferrers = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Live sessions (initial)
  const liveCount = await fetchLiveCount(supabase);

  // Recent sessions table — show top 50 of fetched sessions, with derived "last event"
  const recentSessions = sessions.slice(0, 50);
  const lastEventBySession = new Map<string, AnalyticsEvent>();
  for (const e of events) {
    const existing = lastEventBySession.get(e.session_id);
    if (!existing || existing.created_at < e.created_at) {
      lastEventBySession.set(e.session_id, e);
    }
  }

  const sessionById = new Map(sessions.map((s) => [s.id, s]));

  function buildAbandonRows(
    openType: string,
    stepType: string,
    abandonType: string,
    submitType: string,
    totalSteps: number
  ): AbandonedRow[] {
    const opens = sessionByEventType.get(openType) ?? new Set();
    const submits = sessionByEventType.get(submitType) ?? new Set();
    const maxStepBy = new Map<string, number>();
    const lastEventBy = new Map<string, AnalyticsEvent>();
    for (const e of eventsInScope) {
      if (
        e.event_type === openType ||
        e.event_type === stepType ||
        e.event_type === abandonType
      ) {
        const step = e.event_type === openType ? 1 : e.form_step ?? 1;
        const prev = maxStepBy.get(e.session_id) ?? 0;
        if (step > prev) maxStepBy.set(e.session_id, step);
        const prevEv = lastEventBy.get(e.session_id);
        if (!prevEv || prevEv.created_at < e.created_at) {
          lastEventBy.set(e.session_id, e);
        }
      }
    }
    return Array.from(opens)
      .filter((sid) => !submits.has(sid))
      .map((sid) => {
        const sess = sessionById.get(sid);
        const lastEv = lastEventBy.get(sid);
        return {
          sessionId: sid,
          ip: sess?.ip_address ?? null,
          device: sess?.device_type ?? null,
          browser: sess?.browser ?? null,
          isAuthenticated: sess?.is_authenticated ?? false,
          reachedStep: maxStepBy.get(sid) ?? 1,
          totalSteps,
          durationMs: lastEv?.duration_ms ?? null,
          lastSeenAt:
            sess?.last_seen_at ??
            lastEv?.created_at ??
            new Date().toISOString(),
        };
      })
      .sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : -1))
      .slice(0, 20);
  }

  // Adoption abandons
  const abandonedRows = buildAbandonRows(
    "adoption_form_open",
    "adoption_form_step",
    "adoption_form_abandon",
    "adoption_form_submit",
    TOTAL_FORM_STEPS
  );

  // Donation abandons
  const donationAbandonedRows = buildAbandonRows(
    "donation_form_open",
    "donation_form_step",
    "donation_form_abandon",
    "donation_form_submit",
    TOTAL_DONATION_STEPS
  );

  // Donation submits count
  const donationSubmits =
    sessionByEventType.get("donation_form_submit")?.size ?? 0;
  const donationOpens =
    sessionByEventType.get("donation_form_open")?.size ?? 0;
  const donationCompletionRate =
    donationOpens > 0 ? (donationSubmits / donationOpens) * 100 : 0;

  // Signup attempts vs completions
  const signupStarts =
    sessionByEventType.get("account_signup_start")?.size ?? 0;
  const signupCompletes =
    sessionByEventType.get("account_signup_complete")?.size ?? 0;
  const signupConversionRate =
    signupStarts > 0 ? (signupCompletes / signupStarts) * 100 : 0;

  // Sessions that started signup but didn't complete (and didn't abandon explicitly either)
  const signupStartSet =
    sessionByEventType.get("account_signup_start") ?? new Set();
  const signupCompleteSet =
    sessionByEventType.get("account_signup_complete") ?? new Set();
  const signupAttemptRows: SignupAttempt[] = Array.from(signupStartSet)
    .filter((sid) => !signupCompleteSet.has(sid))
    .map((sid) => {
      const sess = sessionById.get(sid);
      return {
        sessionId: sid,
        ip: sess?.ip_address ?? null,
        device: sess?.device_type ?? null,
        browser: sess?.browser ?? null,
        lastSeenAt: sess?.last_seen_at ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : -1))
    .slice(0, 20);

  // Session focus (drill-down) — fetch independently to avoid being limited by date range
  let focusSession: (AnalyticsSession & { user_email: string | null }) | null = null;
  let focusEvents: Array<
    Omit<AnalyticsEvent, "metadata"> & { animal_name: string | null }
  > = [];
  if (focusSessionId) {
    const { data: sData } = await supabase
      .from("analytics_sessions")
      .select("*")
      .eq("id", focusSessionId)
      .single();
    if (sData) {
      const session = sData as AnalyticsSession;
      let userEmail: string | null = null;
      if (session.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user_id)
          .single();
        if (profileData) {
          userEmail =
            (profileData as { full_name: string | null }).full_name ?? null;
        }
      }
      focusSession = { ...session, user_email: userEmail };

      const { data: eData } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("session_id", focusSessionId)
        .order("created_at", { ascending: true })
        .limit(500);
      const list = (eData ?? []) as AnalyticsEvent[];
      focusEvents = list.map((e) => ({
        id: e.id,
        session_id: e.session_id,
        user_id: e.user_id,
        event_type: e.event_type,
        path: e.path,
        animal_id: e.animal_id,
        form_step: e.form_step,
        duration_ms: e.duration_ms,
        created_at: e.created_at,
        animal_name: e.animal_id
          ? animalById.get(e.animal_id)?.name ?? null
          : null,
      }));
    }
  }

  const kpiCards = [
    {
      label: "Adoções concluídas",
      value: totalAdoptions,
      icon: <CheckCircleIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      label: "Sessões no período",
      value: totalSessions,
      icon: <GroupIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#8B3FA0",
      bg: "#F8F0FA",
    },
    {
      label: "Taxa de envio",
      value: `${completionRate.toFixed(1)}%`,
      caption: `${sessionsWithFormSubmit} de ${sessionsWithFormOpen} aberturas`,
      icon: <TrendingUpIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#E8618C",
      bg: "#FDE8F0",
    },
    {
      label: "Tempo médio até envio",
      value: formatMinutes(avgTimeToSubmitMs),
      icon: <TimerIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#F97316",
      bg: "#FED7AA",
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
          >
            Análises
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comportamento dos visitantes, funil de adoção e métricas de engajamento.
          </Typography>
        </Box>
        <LiveSessions initialCount={liveCount} />
      </Stack>

      <Box sx={{ mt: 2, mb: 3 }}>
        <DateRangeFilter from={fromIso} to={toIso} />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}
              >
                <Box
                  sx={{
                    width: { xs: 36, sm: 44 },
                    height: { xs: 36, sm: 44 },
                    borderRadius: 2,
                    bgcolor: stat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                    mb: 1.5,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
                {"caption" in stat && stat.caption && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.25, opacity: 0.8 }}
                  >
                    {stat.caption}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Funnel */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Funil de adoção
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cada barra representa quantas sessões únicas chegaram até a etapa.
        </Typography>
        <FunnelChart data={funnel} />
      </Paper>

      {/* Step charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Drop-off por passo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sessões únicas que chegaram em cada passo do formulário (1 = abertura).
            </Typography>
            <StepDropoffChart data={stepData} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Tempo médio em cada passo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Quanto mais alto, mais o usuário está pensando antes de avançar.
            </Typography>
            <AvgStepTimeChart data={stepData} />
          </Paper>
        </Grid>
      </Grid>

      {/* Pies */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Dispositivos
            </Typography>
            <CategoryPie data={devicePie} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Navegadores
            </Typography>
            <CategoryPie data={browserPie} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Novos vs recorrentes
            </Typography>
            <CategoryPie data={newReturningPie} />
          </Paper>
        </Grid>
      </Grid>

      {/* Top pets + heatmap */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Pets mais clicados
            </Typography>
            {topPets.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                Nenhum clique em pet ainda no período.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {topPets.map((row, i) => (
                  <Stack
                    key={row.animalId}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ py: 0.5 }}
                  >
                    <Typography
                      sx={{
                        width: 24,
                        textAlign: "right",
                        fontWeight: 700,
                        color: "text.secondary",
                      }}
                    >
                      {i + 1}
                    </Typography>
                    <Avatar
                      variant="rounded"
                      src={row.animal?.cover_photo ?? undefined}
                      sx={{ width: 36, height: 36 }}
                    >
                      {row.animal?.name?.[0] ?? "?"}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {row.animal ? (
                        <Link
                          href={`/animais/${row.animal.slug}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <Typography fontWeight={600} noWrap>
                            {row.animal.name}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography color="text.secondary" noWrap>
                          (Pet removido)
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      label={`${row.clicks} clique${row.clicks === 1 ? "" : "s"}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Atividade por hora
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Quando os visitantes mais navegam pelo site.
            </Typography>
            <HourHeatmap data={heatmap} />
          </Paper>
        </Grid>
      </Grid>

      {/* Abandoned adoption forms */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Adoção — formulários abandonados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visitantes que abriram o formulário de adoção mas não enviaram.
              Mostra em qual passo pararam e o tempo gasto.
            </Typography>
          </Box>
          <Chip
            label={`${abandonedRows.length} ${abandonedRows.length === 1 ? "abandono" : "abandonos"}`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>
        <Box sx={{ mt: 2 }}>
          <AbandonedFormsList rows={abandonedRows} />
        </Box>
      </Paper>

      {/* Donations panel */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 1 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Quero Doar — formulários abandonados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visitantes que abriram o formulário de doação mas não enviaram.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`${donationOpens} abriu${donationOpens === 1 ? "" : "ram"}`}
              variant="outlined"
            />
            <Chip
              label={`${donationSubmits} enviou${donationSubmits === 1 ? "" : "ram"}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Conversão: ${donationCompletionRate.toFixed(1)}%`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`${donationAbandonedRows.length} ${donationAbandonedRows.length === 1 ? "abandono" : "abandonos"}`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <AbandonedFormsList rows={donationAbandonedRows} />
        </Box>
      </Paper>

      {/* Signups panel */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 1 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Cadastros — tentativas vs concluídos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quem abriu a tela de criar conta mas não terminou.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`${signupStarts} tentou${signupStarts === 1 ? "" : "(varias vezes)"}`}
              variant="outlined"
            />
            <Chip
              label={`${signupCompletes} criou conta`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Conversão: ${signupConversionRate.toFixed(1)}%`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`${signupAttemptRows.length} ${signupAttemptRows.length === 1 ? "abandono" : "abandonos"}`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <SignupAttemptsList rows={signupAttemptRows} />
        </Box>
      </Paper>

      {/* Referrers */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Origens do tráfego
        </Typography>
        {topReferrers.length === 0 ? (
          <Typography color="text.secondary">Sem dados ainda.</Typography>
        ) : (
          <Stack spacing={0.75}>
            {topReferrers.map(([host, count]) => (
              <Stack
                key={host}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  py: 0.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: 0 },
                }}
              >
                <Typography>{host}</Typography>
                <Chip size="small" label={count} variant="outlined" />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Recent sessions */}
      <Paper sx={{ p: 0, mb: 3 }}>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700}>
            Sessões recentes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique em uma sessão para ver toda a jornada do visitante.
          </Typography>
        </Box>
        <Divider />
        <RecentSessionsTable
          sessions={recentSessions.map<RecentSession>((s) => {
            const lastEv = lastEventBySession.get(s.id);
            return {
              id: s.id,
              ip_address: s.ip_address,
              device_type: s.device_type,
              browser: s.browser,
              is_authenticated: s.is_authenticated,
              last_seen_at: s.last_seen_at,
              last_event_type: lastEv?.event_type ?? null,
              last_event_path: lastEv?.path ?? null,
            };
          })}
        />
      </Paper>

      {focusSession && (
        <SessionTimelineDialog session={focusSession} events={focusEvents} />
      )}
    </Box>
  );
}
