import React from 'react';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';

import DistrictDashboardScreen from '../screens/district/DistrictDashboardScreen';
import ReportsScreen from '../screens/district/ReportsScreen';
import AllRecordsScreen from '../screens/district/AllRecordsScreen';
import NicPendingListScreen from '../screens/district/NicPendingListScreen';
import NicApplicationReviewScreen from '../screens/district/NicApplicationReviewScreen';
import AddProfileScreen from '../screens/district/AddProfileScreen';
import FindPeopleScreen from '@/screens/district/Findpeoplescreen';
import AuditTrailScreen from '../screens/district/AuditTrailScreen';

import BirthTestScreen from '../screens/birth/BirthTestScreen';
import DeathTestScreen from '../screens/death/DeathTestScreen';

export const dashboards: Record<
  string,
  ComponentType<any>
> = {
  DistrictDashboard: DistrictDashboardScreen,
  BirthDashboard: BirthTestScreen,
  DeathDashboard: DeathTestScreen,
};

export const stackScreens: Record<
  string,
  {
    component: ComponentType<any>;
    title: string;
    headerShown?: boolean;
  }
> = {
  Reports: {
    component: ReportsScreen,
    title: 'Reports',
    headerShown: false,
  },

  AllRecords: {
    component: AllRecordsScreen,
    title: 'All Records',
    headerShown: false,
  },

  AddProfile: {
    component: AddProfileScreen,
    title: 'Add Profile',
    headerShown: false,
  },

  FindPeople: {
    component: FindPeopleScreen,
    title: 'Find People',
    headerShown: false,
  },

  NicPendingList: {
    component: NicPendingListScreen,
    title: 'NIC Pending Applications',
    headerShown: false,
  },

  NicApplicationReview: {
    component: NicApplicationReviewScreen,
    title: 'NIC Application Review',
    headerShown: false,
  },

  BirthDashboard: {
    component: BirthTestScreen,
    title: 'Birth Dashboard',
    headerShown: false,
  },

  DeathDashboard: {
    component: DeathTestScreen,
    title: 'Death Dashboard',
    headerShown: false,
  },

  AuditTrail: {
    component: AuditTrailScreen,
    title: 'Audit Trail',
    headerShown: false,
  },
};

export const NotAvailableScreen = () =>
  React.createElement(
    View,
    {
      style: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    React.createElement(
      Text,
      null,
      'This screen is not available yet.',
    ),
  );