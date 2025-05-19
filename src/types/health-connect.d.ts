interface HealthConnectAPI {
  requestPermissions(permissions: string[]): Promise<{ granted: boolean }>;
  getData(options: {
    startDate: Date;
    endDate: Date;
    dataTypes: string[];
  }): Promise<any>;
}

interface Navigator {
  health?: HealthConnectAPI;
} 