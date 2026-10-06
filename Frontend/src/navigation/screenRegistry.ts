import React from 'react';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import DistrictDashboardScreen from '../screens/district/DistrictDashboardScreen';
import VillageDashboardScreen from '../screens/village/VillageDashboardScreen';
import ReportsScreen from '../screens/district/ReportsScreen';
import NicPendingListScreen from '../screens/district/NicPendingListScreen';
import NicApplicationReviewScreen from '../screens/district/NicApplicationReviewScreen';
import NicPersonalDetailsScreen from '../screens/village/NicPersonalDetailsScreen';
import NicContactFamilyScreen from '../screens/village/NicContactFamilyScreen';
import NicDocumentsScreen from '../screens/village/NicDocumentsScreen';
import NicDeclarationScreen from '../screens/village/NicDeclarationScreen';
import NicReceiptScreen from '../screens/village/NicReceiptScreen';
// Other developers: import your screens here
// Backend `homeScreen` value -> component shown in the Home tab
export const dashboards: Record<string, ComponentType<any>> = {
  DistrictDashboard: DistrictDashboardScreen,
  // BirthDashboard: BirthDashboardScreen,        // DEV2
  // DeathDashboard: DeathDashboardScreen,        // DEV2
  // MarriageDashboard: MarriageDashboardScreen,  // DEV3
  // BankDashboard: BankDashboardScreen,          // DEV3
  VillageDashboard: VillageDashboardScreen,
};

// Backend `allowedScreens` value -> stack screen
// headerShown: false = the screen draws its own header (default is true)
export const stackScreens: Record<
  string,
  { component: ComponentType<any>; title: string; headerShown?: boolean }
> = {
  Reports: { component: ReportsScreen, title: 'Reports' },
  NicPendingList: { component: NicPendingListScreen, title: 'NIC Pending Applications', headerShown: false },
  NicPersonalDetails: { component: NicPersonalDetailsScreen, title: 'Personal Details', headerShown: false },
  NicContactFamily: { component: NicContactFamilyScreen, title: 'Residential Address', headerShown: false },
  NicDocuments: { component: NicDocumentsScreen, title: 'Supporting Documents', headerShown: false },
  NicDeclaration: { component: NicDeclarationScreen, title: 'Review And Declaration', headerShown: false },
  NicReceipt: { component: NicReceiptScreen, title: 'Application Receipt', headerShown: false },
   NicApplicationReview: { component: NicApplicationReviewScreen, title: 'NIC Application Review', headerShown: false },
};

// Shown when the backend sends a key the app does not know (prevents a crash)
export const NotAvailableScreen = () =>
  React.createElement(
    View,
    { style: { flex: 1, alignItems: 'center', justifyContent: 'center' } },
    React.createElement(Text, null, 'This screen is not available yet.'),
  );