export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  MainTabs: { screen?: 'Home' | 'News' | 'Notification' | 'Profile' } | undefined;
  AddProfile: undefined;
  // District
  Reports: undefined;
  NicPendingList: undefined;
  NicApplicationReview: { applicationId: string };
  NicPersonalDetails: undefined;
  NicContactFamily: undefined;
  NicDocuments: undefined;
  NicDeclaration: undefined;
  NicReceipt: undefined;
  // Other developers: add your route names here
};
