import { randomBytes, randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import type { Blueprint } from "@/lib/engine";
import { analyzeForCampus } from "@/lib/open-shop";
import {
  asBlueprint,
  parseConstraints,
  type BomStatus,
  type Campus,
  type DecisionItem,
  type ProjectSummary,
  type TeamMember,
  type TeamSummary,
} from "@/lib/studio";

type AccessRow = {
  id: string;
  owner_id: string;
  team_id: string | null;
  title: string;
  brief: string;
  campus: string;
  constraints: unknown;
  blueprint: unknown;
  chosen_route_id: string | null;
  chosen_route_name: string | null;
  deadline: string | null;
  step_count: number;
};

function cleanId(value: unknown): string {
  const id = String(value ?? "").trim();
  if (!/^[0-9a-f-]{16,64}$/i.test(id)) throw new Error("That record could not be found.");
  return id;
}

function inviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (const byte of randomBytes(8)) code += alphabet[byte % alphabet.length];
  return code;
}

function jsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function planOf(value: unknown): Blueprint {
  const plan = asBlueprint(jsonValue(value));
  if (!plan || plan.routes.length === 0) throw new Error("This project has no plan to show. Recalculate it.");
  return plan;
}

async function loadProject(sql: Sql, userId: string, projectId: string): Promise<AccessRow> {
  const rows = await sql<AccessRow>`
    select p.id, p.owner_id, p.team_id, p.title, p.brief, p.campus, p.constraints, p.blueprint,
           p.chosen_route_id, p.chosen_route_name, p.deadline::text as deadline, p.step_count
    from projects p
    where p.id = ${projectId}
      and (
        p.owner_id = ${userId}
        or exists (
          select 1 from team_members m
          where m.team_id = p.team_id and m.user_id = ${userId}
        )
      )
  `;
  const row = rows[0];
  if (!row) throw new Error("That project is not on your bench.");
  return row;
}

async function assertTeamRole(sql: Sql, userId: string, teamId: string, ownerOnly: boolean): Promise<"owner" | "member"> {
  const rows = await sql<{ role: "owner" | "member" }>`
    select role from team_members where team_id = ${teamId} and user_id = ${userId}
  `;
  const role = rows[0]?.role;
  if (!role) throw new Error("You are not on that team.");
  if (ownerOnly && role !== "owner") throw new Error("Only the person who created the team can do that.");
  return role;
}

function summary(row: {
  id: string;
  title: string;
  campus: string;
  chosen_route_name: string | null;
  step_count: number;
  checks_done: number;
  deadline: string | null;
  updated_at: string;
  team_id: string | null;
  team_name: string | null;
  owner_id: string;
}, userId: string): ProjectSummary {
  const campus: Campus = row.campus === "yale" ? "yale" : "open";
  return {
    id: row.id,
    title: row.title,
    campus,
    routeName: row.chosen_route_name,
    stepCount: Number(row.step_count) || 0,
    checksDone: Number(row.checks_done) || 0,
    deadline: row.deadline,
    updatedAt: row.updated_at,
    teamId: row.team_id,
    teamName: row.team_name,
    owner: row.owner_id === userId,
  };
}

export const listProjects = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProjectSummary[]> => {
    const sql = await getSql();
    const rows = await sql<Parameters<typeof summary>[0]>`
      select p.id, p.title, p.campus, p.chosen_route_name, p.step_count, p.deadline::text as deadline,
             p.updated_at::text as updated_at, p.team_id, p.owner_id, t.name as team_name,
             (select count(*) from project_checks c where c.project_id = p.id) as checks_done
      from projects p
      left join teams t on t.id = p.team_id
      where p.owner_id = ${context.userId}
         or exists (
           select 1 from team_members m where m.team_id = p.team_id and m.user_id = ${context.userId}
         )
      order by p.updated_at desc
      limit 60
    `;
    return rows.map((row) => summary(row, context.userId));
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { brief?: string; constraints?: unknown; campus?: string; routeId?: string | null; doneStepIds?: string[] }) => input)
  .handler(async ({ context, data }) => {
    const brief = String(data.brief ?? "").trim();
    if (brief.length < 12 || brief.length > 4000) {
      throw new Error("Describe the project in one full sentence, under 4000 characters.");
    }
    const campus: Campus = data.campus === "yale" ? "yale" : "open";
    const constraints = parseConstraints(data.constraints);
    const plan = analyzeForCampus(brief, constraints, campus);
    const route = plan.routes.find((item) => item.id === data.routeId) ?? plan.routes[0];
    if (!route) throw new Error("That brief did not produce a plan. Add what the part has to survive.");
    const sql = await getSql();
    const countRows = await sql<{ n: number }>`select count(*) as n from projects where owner_id = ${context.userId}`;
    if (Number(countRows[0]?.n ?? 0) >= 40) throw new Error("Forty saved projects is the cap. Finish one or delete one.");
    const id = randomUUID();
    const title = plan.title.slice(0, 140) || "Untitled project";
    await sql`
      insert into projects (
        id, owner_id, title, brief, campus, constraints, chosen_route_id, chosen_route_name, blueprint, step_count
      ) values (
        ${id}, ${context.userId}, ${title}, ${brief}, ${campus},
        ${JSON.stringify(constraints)}::jsonb, ${route.id}, ${route.name},
        ${JSON.stringify(plan)}::jsonb, ${route.steps.length}
      )
    `;
    const wanted = new Set((data.doneStepIds ?? []).filter((stepId) => route.steps.some((step) => step.id === stepId)));
    for (const stepId of wanted) {
      await sql`
        insert into project_checks (project_id, step_id, done_by) values (${id}, ${stepId}, ${context.userId})
        on conflict do nothing
      `;
    }
    return { id };
  });

