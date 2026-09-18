import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import PatientsIcon from "@mui/icons-material/PersonOutlined";
import DoctorsIcon from "@mui/icons-material/MedicalServicesOutlined";
import BillingIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import ReportsIcon from "@mui/icons-material/InsightsOutlined";
import PrescriptionsIcon from "@mui/icons-material/DescriptionOutlined";
import UsersIcon from "@mui/icons-material/GroupOutlined";
import RolesIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AppointmentsIcon from "@mui/icons-material/EventAvailableOutlined";
import MyAppointmentsIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleIcon from "@mui/icons-material/AccessTimeOutlined";

// Single source of truth for the sidebar. `builtStatus: "live"` items have
// a real page wired to real API data. `builtStatus: "planned"` items route
// to a shared "coming soon" placeholder — they're listed here on purpose,
// not hidden, so the app's intended scope is honest and visible instead of
// silently missing.
export const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/dashboard", icon: DashboardIcon, builtStatus: "live" }],
  },
  {
    label: "Care",
    items: [
      { label: "Patients", path: "/patients", icon: PatientsIcon, builtStatus: "live" },
      { label: "Doctors", path: "/doctors", icon: DoctorsIcon, builtStatus: "planned" },
      { label: "Prescriptions", path: "/prescriptions", icon: PrescriptionsIcon, builtStatus: "planned" },
    ],
  },
  {
    label: "Scheduling",
    items: [
      // Admin/Receptionist browse the full schedule; Doctor sees only
      // their own (enforced by the backend, not just hidden here).
      { label: "Appointments", path: "/appointments", icon: AppointmentsIcon, builtStatus: "live", roles: ["ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"] },
      { label: "My Appointments", path: "/my-appointments", icon: MyAppointmentsIcon, builtStatus: "live", roles: ["DOCTOR"] },
      // A doctor's own consultation-hours master form — sets the working
      // window + lunch break the appointment slot picker builds from.
      { label: "My Consultation Hours", path: "/my-schedule", icon: ScheduleIcon, builtStatus: "live", roles: ["DOCTOR"] },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Billing", path: "/billing", icon: BillingIcon, builtStatus: "planned" },
      { label: "Payments", path: "/payments", icon: PaymentsIcon, builtStatus: "planned" },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Reports", path: "/reports", icon: ReportsIcon, builtStatus: "planned" }],
  },
  {
    label: "Administration",
    items: [
      { label: "Users", path: "/users", icon: UsersIcon, builtStatus: "live", adminOnly: true },
      { label: "Roles", path: "/roles", icon: RolesIcon, builtStatus: "live", adminOnly: true },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);
