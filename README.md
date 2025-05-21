# FitLife Visualizer Reports

## Version: 1.0.0

FitLife Visualizer Reports is a tool for importing, visualizing, and exporting your fitness and nutrition data, with a focus on clear, customizable PDF reports.

---

## Recent Updates

- **PDF Export Improvements:**
  - Meal tables in exported PDFs now include **Brand**, **Meal Type**, and **Amount/Unit** columns.
  - All columns in the PDF meal table now wrap text, so long values are never truncated.
  - Data import and processing flow ensures all relevant meal fields are preserved from import to export.
- **Bug Fixes:**
  - Fixed issues where meal details (brand, amount, meal type) were missing from reports.
  - Improved compatibility with various Fitbit and nutrition data formats.

---

## Features

- Import fitness and nutrition data from Fitbit and compatible JSON formats.
- Visualize your daily and weekly stats, including calories, macros, water, steps, and more.
- Export beautiful, detailed PDF reports with:
  - Weekly and daily summaries
  - Meal breakdowns (with brand, meal type, amount/unit, and calories)
  - Activity and water tracking
  - Charts for calories and nutrient distribution
- All report tables are fully responsive and readable, with text wrapping for long values.

---

## Usage

1. **Import Data:**
   - Use the Import page to upload your Fitbit or compatible JSON data.
2. **Review & Visualize:**
   - Browse your data in the dashboard and review daily/weekly summaries.
3. **Export PDF:**
   - Go to the Export page, select your date range, and download a PDF report.

---

## Development

- Install dependencies: `npm install` or `bun install`
- Start the app: `npm run dev` or `bun run dev`
- Build for production: `npm run build`

---

## License

MIT

---

For more details, see the full documentation or contact the project maintainer.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fitlife-visualizer-reports.git
cd fitlife-visualizer-reports
```

2. Install dependencies:
```bash
npm install
```

3. Build the electron app:
```bash
npm run electron:build
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Data Management

1. **Data Import**
   - Import fitness data from supported formats
   - Validate and review imported data
   - Merge with existing records

### Visualization

- View daily summaries
- Analyze weekly trends
- Track progress over time
- Export reports and insights

## Technical Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context and TanStack Query
- **Data Storage**: IndexedDB
- **Build Tool**: Vite 6
- **Mobile Framework**: Capacitor 5
- **Charts and Visualization**: Recharts, Chart.js
- **PDF Generation**: @react-pdf/renderer
- **Form Handling**: React Hook Form with Zod validation

## Project Structure

```
src/
├── components/    # Reusable UI components
├── context/       # React context providers
├── data/          # Data models and fixtures
├── hooks/         # Custom React hooks
├── integrations/  # External service integrations
├── lib/           # Library configurations
├── pages/         # Page components
├── services/      # Core services (DB, API, etc.)
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Root component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Cursor](https://cursor.com/)
- Built with [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)