export const getProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => ({ id: cleanId(input?.id) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await loadProject(sql, context.userId, data.id);
    const plan = planOf(row.blueprint);
    const checks = await sql<{ step_id: string }>`select step_id from project_checks where project_id = ${row.id}`;
    const bom = await sql<{ line_id: string; status: BomStatus }>`select line_id, status from project_bom where project_id = ${row.id}`;
    const decisions = await sql<{ id: string; body: string; created_at: string; author: string }>`
      select d.id, d.body, d.created_at::text as created_at, coalesce(nullif(u.name, ''), 'Teammate') as author
      from decisions d
      left join "user" u on u.id = d.user_id
      where d.project_id = ${row.id}
      order by d.created_at desc
      limit 40
    `;
    const teams = await sql<{ id: string; name: string }>`
      select t.id, t.name
      from teams t
      join team_members m on m.team_id = t.id
      where m.user_id = ${context.userId}
      order by t.name
    `;
    const teamName = row.team_id
      ? (await sql<{ name: string }>`select name from teams where id = ${row.team_id}`)[0]?.name ?? null
      : null;
    return {
      project: {
        id: row.id,
        title: row.title,
        brief: row.brief,
        campus: (row.campus === "yale" ? "yale" : "open") as Campus,
        deadline: row.deadline,
        teamId: row.team_id,
        teamName,
        owner: row.owner_id === context.userId,
        chosenRouteId: row.chosen_route_id,
        constraints: parseConstraints(jsonValue(row.constraints)),
      },
      blueprint: plan,
      checks: checks.map((item) => item.step_id),
      bom: Object.fromEntries(bom.map((item) => [item.line_id, item.status])) as Record<string, BomStatus>,
      decisions: decisions.map((item): DecisionItem => ({
        id: item.id,
        body: item.body,
        createdAt: item.created_at,
        author: item.author,
      })),
      teams,
    };
  });

export const setCheck = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; stepId?: string; done?: boolean }) => ({
    id: cleanId(input?.id),
    stepId: String(input?.stepId ?? "").slice(0, 80),
    done: Boolean(input?.done),
  }))
  .handler(async ({ context, data }) => {
    if (!data.stepId) throw new Error("Missing step.");
    const sql = await getSql();
    const row = await loadProject(sql, context.userId, data.id);
    const plan = planOf(row.blueprint);
    const known = plan.routes.some((route) => route.steps.some((step) => step.id === data.stepId));
    if (!known) throw new Error("That step is not on this plan.");
    if (data.done) {
      await sql`
        insert into project_checks (project_id, step_id, done_by) values (${data.id}, ${data.stepId}, ${context.userId})
        on conflict (project_id, step_id) do update set done_by = ${context.userId}
      `;
    } else {
      await sql`delete from project_checks where project_id = ${data.id} and step_id = ${data.stepId}`;
    }
    await sql`update projects set updated_at = now() where id = ${data.id}`;
    return { ok: true as const };
  });

