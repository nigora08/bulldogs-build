import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MakerMap } from "@/components/maker-map";
import { Shell } from "@/components/shell";
import { createProject } from "@/lib/studio.functions";
import { errorText, type Campus } from "@/lib/studio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { Constraints } from "@/lib/engine";

export const Route = createFileRoute("/plan")({
  validateSearch: (search: Record<string, unknown>) => ({
    campus: search.campus === "yale" ? ("yale" as const) : ("open" as const),
  }),
  component: PlanPage,
});

function PlanPage() {
  const { campus } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isPending || !user) return;
    const raw = sessionStorage.getItem("datum-pending-save");
    if (!raw) return;
    sessionStorage.removeItem("datum-pending-save");
    let parsed: { brief: string; constraints: Constraints; campus: Campus; routeId: string | null; doneStepIds: string[] };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return;
    }
    setSaving(true);
    createProject({ data: parsed })
      .then((result) => {
        void navigate({ to: "/projects/$id", params: { id: result.id } });
      })
      .catch((err: unknown) => {
        setNote(errorText(err));
        setSaving(false);
      });
  }, [isPending, navigate, user]);

  return (
    <Shell>
      <MakerMap
        campus={campus}
        framed
        consumeDraft
        saving={saving}
        saveNote={note}
        onCampusChange={(next) => {
          void navigate({ to: "/plan", search: { campus: next }, replace: true });
        }}
        onSave={(payload) => {
          const data = { ...payload, campus };
          if (!user) {
            try {
              sessionStorage.setItem("datum-pending-save", JSON.stringify(data));
            } catch {
              setNote("Sign in to save this plan.");
            }
            void navigate({ to: "/login", search: { next: "/plan" } });
            return;
          }
          setSaving(true);
          setNote("");
          createProject({ data })
            .then((result) => {
              void navigate({ to: "/projects/$id", params: { id: result.id } });
            })
            .catch((err: unknown) => {
              setNote(errorText(err));
              setSaving(false);
            });
        }}
      />
    </Shell>
  );
}
