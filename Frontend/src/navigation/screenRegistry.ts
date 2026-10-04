import React from 'react';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import DistrictDashboardScreen from '../screens/district/DistrictDashboardScreen';
import ReportsScreen from '../screens/district/ReportsScreen';
import NicPendingListScreen from '../screens/district/NicPendingListScreen';
import NicApplicationReviewScreen from '../screens/district/NicApplicationReviewScreen';
// Other developers: import your screens here
// Backend `homeScreen` value -> component shown in the Home tab
export const dashboards: Record<string, ComponentType<any>> = {
  DistrictDashboard: DistrictDashboardScreen,
  // BirthDashboard: BirthDashboardScreen,        // DEV2
  // DeathDashboard: DeathDashboardScreen,        // DEV2
  // MarriageDashboard: MarriageDashboardScreen,  // DEV3
  // BankDashboard: BankDashboardScreen,          // DEV3
  // VillageDashboard: VillageDashboardScreen,    // DEV4
};

// Backend `allowedScreens` value -> stack screen
// headerShown: false = the screen draws its own header (default is true)
export const stackScreens: Record<
  string,
  { component: ComponentType<any>; title: string; headerShown?: boolean }
> = {
  Reports: { component: ReportsScreen, title: 'Reports' },
  NicPendingList: { component: NicPendingListScreen, title: 'NIC Pending Applications', headerShown: false },
   NicApplicationReview: { component: NicApplicationReviewScreen, title: 'NIC Application Review', headerShown: false },
};

// Shown when the backend sends a key the app does not know (prevents a crash)
export const NotAvailableScreen = () =>
  React.createElement(
    View,
    { style: { flex: 1, alignItems: 'center', justifyContent: 'center' } },
    React.createElement(Text, null, 'This screen is not available yet.'),
  );