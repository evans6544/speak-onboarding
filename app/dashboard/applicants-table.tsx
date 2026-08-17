"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { Applicant } from "@/lib/applicants";
import { deleteApplicant, type DeleteApplicantState } from "./actions";

type SortKey =
  | "full_name"
  | "email"
  | "position"
  | "current_occupation"
  | "stage1_decision"
  | "task_sent"
  | "task_submitted"
  | "final_decision"
  | "created_at";

type SortDirection = "ascending" | "descending";
type DecisionValue = Applicant["stage1_decision"] | Applicant["final_decision"];

const initialDeleteState: DeleteApplicantState = {
  success: false,
  message: "",
};

const tableHeadClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

const tableCellClassName =
  "whitespace-nowrap px-4 py-4 text-sm text-zinc-700 dark:text-zinc-300";

const decisionStyles: Record<DecisionValue, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  selected:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  rejected:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vilnius",
  }).format(new Date(value));
}

function DecisionBadge({ value }: { value: DecisionValue }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${decisionStyles[value]}`}
    >
      {value}
    </span>
  );
}

function BooleanBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        value
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeSortKey === sortKey;

  return (
    <th
      scope="col"
      aria-sort={isActive ? direction : "none"}
      className={tableHeadClassName}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        {label}
        <span aria-hidden="true" className="text-sm">
          {isActive ? (direction === "ascending" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function getSortValue(applicant: Applicant, key: SortKey) {
  if (key === "created_at") {
    return new Date(applicant.created_at).getTime();
  }

  if (key === "task_sent" || key === "task_submitted") {
    return Number(applicant[key]);
  }

  return applicant[key].toLocaleLowerCase();
}

export default function ApplicantsTable({
  applicants,
}: {
  applicants: Applicant[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [direction, setDirection] =
    useState<SortDirection>("descending");
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteApplicant,
    initialDeleteState,
  );

  const sortedApplicants = useMemo(() => {
    return [...applicants].sort((first, second) => {
      const firstValue = getSortValue(first, sortKey);
      const secondValue = getSortValue(second, sortKey);
      const comparison =
        typeof firstValue === "number" && typeof secondValue === "number"
          ? firstValue - secondValue
          : String(firstValue).localeCompare(String(secondValue));

      return direction === "ascending" ? comparison : -comparison;
    });
  }, [applicants, direction, sortKey]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((current) =>
        current === "ascending" ? "descending" : "ascending",
      );
      return;
    }

    setSortKey(key);
    setDirection(key === "created_at" ? "descending" : "ascending");
  }

  return (
    <section className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
        </p>
      </div>

      {deleteState.message ? (
        <div
          role="status"
          className={`border-b px-5 py-3 text-sm ${
            deleteState.success
              ? "border-emerald-900 bg-emerald-950 text-emerald-200"
              : "border-red-900 bg-red-950 text-red-200"
          }`}
        >
          {deleteState.message}
        </div>
      ) : null}

      {applicants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <SortableHeader label="Full Name" sortKey="full_name" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Email" sortKey="email" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Position" sortKey="position" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Current Occupation" sortKey="current_occupation" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Stage 1 Decision" sortKey="stage1_decision" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Task Sent" sortKey="task_sent" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Task Submitted" sortKey="task_submitted" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Final Decision" sortKey="final_decision" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <SortableHeader label="Created At" sortKey="created_at" activeSortKey={sortKey} direction={direction} onSort={handleSort} />
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sortedApplicants.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <td className={`${tableCellClassName} font-medium`}>{applicant.full_name}</td>
                  <td className={tableCellClassName}>{applicant.email}</td>
                  <td className={tableCellClassName}>{applicant.position}</td>
                  <td className={tableCellClassName}>{applicant.current_occupation}</td>
                  <td className={tableCellClassName}><DecisionBadge value={applicant.stage1_decision} /></td>
                  <td className={tableCellClassName}><BooleanBadge value={applicant.task_sent} /></td>
                  <td className={tableCellClassName}><BooleanBadge value={applicant.task_submitted} /></td>
                  <td className={tableCellClassName}><DecisionBadge value={applicant.final_decision} /></td>
                  <td className={tableCellClassName}>{formatDate(applicant.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/${applicant.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        View
                      </Link>
                      <form
                        action={deleteAction}
                        onSubmit={(event) => {
                          if (!window.confirm(`Delete ${applicant.full_name}'s application? This cannot be undone.`)) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="applicantId" value={applicant.id} />
                        <button
                          type="submit"
                          disabled={deletePending}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-16 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            No applicants yet
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            New submissions from the apply form will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
