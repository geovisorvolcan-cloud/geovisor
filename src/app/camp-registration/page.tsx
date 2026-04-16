"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppContext, type CampParticipant } from "@/lib/appContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const CAMP_ID = "P8091";
const CAMPAIGN_NAME = "Cerro Machin Volcano Field Campaign";

const ROLE_OPTIONS = [
  "Field Geophysicist",
  "Office Coordinator",
  "Social Researcher",
  "Field Technician",
  "Safety Officer",
  "Camp Manager",
  "Volcanologist",
  "Data Analyst",
];

const EQUIPMENT_ITEMS = [
  "GPS Device",
  "Magnetometer",
  "Seismograph",
  "Radio Communication",
  "First Aid Kit",
  "Safety Helmet",
  "Reflective Vest",
  "Field Notebook",
  "Camera",
  "Sampling Tools",
];

type Tab = "register" | "participants" | "equipment";

const STATUS_LABELS: Record<CampParticipant["status"], string> = {
  pending: "Pending",
  checked_in: "Checked In",
  checked_out: "Checked Out",
};

const STATUS_COLORS: Record<CampParticipant["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  checked_in: "bg-green-100 text-green-700 border-green-200",
  checked_out: "bg-gray-100 text-gray-600 border-gray-200",
};

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  fullName: "",
  idNumber: "",
  organization: "",
  role: "",
  phoneNumber: "",
  email: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  equipment: [] as string[],
  checkInDate: new Date().toISOString().split("T")[0],
  checkOutDate: "",
  notes: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampRegistrationPage() {
  const router = useRouter();
  const { campParticipants, addCampParticipant, removeCampParticipant, updateCampParticipantStatus } =
    useAppContext();

  const [activeTab, setActiveTab] = useState<Tab>("register");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Derived counts ──────────────────────────────────────────────────────
  const checkedIn = campParticipants.filter((p) => p.status === "checked_in").length;
  const checkedOut = campParticipants.filter((p) => p.status === "checked_out").length;
  const pending = campParticipants.filter((p) => p.status === "pending").length;
  const total = campParticipants.length;

  // ── Equipment counts for tracking tab ──────────────────────────────────
  const equipmentCounts = EQUIPMENT_ITEMS.map((item) => ({
    name: item,
    count: campParticipants.filter((p) => p.equipment.includes(item)).length,
  }));

  // ── Form helpers ────────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    },
    []
  );

  const toggleEquipment = useCallback((item: string) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Partial<typeof EMPTY_FORM> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.idNumber.trim()) newErrors.idNumber = "ID number is required.";
    if (!form.organization.trim()) newErrors.organization = "Organization is required.";
    if (!form.role) newErrors.role = "Role is required.";
    if (!form.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required.";
    if (!form.email.trim()) newErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address.";
    if (!form.emergencyContactName.trim())
      newErrors.emergencyContactName = "Emergency contact name is required.";
    if (!form.emergencyContactPhone.trim())
      newErrors.emergencyContactPhone = "Emergency contact phone is required.";
    if (!form.checkInDate) newErrors.checkInDate = "Check-in date is required.";
    return newErrors;
  }, [form]);

  const handleSubmit = useCallback(() => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    addCampParticipant({ ...form, status: "pending" });
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  }, [form, validate, addCampParticipant]);

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const headers = [
      "Full Name", "ID Number", "Organization", "Role",
      "Phone", "Email", "Emergency Contact", "Emergency Phone",
      "Equipment", "Check-in Date", "Check-out Date", "Status", "Notes",
    ];
    const rows = campParticipants.map((p) => [
      p.fullName, p.idNumber, p.organization, p.role,
      p.phoneNumber, p.email, p.emergencyContactName, p.emergencyContactPhone,
      p.equipment.join("; "), p.checkInDate, p.checkOutDate,
      STATUS_LABELS[p.status], p.notes,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Camp_${CAMP_ID}_participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [campParticipants]);

  // ── Input class helpers ─────────────────────────────────────────────────
  const inputCls = (field: keyof typeof EMPTY_FORM) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/map")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Map
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm leading-tight">
                Camp {CAMP_ID} Registration
              </h1>
              <p className="text-xs text-gray-500">{CAMPAIGN_NAME}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Data
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Participants</p>
              <p className="text-xl font-bold text-gray-900">{total}</p>
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Checked In</p>
              <p className="text-xl font-bold text-gray-900">{checkedIn}</p>
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Checked Out</p>
              <p className="text-xl font-bold text-gray-900">{checkedOut}</p>
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1">
          {(
            [
              { key: "register", label: "Register Participant" },
              { key: "participants", label: `View Participants (${total})` },
              { key: "equipment", label: "Equipment Tracking" },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-2xl mx-auto p-4">

        {/* ════ Register Participant tab ════ */}
        {activeTab === "register" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-6">

            {submitSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Participant registered successfully!
              </div>
            )}

            {/* Personal Information */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    className={inputCls("fullName")}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CC-1234567890"
                    value={form.idNumber}
                    onChange={(e) => setField("idNumber", e.target.value)}
                    className={inputCls("idNumber")}
                  />
                  {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., US Geophysics Team"
                    value={form.organization}
                    onChange={(e) => setField("organization", e.target.value)}
                    className={inputCls("organization")}
                  />
                  {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value)}
                    className={inputCls("role") + " bg-white"}
                  >
                    <option value="">Select role</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Contact Information */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={form.phoneNumber}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                    className={inputCls("phoneNumber")}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={inputCls("email")}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Emergency Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Emergency contact person"
                    value={form.emergencyContactName}
                    onChange={(e) => setField("emergencyContactName", e.target.value)}
                    className={inputCls("emergencyContactName")}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Emergency Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+57 300 987 6543"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setField("emergencyContactPhone", e.target.value)}
                    className={inputCls("emergencyContactPhone")}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Equipment Assignment */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Equipment Assignment</h2>
              <div className="grid grid-cols-5 gap-2">
                {EQUIPMENT_ITEMS.map((item) => {
                  const selected = form.equipment.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                        selected
                          ? "bg-green-500 text-white border-green-500 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Schedule */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Schedule</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Expected Check-in Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.checkInDate}
                    onChange={(e) => setField("checkInDate", e.target.value)}
                    className={inputCls("checkInDate")}
                  />
                  {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Expected Check-out Date
                  </label>
                  <input
                    type="date"
                    value={form.checkOutDate}
                    min={form.checkInDate}
                    onChange={(e) => setField("checkOutDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Additional Notes */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Additional Notes</h2>
              <textarea
                rows={3}
                placeholder="Any special requirements, certifications, or notes..."
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </section>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
            >
              Register Participant
            </button>
          </div>
        )}

        {/* ════ View Participants tab ════ */}
        {activeTab === "participants" && (
          <div className="space-y-3">
            {campParticipants.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No participants registered yet.</p>
                <button
                  onClick={() => setActiveTab("register")}
                  className="mt-3 text-sm text-green-600 hover:underline font-medium"
                >
                  Register the first participant
                </button>
              </div>
            ) : (
              campParticipants.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm">{p.fullName}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[p.status]}`}
                        >
                          {STATUS_LABELS[p.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.role} · {p.organization}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {p.idNumber}</p>
                    </div>
                    <button
                      onClick={() => removeCampParticipant(p.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Remove participant"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span>📞 {p.phoneNumber}</span>
                    <span>✉️ {p.email}</span>
                    {p.checkInDate && <span>📅 Check-in: {p.checkInDate}</span>}
                    {p.checkOutDate && <span>📅 Check-out: {p.checkOutDate}</span>}
                  </div>

                  {p.equipment.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.equipment.map((e) => (
                        <span
                          key={e}
                          className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    {p.status !== "checked_in" && (
                      <button
                        onClick={() => updateCampParticipantStatus(p.id, "checked_in")}
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        Check In
                      </button>
                    )}
                    {p.status !== "checked_out" && (
                      <button
                        onClick={() => updateCampParticipantStatus(p.id, "checked_out")}
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        Check Out
                      </button>
                    )}
                    {p.status !== "pending" && (
                      <button
                        onClick={() => updateCampParticipantStatus(p.id, "pending")}
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                      >
                        Set Pending
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ════ Equipment Tracking tab ════ */}
        {activeTab === "equipment" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Equipment Assignment Overview</h2>
            {total === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No participants registered. Register participants to track equipment.
              </p>
            ) : (
              <div className="space-y-3">
                {equipmentCounts.map(({ name, count }) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{name}</span>
                      <span className="text-gray-400">
                        {count} / {total} participant{total !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-green-400 rounded-full transition-all"
                        style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {total > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Per-Participant Summary
                </h3>
                <div className="space-y-2">
                  {campParticipants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium truncate max-w-[160px]">{p.fullName}</span>
                      <span className="text-gray-400">
                        {p.equipment.length} item{p.equipment.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
