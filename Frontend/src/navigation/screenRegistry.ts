import React from 'react';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import DistrictDashboardScreen from '../screens/district/DistrictDashboardScreen';
import ReportsScreen from '../screens/district/ReportsScreen';
import NicPendingListScreen from '../screens/district/NicPendingListScreen';
import NicApplicationReviewScreen from '../screens/district/NicApplicationReviewScreen';
import BirthTestScreen from '../screens/birth/BirthTestScreen';
import DeathTestScreen from '../screens/death/DeathTestScreen';

export const dashboards: Record<string, ComponentType<any>> = {
  DistrictDashboard: DistrictDashboardScreen,
  BirthDashboard: BirthTestScreen,
  DeathDashboard: DeathTestScreen,
  // MarriageDashboard: MarriageDashboardScreen,  // DEV3
  // BankDashboard: BankDashboardScreen,          // DEV3
  // VillageDashboard: VillageDashboardScreen,    // DEV4
};

export const stackScreens: Record<
  string,
  { component: ComponentType<any>; title: string; headerShown?: boolean }
> = {
  Reports: { component: ReportsScreen, title: 'Reports' },
  NicPendingList: { component: NicPendingListScreen, title: 'NIC Pending Applications', headerShown: false },
  NicApplicationReview: { component: NicApplicationReviewScreen, title: 'NIC Application Review', headerShown: false },
  BirthDashboard: { component: BirthTestScreen, title: 'Birth Dashboard', headerShown: false },
  DeathDashboard: { component: DeathTestScreen, title: 'Death Dashboard', headerShown: false },
};

export const NotAvailableScreen = () =>
  React.createElement(
    View,
    { style: { flex: 1, alignItems: 'center', justifyContent: 'center' } },
    React.createElement(Text, null, 'This screen is not available yet.'),
  );