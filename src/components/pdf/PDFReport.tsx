import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { DailyStats, WeeklyStats } from '@/utils/pdfExport';

// Register fonts if needed
// Font.register({
//   family: 'Open Sans',
//   src: '/fonts/OpenSans-Regular.ttf'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 0,
    padding: 0,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    marginBottom: 0,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dateRange: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 6,
    marginTop: 0,
  },
  warning: {
    fontSize: 14,
    color: '#ff0000',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    alignItems: 'flex-start',
    minHeight: 24,
    textAlign: 'left',
  },
  column: {
    flex: 1,
    paddingRight: 10,
    wordBreak: 'break-all',
    whiteSpace: 'normal',
    flexWrap: 'wrap',
    minWidth: 0,
    maxWidth: '100%',
  },
  brandColumn: {
    flex: 1,
    paddingRight: 6,
    wordBreak: 'break-all',
    whiteSpace: 'normal',
    flexWrap: 'wrap',
    minWidth: 0,
    maxWidth: '100%',
  },
  nameColumn: {
    flex: 2,
    paddingRight: 6,
    wordBreak: 'break-all',
    whiteSpace: 'normal',
    flexWrap: 'wrap',
    minWidth: 0,
    maxWidth: '100%',
  },
  mealTypeColumn: {
    flex: 1,
    paddingRight: 4,
    textAlign: 'left',
    wordBreak: 'break-all',
    whiteSpace: 'normal',
    flexWrap: 'wrap',
    minWidth: 0,
    maxWidth: '100%',
  },
  caloriesColumn: {
    flex: 1,
    paddingRight: 0,
    textAlign: 'right',
    wordBreak: 'break-all',
    whiteSpace: 'normal',
    flexWrap: 'wrap',
    minWidth: 0,
    maxWidth: '100%',
  },
  header: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  mealSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  chartContainer: {
    width: '100%',
    height: 140,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  missingDates: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff5f5',
    border: '1px solid #ff0000',
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 0,
    gap: 10,
  },
  chartWrapper: {
    width: '40%',
    height: 180,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chartWrapperNutrient: {
    width: '60%',
    height: 260,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    marginBottom: 0,
    textAlign: 'center',
  },
  chartContainerNutrient: {
    width: '100%',
    height: 220,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeklySummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 0,
  },
  summaryItem: {
    width: '30%',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

interface DailyReportProps {
  stats: DailyStats;
}

const DailyReport: React.FC<DailyReportProps> = ({ stats }) => (
  <View style={styles.section} wrap={false} break>
    <Text style={styles.subtitle}>
      Daily Summary - {format(new Date(stats.date), 'EEEE, MMMM d, yyyy')}
    </Text>
    <View style={styles.weeklySummary}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Calories In</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.totalCaloriesIn)} kcal</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Calories Out</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.totalCaloriesOut)} kcal</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Protein</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.totalProtein)}g</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Carbs</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.totalCarbs)}g</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Fat</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.totalFat)}g</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Steps</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.totalSteps)}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Distance</Text>
        <Text style={styles.summaryValue}>{stats.totalDistance ? stats.totalDistance.toFixed(2) : '0.00'} km</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Water</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.totalWater)} ml</Text>
      </View>
    </View>
    <View style={styles.mealSection}>
      <Text style={[styles.text, styles.bold, { marginBottom: 4 }]}>Meals</Text>
      {stats.meals.length > 0 ? (
        <View>
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.brandColumn, styles.text]} wrap>Brand</Text>
            <Text style={[styles.nameColumn, styles.text]} wrap>Name</Text>
            <Text style={[styles.mealTypeColumn, styles.text]} wrap>Meal Type</Text>
            <Text style={[styles.column, styles.text]} wrap>Amount</Text>
            <Text style={[styles.caloriesColumn, styles.text]} wrap>Calories</Text>
          </View>
          {stats.meals.map((meal, index) => (
            <View key={index} style={styles.row}>
              <Text style={[styles.brandColumn, styles.text]} wrap>{meal.brandName || '-'}</Text>
              <Text style={[styles.nameColumn, styles.text]} wrap>{meal.name}</Text>
              <Text style={[styles.mealTypeColumn, styles.text]} wrap>{meal.meal || '-'}</Text>
              <Text style={[styles.column, styles.text]} wrap>
                {meal.amount && meal.unit 
                  ? `${meal.amount} ${meal.unit}`
                  : meal.amount 
                    ? `${meal.amount}`
                    : meal.unit 
                      ? `${meal.unit}`
                      : '-'}
              </Text>
              <Text style={[styles.caloriesColumn, styles.text]} wrap>{Math.round(meal.calories)} cal</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.text}>No meals recorded.</Text>
      )}
    </View>
  </View>
);

