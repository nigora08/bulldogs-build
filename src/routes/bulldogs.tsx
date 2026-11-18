import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MakerMap } from "@/components/maker-map";
import { Shell } from "@/components/shell";
import { createProject } from "@/lib/studio.functions";
import { errorText } from "@/lib/studio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/bulldogs")({ component: BulldogsPage });

function BulldogsPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  return (
    <Shell>
      <MakerMap
        campus="yale"
        framed
        saving={saving}
        saveNote={note}
        onSave={(payload) => {
          const data = { ...payload, campus: "yale" as const };
          if (!user) {
            try {
              sessionStorage.setItem("datum-pending-save", JSON.stringify(data));
            } catch {
              setNote("Sign in to save this plan.");
            }
            void navigate({ to: "/login", search: { next: "/bulldogs" } });
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
