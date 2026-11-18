import { Link } from "@tanstack/react-router";
import { deadlineLabel, type ProjectSummary } from "@/lib/studio";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const total = Math.max(project.stepCount, 1);
  const done = Math.min(project.checksDone, project.stepCount);
  const width = project.stepCount === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      search={{ focus: undefined }}
      className="lift block border border-line bg-card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-cyan">
            {project.campus === "yale" ? "BULLDOGS BUILD" : "OPEN SHOP"}
            {project.teamName ? ` · ${project.teamName}` : ""}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight">{project.title}</h3>
        </div>
        <p className="shrink-0 text-right text-sm text-muted">{deadlineLabel(project.deadline)}</p>
      </div>
      <p className="mt-2 text-sm text-muted">{project.routeName ?? "No route chosen"}</p>
      <p className="mt-2 text-sm">
        {project.nextStepTitle ? `Next: ${project.nextStepTitle}` : "Chosen route is checked off."}
      </p>
      <div className="tick mt-4" aria-hidden="true">
        <span style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 font-mono text-xs text-muted">
        {done}/{project.stepCount} steps
      </p>
    </Link>
  );
}