interface WeeklyReportProps {
  stats: WeeklyStats;
  dailyStats: DailyStats[];
  chartImage?: string;
  nutrientChartImage?: string;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ stats, dailyStats, chartImage, nutrientChartImage }) => (
  <View style={styles.section}>
    <View style={styles.weeklySummary}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Calories In</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.averageCaloriesIn)} kcal</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Calories Out</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.averageCaloriesOut)} kcal</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Protein</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.averageProtein)}g</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Carbs</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.averageCarbs)}g</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Fat</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.averageFat)}g</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Steps</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.averageSteps)}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Distance</Text>
        <Text style={styles.summaryValue}>{stats.averageDistance.toFixed(2)} km</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Average Water</Text>
        <Text style={styles.summaryValue}>{Math.round(stats.averageWater)} ml</Text>
      </View>
    </View>

    <View style={styles.chartsRow}>
      {chartImage && (
        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>Weekly Calorie Trend</Text>
          <View style={styles.chartContainer}>
            <Image src={chartImage} style={styles.chartImage} />
          </View>
        </View>
      )}

      {nutrientChartImage && (
        <View style={styles.chartWrapperNutrient}>
          <Text style={styles.chartTitle}>Nutrient Distribution</Text>
          <View style={styles.chartContainerNutrient}>
            <Image src={nutrientChartImage} style={styles.chartImage} />
          </View>
        </View>
      )}
    </View>
  </View>
);

interface PDFReportProps {
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats;
  chartImage?: string;
  nutrientChartImage?: string;
  missingDates?: string[];
}

const PDFReport: React.FC<PDFReportProps> = ({ 
  dailyStats, 
  weeklyStats, 
  chartImage, 
  nutrientChartImage,
  missingDates = [] 
}) => {
  const today = new Date();
  const formattedDate = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{`FitLife Report ${formattedDate}`}</Text>
        {missingDates.length > 0 && (
          <View style={styles.missingDates}>
            <Text style={styles.warning}>Missing Data</Text>
            <Text style={styles.text}>
              The following dates have no data available:
            </Text>
            <View style={{ marginTop: 10 }}>
              {missingDates.map(date => (
                <Text key={date} style={styles.text}>
                  • {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </Text>
              ))}
            </View>
          </View>
        )}
        <Text style={styles.subtitle}>Weekly Summary</Text>
        <Text style={styles.dateRange}>
          {format(new Date(weeklyStats.startDate), 'MMM d, yyyy')} - {format(new Date(weeklyStats.endDate), 'MMM d, yyyy')}
        </Text>
        <WeeklyReport 
          stats={weeklyStats} 
          dailyStats={dailyStats}
          chartImage={chartImage}
          nutrientChartImage={nutrientChartImage}
        />
        {dailyStats.map((stats, index) => (
          <DailyReport key={index} stats={stats} />
        ))}
      </Page>
    </Document>
  );
};

// Update the static generate method to use the new file name
PDFReport.generate = async (
  dailyStats: DailyStats[],
  weeklyStats: WeeklyStats,
  chartImage?: string,
  nutrientChartImage?: string,
  missingDates?: string[]
) => {
  const { pdf } = await import('@react-pdf/renderer');
  const today = new Date();
  const fileName = `fitlife-report-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.pdf`;
  const blob = await pdf(
    <PDFReport
      dailyStats={dailyStats}
      weeklyStats={weeklyStats}
      chartImage={chartImage}
      nutrientChartImage={nutrientChartImage}
      missingDates={missingDates}
    />
  ).toBlob();
  // Attach the file name to the blob for download (if needed in your download logic)
  (blob as any).name = fileName;
  return blob;
};

export default PDFReport; 