import { forwardRef } from 'react';
import {
  AlertCircle as AlertCircleBase,
  AlertTriangle as AlertTriangleBase,
  Archive as ArchiveBase,
  ArrowLeft as ArrowLeftBase,
  ArrowUpDown as ArrowUpDownBase,
  Calendar as CalendarBase,
  Check as CheckBase,
  CheckCircle as CheckCircleBase,
  ChevronDown as ChevronDownBase,
  ChevronUp as ChevronUpBase,
  Clock as ClockBase,
  Eye as EyeBase,
  EyeOff as EyeOffBase,
  FileSpreadsheet as FileSpreadsheetBase,
  FileText as FileTextBase,
  History as HistoryBase,
  LayoutDashboard as LayoutDashboardBase,
  LogIn as LogInBase,
  LogOut as LogOutBase,
  Menu as MenuBase,
  PanelLeft as PanelLeftBase,
  Pencil as EditBase,
  Plus as PlusBase,
  RotateCcw as RotateCcwBase,
  Search as SearchBase,
  Settings as SettingsBase,
  Trash2 as Trash2Base,
  User as UserBase,
  Users as UsersBase,
  X as XBase,
  XCircle as XCircleBase,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

const withThinStroke = (Icon: LucideIcon) =>
  forwardRef<SVGSVGElement, LucideProps>(function ThinStrokeIcon(props, ref) {
    return (
      <Icon
        ref={ref}
        strokeWidth={props.strokeWidth ?? 1.5}
        absoluteStrokeWidth={props.absoluteStrokeWidth ?? true}
        {...props}
      />
    );
  });

export const AlertCircle = withThinStroke(AlertCircleBase);
export const AlertTriangle = withThinStroke(AlertTriangleBase);
export const Archive = withThinStroke(ArchiveBase);
export const ArrowLeft = withThinStroke(ArrowLeftBase);
export const ArrowUpDown = withThinStroke(ArrowUpDownBase);
export const Calendar = withThinStroke(CalendarBase);
export const Check = withThinStroke(CheckBase);
export const CheckCircle = withThinStroke(CheckCircleBase);
export const ChevronDown = withThinStroke(ChevronDownBase);
export const ChevronUp = withThinStroke(ChevronUpBase);
export const Clock = withThinStroke(ClockBase);
export const Eye = withThinStroke(EyeBase);
export const EyeOff = withThinStroke(EyeOffBase);
export const Edit = withThinStroke(EditBase);
export const FileSpreadsheet = withThinStroke(FileSpreadsheetBase);
export const FileText = withThinStroke(FileTextBase);
export const History = withThinStroke(HistoryBase);
export const LayoutDashboard = withThinStroke(LayoutDashboardBase);
export const LogIn = withThinStroke(LogInBase);
export const LogOut = withThinStroke(LogOutBase);
export const Menu = withThinStroke(MenuBase);
export const PanelLeftIcon = withThinStroke(PanelLeftBase);
export const Plus = withThinStroke(PlusBase);
export const RotateCcw = withThinStroke(RotateCcwBase);
export const Search = withThinStroke(SearchBase);
export const Settings = withThinStroke(SettingsBase);
export const Trash2 = withThinStroke(Trash2Base);
export const User = withThinStroke(UserBase);
export const Users = withThinStroke(UsersBase);
export const X = withThinStroke(XBase);
export const XCircle = withThinStroke(XCircleBase);