export const setBomStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; lineId?: string; status?: string }) => {
    const status = input?.status;
    if (status !== "need" && status !== "ordered" && status !== "in_hand") throw new Error("Unknown stock status.");
    return { id: cleanId(input?.id), lineId: String(input?.lineId ?? "").slice(0, 80), status };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await loadProject(sql, context.userId, data.id);
    const plan = planOf(row.blueprint);
    const known = plan.routes.some((route) => route.bom.some((line) => line.id === data.lineId));
    if (!known) throw new Error("That line is not on this plan.");
    if (data.status === "need") {
      await sql`delete from project_bom where project_id = ${data.id} and line_id = ${data.lineId}`;
    } else {
      await sql`
        insert into project_bom (project_id, line_id, status) values (${data.id}, ${data.lineId}, ${data.status})
        on conflict (project_id, line_id) do update set status = ${data.status}
      `;
    }
    await sql`update projects set updated_at = now() where id = ${data.id}`;
    return { ok: true as const };
  });

export const setRoute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; routeId?: string }) => ({
    id: cleanId(input?.id),
    routeId: String(input?.routeId ?? "").slice(0, 80),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await loadProject(sql, context.userId, data.id);
    const plan = planOf(row.blueprint);
    const route = plan.routes.find((item) => item.id === data.routeId);
    if (!route) throw new Error("That route is not on this plan.");
    await sql`
      update projects
      set chosen_route_id = ${route.id}, chosen_route_name = ${route.name}, step_count = ${route.steps.length}, updated_at = now()
      where id = ${data.id}
    `;
    return { ok: true as const };
  });

export const setDeadline = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; deadline?: string | null }) => {
    const raw = input?.deadline;
    if (raw == null || raw === "") return { id: cleanId(input?.id), deadline: null as string | null };
    if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Use a real date.");
    return { id: cleanId(input?.id), deadline: raw };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await loadProject(sql, context.userId, data.id);
    await sql`update projects set deadline = ${data.deadline}, updated_at = now() where id = ${data.id}`;
    return { ok: true as const };
  });

export const renameProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; title?: string }) => {
    const title = String(input?.title ?? "").trim();
    if (title.length < 2 || title.length > 140) throw new Error("Give the project a short name.");
    return { id: cleanId(input?.id), title };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await loadProject(sql, context.userId, data.id);
    await sql`update projects set title = ${data.title}, updated_at = now() where id = ${data.id}`;
    return { ok: true as const };
  });

export const addDecision = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; body?: string }) => {
    const body = String(input?.body ?? "").trim();
    if (body.length < 2 || body.length > 500) throw new Error("Write the decision in a sentence or two.");
    return { id: cleanId(input?.id), body };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await loadProject(sql, context.userId, data.id);
    const count = await sql<{ n: number }>`select count(*) as n from decisions where project_id = ${data.id}`;
    if (Number(count[0]?.n ?? 0) >= 40) throw new Error("This log is full. The newest 40 decisions stay.");
    const id = randomUUID();
    await sql`
      insert into decisions (id, project_id, user_id, body) values (${id}, ${data.id}, ${context.userId}, ${data.body})
    `;
    await sql`update projects set updated_at = now() where id = ${data.id}`;
    return { id };
  });

