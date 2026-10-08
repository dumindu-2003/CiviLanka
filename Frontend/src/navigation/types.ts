export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  MainTabs: { screen?: 'Home' | 'News' | 'Notification' | 'Profile' } | undefined;
  AddProfile: undefined;
  Reports: undefined;

  AllRecords: undefined;
  AuditTrail: undefined;

  NicPendingList: undefined;
  NicApplicationReview: { applicationId: string };
  NicPersonalDetails: undefined;
  NicContactFamily: undefined;
  NicDocuments: undefined;
  NicDeclaration: undefined;
  NicReceipt: undefined;

  BirthDashboard: undefined;
  DeathDashboard: undefined;

  FindPeople: undefined;
};
