# Overview

BADGEBOX is a web-based employee time tracking system that allows workers to clock in and out using PIN codes. The system includes employee management, historical time tracking data, archived employee records, and data export capabilities. It uses Supabase as the backend database and is built with vanilla HTML, CSS, and JavaScript with Vite as the development server.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology Stack**: Vanilla HTML5, CSS3, and ES6+ JavaScript modules
- **Build System**: Vite development server with hot module replacement disabled for stability
- **PWA Support**: Progressive Web App manifest with comprehensive icon sets for mobile devices
- **Responsive Design**: Mobile-first approach with specific breakpoints (320px, 768px, 1024px+)

## Page Structure
- **Homepage (index.html)**: PIN-based time tracking interface with numeric keypad
- **User Management (utenti.html)**: CRUD operations for active employees
- **Historical Data (storico.html)**: Time tracking history with filtering and export options
- **Archived Employees (ex-dipendenti.html)**: View and manage archived employee records

## Data Management
- **Database**: PostgreSQL hosted on Supabase with Row Level Security (RLS)
- **Core Tables**: 
  - `utenti` (active employees with PIN, name, contract details)
  - `timbrature` (time entries with PIN reference, date, time, type)
  - `dipendenti_archiviati` (archived employees with Excel export paths)
- **Data Validation**: PIN range 1-99, duplicate entry prevention, logical day handling (8:00-5:00)

## Authentication & Access Control
- **PIN-based Access**: 1-2 digit numeric PINs for employee time tracking
- **Admin Access**: Special PIN (1909) for administrative functions
- **Database Security**: Supabase RLS policies with public access for time tracking operations

## Business Logic
- **Time Calculation**: Handles overnight shifts and calculates work hours with overtime tracking
- **Data Export**: Excel/CSV export functionality with WhatsApp sharing integration
- **Archival System**: Complete employee data backup before archiving with Excel generation

## Module Architecture
The system uses ES6 modules organized in `/assets/scripts/` with specific responsibilities:
- **supabase-client.js**: Database connection and configuration
- **calendar-utils.js**: Date handling and formatting utilities
- **timbrature-data.js**: Data retrieval and processing
- **timbrature-render.js**: Table rendering and UI updates

## Error Handling & Data Integrity
- **Validation**: Client-side PIN validation, email format checking, required field validation
- **Error Management**: Supabase error handling with user-friendly messages
- **Data Consistency**: Unique constraints, foreign key relationships, and business rule enforcement

# External Dependencies

## Backend Services
- **Supabase**: PostgreSQL database hosting with real-time capabilities and authentication
- **CDN Libraries**: Luxon.js for date/time manipulation via CDN

## Development Tools
- **Vite**: Development server and build tool (v5.4.2)
- **Node.js**: Required for development environment (18+)

## Browser APIs
- **File System Access**: For Excel/CSV export functionality
- **Clipboard API**: For data copying operations
- **Date Picker API**: Native browser date input controls

## Deployment Platforms
- **Replit**: Primary development and hosting environment
- **Netlify**: Alternative deployment target with configuration files
- **GitHub**: Version control and repository management

## Third-party Integrations
- **WhatsApp Business API**: For sharing exported time tracking data
- **Google Sheets**: Export integration for data analysis
- **Excel Format Support**: XLSX file generation and download