export const shareProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; teamId?: string | null }) => ({
    id: cleanId(input?.id),
    teamId: input?.teamId ? cleanId(input.teamId) : null,
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await loadProject(sql, context.userId, data.id);
    if (row.owner_id !== context.userId) throw new Error("Only the person who saved this project can change who it is shared with.");
    if (data.teamId) await assertTeamRole(sql, context.userId, data.teamId, false);
    const updated = await sql<{ id: string }>`
      update projects set team_id = ${data.teamId}, updated_at = now()
      where id = ${data.id} and owner_id = ${context.userId}
      returning id
    `;
    if (!updated[0]) throw new Error("Could not update sharing.");
    return { ok: true as const };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => ({ id: cleanId(input?.id) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const removed = await sql<{ id: string }>`
      delete from projects where id = ${data.id} and owner_id = ${context.userId} returning id
    `;
    if (!removed[0]) throw new Error("Only the person who saved this project can delete it.");
    return { ok: true as const };
  });

export const recalculateProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => ({ id: cleanId(input?.id) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await loadProject(sql, context.userId, data.id);
    const campus: Campus = row.campus === "yale" ? "yale" : "open";
    const constraints = parseConstraints(jsonValue(row.constraints));
    const plan = analyzeForCampus(row.brief, constraints, campus);
    const route = plan.routes.find((item) => item.id === row.chosen_route_id) ?? plan.routes[0];
    if (!route) throw new Error("Recalculate did not produce a route.");
    await sql`
      update projects
      set title = ${plan.title.slice(0, 140)},
          blueprint = ${JSON.stringify(plan)}::jsonb,
          chosen_route_id = ${route.id},
          chosen_route_name = ${route.name},
          step_count = ${route.steps.length},
          updated_at = now()
      where id = ${data.id}
    `;
    const keep = new Set(route.steps.map((step) => step.id));
    const existing = await sql<{ step_id: string }>`select step_id from project_checks where project_id = ${data.id}`;
    for (const item of existing) {
      if (!keep.has(item.step_id)) {
        await sql`delete from project_checks where project_id = ${data.id} and step_id = ${item.step_id}`;
      }
    }
    return { ok: true as const };
  });

export const listTeams = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<TeamSummary[]> => {
    const sql = await getSql();
    const rows = await sql<{ id: string; name: string; role: "owner" | "member"; invite_code: string; members: number }>`
      select t.id, t.name, m.role, t.invite_code,
             (select count(*) from team_members c where c.team_id = t.id) as members
      from teams t
      join team_members m on m.team_id = t.id and m.user_id = ${context.userId}
      order by t.name
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      inviteCode: row.invite_code,
      members: Number(row.members) || 0,
    }));
  });

export const createTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name?: string }) => {
    const name = String(input?.name ?? "").trim();
    if (name.length < 2 || name.length > 80) throw new Error("Name the team in a few words.");
    return { name };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const count = await sql<{ n: number }>`select count(*) as n from teams where created_by = ${context.userId}`;
    if (Number(count[0]?.n ?? 0) >= 12) throw new Error("Twelve teams is the cap.");
    const id = randomUUID();
    const code = inviteCode();
    await sql`
      with created as (
        insert into teams (id, name, invite_code, created_by)
        values (${id}, ${data.name}, ${code}, ${context.userId})
        returning id
      )
      insert into team_members (team_id, user_id, role)
      select id, ${context.userId}, 'owner' from created
    `;
    return { id };
  });

export const joinTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { code?: string }) => {
    const code = String(input?.code ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length < 6 || code.length > 12) throw new Error("Enter the team code.");
    return { code };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const teams = await sql<{ id: string }>`select id from teams where invite_code = ${data.code}`;
    const team = teams[0];
    if (!team) throw new Error("That code does not match a team.");
    const size = await sql<{ n: number }>`select count(*) as n from team_members where team_id = ${team.id}`;
    if (Number(size[0]?.n ?? 0) >= 24) throw new Error("That team is full.");
    await sql`
      insert into team_members (team_id, user_id, role) values (${team.id}, ${context.userId}, 'member')
      on conflict (team_id, user_id) do nothing
    `;
    return { id: team.id };
  });

export const getTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => ({ id: cleanId(input?.id) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const role = await assertTeamRole(sql, context.userId, data.id, false);
    const teams = await sql<{ id: string; name: string; invite_code: string }>`
      select id, name, invite_code from teams where id = ${data.id}
    `;
    const team = teams[0];
    if (!team) throw new Error("That team is gone.");
    const members = await sql<{ id: string; name: string; role: "owner" | "member" }>`
      select u.id, coalesce(nullif(u.name, ''), 'Teammate') as name, m.role
      from team_members m
      join "user" u on u.id = m.user_id
      where m.team_id = ${data.id}
      order by m.joined_at
    `;
    const projects = await sql<Parameters<typeof summary>[0]>`
      select p.id, p.title, p.campus, p.chosen_route_name, p.step_count, p.deadline::text as deadline,
             p.updated_at::text as updated_at, p.team_id, p.owner_id, t.name as team_name,
             (select count(*) from project_checks c where c.project_id = p.id) as checks_done
      from projects p
      left join teams t on t.id = p.team_id
      where p.team_id = ${data.id}
      order by p.updated_at desc
    `;
    return {
      team: { id: team.id, name: team.name, inviteCode: team.invite_code, role },
      members: members.map((member): TeamMember => ({ id: member.id, name: member.name, role: member.role })),
      projects: projects.map((row) => summary(row, context.userId)),
    };
  });

export const rotateInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => ({ id: cleanId(input?.id) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await assertTeamRole(sql, context.userId, data.id, true);
    const code = inviteCode();
    await sql`update teams set invite_code = ${code} where id = ${data.id}`;
    return { inviteCode: code };
  });

export const deleteTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => ({ id: cleanId(input?.id) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await assertTeamRole(sql, context.userId, data.id, true);
    await sql`update projects set team_id = null where team_id = ${data.id}`;
    await sql`delete from teams where id = ${data.id}`;
    return { ok: true as const };
  });
