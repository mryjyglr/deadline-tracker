import { useEffect, useMemo, useState } from "react";

type Priority = "Low" | "Medium" | "High";
type AssignmentStatus = "Pending" | "Completed" | "Overdue";

type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dateAdded: string;
  deadline: string;
  priority: Priority;
  completedAt?: string;
};

type IconName =
  | "book"
  | "calendar"
  | "check"
  | "clock"
  | "edit"
  | "eye"
  | "plus"
  | "search"
  | "trash"
  | "warning"
  | "x";

const iconPaths: Record<IconName, React.ReactNode> = {
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4m8-4v4M3 10h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V4h8v2m3 0-1 16H6L5 6m5 4v7m4-7v7" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 3.4 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.4a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

const STORAGE_KEY = "studytrack-assignments-v1";
const todayIso = () => new Date().toISOString().slice(0, 10);
const shiftDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const sampleAssignments = (): Assignment[] => [
  {
    id: "sample-1",
    title: "Research Paper Outline",
    subject: "English Literature",
    description:
      "Prepare a structured outline with a thesis statement, three supporting arguments, and at least five academic sources.",
    dateAdded: shiftDate(-3),
    deadline: shiftDate(2),
    priority: "High",
  },
  {
    id: "sample-2",
    title: "Trigonometry Problem Set",
    subject: "Mathematics",
    description: "Complete exercises 1–25 from Chapter 8. Show all working and submit as one PDF.",
    dateAdded: shiftDate(-2),
    deadline: shiftDate(5),
    priority: "Medium",
  },
  {
    id: "sample-3",
    title: "Cell Structure Lab Report",
    subject: "Biology",
    description:
      "Write the lab report using the provided template and include the microscope observation diagram.",
    dateAdded: shiftDate(-9),
    deadline: shiftDate(-1),
    priority: "High",
  },
  {
    id: "sample-4",
    title: "Industrial Revolution Timeline",
    subject: "World History",
    description:
      "Create a timeline of twelve major events and add a short explanation for each milestone.",
    dateAdded: shiftDate(-10),
    deadline: shiftDate(-3),
    priority: "Low",
    completedAt: shiftDate(-4),
  },
  {
    id: "sample-5",
    title: "Reading Reflection",
    subject: "English Literature",
    description: "Write a 500-word reflection on the assigned short story.",
    dateAdded: todayIso(),
    deadline: todayIso(),
    priority: "Medium",
  },
];

const emptyForm = (): Omit<Assignment, "id" | "completedAt"> => ({
  title: "",
  subject: "",
  description: "",
  dateAdded: todayIso(),
  deadline: "",
  priority: "Medium",
});

function getStatus(assignment: Assignment): AssignmentStatus {
  if (assignment.completedAt) return "Completed";
  return assignment.deadline < todayIso() ? "Overdue" : "Pending";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function daysUntil(date: string) {
  const today = new Date(`${todayIso()}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

const statusStyles: Record<AssignmentStatus, string> = {
  Pending: "bg-[#F4EEE4] text-[#846D4D] ring-[#E8DCC9]",
  Completed: "bg-[#E7EFE9] text-[#5F7D67] ring-[#D2E2D6]",
  Overdue: "bg-[#F3E6E7] text-[#936269] ring-[#E6CFD2]",
};

const priorityStyles: Record<Priority, string> = {
  Low: "text-[#707985] bg-[#F0F2F4]",
  Medium: "text-[#62778E] bg-[#EBF0F4]",
  High: "text-[#876166] bg-[#F2E9EA]",
};

function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function App() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : sampleAssignments();
    } catch {
      return sampleAssignments();
    }
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AssignmentStatus>("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [modal, setModal] = useState<"form" | "view" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Assignment | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    if (!modal && !deleteTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModal(null);
        setDeleteTarget(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, deleteTarget]);

  const subjects = useMemo(
    () => [...new Set(assignments.map((item) => item.subject))].sort(),
    [assignments],
  );
  const stats = useMemo(
    () => ({
      total: assignments.length,
      pending: assignments.filter((item) => getStatus(item) === "Pending").length,
      completed: assignments.filter((item) => getStatus(item) === "Completed").length,
      overdue: assignments.filter((item) => getStatus(item) === "Overdue").length,
    }),
    [assignments],
  );

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assignments
      .filter(
        (item) =>
          !term ||
          item.title.toLowerCase().includes(term) ||
          item.subject.toLowerCase().includes(term),
      )
      .filter((item) => statusFilter === "All" || getStatus(item) === statusFilter)
      .filter((item) => subjectFilter === "All" || item.subject === subjectFilter)
      .filter((item) => priorityFilter === "All" || item.priority === priorityFilter)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [assignments, search, statusFilter, subjectFilter, priorityFilter]);

  const reminders = useMemo(
    () =>
      assignments
        .filter((item) => !item.completedAt && daysUntil(item.deadline) <= 7)
        .sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [assignments],
  );

  const history = useMemo(
    () =>
      assignments
        .filter((item) => getStatus(item) !== "Pending")
        .sort((a, b) => b.deadline.localeCompare(a.deadline)),
    [assignments],
  );

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setErrors({});
    setModal("form");
  };

  const openEdit = (assignment: Assignment) => {
    const { id, completedAt, ...values } = assignment;
    setForm(values);
    setEditingId(id);
    setErrors({});
    setModal("form");
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Assignment title is required.";
    if (!form.subject.trim()) nextErrors.subject = "Subject name is required.";
    if (!form.dateAdded) nextErrors.dateAdded = "Date added is required.";
    if (!form.deadline) nextErrors.deadline = "Submission deadline is required.";
    if (form.dateAdded && form.deadline && form.deadline < form.dateAdded)
      nextErrors.deadline = "Deadline cannot be before the date added.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveAssignment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    if (editingId) {
      setAssignments((current) =>
        current.map((item) => (item.id === editingId ? { ...item, ...form } : item)),
      );
    } else {
      setAssignments((current) => [{ ...form, id: crypto.randomUUID() }, ...current]);
    }
    setModal(null);
  };

  const markCompleted = (id: string) => {
    setAssignments((current) =>
      current.map((item) => (item.id === id ? { ...item, completedAt: todayIso() } : item)),
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSubjectFilter("All");
    setPriorityFilter("All");
  };

  return (
    <div className="app-shell min-h-screen text-[#24364B]">
      <header className="relative z-20 border-b border-white/15 bg-[#103E7B]/55 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/12 text-white shadow-[0_6px_18px_rgba(6,34,77,0.18)]">
              <Icon name="book" size={21} />
            </div>
            <div className="min-w-0">
              <p className="hidden max-w-[330px] truncate text-sm font-semibold tracking-tight text-white sm:block lg:text-[15px]">
                Student Assignment and Deadline Monitoring System
              </p>
              <p className="text-[17px] font-bold tracking-tight text-white sm:hidden">
                StudyTrack
              </p>
              <p className="text-xs text-blue-100/70">Academic task workspace</p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {[
              ["Dashboard", "#dashboard"],
              ["Assignments", "#assignments"],
              ["Upcoming Deadlines", "#upcoming"],
              ["History", "#history"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-50/80 transition hover:bg-white/10 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-sm text-blue-50/90 xl:flex">
            <Icon name="calendar" size={16} />
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date())}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <section
          id="dashboard"
          className="scroll-mt-24 mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100/75">
              Academic command center
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-white lg:text-[34px]">
              Welcome back, Student
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50/75">
              Stay ahead of every deadline and keep your schoolwork moving forward.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#164A91] shadow-[0_8px_24px_rgba(5,30,69,0.18)] transition hover:bg-[#EAF2FC] focus:outline-none focus:ring-4 focus:ring-white/25"
          >
            <Icon name="plus" size={18} /> Add Assignment
          </button>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Assignments",
              value: stats.total,
              icon: "book" as IconName,
              color: "bg-[#EAF2FC] text-[#2864B5]",
            },
            {
              label: "Pending Assignments",
              value: stats.pending,
              icon: "clock" as IconName,
              color: "bg-[#EDF4FC] text-[#3970B7]",
            },
            {
              label: "Completed Assignments",
              value: stats.completed,
              icon: "check" as IconName,
              color: "bg-[#E8F2F0] text-[#4B7B74]",
            },
            {
              label: "Overdue Assignments",
              value: stats.overdue,
              icon: "warning" as IconName,
              color: "bg-[#F4E9EB] text-[#98646C]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/70 bg-white p-4 shadow-[0_12px_32px_rgba(7,35,76,0.12)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#708096] sm:text-sm">{stat.label}</p>
                  <p className="mt-2 text-[28px] font-semibold tracking-tight text-[#24364B]">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-lg ${stat.color}`}
                >
                  <Icon name={stat.icon} size={19} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section
          id="assignments"
          className="scroll-mt-24 mb-8 rounded-2xl border border-white/70 bg-white shadow-[0_12px_34px_rgba(7,35,76,0.12)]"
        >
          <div className="border-b border-[#E2E9F1] p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#24364B]">Assignments</h2>
                <p className="mt-1 text-sm text-[#708096]">
                  Manage and track all of your active coursework.
                </p>
              </div>
              <p className="text-sm font-medium text-[#708096]">
                {filteredAssignments.length}{" "}
                {filteredAssignments.length === 1 ? "result" : "results"}
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(135px,.65fr))]">
              <label className="relative">
                <span className="sr-only">Search assignments</span>
                <Icon
                  name="search"
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A9B1]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title or subject..."
                  className="field pl-10"
                />
              </label>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="field"
              >
                {["All", "Pending", "Completed", "Overdue"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                aria-label="Filter by subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="field"
              >
                <option>All</option>
                {subjects.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </select>
              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                className="field"
              >
                {["All", "Low", "Medium", "High"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left">
              <thead>
                <tr className="border-b border-[#E2E9F1] bg-[#F5F8FC] text-[11px] uppercase tracking-[0.08em] text-[#708096]">
                  <th className="px-5 py-3.5 font-semibold">Assignment</th>
                  <th className="px-4 py-3.5 font-semibold">Subject</th>
                  <th className="px-4 py-3.5 font-semibold">Date Added</th>
                  <th className="px-4 py-3.5 font-semibold">Deadline</th>
                  <th className="px-4 py-3.5 font-semibold">Priority</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {filteredAssignments.map((assignment) => {
                  const status = getStatus(assignment);
                  return (
                    <tr key={assignment.id} className="transition hover:bg-[#FAFAFB]">
                      <td className="px-5 py-4">
                        <p className="max-w-[240px] truncate text-sm font-semibold text-[#24364B]">
                          {assignment.title}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#68717D]">{assignment.subject}</td>
                      <td className="px-4 py-4 text-sm text-[#708096]">
                        {formatDate(assignment.dateAdded)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-[#566170]">
                        {formatDate(assignment.deadline)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${priorityStyles[assignment.priority]}`}
                        >
                          {assignment.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton
                            label="View"
                            icon="eye"
                            onClick={() => {
                              setViewing(assignment);
                              setModal("view");
                            }}
                          />
                          <ActionButton
                            label="Edit"
                            icon="edit"
                            onClick={() => openEdit(assignment)}
                          />
                          {status !== "Completed" && (
                            <ActionButton
                              label="Mark completed"
                              icon="check"
                              onClick={() => markCompleted(assignment.id)}
                              success
                            />
                          )}
                          <ActionButton
                            label="Delete"
                            icon="trash"
                            onClick={() => setDeleteTarget(assignment)}
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAssignments.length === 0 && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#F0F2F4] text-[#9BA2AB]">
                  <Icon name="search" size={21} />
                </div>
                <h3 className="mt-3 font-semibold text-[#24364B]">No assignments found</h3>
                <p className="mt-1 text-sm text-[#708096]">
                  Try changing your search or filter criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm font-semibold text-[#2864B5] hover:text-[#164A91]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <div
            id="upcoming"
            className="scroll-mt-24 rounded-2xl border border-white/70 bg-white p-5 shadow-[0_12px_34px_rgba(7,35,76,0.12)]"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-[#EAF2FC] text-[#2864B5]">
                <Icon name="clock" size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-[#24364B]">Reminders & Upcoming</h2>
                <p className="text-xs text-[#708096]">Deadlines within the next 7 days</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {reminders.map((assignment) => {
                const days = daysUntil(assignment.deadline);
                const urgent = days <= 0;
                return (
                  <div
                    key={assignment.id}
                    className={`flex items-center justify-between gap-4 rounded-xl border p-3.5 ${urgent ? "border-[#E6CFD2] bg-[#FBF7F7]" : "border-[#DDE8F5] bg-[#F5F8FC]"}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#24364B]">
                        {assignment.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#708096]">
                        {assignment.subject} · {formatDate(assignment.deadline)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${urgent ? "bg-[#F3E6E7] text-[#936269]" : "bg-[#EBF0F4] text-[#62778E]"}`}
                    >
                      {days < 0
                        ? `${Math.abs(days)}d overdue`
                        : days === 0
                          ? "Due today"
                          : days === 1
                            ? "1 day left"
                            : `${days} days left`}
                    </span>
                  </div>
                );
              })}
              {reminders.length === 0 && (
                <p className="rounded-lg bg-[#F5F7FA] p-6 text-center text-sm text-[#708096]">
                  No deadlines in the next 7 days.
                </p>
              )}
            </div>
          </div>

          <div
            id="history"
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_12px_34px_rgba(7,35,76,0.12)]"
          >
            <div className="border-b border-[#E2E9F1] p-5">
              <h2 className="font-semibold text-[#24364B]">Assignment History</h2>
              <p className="mt-1 text-xs text-[#708096]">
                Completed and overdue assignment records
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-[#F5F8FC] text-[11px] uppercase tracking-[0.08em] text-[#708096]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Assignment</th>
                    <th className="px-4 py-3 font-semibold">Deadline</th>
                    <th className="px-4 py-3 font-semibold">Completed</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F2]">
                  {history.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-[#24364B]">{assignment.title}</p>
                        <p className="text-xs text-[#708096]">{assignment.subject}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#68717D]">
                        {formatDate(assignment.deadline)}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#708096]">
                        {assignment.completedAt ? formatDate(assignment.completedAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={getStatus(assignment)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <p className="p-8 text-center text-sm text-[#858C96]">
                  Your assignment history will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
        <footer className="border-t border-white/15 py-5 text-center text-xs text-blue-100/65">
          StudyTrack · Your academic tasks, clearly organized
        </footer>
      </main>

      {modal === "form" && (
        <Modal
          title={editingId ? "Edit Assignment" : "Add New Assignment"}
          subtitle={
            editingId
              ? "Update the assignment details below."
              : "Add the details and deadline for your new task."
          }
          onClose={() => setModal(null)}
        >
          <form onSubmit={saveAssignment} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Assignment Title" required error={errors.title}>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`field ${errors.title ? "field-error" : ""}`}
                  placeholder="e.g. Chemistry Lab Report"
                />
              </FormField>
              <FormField label="Subject Name" required error={errors.subject}>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={`field ${errors.subject ? "field-error" : ""}`}
                  placeholder="e.g. Chemistry"
                />
              </FormField>
            </div>
            <FormField label="Description or Instructions">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="field min-h-24 resize-y"
                placeholder="Add instructions, resources, or notes..."
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Date Added" required error={errors.dateAdded}>
                <input
                  type="date"
                  value={form.dateAdded}
                  onChange={(e) => setForm({ ...form, dateAdded: e.target.value })}
                  className={`field ${errors.dateAdded ? "field-error" : ""}`}
                />
              </FormField>
              <FormField label="Submission Deadline" required error={errors.deadline}>
                <input
                  type="date"
                  min={form.dateAdded}
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className={`field ${errors.deadline ? "field-error" : ""}`}
                />
              </FormField>
            </div>
            <FormField label="Priority" required>
              <div className="grid grid-cols-3 gap-2">
                {(["Low", "Medium", "High"] as Priority[]).map((priority) => (
                  <button
                    type="button"
                    key={priority}
                    onClick={() => setForm({ ...form, priority })}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${form.priority === priority ? "border-[#2864B5] bg-[#EAF2FC] text-[#164A91] ring-1 ring-[#2864B5]" : "border-[#E2E9F1] text-[#68717D] hover:bg-[#F5F7FA]"}`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </FormField>
            <div className="flex justify-end gap-3 border-t border-[#E8EBEF] pt-5">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Save Changes" : "Save Assignment"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "view" && viewing && (
        <Modal title={viewing.title} subtitle={viewing.subject} onClose={() => setModal(null)}>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={getStatus(viewing)} />
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${priorityStyles[viewing.priority]}`}
              >
                {viewing.priority} Priority
              </span>
            </div>
            <div className="rounded-xl border border-[#E8EBEF] bg-[#FAFAFB] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#858C96]">
                Description / Instructions
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#566170]">
                {viewing.description || "No additional instructions provided."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Date Added" value={formatDate(viewing.dateAdded)} />
              <Detail label="Submission Deadline" value={formatDate(viewing.deadline)} />
              <Detail label="Subject" value={viewing.subject} />
              <Detail
                label="Completion Date"
                value={viewing.completedAt ? formatDate(viewing.completedAt) : "Not completed"}
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-[#E8EBEF] pt-5">
              <button onClick={() => setModal(null)} className="btn-secondary">
                Close
              </button>
              <button onClick={() => openEdit(viewing)} className="btn-primary">
                <Icon name="edit" size={16} /> Edit Assignment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E8EBEF] bg-white p-6 shadow-[0_24px_64px_rgba(48,56,70,0.16)]">
            <div className="grid size-11 place-items-center rounded-full bg-[#F3E6E7] text-[#936269]">
              <Icon name="trash" size={20} />
            </div>
            <h2 id="delete-title" className="mt-4 text-lg font-semibold text-[#303846]">
              Delete assignment?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#858C96]">
              This will permanently remove “{deleteTarget.title}” and its history. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  setAssignments((current) =>
                    current.filter((item) => item.id !== deleteTarget.id),
                  );
                  setDeleteTarget(null);
                }}
                className="inline-flex h-10 items-center rounded-lg bg-[#936269] px-4 text-sm font-semibold text-white transition hover:bg-[#7E5359]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  danger,
  success,
}: {
  label: string;
  icon: IconName;
  onClick: () => void;
  danger?: boolean;
  success?: boolean;
}) {
  const color = danger
    ? "hover:bg-[#F3E6E7] hover:text-[#936269]"
    : success
      ? "hover:bg-[#E7EFE9] hover:text-[#5F7D67]"
      : "hover:bg-[#EAF2FC] hover:text-[#2864B5]";
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid size-8 place-items-center rounded-md text-[#A3A9B1] transition ${color}`}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E8EBEF] bg-white shadow-[0_24px_64px_rgba(48,56,70,0.16)]">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E8EBEF] bg-white px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold tracking-tight text-[#303846]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#858C96]">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-md text-[#A3A9B1] hover:bg-[#F0F2F4] hover:text-[#566170]"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#566170]">
        {label}
        {required && <span className="ml-1 text-[#A46C73]">*</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-[#A46C73]">{error}</span>}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#9BA2AB]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#303846]">{value}</p>
    </div>
  );
}

export default App;
