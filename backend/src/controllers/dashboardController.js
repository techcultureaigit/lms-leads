import { Lead } from "../models/Lead.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { toLeadDto, toUserDto } from "../utils/mappers.js";
import {
  DEMO_TODAY,
  LEAD_STATUSES,
  PRODUCTS,
} from "../utils/constants.js";

const RANGES = new Set(["today", "week", "month", "all"]);

function addDays(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekdayLabel(iso) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(`${iso}T12:00:00`).getDay()
  ];
}

function leadDates(l) {
  return [l.followup, l.meetingDate, l.lostDate, l.wonDate].filter(Boolean);
}

function inDateRange(date, range) {
  if (!date) return false;
  if (range === "all") return true;
  if (range === "today") return date === DEMO_TODAY;
  if (range === "month") return date.startsWith(DEMO_TODAY.slice(0, 7));
  // week: Mon of demo week through DEMO_TODAY (seeded Sep 2026)
  const weekStart = "2026-09-01";
  return date >= weekStart && date <= DEMO_TODAY;
}

function leadInRange(l, range) {
  if (range === "all") return true;
  const dates = leadDates(l);
  if (!dates.length) return false;
  return dates.some((d) => inDateRange(d, range));
}

function buildAgenda(leads, date) {
  const items = [];
  for (const l of leads) {
    const dto = toLeadDto(l);
    if (dto.followup === date) {
      items.push({
        id: dto.id,
        entity: dto.entity,
        contact: dto.contact,
        owner: dto.owner,
        status: dto.status,
        type: "Follow-up",
        kind: "followup",
        when: dto.followup,
      });
    }
    if (dto.meetingDate === date) {
      items.push({
        id: dto.id,
        entity: dto.entity,
        contact: dto.contact,
        owner: dto.owner,
        status: dto.status,
        type: dto.meetingType ? `Meeting · ${dto.meetingType}` : "Meeting",
        kind: "meeting",
        when: dto.meetingDate,
        meetingType: dto.meetingType || "",
      });
    }
  }
  return items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "meeting" ? -1 : 1;
    return a.entity.localeCompare(b.entity);
  });
}

export const getDashboard = asyncHandler(async (req, res) => {
  const range = RANGES.has(req.query.range) ? req.query.range : "all";

  const [allLeads, allUsers] = await Promise.all([
    Lead.find({}).sort({ createdAt: -1 }),
    User.find({}).sort({ name: 1 }),
  ]);

  const scoped = allLeads.filter((l) => leadInRange(l, range));

  const total = scoped.length;
  const active = scoped.filter(
    (l) => l.status !== "Lost" && l.status !== "Completed",
  ).length;
  const neu = scoped.filter((l) => l.status === "New").length;
  const inProcess = scoped.filter((l) => l.status === "In Process").length;
  const meetings = scoped.filter((l) => l.status === "Meeting").length;
  const won = scoped.filter((l) => l.status === "Completed").length;
  const lost = scoped.filter((l) => l.status === "Lost").length;
  const followups = scoped.filter((l) => l.followup).length;
  const overdue = scoped.filter(
    (l) => l.followup && l.followup < DEMO_TODAY,
  ).length;
  const winRate = total ? Math.round((won / total) * 100) : 0;
  const teamCount = allUsers.length;
  const withEmail = scoped.filter((l) => l.email).length;
  const withWebsite = scoped.filter((l) => l.website).length;
  const onlineMeetings = scoped.filter((l) => l.meetingType === "Online").length;
  const offlineMeetings = scoped.filter(
    (l) => l.meetingType === "Offline",
  ).length;

  const weekStart = "2026-09-01";
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekVolume = weekDays.map(
    (day) =>
      allLeads.filter((l) => l.followup === day || l.meetingDate === day)
        .length,
  );
  const weekTotal = weekVolume.reduce((a, b) => a + b, 0);

  const growthMonths = [
    { key: "2026-04", label: "Apr" },
    { key: "2026-05", label: "May" },
    { key: "2026-06", label: "Jun" },
    { key: "2026-07", label: "Jul" },
    { key: "2026-08", label: "Aug" },
    { key: "2026-09", label: "Sep" },
  ];
  const growth = growthMonths.map(
    ({ key }) =>
      allLeads.filter((l) =>
        leadDates(l).some((d) => String(d).startsWith(key)),
      ).length,
  );

  const funnel = LEAD_STATUSES.map((status) => ({
    status,
    count: scoped.filter((l) => l.status === status).length,
  }));

  const recentLeads = scoped.slice(0, 25).map((l) => {
    const dto = toLeadDto(l);
    return {
      id: dto.id,
      entity: dto.entity,
      contact: dto.contact,
      status: dto.status,
      owner: dto.owner,
      followup: dto.followup,
    };
  });

  const ownerCounts = allUsers.map((u) => {
    const count = scoped.filter((l) => l.owner === u.name).length;
    return { user: toUserDto(u), count };
  });
  const ownerMax = Math.max(...ownerCounts.map((x) => x.count), 1);

  const teamPerformance = ownerCounts
    .map(({ user, count }) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      initials: user.initials,
      count,
      pct: Math.round((count / ownerMax) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  res.json({
    range,
    today: DEMO_TODAY,
    metrics: {
      totalLeads: total,
      activePipeline: active,
      newLeads: neu,
      inProcess,
      meetings,
      followupsOpen: followups,
      overdueFollowups: overdue,
      wonDeals: won,
      lostLeads: lost,
      winRate,
      teamMembers: teamCount,
      productsCatalog: PRODUCTS.length,
      leadsWithEmail: withEmail,
      leadsWithWebsite: withWebsite,
      onlineMeetings,
      offlineMeetings,
      assignedOwners: teamCount,
      thisWeekVolume: weekTotal,
      priorityQueue: active,
      conversionFocus: meetings + inProcess,
    },
    charts: {
      weekActivity: {
        labels: weekDays.map(weekdayLabel),
        values: weekVolume,
        total: weekTotal,
      },
      monthGrowth: {
        labels: growthMonths.map((m) => m.label),
        values: growth,
      },
    },
    agenda: buildAgenda(allLeads, DEMO_TODAY),
    funnel,
    recentLeads,
    teamPerformance,
  });
});
